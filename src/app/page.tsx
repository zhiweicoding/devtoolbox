import Link from "next/link";

const tools = [
  { name: "XML Formatter", href: "/tools/xml-formatter", icon: "bi-file-earmark-code", desc: "Format, beautify, and minify XML with syntax highlighting and line numbers." },
  { name: "JWT Decoder", href: "/tools/jwt-decoder", icon: "bi-key", desc: "Decode and inspect JSON Web Tokens — header, payload, expiration and more." },
  { name: "LinkedIn Text Formatter", href: "/tools/linkedin-formatter", icon: "bi-linkedin", desc: "Format text with bold, italic, script and special Unicode fonts for LinkedIn." },
  { name: "Certificate Decoder", href: "/tools/cert-decoder", icon: "bi-shield-lock", desc: "Decode and inspect SSL/TLS certificate details instantly." },
  { name: "CSV Viewer", href: "/tools/csv-viewer", icon: "bi-table", desc: "View and explore CSV files as clean, interactive tables." },
  { name: "YAML Validator", href: "/tools/yaml-validator", icon: "bi-check-circle", desc: "Validate YAML syntax and pinpoint errors in real time." },
  { name: "Invoice Generator", href: "/tools/invoice-generator", icon: "bi-receipt", desc: "Create professional PDF invoices in seconds — no account needed." },
  { name: "YAML Formatter", href: "/tools/yaml-formatter", icon: "bi-code-square", desc: "Format and beautify YAML code with proper indentation." },
  { name: "Tone Generator", href: "/tools/tone-generator", icon: "bi-volume-up", desc: "Generate audio tones at any frequency for testing and calibration." },
  { name: "WiFi QR Generator", href: "/tools/wifi-qr-generator", icon: "bi-wifi", desc: "Create QR codes for instant WiFi connection sharing." },
];

const features = [
  {
    icon: "bi-lightning-charge",
    title: "Lightning Fast",
    desc: "All tools run directly in your browser with zero server round-trips. Results appear instantly.",
  },
  {
    icon: "bi-gift",
    title: "100% Free",
    desc: "No subscriptions, no paywalls, no hidden limits. Every tool is completely free to use.",
  },
  {
    icon: "bi-lock",
    title: "Private & Secure",
    desc: "Your data never leaves your browser. Nothing is uploaded, stored, or tracked.",
  },
];

const steps = [
  { step: "1", title: "Pick a Tool", desc: "Browse our collection and select the tool you need." },
  { step: "2", title: "Paste Your Data", desc: "Enter or paste your text, code, or token into the input area." },
  { step: "3", title: "Get Results", desc: "See formatted, decoded, or validated output instantly — copy with one click." },
];

const faqs = [
  {
    q: "Is DevToolBox really free?",
    a: "Yes, 100%. All tools are free to use with no signup, no limits, and no ads. We believe developer tools should be accessible to everyone.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. Every tool runs entirely in your browser using JavaScript. Your data is never sent to any server. You can verify this by checking the network tab in your browser's developer tools.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. There's no signup, no login, and no account required. Just open a tool and start using it immediately.",
  },
  {
    q: "Can I use these tools on mobile?",
    a: "Yes. All tools are fully responsive and work on phones, tablets, and desktops. The interface adapts to your screen size.",
  },
  {
    q: "What browsers are supported?",
    a: "DevToolBox works in all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Free Online Developer Tools
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Format, validate, decode, and generate — all in your browser. Fast, free, and private. No signup required.
          </p>
          <Link
            href="#tools"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
          >
            Explore Tools
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </Link>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">All Tools</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Pick a tool and get started in seconds. Everything runs client-side.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 min-h-[160px]"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xl mb-3"><i className={`bi ${t.icon}`}></i></div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{t.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why DevToolBox */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why DevToolBox?</h2>
            <p className="text-gray-500">Built by developers, for developers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 text-2xl mx-auto mb-4"><i className={`bi ${f.icon}`}></i></div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500">Three simple steps to get things done.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-gray-900 font-medium">
                  <span>{f.q}</span>
                  <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg">Pick any tool above and start using it right away — no signup, no hassle.</p>
          <Link
            href="#tools"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg"
          >
            Browse All Tools
          </Link>
        </div>
      </section>
    </div>
  );
}
