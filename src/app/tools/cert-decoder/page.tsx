"use client";

import { useState } from "react";

interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
  version: number;
  isExpired: boolean;
  daysRemaining: number;
}

function parseLength(bytes: Uint8Array, offset: number): { length: number; bytesRead: number } {
  const first = bytes[offset];
  if (first < 0x80) return { length: first, bytesRead: 1 };
  const numBytes = first & 0x7f;
  let length = 0;
  for (let i = 0; i < numBytes; i++) {
    length = (length << 8) | bytes[offset + 1 + i];
  }
  return { length, bytesRead: 1 + numBytes };
}

function readTag(bytes: Uint8Array, offset: number): { tag: number; length: number; valueOffset: number; totalLength: number } {
  const tag = bytes[offset];
  const { length, bytesRead } = parseLength(bytes, offset + 1);
  const valueOffset = offset + 1 + bytesRead;
  return { tag, length, valueOffset, totalLength: 1 + bytesRead + length };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(":");
}

const OID_MAP: Record<string, string> = {
  "2.5.4.3": "CN", "2.5.4.6": "C", "2.5.4.7": "L", "2.5.4.8": "ST",
  "2.5.4.10": "O", "2.5.4.11": "OU", "1.2.840.113549.1.1.1": "RSA",
  "1.2.840.113549.1.1.5": "SHA1withRSA", "1.2.840.113549.1.1.11": "SHA256withRSA",
  "1.2.840.113549.1.1.12": "SHA384withRSA", "1.2.840.113549.1.1.13": "SHA512withRSA",
  "1.2.840.10045.4.3.2": "ECDSA-SHA256", "1.2.840.10045.4.3.3": "ECDSA-SHA384",
  "1.2.840.10045.4.3.4": "ECDSA-SHA512",
};

function decodeOID(bytes: Uint8Array, offset: number, length: number): string {
  const parts: number[] = [];
  parts.push(Math.floor(bytes[offset] / 40));
  parts.push(bytes[offset] % 40);
  let value = 0;
  for (let i = 1; i < length; i++) {
    value = (value << 7) | (bytes[offset + i] & 0x7f);
    if ((bytes[offset + i] & 0x80) === 0) { parts.push(value); value = 0; }
  }
  return parts.join(".");
}

function decodeUTCTime(bytes: Uint8Array, offset: number, length: number): Date {
  const str = String.fromCharCode(...bytes.slice(offset, offset + length));
  let year = parseInt(str.slice(0, 2));
  year += year >= 50 ? 1900 : 2000;
  return new Date(Date.UTC(year, parseInt(str.slice(2, 4)) - 1, parseInt(str.slice(4, 6)), parseInt(str.slice(6, 8)), parseInt(str.slice(8, 10)), parseInt(str.slice(10, 12))));
}

function decodeGeneralizedTime(bytes: Uint8Array, offset: number, length: number): Date {
  const str = String.fromCharCode(...bytes.slice(offset, offset + length));
  return new Date(Date.UTC(parseInt(str.slice(0, 4)), parseInt(str.slice(4, 6)) - 1, parseInt(str.slice(6, 8)), parseInt(str.slice(8, 10)), parseInt(str.slice(10, 12)), parseInt(str.slice(12, 14))));
}

function decodeString(bytes: Uint8Array, offset: number, length: number): string {
  return new TextDecoder().decode(bytes.slice(offset, offset + length));
}

function parseDN(bytes: Uint8Array, offset: number, length: number): string {
  const parts: string[] = [];
  let pos = offset;
  const end = offset + length;
  while (pos < end) {
    const set = readTag(bytes, pos);
    if (set.tag !== 0x31) { pos += set.totalLength; continue; }
    let seqPos = set.valueOffset;
    const seqEnd = set.valueOffset + set.length;
    while (seqPos < seqEnd) {
      const seq = readTag(bytes, seqPos);
      if (seq.tag !== 0x30) { seqPos += seq.totalLength; continue; }
      const oidTag = readTag(bytes, seq.valueOffset);
      const oid = decodeOID(bytes, oidTag.valueOffset, oidTag.length);
      const valTag = readTag(bytes, seq.valueOffset + oidTag.totalLength);
      const val = decodeString(bytes, valTag.valueOffset, valTag.length);
      parts.push(`${OID_MAP[oid] || oid}=${val}`);
      seqPos += seq.totalLength;
    }
    pos += set.totalLength;
  }
  return parts.reverse().join(", ");
}

function parseCert(pem: string): CertInfo {
  const b64 = pem.replace(/-----BEGIN CERTIFICATE-----/g, "").replace(/-----END CERTIFICATE-----/g, "").replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const outer = readTag(bytes, 0);
  const tbsCert = readTag(bytes, outer.valueOffset);
  let pos = tbsCert.valueOffset;

  let version = 1;
  const vTag = readTag(bytes, pos);
  if (vTag.tag === 0xa0) {
    const innerV = readTag(bytes, vTag.valueOffset);
    version = bytes[innerV.valueOffset] + 1;
    pos += vTag.totalLength;
  }

  const serialTag = readTag(bytes, pos);
  const serialNumber = bytesToHex(bytes.slice(serialTag.valueOffset, serialTag.valueOffset + serialTag.length));
  pos += serialTag.totalLength;

  const sigAlgSeq = readTag(bytes, pos);
  const sigOidTag = readTag(bytes, sigAlgSeq.valueOffset);
  const sigOid = decodeOID(bytes, sigOidTag.valueOffset, sigOidTag.length);
  const signatureAlgorithm = OID_MAP[sigOid] || sigOid;
  pos += sigAlgSeq.totalLength;

  const issuerTag = readTag(bytes, pos);
  const issuer = parseDN(bytes, issuerTag.valueOffset, issuerTag.length);
  pos += issuerTag.totalLength;

  const validityTag = readTag(bytes, pos);
  let vPos = validityTag.valueOffset;
  const notBeforeTag = readTag(bytes, vPos);
  const validFrom = notBeforeTag.tag === 0x17
    ? decodeUTCTime(bytes, notBeforeTag.valueOffset, notBeforeTag.length)
    : decodeGeneralizedTime(bytes, notBeforeTag.valueOffset, notBeforeTag.length);
  vPos += notBeforeTag.totalLength;
  const notAfterTag = readTag(bytes, vPos);
  const validTo = notAfterTag.tag === 0x17
    ? decodeUTCTime(bytes, notAfterTag.valueOffset, notAfterTag.length)
    : decodeGeneralizedTime(bytes, notAfterTag.valueOffset, notAfterTag.length);
  pos += validityTag.totalLength;

  const subjectTag = readTag(bytes, pos);
  const subject = parseDN(bytes, subjectTag.valueOffset, subjectTag.length);

  const now = new Date();
  const isExpired = now > validTo;
  const daysRemaining = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    subject, issuer, serialNumber, signatureAlgorithm, version, isExpired, daysRemaining,
    validFrom: validFrom.toUTCString(), validTo: validTo.toUTCString(),
  };
}

const RELATED_TOOLS = [
  { name: "JWT Decoder", href: "/tools/jwt-decoder", icon: "bi bi-key", desc: "Decode and inspect JSON Web Tokens" },
  { name: "YAML Validator", href: "/tools/yaml-validator", icon: "bi bi-check-circle", desc: "Validate YAML syntax instantly" },
  { name: "XML Formatter", href: "/tools/xml-formatter", icon: "bi bi-file-earmark-code", desc: "Format and beautify XML code" },
];

const FAQS = [
  { q: "Is it safe to paste my certificate here?", a: "Yes. This tool runs entirely in your browser. Your certificate data is never sent to any server — all parsing happens locally using JavaScript." },
  { q: "What certificate formats are supported?", a: "This tool supports PEM-encoded X.509 certificates. PEM files typically start with -----BEGIN CERTIFICATE----- and end with -----END CERTIFICATE-----." },
  { q: "Can I decode a certificate chain?", a: "Currently, this tool decodes the first certificate in the input. If you have a chain, paste each certificate separately to inspect them individually." },
  { q: "Why does my certificate show as expired?", a: "The expiration check compares the certificate's 'Not After' date with your current system time. If your system clock is incorrect, the result may be inaccurate." },
];

export default function CertDecoderPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CertInfo | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const decode = () => {
    setError(""); setResult(null);
    try { setResult(parseCert(input)); } catch (e: unknown) {
      setError(`Failed to parse certificate: ${e instanceof Error ? e.message : "Invalid PEM format"}`);
    }
  };

  const copyAll = async () => {
    if (!result) return;
    const text = Object.entries(result).map(([k, v]) => `${k}: ${v}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true); showToast("Certificate details copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = result
    ? result.isExpired
      ? "bg-red-100 border-red-300 text-red-800"
      : result.daysRemaining <= 30
        ? "bg-yellow-100 border-yellow-300 text-yellow-800"
        : "bg-green-100 border-green-300 text-green-800"
    : "";

  const statusIconClass = result
    ? result.isExpired ? "bi bi-x-circle-fill text-red-500" : result.daysRemaining <= 30 ? "bi bi-exclamation-triangle-fill text-yellow-500" : "bi bi-check-circle-fill text-green-500"
    : "";

  const statusText = result
    ? result.isExpired
      ? `Expired ${Math.abs(result.daysRemaining)} days ago`
      : result.daysRemaining <= 30
        ? `Expiring soon — ${result.daysRemaining} days remaining`
        : `Valid — ${result.daysRemaining} days remaining`
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm animate-fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <i className="bi bi-shield-lock"></i> <span>Free Online Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">SSL Certificate Decoder<br className="hidden md:block" /><span className="text-emerald-200"> — Decode PEM Certificates Online</span></h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">Paste a PEM-encoded SSL/TLS certificate to instantly decode and inspect its details. Subject, issuer, validity, algorithm — all parsed in your browser.</p>
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">PEM Certificate</label>
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-mono text-sm text-gray-900 bg-gray-50"
            placeholder={"-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----"}
            value={input} onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button onClick={decode} disabled={!input.trim()}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
              <i className="bi bi-search"></i> Decode Certificate
            </button>
            <button onClick={() => { setInput(""); setResult(null); setError(""); }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"><i className="bi bi-x-circle-fill text-red-500"></i> {error}</div>
          )}

          {result && (
            <div className="mt-6">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusColor} mb-5`}>
                <span><i className={statusIconClass}></i></span> {statusText}
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Certificate Details</h2>
                <button onClick={copyAll} className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
                  {copied ? "✓ Copied!" : <><i className="bi bi-clipboard"></i> Copy All</>}
                </button>
              </div>

              <div className="grid gap-3">
                {([
                  ["Version", `v${result.version}`, "bi bi-tag"],
                  ["Subject", result.subject, "bi bi-pin-map"],
                  ["Issuer", result.issuer, "bi bi-building"],
                  ["Valid From", result.validFrom, "bi bi-calendar-event"],
                  ["Valid To", result.validTo, "bi bi-calendar-event"],
                  ["Serial Number", result.serialNumber, "bi bi-hash"],
                  ["Signature Algorithm", result.signatureAlgorithm, "bi bi-lock"],
                ] as [string, string, string][]).map(([label, value, iconClass]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-500 sm:w-48 flex-shrink-0"><i className={iconClass}></i> {label}</span>
                    <span className="text-sm text-gray-900 font-mono break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SEO Content */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is an SSL Certificate?</h2>
          <p className="text-gray-600 leading-relaxed">An SSL (Secure Sockets Layer) certificate is a digital certificate that authenticates a website&apos;s identity and enables an encrypted connection. SSL certificates contain the website&apos;s public key, the domain name it&apos;s issued for, the issuing certificate authority&apos;s digital signature, and other important details. When a browser connects to a secure website, the SSL certificate enables an encrypted link between the web server and the browser, ensuring that all data passed between them remains private and secure.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Decode a Certificate</h2>
          <p className="text-gray-600 leading-relaxed">To decode an SSL certificate, you need the PEM-encoded version of the certificate. PEM (Privacy Enhanced Mail) is a Base64-encoded format that starts with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">-----BEGIN CERTIFICATE-----</code> and ends with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">-----END CERTIFICATE-----</code>. You can obtain this from your web server configuration, export it from your browser, or use OpenSSL commands like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">openssl s_client -connect example.com:443</code>. Once you have the PEM text, simply paste it into the decoder above to view all certificate fields.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Fields Explained</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["Subject", "The entity (domain, organization) the certificate is issued to."],
              ["Issuer", "The Certificate Authority (CA) that issued and signed the certificate."],
              ["Valid From / To", "The time window during which the certificate is considered valid."],
              ["Serial Number", "A unique identifier assigned by the CA to distinguish this certificate."],
              ["Signature Algorithm", "The cryptographic algorithm used to sign the certificate (e.g., SHA256withRSA)."],
              ["Version", "The X.509 version — most modern certificates use v3."],
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
