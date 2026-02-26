"use client";

import { useState, useEffect } from "react";

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signatureHex: string;
  isExpired: boolean | null;
  expiresAt: string | null;
  issuedAt: string | null;
  expiresIn: number | null;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return atob(base64);
}

function base64UrlToHex(str: string): string {
  const raw = base64UrlDecode(str);
  return Array.from(raw).map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
  });
}

function decodeJWT(token: string): DecodedJWT {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT: expected 3 parts separated by dots, got " + parts.length);
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  const signatureHex = base64UrlToHex(parts[2]);
  let isExpired: boolean | null = null;
  let expiresAt: string | null = null;
  let issuedAt: string | null = null;
  let expiresIn: number | null = null;
  if (typeof payload.exp === "number") {
    expiresAt = formatTimestamp(payload.exp);
    const diff = payload.exp - Date.now() / 1000;
    isExpired = diff <= 0;
    expiresIn = isExpired ? null : Math.floor(diff);
  }
  if (typeof payload.iat === "number") {
    issuedAt = formatTimestamp(payload.iat);
  }
  return { header, payload, signatureHex, isExpired, expiresAt, issuedAt, expiresIn };
}

function formatCountdown(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function SyntaxJson({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data, null, 2);
  const lines = json.split("\n");
  return (
    <div className="font-mono text-sm leading-relaxed">
      {lines.map((line, i) => {
        const colored = line
          .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
          .replace(/: "([^"]*)"(,?)$/g, ': <span class="text-green-400">"$1"</span>$2')
          .replace(/: (\d+)(,?)$/g, ': <span class="text-amber-400">$1</span>$2')
          .replace(/: (true|false)(,?)$/g, ': <span class="text-purple-400">$1</span>$2')
          .replace(/: (null)(,?)$/g, ': <span class="text-gray-500">$1</span>$2');
        return <div key={i} dangerouslySetInnerHTML={{ __html: colored }} />;
      })}
    </div>
  );
}

const jwtFaqs = [
  { q: "Is it safe to paste my JWT here?", a: "Yes. This tool runs entirely in your browser. Your token is never sent to any server. You can verify this by checking the Network tab in your browser developer tools." },
  { q: "Can this tool verify JWT signatures?", a: "This tool decodes and inspects JWTs but does not verify signatures. Signature verification requires the secret key or public key, which should never be shared in a browser tool." },
  { q: "What does it mean when a JWT is expired?", a: "A JWT contains an 'exp' (expiration) claim with a Unix timestamp. If the current time is past that timestamp, the token is expired and should no longer be accepted by servers." },
  { q: "What is the difference between JWS and JWE?", a: "JWS (JSON Web Signature) is a signed token — the payload is readable but tamper-proof. JWE (JSON Web Encryption) encrypts the payload so it cannot be read without the decryption key. This tool decodes JWS tokens." },
  { q: "Why does my JWT have three parts?", a: "A JWT consists of three Base64URL-encoded parts separated by dots: the Header (algorithm and type), the Payload (claims and data), and the Signature (integrity verification)." },
];

const commonClaims = [
  { claim: "iss", name: "Issuer", desc: "Identifies the principal that issued the JWT." },
  { claim: "sub", name: "Subject", desc: "Identifies the subject of the JWT (usually a user ID)." },
  { claim: "aud", name: "Audience", desc: "Identifies the recipients the JWT is intended for." },
  { claim: "exp", name: "Expiration", desc: "Unix timestamp after which the JWT must not be accepted." },
  { claim: "nbf", name: "Not Before", desc: "Unix timestamp before which the JWT must not be accepted." },
  { claim: "iat", name: "Issued At", desc: "Unix timestamp when the JWT was issued." },
  { claim: "jti", name: "JWT ID", desc: "Unique identifier for the JWT, used to prevent replay attacks." },
];

export default function JWTDecoderPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDecode = () => {
    setError("");
    setResult(null);
    setCountdown(null);
    try {
      const decoded = decodeJWT(input);
      setResult(decoded);
      if (decoded.expiresIn !== null) setCountdown(decoded.expiresIn);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to decode JWT");
    }
  };

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const copyJson = async (data: Record<string, unknown>, key: string) => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const parts = input.trim().split(".");
  const hasThree = parts.length === 3 && input.trim().length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            JWT Decoder — Decode JSON Web Tokens Online
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-3xl">
            Paste a JWT to instantly decode its header, payload, and signature. Check expiration, inspect claims, and debug tokens — all in your browser.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <label htmlFor="jwt-input" className="block text-sm font-semibold text-gray-700 mb-2">Paste Your JWT</label>
          <textarea
            id="jwt-input"
            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm text-gray-900 break-all"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {hasThree && (
            <div className="mt-3 p-4 bg-gray-900 rounded-xl font-mono text-sm break-all leading-relaxed">
              <span className="text-blue-400">{parts[0]}</span>
              <span className="text-gray-500">.</span>
              <span className="text-purple-400">{parts[1]}</span>
              <span className="text-gray-500">.</span>
              <span className="text-orange-400">{parts[2]}</span>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={handleDecode} disabled={!input.trim()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Decode JWT
            </button>
            <button onClick={() => { setInput(""); setResult(null); setError(""); setCountdown(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <p className="text-red-700 text-sm"><i className="bi bi-x-circle text-red-600"></i> {error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 mb-6">
            {/* Expiration status */}
            {result.isExpired !== null && (
              <div className={`rounded-2xl border p-5 ${result.isExpired ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{result.isExpired ? <i className="bi bi-alarm text-red-600"></i> : <i className="bi bi-check-circle text-green-600"></i>}</span>
                  <div>
                    <span className={`font-semibold text-lg ${result.isExpired ? "text-red-800" : "text-green-800"}`}>
                      {result.isExpired ? "Token Expired" : "Token Valid"}
                    </span>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {result.isExpired ? `Expired: ${result.expiresAt}` : `Expires: ${result.expiresAt}`}
                      {result.issuedAt && <> · Issued: {result.issuedAt}</>}
                    </p>
                    {countdown !== null && countdown > 0 && (
                      <p className="text-sm font-mono text-green-700 mt-1"><i className="bi bi-stopwatch"></i> Expires in: {formatCountdown(countdown)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="rounded-2xl border-2 border-blue-200 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-400">Header</span>
                <button onClick={() => copyJson(result.header, "header")} className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                  {copied === "header" ? <><i className="bi bi-check-lg"></i> Copied</> : <><i className="bi bi-clipboard"></i> Copy</>}
                </button>
              </div>
              <SyntaxJson data={result.header} />
            </div>

            {/* Payload */}
            <div className="rounded-2xl border-2 border-purple-200 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-purple-400">Payload</span>
                <button onClick={() => copyJson(result.payload, "payload")} className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                  {copied === "payload" ? <><i className="bi bi-check-lg"></i> Copied</> : <><i className="bi bi-clipboard"></i> Copy</>}
                </button>
              </div>
              <SyntaxJson data={result.payload} />
            </div>

            {/* Signature */}
            <div className="rounded-2xl border-2 border-orange-200 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-orange-400">Signature (hex)</span>
                <button onClick={async () => { await navigator.clipboard.writeText(result.signatureHex); setCopied("sig"); setTimeout(() => setCopied(null), 1500); }} className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                  {copied === "sig" ? <><i className="bi bi-check-lg"></i> Copied</> : <><i className="bi bi-clipboard"></i> Copy</>}
                </button>
              </div>
              <p className="text-sm font-mono text-gray-300 break-all">{result.signatureHex}</p>
            </div>
          </div>
        )}
      </section>

      {/* SEO Content */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a JWT Token?</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>A JSON Web Token (JWT) is a compact, URL-safe token format used to securely transmit information between parties as a JSON object. JWTs are widely used for authentication and authorization in modern web applications, APIs, and microservices.</p>
              <p>When you log into a website, the server may issue a JWT that contains your identity and permissions. Your browser sends this token with subsequent requests, allowing the server to verify your identity without querying a database each time.</p>
              <p>JWTs are self-contained — they carry all the information needed for verification within the token itself, making them efficient for distributed systems.</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">JWT Structure Explained</h2>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>A JWT consists of three parts separated by dots (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">xxxxx.yyyyy.zzzzz</code>):</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-semibold text-blue-800 mb-2">Header</h3>
                  <p className="text-sm text-blue-700">Contains the token type (JWT) and the signing algorithm (e.g., HS256, RS256). Base64URL encoded.</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                  <h3 className="font-semibold text-purple-800 mb-2">Payload</h3>
                  <p className="text-sm text-purple-700">Contains claims — statements about the user and metadata. Includes registered, public, and private claims.</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                  <h3 className="font-semibold text-orange-800 mb-2">Signature</h3>
                  <p className="text-sm text-orange-700">Created by signing the encoded header and payload with a secret key. Verifies the token hasn&apos;t been tampered with.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Common JWT Claims</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Claim</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {commonClaims.map((c) => (
                    <tr key={c.claim} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-mono text-blue-600">{c.claim}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{c.name}</td>
                      <td className="py-3 px-4 text-gray-500">{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {jwtFaqs.map((f, i) => (
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
        </div>
      </section>
    </div>
  );
}
