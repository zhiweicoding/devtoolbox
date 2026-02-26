"use client";

import { useState } from "react";
import yaml from "js-yaml";

const RELATED_TOOLS = [
  { name: "YAML Validator", href: "/tools/yaml-validator", icon: "bi bi-check-circle", desc: "Validate YAML syntax and find errors" },
  { name: "XML Formatter", href: "/tools/xml-formatter", icon: "bi bi-file-earmark-code", desc: "Format and beautify XML code" },
  { name: "CSV Viewer", href: "/tools/csv-viewer", icon: "bi bi-table", desc: "View CSV files as interactive tables" },
];

const FAQS = [
  { q: "Does formatting change my YAML data?", a: "No. Formatting only adjusts whitespace and indentation. The underlying data structure remains identical — you can verify by comparing the parsed output before and after formatting." },
  { q: "Should I use 2 or 4 spaces for YAML indentation?", a: "Both are valid. 2 spaces is the most common convention (used by Kubernetes, Docker Compose, and most YAML style guides). 4 spaces can improve readability for deeply nested structures. Pick one and stay consistent." },
  { q: "Does sorting keys affect my YAML behavior?", a: "Sorting keys changes the order of key-value pairs but not the data itself. Most YAML consumers treat mappings as unordered, so sorting is safe. However, some tools may depend on key order — use with caution in those cases." },
  { q: "Can I format multi-document YAML files?", a: "Currently, this tool formats a single YAML document. If your file contains multiple documents separated by ---, format each document separately." },
];

export default function YamlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const format = () => {
    setError(""); setOutput("");
    if (!input.trim()) return;
    try {
      const parsed = yaml.load(input);
      const formatted = yaml.dump(parsed, { indent, lineWidth: -1, noRefs: true, sortKeys });
      setOutput(formatted);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid YAML");
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    showToast("Formatted YAML copied to clipboard!");
  };

  const outputLines = output.split("\n");

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <i className="bi bi-code-square"></i> <span>Free Online Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">YAML Formatter &amp; Beautifier Online</h1>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto">Paste messy YAML and instantly format it with consistent indentation. Choose 2 or 4 spaces, sort keys, and copy the clean output.</p>
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Indent:</span>
              {([2, 4] as const).map((n) => (
                <button key={n} onClick={() => setIndent(n)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${indent === n ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {n} spaces
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="accent-violet-600 w-4 h-4" />
              Sort keys
            </label>
            <div className="ml-auto flex gap-3">
              <button onClick={format} disabled={!input.trim()}
                className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
                <i className="bi bi-stars"></i> Format
              </button>
              <button onClick={() => { setInput(""); setOutput(""); setError(""); }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                Clear
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"><i className="bi bi-x-circle-fill text-red-500"></i> {error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Input</span>
                <span className="text-xs text-gray-400">{input.split("\n").length} lines</span>
              </div>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={"server:\n    host: localhost\n    port:   8080\ndatabase:\n      name: mydb\n      host: 127.0.0.1"}
                className="w-full h-[420px] bg-gray-50 border border-gray-300 rounded-xl p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-900"
                spellCheck={false}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Formatted Output</span>
                <button onClick={copy} disabled={!output}
                  className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-40 transition-colors">
                  <i className="bi bi-clipboard"></i> Copy
                </button>
              </div>
              <div className="w-full h-[420px] bg-gray-50 border border-gray-300 rounded-xl overflow-auto font-mono text-sm">
                {output ? (
                  <table className="w-full">
                    <tbody>
                      {outputLines.map((line, i) => (
                        <tr key={i} className="hover:bg-violet-50/50">
                          <td className="px-3 py-0 text-right text-gray-400 select-none border-r border-gray-200 w-10 text-xs">{i + 1}</td>
                          <td className="px-3 py-0 whitespace-pre text-gray-900">{line}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-gray-400 flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-3xl mb-2"><i className="bi bi-code-square"></i></div>
                      <p>Formatted YAML will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is YAML Formatting?</h2>
          <p className="text-gray-600 leading-relaxed">YAML formatting is the process of applying consistent indentation, spacing, and structure to YAML documents. Well-formatted YAML is easier to read, review, and maintain. Formatting ensures that indentation levels are uniform (typically 2 or 4 spaces), removes unnecessary whitespace, and presents the data hierarchy clearly. This is especially important in team environments where multiple developers edit the same configuration files — consistent formatting reduces merge conflicts and makes code reviews more efficient.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">YAML Best Practices</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["Use Consistent Indentation", "Pick 2 or 4 spaces and stick with it across your entire project. Never use tabs in YAML files."],
              ["Quote Strings When Needed", "Strings containing special characters (:, #, {, }) or that look like numbers/booleans should be quoted."],
              ["Add Comments", "YAML supports comments with #. Use them to document non-obvious configuration choices."],
              ["Keep It Flat", "Avoid deeply nested structures when possible. Flat YAML is easier to read and less error-prone."],
            ].map(([title, desc]) => (
              <div key={title} className="p-4 bg-white rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
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
            <a key={t.href} href={t.href} className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all">
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