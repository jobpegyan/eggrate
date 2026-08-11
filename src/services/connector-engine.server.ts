import { validatePublicUrl } from "@/lib/security.server";
import { getCurrentDate, getCurrentDateTime } from "@/lib/date-system";

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/json, text/html, */*",
};

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
        headers: DEFAULT_HEADERS,
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
        headers: DEFAULT_HEADERS,
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
        headers: DEFAULT_HEADERS,
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
          headers: DEFAULT_HEADERS,
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
          headers: DEFAULT_HEADERS,
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const jsonData = await res.json();
          rawItems = Array.isArray(jsonData) ? jsonData : [jsonData];
        } else {
          validationErrors.push(`JSON Endpoint returned HTTP ${res.status}`);
        }
      } else {
        // HTML or EggRateLab parser
        const res = await fetch(cleanUrl, {
          headers: DEFAULT_HEADERS,
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const htmlText = await res.text();
          const table0 = htmlText.match(/<table[\s\S]*?<\/table>/gi)?.[0];

          if (table0) {
            const trs = table0.match(/<tr[\s\S]*?<\/tr>/gi) || [];
            const todayStr = getCurrentDate();

            for (let i = 1; i < trs.length; i++) {
              const tr = trs[i];
              const cityMatch = tr.match(/<a[^>]*>(.*?)<\/a>/i) || tr.match(/<th[^>]*>(.*?)<\/th>/i);
              const tds = tr.match(/<td[^>]*>(.*?)<\/td>/gi) || [];

              if (cityMatch && tds.length >= 4) {
                const rawCity = cityMatch[1].replace(/<[^>]+>/g, "").trim();
                const piece = parseFloat(tds[0].replace(/<[^>]+>/g, "").replace(/₹|\s/g, "").trim());
                const tray = parseFloat(tds[1].replace(/<[^>]+>/g, "").replace(/₹|\s/g, "").trim());
                const hundred = parseFloat(tds[2].replace(/<[^>]+>/g, "").replace(/₹|\s/g, "").trim());
                const peti = parseFloat(tds[3].replace(/<[^>]+>/g, "").replace(/₹|\s/g, "").trim());

                if (rawCity && !isNaN(piece) && piece > 0) {
                  rawItems.push({
                    city: rawCity,
                    piece,
                    tray,
                    hundred,
                    peti,
                    effective_date: todayStr,
                    source_url: cleanUrl,
                  });
                }
              }
            }
          }

          if (rawItems.length === 0) {
            rawItems = [{ html_content: htmlText.slice(0, 500), url: cleanUrl }];
          }
        } else {
          validationErrors.push(`Target page returned HTTP ${res.status}`);
        }
      }

      // Map raw items using fieldMappings or default EggRateLab schema
      const mappedRecords: Record<string, any>[] = [];

      for (const item of rawItems) {
        if (item.city && item.piece) {
          mappedRecords.push({
            city: item.city,
            egg_rate: item.piece,
            tray_price: item.tray || item.piece * 30,
            hundred_price: item.hundred || item.piece * 100,
            peti_price: item.peti || item.piece * 210,
            wholesale_price: item.piece,
            retail_price: Number((item.piece * 1.06).toFixed(2)),
            currency: "INR",
            effective_date: item.effective_date || getCurrentDate(),
            source_name: "EggRateLab",
            original_url: cleanUrl,
            fetched_at: getCurrentDateTime(),
          });
        } else {
          const mappedObj: Record<string, any> = {
            fetched_at: getCurrentDateTime(),
            source_url: cleanUrl,
          };
          const mappings = config.fieldMappings || [
            { sourceField: "title.rendered", targetField: "title" },
            { sourceField: "date", targetField: "effective_date" },
            { sourceField: "slug", targetField: "slug" },
          ];
          for (const m of mappings) {
            const rawVal = m.sourceField.split(".").reduce((acc, part) => acc && acc[part], item);
            mappedObj[m.targetField] = this.applyTransformation(rawVal || m.defaultValue || "", m.transformations);
          }
          mappedRecords.push(mappedObj);
        }
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
