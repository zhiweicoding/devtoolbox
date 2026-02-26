import Link from "next/link";

const formatters = [
  { name: "XML Formatter", href: "/tools/xml-formatter" },
  { name: "YAML Formatter", href: "/tools/yaml-formatter" },
  { name: "LinkedIn Formatter", href: "/tools/linkedin-formatter" },
];

const decoders = [
  { name: "JWT Decoder", href: "/tools/jwt-decoder" },
  { name: "Certificate Decoder", href: "/tools/cert-decoder" },
  { name: "CSV Viewer", href: "/tools/csv-viewer" },
];

const generators = [
  { name: "Invoice Generator", href: "/tools/invoice-generator" },
  { name: "Tone Generator", href: "/tools/tone-generator" },
  { name: "WiFi QR Generator", href: "/tools/wifi-qr-generator" },
];

const validators = [
  { name: "YAML Validator", href: "/tools/yaml-validator" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <i className="bi bi-tools text-xl"></i>
              <span>DevToolBox</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Free online developer tools that run entirely in your browser. No data is sent to any server — your privacy is guaranteed.
            </p>
          </div>

          {/* Formatters */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Formatters</h3>
            <ul className="space-y-2">
              {formatters.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-sm hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Decoders */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Decoders & Viewers</h3>
            <ul className="space-y-2">
              {decoders.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-sm hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Generators */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Generators</h3>
            <ul className="space-y-2">
              {generators.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-sm hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Validators */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Validators</h3>
            <ul className="space-y-2">
              {validators.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-sm hover:text-white transition-colors">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} DevToolBox. All rights reserved.</p>
          <p className="text-xs text-gray-500">All tools run client-side. No data leaves your browser.</p>
        </div>
      </div>
    </footer>
  );
}
