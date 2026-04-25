"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import Link from "next/link";

const CW = 1600;
const CH = 900;

const GRADIENTS = [
  { label: "Purple",  from: "#9b6bff", to: "#5b21d1" },
  { label: "Teal",    from: "#30ffc9", to: "#0ea07a" },
  { label: "Blue",    from: "#7ac6ff", to: "#2f6cd1" },
  { label: "Coral",   from: "#ffb2a0", to: "#d64423" },
  { label: "Gold",    from: "#ffe27a", to: "#c68a0e" },
  { label: "Lime",    from: "#c8ff7a", to: "#5faf18" },
  { label: "Pink",    from: "#ff9bf2", to: "#c21d99" },
  { label: "Orange",  from: "#ffb960", to: "#ff6a1f" },
];

const BG_OPTIONS = [
  { label: "None",  value: "none" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Dark",  value: "#1a1a2e" },
];

type Variant = "M1" | "M2" | "M3";

interface Coin {
  id: string;
  ticker: string;
  fullName: string;
  leverage: string;
  colorIdx: number;
  imgSrc: string | null;
  imgBg: string;
}

function uid() { return Math.random().toString(36).slice(2); }

const DEFAULT_COINS: Coin[] = [
  { id: uid(), ticker: "HUMA", fullName: "Huma Finance",    leverage: "50×", colorIdx: 0, imgSrc: null, imgBg: "none" },
  { id: uid(), ticker: "EDGE", fullName: "EdgeX Token",     leverage: "3×",  colorIdx: 1, imgSrc: null, imgBg: "none" },
  { id: uid(), ticker: "ROBO", fullName: "Robonomics",      leverage: "10×", colorIdx: 2, imgSrc: null, imgBg: "none" },
  { id: uid(), ticker: "BOTZ", fullName: "Botz Protocol",   leverage: "10×", colorIdx: 3, imgSrc: null, imgBg: "none" },
  { id: uid(), ticker: "MAGS", fullName: "Magnus Network",  leverage: "10×", colorIdx: 4, imgSrc: null, imgBg: "none" },
  { id: uid(), ticker: "URA",  fullName: "Uranium DAO",     leverage: "10×", colorIdx: 5, imgSrc: null, imgBg: "none" },
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function Brandbar({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", zIndex: 10, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-text-white.png" alt="Tangerine" style={{ height: 38 }} />
    </div>
  );
}

function Brackets() {
  const corners = [
    { top: 48, left: 48, borderRight: "none", borderBottom: "none" },
    { top: 48, right: 48, borderLeft: "none", borderBottom: "none" },
    { bottom: 48, left: 48, borderRight: "none", borderTop: "none" },
    { bottom: 48, right: 48, borderLeft: "none", borderTop: "none" },
  ] as React.CSSProperties[];
  return (
    <>
      {corners.map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 28, height: 28, border: "2px solid rgba(255,122,31,0.55)", zIndex: 6, ...s }} />
      ))}
    </>
  );
}

function OrbCircle({ size, colorIdx, ticker, imgSrc, imgBg }: {
  size: number; colorIdx: number; ticker: string;
  imgSrc?: string | null; imgBg?: string;
}) {
  const g = GRADIENTS[colorIdx % GRADIENTS.length];
  const fs = Math.round(size * 0.38);
  const bg = imgSrc
    ? (imgBg === "none" ? "transparent" : imgBg ?? "transparent")
    : `radial-gradient(circle at 35% 30%, ${g.from}, ${g.to} 70%)`;
  const shadow = imgSrc && imgBg === "none"
    ? "none"
    : `0 ${size * 0.17}px ${size * 0.45}px rgba(0,0,0,0.45), inset 0 ${size * 0.052}px ${size * 0.17}px rgba(255,255,255,0.18), inset 0 ${-size * 0.086}px ${size * 0.31}px rgba(0,0,0,0.35)`;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: bg,
      boxShadow: shadow,
      display: "grid", placeItems: "center", position: "relative", overflow: "hidden",
    }}>
      {imgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgSrc} alt="" style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%", height: "100%",
          objectFit: "contain", objectPosition: "center",
        }} />
      )}
      {!imgSrc && (
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: fs, color: "#fff", letterSpacing: -2, textShadow: "0 2px 8px rgba(0,0,0,0.35)", position: "relative", zIndex: 1 }}>
          {ticker[0]?.toUpperCase() ?? "?"}
        </span>
      )}
      {(!imgSrc || imgBg !== "none") && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.07) 100%)", pointerEvents: "none", borderRadius: "50%" }} />
      )}
    </div>
  );
}

// ── M1: 3×2 grid with brackets ────────────────────────────────────────────────
function M1({ coins }: { coins: Coin[] }) {
  const shown = coins.slice(0, 6);
  return (
    <div style={{ width: CW, height: CH, position: "relative", overflow: "hidden",
      background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(30,14,4,0.9), #06060a 75%), #06060a",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px", WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 92%)", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 92%)" }} />
      <Brackets />
      <Brandbar style={{ top: 56, left: 60 }} />
      <div style={{ position: "absolute", top: 66, right: 60, display: "flex", alignItems: "center", gap: 10, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 2.6, textTransform: "uppercase", zIndex: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF7A1F", boxShadow: "0 0 12px #FF7A1F" }} />
        BATCH · <strong style={{ color: "#fff" }}>{coins.length} NEW</strong>
      </div>

      {/* Heading */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 155, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, zIndex: 5 }}>
        <div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: "rgba(255,255,255,0.45)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
            NEW · <strong style={{ color: "#FF7A1F" }}>LISTINGS</strong>
          </div>
          <div style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: 80, fontWeight: 800, letterSpacing: -3.4, lineHeight: 0.95, color: "#fff" }}>
            Fresh <span style={{ background: "linear-gradient(180deg, #FFB37A, #FF7A1F)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>listings.</span>
          </div>
        </div>
        <div style={{ textAlign: "right", fontFamily: "IBM Plex Mono, monospace" }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 86, letterSpacing: -3, color: "#FF7A1F", lineHeight: 1 }}>{coins.length}</div>
          <div style={{ fontSize: 12, letterSpacing: 2.6, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 4 }}>New This Batch</div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 380, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, zIndex: 4 }}>
        {shown.map((c, i) => (
          <div key={c.id || i} style={{ padding: "22px 26px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(255,122,31,0.06), transparent 70%)", pointerEvents: "none" }} />
            <OrbCircle size={96} colorIdx={c.colorIdx} ticker={c.ticker} imgSrc={c.imgSrc} imgBg={c.imgBg} />
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 40, letterSpacing: -1.5, lineHeight: 1, color: "#fff" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>$</span>{c.ticker.toUpperCase()}
              </div>
              {c.leverage && (
                <div style={{ marginTop: 8, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>
                  Up to <strong style={{ color: "#FF7A1F" }}>{c.leverage}</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 60, right: 60, bottom: 54, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2.6, textTransform: "uppercase", zIndex: 6 }}>
        <strong style={{ color: "#FF7A1F" }}>TANGERINE.EXCHANGE</strong>
      </div>
    </div>
  );
}

// ── M2: Split contact sheet ───────────────────────────────────────────────────
function M2({ coins }: { coins: Coin[] }) {
  const shown = coins.slice(0, 7);
  return (
    <div style={{ width: CW, height: CH, position: "relative", overflow: "hidden", background: "#07080a" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 90% 90%, rgba(255,122,31,0.12), transparent 70%), radial-gradient(ellipse 60% 50% at 10% 10%, rgba(255,122,31,0.08), transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.014) 0, rgba(255,255,255,0.014) 1px, transparent 1px, transparent 4px)", pointerEvents: "none" }} />

      <Brandbar style={{ top: 56, left: 60 }} />
      <div style={{ position: "absolute", top: 66, right: 60, display: "flex", alignItems: "center", gap: 10, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 2.6, textTransform: "uppercase", zIndex: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2bd17e", boxShadow: "0 0 10px #2bd17e" }} />
        LIVE · <strong style={{ color: "#fff" }}>BATCH LISTING</strong>
      </div>

      {/* Split layout */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 150, bottom: 100, display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 48, zIndex: 4 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: "rgba(255,255,255,0.45)", letterSpacing: 4, textTransform: "uppercase" }}>
            NEW · <strong style={{ color: "#FF7A1F" }}>PERPS</strong>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 112, letterSpacing: -5, lineHeight: 0.88, color: "#fff" }}>
            New<br /><span style={{ color: "#FF7A1F" }}>perps</span>.
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, fontFamily: "IBM Plex Mono, monospace" }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 72, letterSpacing: -2.5, color: "#FF7A1F", lineHeight: 1 }}>{shown.length}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 2.6, textTransform: "uppercase" }}>Listings<br />this batch</div>
          </div>
        </div>

        {/* Right: table */}
        <div style={{ background: "rgba(12,10,10,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "72px 1.1fr 1.4fr 110px", gap: 18, padding: "16px 26px", fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2.2, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span /><span>Ticker</span><span>Name</span><span style={{ textAlign: "right" }}>Lev.</span>
          </div>
          {shown.map((c, i) => (
            <div key={c.id || i} style={{ display: "grid", gridTemplateColumns: "72px 1.1fr 1.4fr 110px", gap: 18, alignItems: "center", padding: "10px 26px", borderBottom: i < shown.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <OrbCircle size={52} colorIdx={c.colorIdx} ticker={c.ticker} imgSrc={c.imgSrc} imgBg={c.imgBg} />
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1.1, lineHeight: 1, color: "#fff" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>$</span>{c.ticker.toUpperCase()}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 500, letterSpacing: -0.2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{c.fullName}</div>
              {c.leverage && (
                <div style={{ justifySelf: "end", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(255,122,31,0.12)", border: "1px solid rgba(255,122,31,0.4)", borderRadius: 999, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 700, color: "#FFB37A", letterSpacing: 1.6 }}>{c.leverage}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", left: 60, right: 60, bottom: 48, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2.6, textTransform: "uppercase", zIndex: 6 }}>
        <strong style={{ color: "#FF7A1F" }}>APP.TANGERINE.EXCHANGE</strong>
      </div>
    </div>
  );
}

// ── M3: Constellation ─────────────────────────────────────────────────────────
function M3({ coins }: { coins: Coin[] }) {
  const shown = coins.slice(0, 6);
  const positions: React.CSSProperties[] = [
    { left: 110,  top: 230 },
    { right: 110, top: 220 },
    { left: 150,  top: 600 },
    { right: 150, top: 620 },
    { left: "50%", top: 155, transform: "translateX(-50%)" },
    { left: "50%", top: 680, transform: "translateX(-50%)" },
  ];
  return (
    <div style={{ width: CW, height: CH, position: "relative", overflow: "hidden",
      background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(40,18,6,0.85), #060404 70%), #060404",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 15% 85%, rgba(255,122,31,0.14), transparent 38%), radial-gradient(circle at 85% 15%, rgba(255,60,0,0.14), transparent 38%)", pointerEvents: "none" }} />

      {/* Top marquee */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 52, background: "rgba(0,0,0,0.55)", borderBottom: "1px solid rgba(255,122,31,0.25)", display: "flex", alignItems: "center", gap: 32, padding: "0 60px", fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 2.8, textTransform: "uppercase", zIndex: 6 }}>
        <span>TANGERINE</span>
        <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
        <strong style={{ color: "#FF7A1F" }}>NEW LISTINGS</strong>
        <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
        <span>NOW LIVE</span>
      </div>

      <Brandbar style={{ top: 90, left: 60 }} />

      {/* Badge */}
      <div style={{ position: "absolute", top: 90, right: 60, zIndex: 10, padding: "10px 18px", background: "rgba(255,122,31,0.14)", border: "1px solid rgba(255,122,31,0.45)", borderRadius: 999, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "#FFB37A", fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase" }}>
        {coins.length} NEW PERPS
      </div>

      {/* Center plate */}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 5 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 100, letterSpacing: -4.5, lineHeight: 0.94, color: "#fff" }}>
          {shown.length > 1 ? (
            <>{shown.length === 2 ? "Two" : shown.length === 3 ? "Three" : shown.length === 4 ? "Four" : shown.length === 5 ? "Five" : "Six"} new <span style={{ color: "#FF7A1F" }}>perps,</span><br />live now.</>
          ) : (
            <>New <span style={{ color: "#FF7A1F" }}>perp,</span><br />live now.</>
          )}
        </div>
      </div>

      {/* Orbs */}
      {shown.map((c, i) => (
        <div key={c.id || i} style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 12px", background: "rgba(18,14,14,0.92)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, fontFamily: "Inter, sans-serif", zIndex: 4, boxShadow: "0 18px 40px rgba(0,0,0,0.5)", ...positions[i] }}>
          <OrbCircle size={56} colorIdx={c.colorIdx} ticker={c.ticker} imgSrc={c.imgSrc} imgBg={c.imgBg} />
          <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: -0.6, color: "#fff" }}>
            <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>$</span>{c.ticker.toUpperCase()}
          </div>
          {c.leverage && (
            <div style={{ marginLeft: 6, fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#FFB37A", fontWeight: 700, letterSpacing: 1.4, padding: "5px 10px", border: "1px solid rgba(255,122,31,0.4)", borderRadius: 5 }}>{c.leverage}</div>
          )}
        </div>
      ))}

      {/* Bottom marquee */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 52, background: "rgba(0,0,0,0.55)", borderTop: "1px solid rgba(255,122,31,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 2.8, textTransform: "uppercase", zIndex: 6 }}>
        <strong style={{ color: "#FF7A1F" }}>APP.TANGERINE.EXCHANGE</strong>
      </div>
    </div>
  );
}

function CardContent({ variant, coins }: { variant: Variant; coins: Coin[] }) {
  if (variant === "M1") return <M1 coins={coins} />;
  if (variant === "M2") return <M2 coins={coins} />;
  return <M3 coins={coins} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MultiPage() {
  const [variant, setVariant] = useState<Variant>("M1");
  const [coins, setCoins] = useState<Coin[]>(DEFAULT_COINS);
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingCoinId = useRef<string | null>(null);

  const maxCoins = variant === "M2" ? 7 : 6;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setScale(el.clientWidth / CW));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function addCoin() {
    if (coins.length >= maxCoins) return;
    setCoins(prev => [...prev, { id: uid(), ticker: "NEW", fullName: "New Token", leverage: "10×", colorIdx: prev.length % GRADIENTS.length, imgSrc: null, imgBg: "none" }]);
  }

  function removeCoin(id: string) {
    setCoins(prev => prev.filter(c => c.id !== id));
  }

  function updateCoin(id: string, field: keyof Omit<Coin, "id">, value: string | number | null) {
    setCoins(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  function triggerUpload(coinId: string) {
    uploadingCoinId.current = coinId;
    fileInputRef.current?.click();
  }

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = uploadingCoinId.current;
    if (!file || !id) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setCoins(prev => prev.map(c => c.id === id ? { ...c, imgSrc: src, imgBg: "none" } : c));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  async function download() {
    const el = exportRef.current;
    if (!el || isDownloading) return;
    setIsDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(el, { pixelRatio: 1, width: CW, height: CH });
      const link = document.createElement("a");
      link.download = `tangerine-batch-listing.png`;
      link.href = url;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Off-screen export */}
      <div style={{ position: "fixed", left: -9999, top: -9999, pointerEvents: "none", zIndex: -100, opacity: 0, overflow: "hidden", width: CW, height: CH }}>
        <div ref={exportRef} style={{ width: CW, height: CH }}>
          <CardContent variant={variant} coins={coins} />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        <div className="h-7 w-7 rounded-full bg-[#FF7A1F] flex items-center justify-center text-white font-bold text-sm">T</div>
        <span className="font-semibold text-white/90">Listing Card Maker</span>
        <span className="text-white/20">·</span>
        <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Single Coin</Link>
        <Link href="/multi" className="text-sm text-[#FF7A1F] font-medium">Multi Coin</Link>
        <span className="ml-auto text-xs text-white/20 font-mono">tangerine.exchange</span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 gap-0">
        {/* Controls */}
        <aside className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-57px)]">

          {/* Variant */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Template</label>
            <div className="flex gap-2">
              {(["M1", "M2", "M3"] as Variant[]).map((v) => (
                <button key={v} onClick={() => setVariant(v)} className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all border ${variant === v ? "bg-[#FF7A1F]/15 border-[#FF7A1F]/60 text-[#FF7A1F]" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/60"}`}>{v}</button>
              ))}
            </div>
            <p className="text-xs text-white/25">{variant === "M1" ? "3×2 grid with corner brackets (up to 6 coins)" : variant === "M2" ? "Split layout — title left, table right (up to 7 coins)" : "Constellation — coins floating around center (up to 6)"}</p>
          </div>

          {/* Coins list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Coins ({coins.length}/{maxCoins})</label>
              {coins.length < maxCoins && (
                <button onClick={addCoin} className="text-xs text-[#FF7A1F] hover:text-[#FF9A50] transition-colors font-medium">+ Add coin</button>
              )}
            </div>

            <div className="space-y-3">
              {coins.map((c) => {
                const g = GRADIENTS[c.colorIdx % GRADIENTS.length];
                return (
                  <div key={c.id} className="bg-[#14141a] border border-white/[0.07] rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Color swatch */}
                      <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black overflow-hidden relative" style={{ background: c.imgSrc ? (c.imgBg === "none" ? "transparent" : c.imgBg) : `radial-gradient(circle at 35% 30%, ${g.from}, ${g.to} 70%)` }}>
                        {c.imgSrc
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={c.imgSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />
                          : c.ticker[0]?.toUpperCase() ?? "?"}
                      </div>
                      {/* Ticker */}
                      <input type="text" value={c.ticker} onChange={(e) => updateCoin(c.id, "ticker", e.target.value.toUpperCase().slice(0, 10))}
                        className="w-24 bg-[#1e1e26] border border-white/[0.08] rounded-lg px-2 py-1.5 text-white text-sm font-bold focus:outline-none focus:border-[#FF7A1F]/60 transition-all"
                        placeholder="TICK" />
                      {/* Leverage */}
                      <input type="text" value={c.leverage} onChange={(e) => updateCoin(c.id, "leverage", e.target.value.slice(0, 10))}
                        className="w-16 bg-[#1e1e26] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[#FFB37A] text-sm font-bold focus:outline-none focus:border-[#FF7A1F]/60 transition-all"
                        placeholder="50×" />
                      <span className="flex-1" />
                      <button onClick={() => removeCoin(c.id)} className="text-white/25 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                    </div>

                    {/* Full name */}
                    <input type="text" value={c.fullName} onChange={(e) => updateCoin(c.id, "fullName", e.target.value.slice(0, 40))}
                      className="w-full bg-[#1e1e26] border border-white/[0.08] rounded-lg px-2 py-1.5 text-white/70 text-xs focus:outline-none focus:border-[#FF7A1F]/60 transition-all"
                      placeholder="Full name (optional)" />

                    {/* Image upload */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => triggerUpload(c.id)}
                        className="flex-1 h-8 rounded-lg border border-white/[0.08] bg-[#1e1e26] text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all flex items-center justify-center gap-1.5">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                        {c.imgSrc ? "Change image" : "Upload image"}
                      </button>
                      {c.imgSrc && (
                        <button onClick={() => updateCoin(c.id, "imgSrc", null)}
                          className="h-8 px-2.5 rounded-lg border border-white/[0.08] bg-[#1e1e26] text-xs text-red-400/70 hover:text-red-400 hover:border-red-400/30 transition-all">
                          Remove
                        </button>
                      )}
                    </div>

                    {/* BG selector — only shown when image is uploaded */}
                    {c.imgSrc && (
                      <div className="flex gap-1.5">
                        {BG_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => updateCoin(c.id, "imgBg", opt.value)}
                            className={`flex-1 h-7 rounded-lg text-[10px] font-semibold border transition-all ${c.imgBg === opt.value ? "border-[#FF7A1F]/60 text-[#FF7A1F] bg-[#FF7A1F]/10" : "border-white/[0.08] text-white/35 hover:border-white/20 hover:text-white/60"}`}
                            style={opt.value !== "none" ? { background: c.imgBg === opt.value ? undefined : opt.value + "22" } : {}}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Color picker — circles */}
                    <div className="flex gap-2 flex-wrap">
                      {GRADIENTS.map((gr, gi) => (
                        <button key={gi} onClick={() => updateCoin(c.id, "colorIdx", gi)}
                          className={`h-5 w-5 rounded-full transition-all ring-offset-[#14141a] ${c.colorIdx === gi ? "ring-2 ring-white ring-offset-2 scale-110" : "hover:scale-110"}`}
                          style={{ background: `radial-gradient(circle at 35% 30%, ${gr.from}, ${gr.to} 70%)` }}
                          title={gr.label}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/[0.06]" />

          <button onClick={download} disabled={isDownloading || coins.length === 0}
            className="w-full h-12 rounded-xl bg-[#FF7A1F] hover:bg-[#FF8F3F] active:bg-[#E06010] disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            {isDownloading ? "Exporting…" : "Download PNG (1600×900)"}
          </button>
          <p className="text-xs text-white/20 text-center">Generated in-browser · No data uploaded</p>
        </aside>

        {/* Preview */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-[#0c0c0e]">
          <div className="w-full max-w-5xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/30 font-mono">preview — {CW} × {CH} · 16:9</span>
              <span className="text-xs text-white/20 font-mono">{variant} · {coins.length} coins</span>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.05]">
              <div ref={containerRef} style={{ width: "100%", height: 0, paddingBottom: `${(CH / CW) * 100}%`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: CW, height: CH, transformOrigin: "top left", transform: `scale(${scale})` }}>
                  <CardContent variant={variant} coins={coins} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
