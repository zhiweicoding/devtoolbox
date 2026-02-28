"use client";

import { useState, useRef, useMemo } from "react";
import { AdUnit } from "@/app/components/AdUnit";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cell += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\r" && next === "\n") { row.push(cell); cell = ""; rows.push(row); row = []; i++; }
      else if (ch === "\n") { row.push(cell); cell = ""; rows.push(row); row = []; }
      else { cell += ch; }
    }
  }
  if (cell || row.length > 0) { row.push(cell); rows.push(row); }
  if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") rows.pop();
  const maxCols = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => { while (r.length < maxCols) r.push(""); return r; });
}

const RELATED_TOOLS = [
  { name: "YAML Validator", href: "/tools/yaml-validator", icon: "bi bi-check-circle", desc: "Validate YAML syntax instantly" },
  { name: "XML Formatter", href: "/tools/xml-formatter", icon: "bi bi-file-earmark-code", desc: "Format and beautify XML code" },
  { name: "Invoice Generator", href: "/tools/invoice-generator", icon: "bi bi-receipt", desc: "Create professional PDF invoices" },
];

const FAQS = [
  { q: "What is the maximum file size supported?", a: "Since this tool runs entirely in your browser, the limit depends on your device's available memory. Most modern devices can handle CSV files up to 50MB without issues." },
  { q: "Does this tool upload my data to a server?", a: "No. All CSV parsing and rendering happens locally in your browser. Your data never leaves your device." },
  { q: "Can I edit the CSV data in the table?", a: "This tool is a viewer, not an editor. You can sort, search, and filter your data, but editing is not currently supported." },
  { q: "What delimiters are supported?", a: "Currently, this tool supports comma-separated values (CSV). TSV (tab-separated) files can be pasted but will be treated as single-column data." },
];

export default function CSVViewerPage() {
  const [rawText, setRawText] = useState("");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const parsed = useMemo(() => (rawText.trim() ? parseCSV(rawText) : []), [rawText]);
  const headers = parsed[0] || [];
  const dataRows = parsed.slice(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return dataRows;
    const q = search.toLowerCase();
    return dataRows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
  }, [dataRows, search]);

  const sorted = useMemo(() => {
    if (sortCol === null) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortCol] ?? "", vb = b[sortCol] ?? "";
      const na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return sortAsc ? na - nb : nb - na;
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, sortCol, sortAsc]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setRawText(ev.target?.result as string); };
    reader.readAsText(file);
  };

  const handleSort = (col: number) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const copyTable = async () => {
    await navigator.clipboard.writeText(rawText);
    showToast("CSV data copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <i className="bi bi-table"></i> <span>Free Online Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">CSV Viewer Online<br className="hidden md:block" /><span className="text-blue-200"> — View CSV Files as Tables</span></h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">Upload or paste CSV data to instantly view it as a beautiful, sortable, searchable table. No signup, no server upload — everything runs in your browser.</p>
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button onClick={() => fileRef.current?.click()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm">
              <i className="bi bi-folder2-open"></i> Upload CSV File
            </button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFile} />
            {rawText && (
              <button onClick={() => { setRawText(""); setSearch(""); setSortCol(null); }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Clear
              </button>
            )}
          </div>
          <textarea
            className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm text-gray-900 bg-gray-50"
            placeholder={"name,email,age\nAlice,[email],30\nBob,[email],25"}
            value={rawText} onChange={(e) => setRawText(e.target.value)}
          />

          {parsed.length > 1 && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                    {sorted.length} row{sorted.length !== 1 ? "s" : ""} × {headers.length} column{headers.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <input type="text" placeholder="Search rows..." value={search} onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"><i className="bi bi-search"></i></span>
                  </div>
                  <button onClick={copyTable} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">
                    <i className="bi bi-clipboard"></i> Copy CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 w-12">#</th>
                      {headers.map((h, i) => (
                        <th key={i} onClick={() => handleSort(i)}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap">
                          {h || `Col ${i + 1}`}
                          {sortCol === i && <span className="ml-1 text-indigo-600">{sortAsc ? <i className="bi bi-sort-up"></i> : <i className="bi bi-sort-down"></i>}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((row, ri) => (
                      <tr key={ri} className={`${ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/50 transition-colors`}>
                        <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{ri + 1}</td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-2.5 text-gray-900 whitespace-nowrap max-w-xs truncate" title={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sorted.length === 0 && search && (
                <p className="text-center text-gray-400 py-8 text-sm">No rows match &quot;{search}&quot;</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Ad after tool */}
      <div className="max-w-6xl mx-auto px-6">
        <AdUnit />
      </div>

      {/* SEO Content */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a CSV File?</h2>
          <p className="text-gray-600 leading-relaxed">CSV (Comma-Separated Values) is one of the most common file formats for storing tabular data. Each line in a CSV file represents a row, and values within each row are separated by commas. CSV files are widely used for data exchange between applications — you can export data from databases, spreadsheets (Excel, Google Sheets), CRM systems, and analytics platforms as CSV. Despite its simplicity, CSV has nuances: fields containing commas or newlines must be enclosed in double quotes, and double quotes within fields are escaped by doubling them.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Open CSV Files Online</h2>
          <p className="text-gray-600 leading-relaxed">Opening CSV files doesn&apos;t require installing any software. With this online CSV viewer, you can either upload a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.csv</code> file directly from your computer or paste the raw CSV text into the input area. The tool instantly parses the data and renders it as a clean, interactive table. You can click any column header to sort the data (ascending or descending), use the search box to filter rows, and see row/column counts at a glance. This is especially useful for quickly inspecting data exports, log files, or datasets without opening a full spreadsheet application.</p>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                  {faq.q}
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform"><i className="bi bi-chevron-down"></i></span>
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {RELATED_TOOLS.map((t) => (
            <a key={t.href} href={t.href} className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xl mb-2"><i className={t.icon}></i></div>
              <h3 className="font-semibold text-gray-900 mb-1">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}