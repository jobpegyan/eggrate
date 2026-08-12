/**
 * Bulk seed service for populating states, cities, and markets.
 * Uses supabaseAdmin (service role) to bypass RLS.
 */

export interface SeedResult {
  statesCreated: number;
  statesSkipped: number;
  citiesCreated: number;
  citiesSkipped: number;
  marketsCreated: number;
  marketsSkipped: number;
  errors: string[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Seeds ALL Indian states and cities into the database.
 * Idempotent — skips any records that already exist (matched by slug).
 */
export async function seedAllIndiaData(): Promise<SeedResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { ALL_STATES, ALL_CITIES } = await import("@/data/india-seed-data");

  const result: SeedResult = {
    statesCreated: 0,
    statesSkipped: 0,
    citiesCreated: 0,
    citiesSkipped: 0,
    marketsCreated: 0,
    marketsSkipped: 0,
    errors: [],
  };

  // ─── Step 1: Seed states ───────────────────────────────────────────
  const { data: existingStates } = await supabaseAdmin
    .from("states")
    .select("slug, id")
    .limit(500);

  const existingStateSlugs = new Map(
    (existingStates ?? []).map((s) => [s.slug, s.id]),
  );

  const newStates = ALL_STATES.filter(
    (s) => !existingStateSlugs.has(s.slug),
  );

  if (newStates.length > 0) {
    const statePayload = newStates.map((s) => ({
      name: s.name,
      slug: s.slug,
      code: s.code,
      status: "active" as const,
      display_order: s.displayOrder,
    }));

    // Insert in batches of 50
    for (let i = 0; i < statePayload.length; i += 50) {
      const batch = statePayload.slice(i, i + 50);
      const { error } = await supabaseAdmin.from("states").insert(batch);
      if (error) {
        result.errors.push(`State insert batch ${i}: ${error.message}`);
      } else {
        result.statesCreated += batch.length;
      }
    }
  }
  result.statesSkipped = ALL_STATES.length - newStates.length;

  // Reload states to get IDs for city foreign keys
  const { data: allStatesInDB } = await supabaseAdmin
    .from("states")
    .select("id, slug, code")
    .limit(500);

  const stateByCode = new Map(
    (allStatesInDB ?? []).map((s) => [s.code, { id: s.id, slug: s.slug }]),
  );

  // ─── Step 2: Seed cities ───────────────────────────────────────────
  const { data: existingCities } = await supabaseAdmin
    .from("cities")
    .select("slug")
    .limit(10000);

  const existingCitySlugs = new Set(
    (existingCities ?? []).map((c) => c.slug),
  );

  const newCities = ALL_CITIES.filter((c) => {
    const slug = slugify(c.name);
    return !existingCitySlugs.has(slug);
  });

  if (newCities.length > 0) {
    const cityPayload = newCities
      .map((c) => {
        const stateInfo = stateByCode.get(c.stateCode);
        if (!stateInfo) {
          result.errors.push(
            `City "${c.name}" skipped — state code "${c.stateCode}" not found in DB`,
          );
          return null;
        }
        return {
          name: c.name,
          slug: slugify(c.name),
          state_id: stateInfo.id,
          is_featured: c.isFeatured,
          latitude: c.latitude,
          longitude: c.longitude,
          population: c.population,
          status: "active" as const,
          display_order: 0,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    // Insert in batches of 100
    for (let i = 0; i < cityPayload.length; i += 100) {
      const batch = cityPayload.slice(i, i + 100);
      const { error } = await supabaseAdmin.from("cities").insert(batch);
      if (error) {
        result.errors.push(`City insert batch ${i}: ${error.message}`);
      } else {
        result.citiesCreated += batch.length;
      }
    }
  }
  result.citiesSkipped = ALL_CITIES.length - newCities.length;

  // ─── Step 3: Seed default markets for cities without one ───────────
  const { data: citiesWithoutMarkets } = await supabaseAdmin
    .from("cities")
    .select("id, name, slug, state_id")
    .eq("status", "active")
    .limit(10000);

  const { data: existingMarkets } = await supabaseAdmin
    .from("markets")
    .select("city_id")
    .limit(10000);

  const citiesWithMarkets = new Set(
    (existingMarkets ?? []).map((m) => m.city_id),
  );

  const citiesNeedingMarkets = (citiesWithoutMarkets ?? []).filter(
    (c) => !citiesWithMarkets.has(c.id),
  );

  if (citiesNeedingMarkets.length > 0) {
    const marketPayload = citiesNeedingMarkets.map((city) => ({
      name: `${city.name} Main Market`,
      slug: `${city.slug}-main-market`,
      city_id: city.id,
      state_id: city.state_id,
      market_type: "both" as const,
      supports_wholesale: true,
      supports_retail: true,
      status: "active" as const,
    }));

    // Insert in batches of 100
    for (let i = 0; i < marketPayload.length; i += 100) {
      const batch = marketPayload.slice(i, i + 100);
      const { error } = await supabaseAdmin.from("markets").insert(batch);
      if (error) {
        result.errors.push(`Market insert batch ${i}: ${error.message}`);
      } else {
        result.marketsCreated += batch.length;
      }
    }
  }
  result.marketsSkipped = citiesWithMarkets.size;

  // ─── Step 4: Audit log ─────────────────────────────────────────────
  try {
    await supabaseAdmin.from("system_logs").insert({
      level: "info",
      source: "seed-service",
      message: `Seed completed: ${result.statesCreated} states, ${result.citiesCreated} cities, ${result.marketsCreated} markets created`,
      context: result as any,
    });
  } catch {
    // Non-critical
  }

  return result;
}
