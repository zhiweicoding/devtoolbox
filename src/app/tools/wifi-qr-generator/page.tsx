"use client";

import { useState, useCallback, useRef } from "react";
import QRCode from "qrcode";

type Encryption = "WPA" | "WEP" | "nopass";

const RELATED_TOOLS = [
  { name: "Tone Generator", href: "/tools/tone-generator", icon: "bi bi-volume-up", desc: "Generate audio tones at any frequency" },
  { name: "Invoice Generator", href: "/tools/invoice-generator", icon: "bi bi-receipt", desc: "Create professional PDF invoices" },
  { name: "Certificate Decoder", href: "/tools/cert-decoder", icon: "bi bi-shield-lock", desc: "Decode SSL/TLS certificate details" },
];

const FAQS = [
  { q: "Is it safe to share my WiFi password via QR code?", a: "The QR code is generated entirely in your browser — your WiFi credentials are never sent to any server. However, anyone who scans the QR code will be able to connect to your network, so share it only with trusted people." },
  { q: "Which devices can scan WiFi QR codes?", a: "Most modern smartphones can scan WiFi QR codes natively using their camera app. iPhones (iOS 11+) and Android phones (Android 10+) support this out of the box." },
  { q: "What encryption type should I choose?", a: "Choose WPA/WPA2 for most modern networks — it's the standard and most secure option. WEP is an older, less secure protocol. Select 'None' only for open networks without a password." },
  { q: "Can I customize the QR code appearance?", a: "Currently, the tool generates standard black-and-white QR codes optimized for maximum scan reliability." },
];

function escapeWifi(s: string) {
  return s.replace(/[\\;,:""]/g, (c) => "\\" + c);
}

export default function WifiQrGenerator() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<Encryption>("WPA");
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = useCallback(async () => {
    if (!ssid.trim()) return;
    const wifiString = `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden ? "true" : "false"};;`;
    try {
      const url = await QRCode.toDataURL(wifiString, { width: 300, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
      setQrDataUrl(url);
    } catch { setQrDataUrl(null); }
  }, [ssid, password, encryption, hidden]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `wifi-${ssid || "qrcode"}.png`;
    a.click();
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">{toast}</div>}

      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">WiFi QR Code Generator</h1>
          <p className="text-xl text-teal-100">Create a QR code to share your WiFi network instantly. No app needed — just scan and connect.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">WiFi Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network Name (SSID)</label>
                <input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)}
                  placeholder="Enter your WiFi name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter WiFi password" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none pr-12"
                    disabled={encryption === "nopass"} />
                  <button onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
                <div className="flex gap-2">
                  {(["WPA", "WEP", "nopass"] as Encryption[]).map((enc) => (
                    <button key={enc} onClick={() => { setEncryption(enc); if (enc === "nopass") setPassword(""); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${encryption === enc ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>
                      {enc === "nopass" ? "None" : enc}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="rounded" />
                Hidden network
              </label>
              <button onClick={generateQR} disabled={!ssid.trim()}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Generate QR Code
              </button>
            </div>
          </div>

          {/* QR Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <>
                <img src={qrDataUrl} alt="WiFi QR Code" className="w-64 h-64 mb-4" />
                <p className="text-sm text-gray-500 mb-4">Scan with your phone camera to connect</p>
                <div className="flex gap-3">
                  <button onClick={downloadQR} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    <i className="bi bi-download"></i> Download PNG
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(`WIFI:T:${encryption};S:${ssid};P:${password};;`); showToast("WiFi string copied!"); }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                    <i className="bi bi-clipboard"></i> Copy String
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4"><i className="bi bi-wifi"></i></div>
                <p>Enter your WiFi details and click Generate</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">What is a WiFi QR Code?</h2>
              <p className="text-gray-600 leading-relaxed">A WiFi QR code encodes your network name (SSID), password, and encryption type into a scannable format. When someone scans the code with their smartphone camera, they automatically connect to your WiFi network without manually typing the password. This is especially useful for businesses, hotels, restaurants, and home guests.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">How WiFi QR Codes Work</h2>
              <div className="space-y-3 text-gray-600">
                <p>WiFi QR codes use a standardized format recognized by most modern smartphones:</p>
                <code className="block bg-gray-100 p-3 rounded-lg text-sm">WIFI:T:WPA;S:NetworkName;P:Password;;</code>
                <p>When scanned, the device reads this string and automatically fills in the WiFi connection details. On iOS 11+ and Android 10+, this happens natively through the camera app — no third-party QR scanner needed.</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <details key={i} className="group border border-gray-200 rounded-lg">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50">
                      {faq.q}
                      <span className="text-gray-400 group-open:rotate-180 transition-transform"><i className="bi bi-chevron-down"></i></span>
                    </summary>
                    <p className="px-4 pb-4 text-gray-600">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">More Tools</h3>
            {RELATED_TOOLS.map((t) => (
              <a key={t.href} href={t.href} className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-lg mb-1"><i className={t.icon}></i></div>
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
