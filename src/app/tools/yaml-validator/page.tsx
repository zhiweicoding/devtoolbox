"use client";

import { useState } from "react";
import yaml from "js-yaml";

interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  json?: string;
}

function validateYAML(input: string): ValidationResult {
  try {
    const parsed = yaml.load(input);
    return { valid: true, json: JSON.stringify(parsed, null, 2) };
  } catch (e: unknown) {
    if (e instanceof yaml.YAMLException) {
      return { valid: false, error: e.message, line: e.mark?.line !== undefined ? e.mark.line + 1 : undefined };
    }
    return { valid: false, error: String(e) };
  }
}

const RELATED_TOOLS = [
  { name: "YAML Formatter", href: "/tools/yaml-formatter", icon: "bi bi-code-square", desc: "Format and beautify YAML with proper indentation" },
  { name: "XML Formatter", href: "/tools/xml-formatter", icon: "bi bi-file-earmark-code", desc: "Format and beautify XML code" },
  { name: "JWT Decoder", href: "/tools/jwt-decoder", icon: "bi bi-key", desc: "Decode and inspect JSON Web Tokens" },
];

const FAQS = [
  { q: "Is this YAML validator free to use?", a: "Yes, completely free with no limits. The tool runs entirely in your browser — no account, no signup, no server processing required." },
  { q: "Which YAML versions are supported?", a: "This tool uses the js-yaml library which supports YAML 1.2 specification, the most current version. It handles all standard YAML features including anchors, aliases, multi-line strings, and complex mappings." },
  { q: "Can I validate multiple YAML documents?", a: "Currently, the tool validates a single YAML document at a time. If your file contains multiple documents separated by ---, paste each document separately for validation." },
  { q: "Does this tool fix YAML errors automatically?", a: "No, this tool identifies and reports errors with line numbers and descriptions so you can fix them yourself. Automatic fixing could introduce unintended changes to your configuration." },
];

export default function YAMLValidatorPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const handleValidate = () => {
    if (!input.trim()) return;
    setResult(validateYAML(input));
  };

  const copyJSON = async () => {
    if (!result?.json) return;
    await navigator.clipboard.writeText(result.json);
    showToast("JSON copied to clipboard!");
  };

  const lines = input.split("\n");

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <i className="bi bi-check-circle"></i> <span>Free Online Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">YAML Validator Online<br className="hidden md:block" /><span className="text-green-200"> — Check YAML Syntax</span></h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto">Paste your YAML to instantly validate syntax, find errors with line numbers, and preview the parsed JSON output. Everything runs in your browser.</p>
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">YAML Input</label>
              <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                <div className="bg-gray-50 px-2 py-3 text-right select-none border-r border-gray-200 min-w-[3rem]">
                  {lines.map((_, i) => (
                    <div key={i} className={`text-xs leading-5 font-mono ${result && !result.valid && result.line === i + 1 ? "text-red-600 font-bold bg-red-50" : "text-gray-400"}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  className="flex-1 p-3 resize-none font-mono text-sm text-gray-900 focus:outline-none leading-5 min-h-[350px]"
                  placeholder={"server:\n  host: localhost\n  port: 8080\ndatabase:\n  name: mydb"}
                  value={input} onChange={(e) => { setInput(e.target.value); setResult(null); }}
                  spellCheck={false}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleValidate} disabled={!input.trim()}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
                  <i className="bi bi-check-circle"></i> Validate YAML
                </button>
                <button onClick={() => { setInput(""); setResult(null); }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  Clear
                </button>
              </div>
            </div>

            {/* Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Validation Result</label>
              {!result && (
                <div className="h-[350px] border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm bg-gray-50">
                  <div className="text-center">
                    <div className="text-4xl mb-3"><i className="bi bi-clipboard"></i></div>
                    <p>Paste YAML and click Validate</p>
                  </div>
                </div>
              )}

              {result && !result.valid && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 p-4 flex items-center gap-3 border-b border-red-200">
                    <span className="text-2xl"><i className="bi bi-x-circle-fill text-red-500"></i></span>
                    <div>
                      <span className="text-lg font-semibold text-red-800">Invalid YAML</span>
                      {result.line && <p className="text-sm text-red-600">Error at line {result.line}</p>}
                    </div>
                  </div>
                  <pre className="p-4 text-sm text-red-700 bg-red-50/50 overflow-x-auto whitespace-pre-wrap font-mono max-h-[280px] overflow-y-auto">{result.error}</pre>
                </div>
              )}

              {result?.valid && result.json && (
                <div className="border border-green-200 rounded-xl overflow-hidden">
                  <div className="bg-green-50 p-4 flex items-center justify-between border-b border-green-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl"><i className="bi bi-check-circle-fill text-green-500"></i></span>
                      <span className="text-lg font-semibold text-green-800">Valid YAML</span>
                    </div>
                    <button onClick={copyJSON} className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
                      <i className="bi bi-clipboard"></i> Copy JSON
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-gray-900 overflow-x-auto max-h-[280px] overflow-y-auto bg-green-50/30">{result.json}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is YAML?</h2>
          <p className="text-gray-600 leading-relaxed">YAML (YAML Ain&apos;t Markup Language) is a human-readable data serialization format commonly used for configuration files and data exchange. Unlike JSON, YAML uses indentation to represent structure, making it cleaner and easier to read. YAML is the standard format for Kubernetes manifests, Docker Compose files, Ansible playbooks, GitHub Actions workflows, and many other DevOps tools. Its support for comments, multi-line strings, and complex data types makes it a favorite among developers and system administrators.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common YAML Syntax Errors</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["Incorrect Indentation", "YAML uses spaces (not tabs) for indentation. Mixing tabs and spaces or inconsistent indentation levels will cause parse errors."],
              ["Missing Colons", "Key-value pairs require a colon followed by a space. Writing key:value without a space after the colon is invalid."],
              ["Unquoted Special Characters", "Values containing characters like :, #, {, }, [, ] should be quoted to avoid ambiguity."],
              ["Duplicate Keys", "Having the same key twice at the same level can cause unexpected behavior — the last value silently wins."],
            ].map(([title, desc]) => (
              <div key={title} className="p-4 bg-white rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">YAML vs JSON vs TOML</h2>
          <p className="text-gray-600 leading-relaxed">YAML, JSON, and TOML are all popular data serialization formats, each with distinct strengths. JSON is the most widely supported and is the standard for APIs and web data exchange, but it lacks comments and can be verbose. YAML offers better readability with its indentation-based syntax and supports comments, making it ideal for configuration files. TOML provides a middle ground with an INI-like syntax that&apos;s easy to read and supports comments, commonly used in Rust (Cargo.toml) and Python (pyproject.toml) ecosystems. Choose YAML for complex configurations, JSON for data interchange, and TOML for simple config files.</p>
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
            <a key={t.href} href={t.href} className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all">
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