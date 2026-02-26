"use client";

import { useState, useRef, useCallback } from "react";

const PRESETS = [
  { label: "C4", hz: 261.63 }, { label: "D4", hz: 293.66 }, { label: "E4", hz: 329.63 },
  { label: "F4", hz: 349.23 }, { label: "G4", hz: 392.0 }, { label: "A4", hz: 440.0 },
  { label: "B4", hz: 493.88 }, { label: "C5", hz: 523.25 },
  { label: "A440 Tuning", hz: 440.0 }, { label: "1kHz Test", hz: 1000 },
];

const WAVEFORMS: { type: OscillatorType; label: string; icon: string }[] = [
  { type: "sine", label: "Sine", icon: "∿" },
  { type: "square", label: "Square", icon: "⊓" },
  { type: "sawtooth", label: "Sawtooth", icon: "⩘" },
  { type: "triangle", label: "Triangle", icon: "△" },
];

const RELATED_TOOLS = [
  { name: "WiFi QR Generator", href: "/tools/wifi-qr-generator", icon: "bi bi-wifi", desc: "Create QR codes for instant WiFi connection" },
  { name: "Invoice Generator", href: "/tools/invoice-generator", icon: "bi bi-receipt", desc: "Create professional PDF invoices" },
  { name: "CSV Viewer", href: "/tools/csv-viewer", icon: "bi bi-table", desc: "View CSV files as interactive tables" },
];

const FAQS = [
  { q: "Is this tone generator free?", a: "Yes, completely free with no limits. It uses the Web Audio API built into your browser — no plugins, downloads, or signup required." },
  { q: "What frequency range is supported?", a: "The generator supports frequencies from 20 Hz to 20,000 Hz, which covers the full range of human hearing. The slider uses a logarithmic scale for more natural frequency selection." },
  { q: "Can I use this for instrument tuning?", a: "Yes! Use the preset buttons for standard musical notes. A4 = 440 Hz is the standard concert pitch. You can also enter any custom frequency for precise tuning." },
  { q: "Why can't I hear very low or very high frequencies?", a: "Human hearing typically ranges from 20 Hz to 20 kHz, but sensitivity varies by age and individual. Very low frequencies (< 40 Hz) may require good speakers or headphones. High frequencies (> 15 kHz) become inaudible with age." },
];

export default function ToneGeneratorPage() {
  const [frequency, setFrequency] = useState(440);
  const [waveform, setWaveform] = useState<OscillatorType>("sine");
  const [volume, setVolume] = useState(0.5);
  const [playing, setPlaying] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const start = useCallback(() => {
    if (playing) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveform;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    ctxRef.current = ctx; oscRef.current = osc; gainRef.current = gain;
    setPlaying(true);
  }, [frequency, waveform, volume, playing]);

  const stop = useCallback(() => {
    oscRef.current?.stop(); ctxRef.current?.close();
    oscRef.current = null; ctxRef.current = null; gainRef.current = null;
    setPlaying(false);
  }, []);

  const updateFrequency = (hz: number) => {
    setFrequency(hz);
    if (oscRef.current) oscRef.current.frequency.value = hz;
  };

  const updateVolume = (v: number) => {
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  const updateWaveform = (w: OscillatorType) => {
    setWaveform(w);
    if (oscRef.current) oscRef.current.type = w;
  };

  // Logarithmic slider conversion
  const freqToSlider = (f: number) => Math.log(f / 20) / Math.log(1000) * 100;
  const sliderToFreq = (s: number) => 20 * Math.pow(1000, s / 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <i className="bi bi-volume-up"></i> <span>Free Online Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Online Tone Generator<br className="hidden md:block" /><span className="text-orange-200"> — Generate Audio Frequencies</span></h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto">Generate precise audio tones from 20 Hz to 20 kHz. Choose waveforms, adjust volume, and use preset musical notes. Powered by Web Audio API.</p>
        </div>
      </section>

      {/* Tool */}
      <section className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          {/* Frequency Display */}
          <div className="text-center mb-8 py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <div className={`text-7xl font-bold font-mono transition-colors ${playing ? "text-rose-500" : "text-gray-900"}`}>
              {frequency.toFixed(1)}
            </div>
            <div className="text-gray-500 text-lg mt-1">Hz</div>
            {playing && (
              <div className="mt-2 inline-flex items-center gap-2 text-rose-500 text-sm">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span> Playing
              </div>
            )}
          </div>

          {/* Frequency Slider (logarithmic) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">Frequency</label>
            <input type="range" min={0} max={100} step={0.1} value={freqToSlider(frequency)}
              onChange={(e) => updateFrequency(Math.round(sliderToFreq(parseFloat(e.target.value)) * 10) / 10)}
              className="w-full accent-rose-500 h-2" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>20 Hz</span><span>200 Hz</span><span>2 kHz</span><span>20 kHz</span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">Manual Input</label>
            <div className="flex items-center gap-2">
              <input type="number" min={20} max={20000} step={0.1} value={frequency}
                onChange={(e) => { const v = parseFloat(e.target.value); if (v >= 20 && v <= 20000) updateFrequency(v); }}
                className="w-36 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900" />
              <span className="text-gray-500 text-sm">Hz</span>
            </div>
          </div>

          {/* Waveform */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">Waveform</label>
            <div className="grid grid-cols-4 gap-2">
              {WAVEFORMS.map((w) => (
                <button key={w.type} onClick={() => updateWaveform(w.type)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    waveform === w.type ? "bg-rose-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  <span className="text-xl">{w.icon}</span>
                  <span>{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="mb-8">
            <label className="text-sm font-medium text-gray-700 block mb-2">Volume: {Math.round(volume * 100)}%</label>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={(e) => updateVolume(parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-2" />
          </div>

          {/* Play/Stop */}
          <div className="flex justify-center gap-4 mb-8">
            <button onClick={start} disabled={playing}
              className={`px-10 py-4 rounded-2xl font-semibold text-lg transition-all ${
                playing ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
              }`}>
              <i className="bi bi-play-fill"></i> Play
            </button>
            <button onClick={stop} disabled={!playing}
              className={`px-10 py-4 rounded-2xl font-semibold text-lg transition-all ${
                !playing ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
              }`}>
              <i className="bi bi-stop-fill"></i> Stop
            </button>
          </div>

          {/* Presets */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">Preset Frequencies</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label + p.hz} onClick={() => updateFrequency(p.hz)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    Math.abs(frequency - p.hz) < 0.1
                      ? "bg-rose-50 border-rose-300 text-rose-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50"
                  }`}>
                  {p.label} <span className="text-gray-400 text-xs ml-1">{p.hz} Hz</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Tone Generator?</h2>
          <p className="text-gray-600 leading-relaxed">A tone generator is a tool that produces audio signals at specific frequencies. It creates pure tones using mathematical waveforms — sine waves produce smooth, pure tones, while square, sawtooth, and triangle waves create richer sounds with different harmonic content. Tone generators are essential tools for audio engineers, musicians, hearing tests, speaker testing, and scientific experiments. This online tone generator uses the Web Audio API, a powerful browser-native technology that generates audio in real-time without any plugins or downloads.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Audio Frequencies</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["20–60 Hz (Sub-Bass)", "The lowest audible frequencies. Felt more than heard — think rumbling bass, earthquakes, and subwoofers."],
              ["60–250 Hz (Bass)", "Fundamental frequencies of bass instruments, kick drums, and male vocals."],
              ["250–2000 Hz (Midrange)", "Where most musical instruments and human speech live. Critical for clarity and intelligibility."],
              ["2–6 kHz (Upper Midrange)", "The presence range — makes sounds feel close and detailed. Human hearing is most sensitive here."],
              ["6–20 kHz (Treble)", "Cymbals, sibilance, and air. High frequencies add brilliance and sparkle to audio."],
              ["440 Hz (A4)", "The standard concert pitch used worldwide for tuning musical instruments."],
            ].map(([title, desc]) => (
              <div key={title} className="p-4 bg-white rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Uses for Tone Generators</h2>
          <p className="text-gray-600 leading-relaxed">Tone generators serve many practical purposes. Musicians use them for instrument tuning and ear training. Audio engineers test speakers, headphones, and room acoustics by sweeping through frequencies. Educators demonstrate sound wave properties in physics classes. Tinnitus sufferers use specific frequencies for sound therapy. Developers test audio processing code. Even pet owners use certain frequencies for animal training. The versatility of a simple tone generator makes it an invaluable tool across many fields.</p>
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
            <a key={t.href} href={t.href} className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all">
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
