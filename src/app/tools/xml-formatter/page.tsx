"use client";

import { useState } from "react";
import { AdUnit } from "@/app/components/AdUnit";

type IndentType = "2" | "4" | "tab";

function formatXml(xml: string, indentType: IndentType): string {
  const PADDING = indentType === "tab" ? "\t" : " ".repeat(Number(indentType));
  let formatted = "";
  let indent = 0;
  const stripped = xml.replace(/(>)\s*(<)/g, "$1\n$2").replace(/\r\n|\r/g, "\n");
  const lines = stripped.split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      formatted += PADDING.repeat(indent) + line + "\n";
    } else if (line.endsWith("/>") || line.startsWith("<?") || line.startsWith("<!")) {
      formatted += PADDING.repeat(indent) + line + "\n";
    } else if (line.startsWith("<") && line.includes("</") && !line.startsWith("</")) {
      formatted += PADDING.repeat(indent) + line + "\n";
    } else if (line.startsWith("<") && !line.startsWith("</")) {
      formatted += PADDING.repeat(indent) + line + "\n";
      indent++;
    } else {
      formatted += PADDING.repeat(indent) + line + "\n";
    }
  }
  return formatted.trimEnd();
}

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, "><").replace(/\s*\n\s*/g, "").trim();
}

const xmlFaqs = [
  { q: "What is XML formatting?", a: "XML formatting (or beautifying) is the process of adding proper indentation and line breaks to XML code to make it human-readable. Minified XML saves space but is hard to read; formatted XML is structured and easy to understand." },
  { q: "Is my XML data safe?", a: "Yes. This tool runs entirely in your browser using JavaScript. Your XML is never uploaded to any server. You can verify this by checking the Network tab in your browser developer tools." },
  { q: "Can this tool fix invalid XML?", a: "This tool validates and formats XML, but it cannot fix structural errors. If your XML is invalid, it will show an error message describing the issue so you can fix it manually." },
  { q: "What indent options are available?", a: "You can choose between 2 spaces, 4 spaces, or tab characters for indentation. The default is 2 spaces, which is the most common convention." },
  { q: "What is the difference between XML and JSON?", a: "XML uses tags (like HTML) and supports attributes, namespaces, and schemas. JSON uses key-value pairs and is lighter weight. JSON is more common in modern APIs, while XML is still widely used in enterprise systems, SOAP services, and configuration files." },
];

export default function XmlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentType, setIndentType] = useState<IndentType>("2");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const format = () => {
    setError("");
    if (!input.trim()) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "application/xml");
      const parseError = doc.querySelector("parsererror");
      if (parseError) {
        setError("Invalid XML: " + (parseError.textContent?.slice(0, 200) || "Parse error"));
        setOutput("");
        return;
      }
      setOutput(formatXml(input, indentType));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to parse XML");
    }
  };

  const minify = () => {
    setError("");
    if (!input.trim()) return;
    setOutput(minifyXml(input));
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const outputLines = output.split("\n");

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            XML Formatter &amp; Beautifier Online
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-3xl">
            Paste compressed or minified XML and instantly format it into a readable, indented structure. Validate, beautify, or minify — all in your browser.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Indent:</span>
          {([["2", "2 spaces"], ["4", "4 spaces"], ["tab", "Tab"]] as [IndentType, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setIndentType(val)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                indentType === val
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={format} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
              Format
            </button>
            <button onClick={minify} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
              Minify
            </button>
            <button onClick={clear} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
              Clear
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <i className="bi bi-x-circle text-red-600"></i> {error}
          </div>
        )}

        {/* Editor panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">Input</span>
              <span className="text-xs text-gray-400">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your XML here..."
              className="w-full h-[500px] p-4 font-mono text-sm resize-none focus:outline-none text-gray-900 bg-white"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">Output</span>
              <button
                onClick={copy}
                disabled={!output}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? <><i className="bi bi-check-lg"></i> Copied</> : <><i className="bi bi-clipboard"></i> Copy</>}
              </button>
            </div>
            <div className="h-[500px] overflow-auto font-mono text-sm bg-gray-900 text-gray-100">
              {output ? (
                <table className="w-full">
                  <tbody>
                    {outputLines.map((line, i) => (
                      <tr key={i} className="hover:bg-gray-800/50">
                        <td className="px-3 py-0 text-right text-gray-600 select-none border-r border-gray-800 w-10 text-xs align-top">{i + 1}</td>
                        <td className="px-3 py-0 whitespace-pre text-gray-100">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-gray-500">Formatted XML will appear here...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ad after tool */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdUnit />
      </div>

      {/* SEO Content */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What is XML Formatting?</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>XML formatting (also called XML beautifying or pretty-printing) is the process of transforming compressed or minified XML into a well-structured, human-readable format with proper indentation and line breaks.</p>
              <p>Minified XML removes all unnecessary whitespace to reduce file size, which is great for data transfer but makes the code nearly impossible to read. A formatter reverses this process, adding consistent indentation so you can easily see the hierarchy of elements, attributes, and nested structures.</p>
              <p>This is essential for debugging API responses, inspecting configuration files, reviewing SOAP messages, and working with any XML-based data format.</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our XML Formatter</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>Paste your XML into the input panel on the left.</li>
                <li>Choose your preferred indentation — 2 spaces, 4 spaces, or tabs.</li>
                <li>Click &quot;Format&quot; to beautify, or &quot;Minify&quot; to compress.</li>
                <li>The formatted output appears on the right with line numbers.</li>
                <li>Click &quot;Copy&quot; to copy the result to your clipboard.</li>
              </ol>
              <p>If your XML contains syntax errors, the tool will display a clear error message to help you identify and fix the issue.</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">XML vs JSON</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>Both XML and JSON are popular data interchange formats, but they serve different purposes:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">XML Strengths</h3>
                  <ul className="text-sm space-y-2 text-gray-500">
                    <li>• Supports attributes and namespaces</li>
                    <li>• Schema validation (XSD, DTD)</li>
                    <li>• XSLT transformations</li>
                    <li>• Widely used in enterprise and SOAP APIs</li>
                    <li>• Self-describing with rich metadata</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">JSON Strengths</h3>
                  <ul className="text-sm space-y-2 text-gray-500">
                    <li>• Lighter weight and less verbose</li>
                    <li>• Native JavaScript support</li>
                    <li>• Easier to parse and generate</li>
                    <li>• Dominant in REST APIs and modern web</li>
                    <li>• Better for nested data structures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Ad between XML vs JSON and FAQ */}
          <AdUnit />

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {xmlFaqs.map((f, i) => (
                <details key={i} className="group bg-white rounded-xl border border-gray-200">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-gray-900 font-medium">
                    <span>{f.q}</span>
                    <svg className="faq-chevron w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Ad after FAQ */}
          <AdUnit />
        </div>
      </section>
    </div>
  );
}
