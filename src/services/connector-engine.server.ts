import { validatePublicUrl } from "@/lib/security.server";
import { getCurrentDate, getCurrentDateTime } from "@/lib/date-system";

export type ConnectorKind = "auto" | "wordpress" | "api" | "json" | "rss" | "html" | "csv" | "custom";

export interface FieldMappingConfig {
  sourceField: string;
  targetField: string;
  transformations?: ("trim" | "lowercase" | "uppercase" | "remove_currency" | "remove_commas" | "parse_number" | "parse_date")[];
  defaultValue?: string;
  required?: boolean;
}

export interface ConnectorSourceConfig {
  url: string;
  kind: ConnectorKind;
  wpEndpoint?: string;
  cssSelectors?: Record<string, string>;
  fieldMappings?: FieldMappingConfig[];
  pageLimit?: number;
  isEggRateMode?: boolean;
}

export interface DetectionResult {
  detectedKind: ConnectorKind;
  isWordPress: boolean;
  wpRoutes?: string[];
  rssUrl?: string;
  samplePayload?: any;
  availableFields?: string[];
  note?: string;
}

export interface ConnectorFetchResult {
  success: boolean;
  kind: ConnectorKind;
  fetchedCount: number;
  validCount: number;
  rejectedCount: number;
  rawSample?: any;
  parsedRecords: Record<string, any>[];
  mappedRecords: Record<string, any>[];
  validationErrors: string[];
  note?: string;
}

export class ConnectorEngine {
  /**
   * Auto-detects website data source features (WordPress REST API, RSS, JSON, HTML).
   */
  async autoDetect(websiteUrl: string): Promise<DetectionResult> {
    const urlCheck = validatePublicUrl(websiteUrl);
    if (!urlCheck.isValid) {
      return {
        detectedKind: "html",
        isWordPress: false,
        note: `Security check: ${urlCheck.error}`,
      };
    }

    const cleanUrl = urlCheck.cleanUrl!;
    const parsedUrl = new URL(cleanUrl);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    try {
      // 1. Probe WordPress REST API
      const wpProbeUrl = `${baseUrl}/wp-json/wp/v2/posts?per_page=3`;
      const wpRes = await fetch(wpProbeUrl, {
        headers: { "User-Agent": "EggRateIndia-Collector/1.0 (+https://www.egg-rate.today)" },
        signal: AbortSignal.timeout(5000),
      });

      if (wpRes.ok) {
        const wpData = await wpRes.json();
        if (Array.isArray(wpData) && wpData.length > 0) {
          const sample = wpData[0];
          const fields = Object.keys(sample);
          return {
            detectedKind: "wordpress",
            isWordPress: true,
            wpRoutes: ["/wp-json/wp/v2/posts", "/wp-json/wp/v2/pages"],
            samplePayload: wpData.slice(0, 2),
            availableFields: fields,
            note: "WordPress REST API endpoint detected successfully.",
          };
        }
      }
    } catch {
      // Ignore WP probe failure and continue to RSS
    }

    try {
      // 2. Probe RSS / Atom feed
      const rssProbeUrl = `${baseUrl}/feed/`;
      const rssRes = await fetch(rssProbeUrl, {
        headers: { "User-Agent": "EggRateIndia-Collector/1.0 (+https://www.egg-rate.today)" },
        signal: AbortSignal.timeout(5000),
      });

      if (rssRes.ok) {
        const text = await rssRes.text();
        if (text.includes("<rss") || text.includes("<feed") || text.includes("<item")) {
          return {
            detectedKind: "rss",
            isWordPress: false,
            rssUrl: rssProbeUrl,
            note: "RSS / Atom feed endpoint detected successfully.",
          };
        }
      }
    } catch {
      // Ignore RSS probe failure
    }

    try {
      // 3. Probe target URL for JSON vs HTML
      const mainRes = await fetch(cleanUrl, {
        headers: { "User-Agent": "EggRateIndia-Collector/1.0 (+https://www.egg-rate.today)" },
        signal: AbortSignal.timeout(6000),
      });

      if (mainRes.status === 401 || mainRes.status === 403) {
        return {
          detectedKind: "html",
          isWordPress: false,
          note: "Authentication required or access restricted by target website policy.",
        };
      }

      const contentType = mainRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const jsonData = await mainRes.json();
        const sampleArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        const fields = sampleArray.length > 0 && typeof sampleArray[0] === "object" ? Object.keys(sampleArray[0]) : [];
        return {
          detectedKind: "json",
          isWordPress: false,
          samplePayload: sampleArray.slice(0, 3),
          availableFields: fields,
          note: "JSON REST API endpoint detected.",
        };
      }
    } catch (err: any) {
      return {
        detectedKind: "html",
        isWordPress: false,
        note: `Fetch notice: ${err.message}`,
      };
    }

    return {
      detectedKind: "html",
      isWordPress: false,
      note: "Public HTML page detected. HTML Extractor mode available.",
    };
  }

  /**
   * Applies transformation pipeline to raw string/number input
   */
  applyTransformation(value: any, transformations?: string[]): any {
    if (value === null || value === undefined) return "";
    let str = String(value);

    if (!transformations || transformations.length === 0) return str.trim();

    for (const tf of transformations) {
      switch (tf) {
        case "trim":
          str = str.trim();
          break;
        case "lowercase":
          str = str.toLowerCase();
          break;
        case "uppercase":
          str = str.toUpperCase();
          break;
        case "remove_currency":
          str = str.replace(/[₹$€£\s]/g, "");
          break;
        case "remove_commas":
          str = str.replace(/,/g, "");
          break;
        case "parse_number":
          const num = parseFloat(str.replace(/[^0-9.]/g, ""));
          return isNaN(num) ? 0 : num;
        case "parse_date":
          return str.slice(0, 10);
      }
    }

    return str;
  }

  /**
   * Executes fetch and field mapping for given connector configuration
   */
  async executeFetch(config: ConnectorSourceConfig): Promise<ConnectorFetchResult> {
    const urlCheck = validatePublicUrl(config.url);
    if (!urlCheck.isValid) {
      return {
        success: false,
        kind: config.kind,
        fetchedCount: 0,
        validCount: 0,
        rejectedCount: 0,
        parsedRecords: [],
        mappedRecords: [],
        validationErrors: [`SSRF Check Failed: ${urlCheck.error}`],
      };
    }

    const cleanUrl = urlCheck.cleanUrl!;
    const validationErrors: string[] = [];
    let rawItems: any[] = [];

    try {
      if (config.kind === "wordpress") {
        const parsedUrl = new URL(cleanUrl);
        const wpUrl = `${parsedUrl.protocol}//${parsedUrl.host}/wp-json/wp/v2/posts?per_page=${config.pageLimit || 10}`;
        const res = await fetch(wpUrl, {
          headers: { "User-Agent": "EggRateIndia-Collector/1.0 (+https://www.egg-rate.today)" },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const wpData = await res.json();
          rawItems = Array.isArray(wpData) ? wpData : [wpData];
        } else {
          validationErrors.push(`WordPress REST API returned HTTP ${res.status}`);
        }
      } else if (config.kind === "json" || config.kind === "api") {
        const res = await fetch(cleanUrl, {
          headers: { "User-Agent": "EggRateIndia-Collector/1.0 (+https://www.egg-rate.today)" },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const jsonData = await res.json();
          rawItems = Array.isArray(jsonData) ? jsonData : [jsonData];
        } else {
          validationErrors.push(`JSON Endpoint returned HTTP ${res.status}`);
        }
      } else {
        // HTML or fallback parser
        const res = await fetch(cleanUrl, {
          headers: { "User-Agent": "EggRateIndia-Collector/1.0 (+https://www.egg-rate.today)" },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const htmlText = await res.text();
          // Extract basic sample items from HTML
          rawItems = [{ html_content: htmlText.slice(0, 500), url: cleanUrl }];
        } else {
          validationErrors.push(`Target page returned HTTP ${res.status}`);
        }
      }

      // Map raw items using fieldMappings
      const mappings = config.fieldMappings || [
        { sourceField: "title.rendered", targetField: "title" },
        { sourceField: "date", targetField: "effective_date" },
        { sourceField: "slug", targetField: "slug" },
      ];

      const mappedRecords: Record<string, any>[] = [];

      for (const item of rawItems) {
        const mappedObj: Record<string, any> = {
          fetched_at: getCurrentDateTime(),
          source_url: cleanUrl,
        };

        for (const m of mappings) {
          // Resolve nested dot notation e.g. "title.rendered"
          const rawVal = m.sourceField.split(".").reduce((acc, part) => acc && acc[part], item);
          const transformed = this.applyTransformation(rawVal || m.defaultValue || "", m.transformations);
          mappedObj[m.targetField] = transformed;
        }

        // Egg Rate Mode defaults
        if (config.isEggRateMode) {
          if (!mappedObj["effective_date"]) mappedObj["effective_date"] = getCurrentDate();
          if (!mappedObj["currency"]) mappedObj["currency"] = "INR";
          if (!mappedObj["egg_rate"] && mappedObj["price"]) {
            mappedObj["egg_rate"] = this.applyTransformation(mappedObj["price"], ["remove_currency", "remove_commas", "parse_number"]);
          }
        }

        mappedRecords.push(mappedObj);
      }

      const validCount = mappedRecords.filter((r) => r["effective_date"] && (r["egg_rate"] || r["title"])).length;
      const rejectedCount = mappedRecords.length - validCount;

      return {
        success: validCount > 0,
        kind: config.kind,
        fetchedCount: rawItems.length,
        validCount,
        rejectedCount,
        rawSample: rawItems.slice(0, 2),
        parsedRecords: rawItems.slice(0, 5),
        mappedRecords,
        validationErrors,
        note: `Successfully parsed ${validCount} valid record(s) out of ${rawItems.length} fetched.`,
      };
    } catch (err: any) {
      return {
        success: false,
        kind: config.kind,
        fetchedCount: 0,
        validCount: 0,
        rejectedCount: 0,
        parsedRecords: [],
        mappedRecords: [],
        validationErrors: [err.message || "Failed to connect to data source"],
      };
    }
  }
}
