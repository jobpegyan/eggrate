import { supabaseAdmin as supabase } from "@/integrations/supabase/client.server";
import { CITY_CLUSTERS, getSubCitySlugsForMainCity } from "@/utils/city-clusters";

export interface SyncSubCityResult {
  success: boolean;
  ratesSynced: number;
  subCitiesProcessed: number;
  errors: string[];
  date: string;
}

/**
 * Propagates / syncs main city egg rates to all their sub-cities and satellite towns.
 * For example: Mumbai's rate syncs to Thane, Navi Mumbai, Kalyan, Dombivli, etc.
 */
export async function syncSubCityRatesFromMainCities(
  targetDate?: string,
): Promise<SyncSubCityResult> {
  const result: SyncSubCityResult = {
    success: true,
    ratesSynced: 0,
    subCitiesProcessed: 0,
    errors: [],
    date: targetDate || new Date().toISOString().slice(0, 10),
  };

  try {
    // 1. Fetch all active cities with state info
    const { data: allCities, error: citiesErr } = await supabase
      .from("cities")
      .select("id, name, slug, state_id, is_featured")
      .eq("status", "active");

    if (citiesErr || !allCities) {
      result.success = false;
      result.errors.push(`Failed to fetch cities: ${citiesErr?.message}`);
      return result;
    }

    const cityBySlug = new Map(allCities.map((c) => [c.slug, c]));
    const cityById = new Map(allCities.map((c) => [c.id, c]));

    // Group cities by state to find fallback featured city per state
    const featuredCityByState = new Map<string, typeof allCities[0]>();
    for (const city of allCities) {
      if (city.is_featured && !featuredCityByState.has(city.state_id)) {
        featuredCityByState.set(city.state_id, city);
      }
    }

    // 2. Fetch all markets for active cities
    const { data: allMarkets } = await supabase
      .from("markets")
      .select("id, city_id, slug")
      .eq("status", "active");

    const defaultMarketByCityId = new Map<string, string>();
    (allMarkets || []).forEach((m) => {
      if (!defaultMarketByCityId.has(m.city_id)) {
        defaultMarketByCityId.set(m.city_id, m.id);
      }
    });

    // For cities without a market, ensure default market exists or create one payload
    const missingMarketCityIds = allCities
      .filter((c) => !defaultMarketByCityId.has(c.id))
      .map((c) => c);

    if (missingMarketCityIds.length > 0) {
      const marketInserts = missingMarketCityIds.map((c) => ({
        city_id: c.id,
        state_id: c.state_id,
        name: `${c.name} Main Market`,
        slug: `${c.slug}-main-market`,
        market_type: "both" as const,
        supports_wholesale: true,
        supports_retail: true,
        status: "active" as const,
      }));

      const { data: createdMarkets, error: marketCreateErr } = await supabase
        .from("markets")
        .upsert(marketInserts, { onConflict: "slug" })
        .select("id, city_id");

      if (!marketCreateErr && createdMarkets) {
        createdMarkets.forEach((m) => defaultMarketByCityId.set(m.city_id, m.id));
      }
    }

    // 3. Query main city rates for target date (or last 7 days if target date empty)
    const effectiveDateFilter = targetDate || result.date;

    const { data: mainCityRates, error: ratesErr } = await supabase
      .from("egg_rates")
      .select("*")
      .eq("is_published", true)
      .gte("effective_date", effectiveDateFilter)
      .order("effective_date", { ascending: false });

    if (ratesErr || !mainCityRates || mainCityRates.length === 0) {
      // Fallback to fetch latest rates from last 14 days
      const { data: recentRates } = await supabase
        .from("egg_rates")
        .select("*")
        .eq("is_published", true)
        .order("effective_date", { ascending: false })
        .limit(200);

      if (!recentRates || recentRates.length === 0) {
        result.errors.push("No published egg rates found to sync.");
        return result;
      }
      mainCityRates?.push(...recentRates);
    }

    // Group rates by city_id and effective_date
    const rateByCityAndDate = new Map<string, typeof mainCityRates[0]>();
    for (const rate of mainCityRates || []) {
      const key = `${rate.city_id}:${rate.effective_date}`;
      if (!rateByCityAndDate.has(key)) {
        rateByCityAndDate.set(key, rate);
      }
    }

    // 4. Build sub-city upsert payloads
    const upsertRows: any[] = [];
    const now = new Date().toISOString();

    for (const [mainSlug, subSlugs] of Object.entries(CITY_CLUSTERS)) {
      const mainCityRecord = cityBySlug.get(mainSlug);
      if (!mainCityRecord) continue;

      // Find rates for this main city
      const mainCityRatesForHub = (mainCityRates || []).filter(
        (r) => r.city_id === mainCityRecord.id,
      );

      if (mainCityRatesForHub.length === 0) continue;

      for (const mainRate of mainCityRatesForHub) {
        for (const subSlug of subSlugs) {
          if (subSlug === mainSlug) continue; // Skip main city itself

          const subCityRecord = cityBySlug.get(subSlug);
          if (!subCityRecord) continue;

          const subMarketId = defaultMarketByCityId.get(subCityRecord.id);
          if (!subMarketId) continue;

          upsertRows.push({
            city_id: subCityRecord.id,
            state_id: subCityRecord.state_id,
            market_id: subMarketId,
            egg_rate: mainRate.egg_rate,
            dozen_price: mainRate.dozen_price ?? Number((Number(mainRate.egg_rate) * 12).toFixed(2)),
            tray_price: mainRate.tray_price ?? Number((Number(mainRate.egg_rate) * 30).toFixed(2)),
            hundred_price: mainRate.hundred_price ?? Number((Number(mainRate.egg_rate) * 100).toFixed(2)),
            peti_price: mainRate.peti_price ?? Number((Number(mainRate.egg_rate) * 210).toFixed(2)),
            wholesale_price: mainRate.wholesale_price ?? mainRate.egg_rate,
            retail_price: mainRate.retail_price ?? Number((Number(mainRate.egg_rate) * 1.06).toFixed(2)),
            currency: mainRate.currency || "INR",
            effective_date: mainRate.effective_date,
            is_verified: true,
            is_published: true,
            published_at: now,
            updated_at: now,
            notes: `Synced from main hub (${mainCityRecord.name})`,
          });

          result.subCitiesProcessed++;
        }
      }
    }

    // Secondary fallback: State-level sync for active cities not covered in explicit clusters
    for (const city of allCities) {
      const isAlreadyCovered = Object.values(CITY_CLUSTERS).some((list) =>
        list.includes(city.slug),
      );
      if (isAlreadyCovered) continue;

      // Find state fallback featured city
      const stateFeaturedCity = featuredCityByState.get(city.state_id);
      if (!stateFeaturedCity || stateFeaturedCity.id === city.id) continue;

      const featuredRates = (mainCityRates || []).filter(
        (r) => r.city_id === stateFeaturedCity.id,
      );

      const subMarketId = defaultMarketByCityId.get(city.id);
      if (!subMarketId) continue;

      for (const mainRate of featuredRates) {
        upsertRows.push({
          city_id: city.id,
          state_id: city.state_id,
          market_id: subMarketId,
          egg_rate: mainRate.egg_rate,
          dozen_price: mainRate.dozen_price ?? Number((Number(mainRate.egg_rate) * 12).toFixed(2)),
          tray_price: mainRate.tray_price ?? Number((Number(mainRate.egg_rate) * 30).toFixed(2)),
          hundred_price: mainRate.hundred_price ?? Number((Number(mainRate.egg_rate) * 100).toFixed(2)),
          peti_price: mainRate.peti_price ?? Number((Number(mainRate.egg_rate) * 210).toFixed(2)),
          wholesale_price: mainRate.wholesale_price ?? mainRate.egg_rate,
          retail_price: mainRate.retail_price ?? Number((Number(mainRate.egg_rate) * 1.06).toFixed(2)),
          currency: mainRate.currency || "INR",
          effective_date: mainRate.effective_date,
          is_verified: true,
          is_published: true,
          published_at: now,
          updated_at: now,
          notes: `Synced from state capital/featured hub (${stateFeaturedCity.name})`,
        });
        result.subCitiesProcessed++;
      }
    }

    // 5. Bulk upsert in batches of 200
    if (upsertRows.length > 0) {
      for (let i = 0; i < upsertRows.length; i += 200) {
        const batch = upsertRows.slice(i, i + 200);
        const { error: upsertErr } = await supabase
          .from("egg_rates")
          .upsert(batch, {
            onConflict: "city_id,market_id,effective_date",
            ignoreDuplicates: false,
          } as any);

        if (upsertErr) {
          result.errors.push(`Sub-city batch upsert error: ${upsertErr.message}`);
        } else {
          result.ratesSynced += batch.length;
        }
      }
    }

    console.log(
      `[SubCitySync] Complete: synced ${result.ratesSynced} rows across ${result.subCitiesProcessed} sub-city mappings`,
    );
  } catch (err: any) {
    result.success = false;
    result.errors.push(err.message || String(err));
  }

  return result;
}
