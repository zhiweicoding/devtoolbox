"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { FORMAT_DEFS, boldMap, italicMap, applyMap, addCombining } from "./unicode-formats";
import { AdUnit } from "@/app/components/AdUnit";

// ─── Toast Component ───
function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fade-in">
      <i className="bi bi-check-lg"></i> {message}
    </div>
  );
}

// ─── Toolbar ───
function Toolbar({ onFormat }: { onFormat: (type: string) => void }) {
  const buttons: { label: React.ReactNode; title: string; action: string; className: string }[] = [
    { label: "B", title: "Bold", action: "bold", className: "font-bold" },
    { label: "I", title: "Italic", action: "italic", className: "italic" },
    { label: "U", title: "Underline", action: "underline", className: "underline" },
    { label: "S", title: "Strikethrough", action: "strikethrough", className: "line-through" },
    { label: <i className="bi bi-link-45deg"></i>, title: "Link (wrap in brackets)", action: "link", className: "" },
    { label: "1.", title: "Numbered List", action: "numbered", className: "text-xs font-mono" },
    { label: "•", title: "Bullet Points", action: "bullets", className: "text-lg leading-none" },
    { label: <i className="bi bi-check-square"></i>, title: "Checklist", action: "checklist", className: "" },
  ];
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {buttons.map((b) => (
        <button
          key={b.action}
          title={b.title}
          onClick={() => onFormat(b.action)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-colors text-sm ${b.className}`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

// ─── LinkedIn Post Preview ───
function PostPreview({ text, isMobile }: { text: string; isMobile: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const shouldTruncate = lines.length > 3 && !expanded;
  const displayText = shouldTruncate ? lines.slice(0, 3).join("\n") : text;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${isMobile ? "max-w-[340px]" : "w-full"} mx-auto`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm text-gray-900">Your Name</p>
          <p className="text-xs text-gray-500">Your headline here</p>
          <p className="text-xs text-gray-400">Just now · <i className="bi bi-globe"></i></p>
        </div>
      </div>
      {/* Content */}
      <div className="px-4 py-2 min-h-[60px]">
        {text ? (
          <div className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
            {displayText}
            {shouldTruncate && (
              <button onClick={() => setExpanded(true)} className="text-gray-500 hover:text-gray-700 ml-1">
                ...more
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Your formatted text will appear here...</p>
        )}
      </div>
      {/* Engagement stats */}
      <div className="px-4 py-1 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
        <span><i className="bi bi-hand-thumbs-up"></i> <i className="bi bi-heart"></i> 12</span>
        <span>3 comments · 1 repost</span>
      </div>
      {/* Action buttons */}
      <div className="flex items-center justify-around py-2 px-2">
        {[
          { icon: "bi-hand-thumbs-up", label: "Like" },
          { icon: "bi-chat-dots", label: "Comment" },
          { icon: "bi-arrow-repeat", label: "Repost" },
          { icon: "bi-send", label: "Send" },
        ].map((a) => (
          <button key={a.label} className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-xs text-gray-600 transition-colors">
            <i className={`bi ${a.icon}`}></i>
            <span className="hidden sm:inline">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Format Row ───
function FormatRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
      <span className="w-36 flex-shrink-0 text-sm font-medium text-gray-600">{label}</span>
      <input
        type="text"
        readOnly
        value={value}
        className="flex-1 min-w-0 text-sm text-gray-900 bg-transparent border-0 outline-none truncate"
      />
      <button
        onClick={() => onCopy(value, label)}
        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        Copy
      </button>
    </div>
  );
}

// ─── FAQ Data ───
const faqs = [
  {
    q: "Does LinkedIn support bold and italic text natively?",
    a: "LinkedIn does not offer built-in rich text formatting for posts and comments. This tool uses Unicode characters that visually resemble bold, italic, and other styles, allowing you to paste styled text directly into LinkedIn.",
  },
  {
    q: "Will formatted text affect my LinkedIn post reach?",
    a: "There is no evidence that Unicode-formatted text negatively impacts LinkedIn's algorithm. In fact, posts with visual variety tend to attract more engagement and stop the scroll.",
  },
  {
    q: "Can screen readers read Unicode-formatted text?",
    a: "Most screen readers cannot interpret Unicode mathematical symbols as regular letters. Use formatted text sparingly and ensure your core message is also conveyed in plain text for accessibility.",
  },
  {
    q: "Is this tool free to use?",
    a: "Yes, completely free with no limits. No signup, no account, no ads. The tool runs entirely in your browser — your text is never sent to any server.",
  },
  {
    q: "Can I use this for other platforms like Twitter or Instagram?",
    a: "Absolutely. The Unicode characters work on any platform that supports Unicode text, including Twitter/X, Instagram bios, Facebook, WhatsApp, and more.",
  },
  {
    q: "How many formatting styles are available?",
    a: "We offer 22 different formatting styles including Bold, Italic, Sans-Serif variants, Underline, Strikethrough, Script, Double-struck, Fullwidth, case conversions, and list formatting options like numbered lists, bullet points, and checklists.",
  },
];

const relatedTools = [
  { name: "JWT Decoder", href: "/tools/jwt-decoder", icon: "bi-key" },
  { name: "XML Formatter", href: "/tools/xml-formatter", icon: "bi-file-earmark-code" },
  { name: "YAML Validator", href: "/tools/yaml-validator", icon: "bi-check-circle" },
  { name: "CSV Viewer", href: "/tools/csv-viewer", icon: "bi-table" },
  { name: "QR Code Generator", href: "/tools/wifi-qr-generator", icon: "bi-qr-code" },
  { name: "Invoice Generator", href: "/tools/invoice-generator", icon: "bi-receipt" },
];

// ─── Main Page ───
export default function LinkedInFormatterPage() {
  const [input, setInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  const [proToast, setProToast] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const copyText = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${label} copied!`);
      } catch {
        showToast("Failed to copy");
      }
    },
    [showToast]
  );

  const showProToast = useCallback((feature: string) => {
    setProToast(`${feature} — Coming soon! Sign up for Pro.`);
    setTimeout(() => setProToast(null), 3000);
  }, []);

  const handleToolbarFormat = useCallback(
    (type: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = input.slice(start, end);
      if (!selected && type !== "numbered" && type !== "bullets" && type !== "checklist") return;

      let formatted = selected;
      switch (type) {
        case "bold":
          formatted = applyMap(selected, boldMap);
          break;
        case "italic":
          formatted = applyMap(selected, italicMap);
          break;
        case "underline":
          formatted = addCombining(selected, "\u0332");
          break;
        case "strikethrough":
          formatted = addCombining(selected, "\u0336");
          break;
        case "link":
          formatted = `[${selected}](url)`;
          break;
        case "numbered": {
          const lines = (selected || input).split("\n");
          formatted = lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
          if (!selected) {
            setInput(formatted);
            return;
          }
          break;
        }
        case "bullets": {
          const lines = (selected || input).split("\n");
          formatted = lines.map((l) => `• ${l}`).join("\n");
          if (!selected) {
            setInput(formatted);
            return;
          }
          break;
        }
        case "checklist": {
          const lines = (selected || input).split("\n");
          formatted = lines.map((l) => `☐ ${l}`).join("\n");
          if (!selected) {
            setInput(formatted);
            return;
          }
          break;
        }
      }
      const newText = input.slice(0, start) + formatted + input.slice(end);
      setInput(newText);
    },
    [input]
  );

  return (
    <div>
      <Toast message={toast} />
      {proToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fade-in">
          {proToast}
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            LinkedIn Text Formatter
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-2xl">
            Easily format the text of your LinkedIn post with bold, italic, underlined and more for free.
          </p>
        </div>
      </section>

      {/* Editor + Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <Toolbar onFormat={handleToolbarFormat} />
              <textarea
                ref={textareaRef}
                className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 text-base leading-relaxed"
                placeholder="Write here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => copyText(input, "Text")}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="bi bi-clipboard me-1"></i> Copy text
                </button>
                <button
                  onClick={() => showProToast("Schedule")}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <i className="bi bi-calendar-check me-1"></i> Schedule
                </button>
                <button
                  onClick={() => showProToast("Post now")}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <i className="bi bi-send me-1"></i> Post now
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Post Preview</h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsMobile(true)}
                    className={`p-2 rounded-lg text-sm transition-colors ${isMobile ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
                    title="Mobile view"
                  >
                    <i className="bi bi-phone"></i>
                  </button>
                  <button
                    onClick={() => setIsMobile(false)}
                    className={`p-2 rounded-lg text-sm transition-colors ${!isMobile ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
                    title="Desktop view"
                  >
                    <i className="bi bi-display"></i>
                  </button>
                </div>
              </div>
              <PostPreview text={input} isMobile={isMobile} />
            </div>
          </div>
        </div>
      </section>

      {/* 22 Format Previews */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All 22 Formats</h2>
          {!input ? (
            <p className="text-gray-400 text-sm py-8 text-center">
              Start typing above to see all 22 formatted previews
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {FORMAT_DEFS.map((f) => (
                <FormatRow
                  key={f.key}
                  label={f.label}
                  value={f.transform(input)}
                  onCopy={copyText}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ad after format previews */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <AdUnit />
      </div>

      {/* SEO: How to use */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How to use the LinkedIn Text Formatter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Type or paste your text",
                  desc: "Enter the text you want to format in the editor above. You can write from scratch or paste existing content.",
                },
                {
                  step: "2",
                  title: "Choose your format",
                  desc: "Use the toolbar for quick formatting, or scroll down to see all 22 format styles applied to your text in real time.",
                },
                {
                  step: "3",
                  title: "Copy and paste to LinkedIn",
                  desc: "Click the Copy button next to any format, then paste it directly into your LinkedIn post, comment, or bio.",
                },
              ].map((s) => (
                <div key={s.step} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ad between How to use and FAQ */}
          <AdUnit />

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="group bg-white rounded-xl border border-gray-200">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-gray-900 font-medium text-sm">
                    <span>{f.q}</span>
                    <svg
                      className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0 ml-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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

          {/* More tools */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More free tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relatedTools.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-sm text-gray-700 hover:text-blue-700"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 flex-shrink-0"><i className={`bi ${t.icon} text-lg`}></i></span>
                  <span className="font-medium">{t.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
