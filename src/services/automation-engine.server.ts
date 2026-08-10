
import { supabaseAdmin as supabase } from "@/integrations/supabase/client.server";
import { 
  NormalizedRate, 
  AutomationSettings, 
  AnomalyRule 
} from "@/lib/automation-schemas";
import { createHash } from "crypto";

/**
 * Core Automation Engine logic (Phase 7).
 * Runs on the server to handle data processing, normalization, and validation.
 */

export class AutomationEngine {
  private settings: AutomationSettings | null = null;
  private mappings: Record<string, string> = {};
  private rules: AnomalyRule[] = [];

  async init() {
    // 1. Load settings
    const { data: settingsData } = await supabase.from('automation_settings').select('*');
    const settingsObj: any = {};
    settingsData?.forEach(item => {
      settingsObj[item.key] = item.value;
    });
    this.settings = settingsObj as AutomationSettings;

    // 2. Load mappings
    const { data: mappingsData } = await supabase.from('normalization_mappings').select('*').eq('is_active', true);
    mappingsData?.forEach(m => {
      this.mappings[`${m.mapping_type}:${m.source_name.toLowerCase()}`] = m.target_name;
    });

    // 3. Load anomaly rules
    const { data: rulesData } = await supabase.from('anomaly_rules').select('*').eq('is_active', true);
    this.rules = (rulesData || []) as any[];
  }

  /**
   * Normalizes a location name (city/state)
   */
  normalizeLocation(name: string, type: 'city' | 'state'): string {
    const key = `${type}:${name.toLowerCase().trim()}`;
    return this.mappings[key] || name.trim();
  }

  /**
   * Look up city and state IDs by name
   */
  async lookupLocationIds(cityName: string, stateName: string): Promise<{ cityId: string; stateId: string } | null> {
    const { data: city } = await supabase
      .from('cities')
      .select('id, state_id')
      .ilike('name', cityName)
      .limit(1)
      .maybeSingle();

    if (city) {
      return { cityId: city.id, stateId: city.state_id };
    }

    // If city not found, try to find state at least
    const { data: state } = await supabase
      .from('states')
      .select('id')
      .ilike('name', stateName)
      .limit(1)
      .maybeSingle();
      
    if (state) {
      return { cityId: '', stateId: state.id };
    }

    return null;
  }

  /**
   * Calculates the price per egg based on market-specific peti size
   */
  async calculatePricePerEgg(inputPrice: number, unit: string, cityName: string, marketName?: string): Promise<number> {
    // 1. Get market peti size
    let petiSize = this.settings?.petiSizeDefault || 210;
    
    if (marketName) {
      const { data: market } = await supabase
        .from('markets')
        .select('peti_size')
        .ilike('name', marketName)
        .limit(1)
        .maybeSingle();
      if (market?.peti_size) petiSize = market.peti_size;
    }

    // 2. Convert to per-egg
    switch (unit.toLowerCase()) {
      case 'dozen': return inputPrice / 12;
      case 'tray': return inputPrice / 30;
      case '100': return inputPrice / 100;
      case 'peti': return inputPrice / petiSize;
      case 'piece':
      case 'egg':
      default: return inputPrice;
    }
  }

  /**
   * Validates and detects anomalies in a rate
   */
  async detectAnomalies(rate: NormalizedRate, cityId: string): Promise<{ isAnomaly: boolean; reason?: string }> {
    // 1. Basic range check
    if (rate.eggRate <= 0 || rate.eggRate > 50) {
      return { isAnomaly: true, reason: "Impossible price value" };
    }

    if (!cityId) return { isAnomaly: false };

    // 2. Check against historical average (simplified: last 7 days)
    const { data: history } = await supabase
      .from('egg_rates')
      .select('egg_rate')
      .eq('city_id', cityId)
      .lt('effective_date', rate.effectiveDate)
      .order('effective_date', { ascending: false })
      .limit(7);

    if (history && history.length > 0) {
      const avg = history.reduce((sum, h) => sum + (h.egg_rate as unknown as number), 0) / history.length;
      const percentChange = Math.abs((rate.eggRate - avg) / avg) * 100;
      
      const threshold = this.settings?.anomalyThresholdPercent || 15;
      if (percentChange > threshold) {
        return { 
          isAnomaly: true, 
          reason: `Price deviation of ${percentChange.toFixed(1)}% exceeds threshold of ${threshold}%` 
        };
      }
    }

    return { isAnomaly: false };
  }

  /**
   * Checks for conflicts between sources
   */
  async checkConflicts(rate: NormalizedRate, cityId: string): Promise<boolean> {
    if (!cityId) return false;

    const { data: existing } = await supabase
      .from('egg_rates')
      .select('id, egg_rate, source_id')
      .eq('city_id', cityId)
      .eq('effective_date', rate.effectiveDate)
      .neq('source_id', rate.sourceId)
      .limit(1)
      .maybeSingle();

    if (existing && Math.abs((existing.egg_rate as unknown as number) - rate.eggRate) > 0.01) {
      // Create conflict record
      await supabase.from('data_conflicts').upsert({
        city_id: cityId,
        date: rate.effectiveDate,
        source_a: existing.source_id,
        rate_a: existing.egg_rate as unknown as number,
        source_b: rate.sourceId,
        rate_b: rate.eggRate,
        resolved: false
      }, { onConflict: 'city_id,date,source_a,source_b' } as any);
      
      return true;
    }

    return false;
  }

  /**
   * Processes a single rate through the entire pipeline
   */
  async processRate(item: any, sourceId: string, rawDataId: string): Promise<NormalizedRate | null> {
    try {
      const stateName = this.normalizeLocation(item.state || '', 'state');
      const cityName = this.normalizeLocation(item.city || item.location || '', 'city');
      
      const location = await this.lookupLocationIds(cityName, stateName);
      if (!location) {
        await supabase.from('automation_audit_logs').insert({
          action: 'rate_processing',
          status: 'failed',
          details: { raw_data_id: rawDataId, error: `Location not found: ${cityName}, ${stateName}` }
        });
        return null;
      }

      const eggRate = await this.calculatePricePerEgg(
        parseFloat(item.price || item.rate),
        item.unit || 'piece',
        cityName,
        item.market
      );

      const normalized: NormalizedRate = {
        stateName,
        cityName,
        marketName: item.market,
        eggRate,
        effectiveDate: item.date || new Date().toISOString().split('T')[0],
        sourceId,
        unit: 'piece',
        currency: 'INR'
      };

      // Check anomalies
      const { isAnomaly, reason } = await this.detectAnomalies(normalized, location.cityId);
      
      // Check conflicts
      const hasConflict = await this.checkConflicts(normalized, location.cityId);

      // Audit Log
      await supabase.from('automation_audit_logs').insert({
        action: 'rate_processing',
        status: isAnomaly || hasConflict ? 'warning' : 'success',
        details: { 
          raw_data_id: rawDataId, 
          city: cityName, 
          city_id: location.cityId,
          anomaly: isAnomaly, 
          conflict: hasConflict,
          reason 
        }
      });

      if (isAnomaly || hasConflict) {
        // If auto-publish is disabled for risky data, return null
        if (!this.settings?.autoPublishBelowThreshold) return null;
      }

      return normalized;
    } catch (err) {
      console.error("Error processing rate:", err);
      return null;
    }
  }
}
