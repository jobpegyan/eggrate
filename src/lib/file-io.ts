/**
 * Browser-side file helpers for the import/export system.
 * `xlsx` is loaded lazily so the admin bundle stays small.
 */

export type SheetRow = Record<string, string | number | null>;

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: SheetRow[], columns?: string[]): string {
  const headers = columns ?? Object.keys(rows[0] ?? {});
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
}

export function downloadCsv(rows: SheetRow[], fileName: string, columns?: string[]) {
  download(new Blob([toCsv(rows, columns)], { type: "text/csv;charset=utf-8" }), fileName);
}

export function downloadJson(data: unknown, fileName: string) {
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), fileName);
}

export async function downloadXlsx(rows: SheetRow[], fileName: string, sheetName = "Data") {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  const buffer = XLSX.write(book, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  download(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    fileName,
  );
}

function parseCsv(text: string): SheetRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const split = (line: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        if (quoted && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        cells.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells.map((cell) => cell.trim());
  };

  const headers = split(lines[0] ?? "").map((header) => header.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row: SheetRow = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });
}

/** Reads a user-selected CSV or Excel file into plain rows keyed by header. */
export async function readSpreadsheet(file: File): Promise<SheetRow[]> {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  if (!isExcel) return parseCsv(await file.text());

  const XLSX = await import("xlsx");
  const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const first = book.SheetNames[0];
  if (!first) return [];
  const sheet = book.Sheets[first];
  if (!sheet) return [];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
  return raw.map((row) => {
    const normalised: SheetRow = {};
    for (const [key, value] of Object.entries(row)) {
      normalised[key.trim().toLowerCase()] = value === null ? "" : (value as string);
    }
    return normalised;
  });
}

export function fileFormatOf(file: File): "csv" | "xlsx" {
  return /\.(xlsx|xls)$/i.test(file.name) ? "xlsx" : "csv";
}
