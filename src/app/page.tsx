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

type Variant = "S1" | "S2" | "S3";
type MarketType = "PERP" | "SPOT" | "";

interface CardData {
  ticker: string;
  fullName: string;
  marketType: MarketType;
  leverageText: string;
  showLeverage: boolean;
  coinImg: string | null;
  coinBg: string;
  colorIdx: number;
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────

function Brandbar({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", zIndex: 10, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-text-white.png" alt="Tangerine" style={{ height: 40 }} />
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

function CoinOrb({
  size, imgSrc, imgBg, colorIdx, ticker, showLetter = true,
}: {
  size: number; imgSrc: string | null; imgBg: string; colorIdx: number;
  ticker: string; showLetter?: boolean;
}) {
  const g = GRADIENTS[colorIdx] ?? GRADIENTS[0];
  const bg = imgSrc
    ? (imgBg === "none" ? "transparent" : imgBg)
    : `radial-gradient(circle at 35% 30%, ${g.from}, ${g.to} 70%)`;
  const fs = Math.round(size * 0.37);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg,
      boxShadow: `0 ${size * 0.08}px ${size * 0.21}px rgba(255,100,20,0.35), inset 0 ${size * 0.011}px ${size * 0.047}px rgba(255,255,255,0.18), inset 0 ${-size * 0.026}px ${size * 0.105}px rgba(0,0,0,0.4)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      {imgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgSrc} alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} />
      )}
      {showLetter && !imgSrc && (
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: fs, color: "#fff", letterSpacing: -2, textShadow: "0 4px 20px rgba(0,0,0,0.35)", position: "relative", zIndex: 1 }}>
          {ticker[0]?.toUpperCase() ?? "?"}
        </span>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.08) 100%)", pointerEvents: "none", zIndex: 2, borderRadius: "50%" }} />
    </div>
  );
}

function tickerFs(ticker: string): number {
  const len = ticker.length;
  if (len <= 3) return 180;
  if (len <= 5) return 160;
  if (len <= 7) return 128;
  if (len <= 9) return 100;
  return 80;
}

// ── S1: Hero medallion ────────────────────────────────────────────────────────
function S1({ d }: { d: CardData }) {
  const label = d.marketType ? `NEW ${d.marketType}` : "NEW LISTING";
  const fs = tickerFs(d.ticker);
  return (
    <div style={{ width: CW, height: CH, position: "relative", overflow: "hidden",
      background: "radial-gradient(ellipse 55% 70% at 30% 55%, rgba(255,122,31,0.22), transparent 70%), radial-gradient(ellipse 100% 60% at 50% 110%, rgba(255,80,0,0.14), transparent 70%), #070604",
    }}>
      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "60px 60px", WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 90%)", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 90%)" }} />
      <Brackets />
      <Brandbar style={{ top: 56, left: 60 }} />

      {/* NEW LISTING chip */}
      <div style={{ position: "absolute", top: 62, right: 60, zIndex: 10, display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", background: "rgba(255,122,31,0.12)", border: "1px solid rgba(255,122,31,0.45)", borderRadius: 999, fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 700, color: "#FFB37A", letterSpacing: 2, textTransform: "uppercase" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF7A1F", boxShadow: "0 0 12px #FF7A1F", flexShrink: 0 }} />
        {label}
      </div>

      {/* Coin stage */}
      <div style={{ position: "absolute", left: 210, top: "50%", transform: "translate(-50%, -50%)", width: 460, height: 460, display: "grid", placeItems: "center" }}>
        <div style={{ position: "absolute", inset: -80, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", inset: -20, borderRadius: "50%", border: "1px dashed rgba(255,122,31,0.28)" }} />
        <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(255,122,31,0.4), transparent 62%)", filter: "blur(6px)" }} />
        <CoinOrb size={380} imgSrc={d.coinImg} imgBg={d.coinBg} colorIdx={d.colorIdx} ticker={d.ticker} />
      </div>

      {/* Text block */}
      <div style={{ position: "absolute", left: 540, right: 80, top: "50%", transform: "translateY(-50%)", zIndex: 5 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: fs, letterSpacing: -7, lineHeight: 0.9, color: "#fff", display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>$</span>
          <span>{d.ticker.toUpperCase()}</span>
        </div>
        {d.fullName && (
          <div style={{ marginTop: 14, fontFamily: "Inter, sans-serif", fontSize: 26, fontWeight: 500, letterSpacing: -0.2, color: "rgba(255,255,255,0.65)" }}>{d.fullName}</div>
        )}
        {d.showLeverage && d.leverageText && (
          <div style={{ marginTop: 26 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 18px", background: "rgba(255,122,31,0.1)", border: "1px solid rgba(255,122,31,0.45)", borderRadius: 10, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, letterSpacing: 1.8, textTransform: "uppercase", color: "#FFB37A", fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF7A1F", flexShrink: 0 }} />
              {d.leverageText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── S2: Terminal readout ──────────────────────────────────────────────────────
function S2({ d }: { d: CardData }) {
  const statusLabel = d.marketType || "PERP";
  const fs = tickerFs(d.ticker);
  return (
    <div style={{ width: CW, height: CH, position: "relative", overflow: "hidden", background: "#07080a" }}>
      {/* Background glows */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 85% 25%, rgba(255,122,31,0.2), transparent 70%), radial-gradient(ellipse 60% 40% at 15% 95%, rgba(255,122,31,0.08), transparent 70%)" }} />
      {/* Scan lines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 4px)", pointerEvents: "none" }} />

      <Brandbar style={{ top: 56, left: 60 }} />

      {/* Live badge */}
      <div style={{ position: "absolute", top: 66, right: 60, zIndex: 10, display: "flex", alignItems: "center", gap: 10, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 2.4, textTransform: "uppercase" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2bd17e", boxShadow: "0 0 10px #2bd17e" }} />
        LIVE · <strong style={{ color: "#fff" }}>NEW LISTING</strong>
      </div>

      {/* Hero row */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 205, display: "flex", alignItems: "center", gap: 56, zIndex: 4 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -28, borderRadius: "50%", border: "1px solid rgba(255,122,31,0.18)" }} />
          <CoinOrb size={280} imgSrc={d.coinImg} imgBg={d.coinBg} colorIdx={d.colorIdx} ticker={d.ticker} />
        </div>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: Math.min(fs, 200), letterSpacing: -8, lineHeight: 0.9, color: "#fff", display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 700 }}>$</span>
            <span>{d.ticker.toUpperCase()}</span>
          </div>
          {d.fullName && (
            <div style={{ marginTop: 14, fontFamily: "Inter, sans-serif", fontSize: 26, fontWeight: 500, letterSpacing: -0.2, color: "rgba(255,255,255,0.65)" }}>{d.fullName}</div>
          )}
        </div>
      </div>

      {/* Data panel */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 100, background: "rgba(12,10,10,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "28px 40px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, fontFamily: "IBM Plex Mono, monospace", zIndex: 4, backdropFilter: "blur(8px)" }}>
        {d.showLeverage && d.leverageText ? (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 10 }}>Leverage</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: "#FF7A1F" }}>{d.leverageText}</div>
          </div>
        ) : <div />}
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 10 }}>Type</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: "#fff" }}>{statusLabel}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 10 }}>Status</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: "#2bd17e" }}>Live</div>
        </div>
      </div>

      {/* Bottom edge */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 54, display: "flex", justifyContent: "space-between", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2.6, textTransform: "uppercase", zIndex: 4 }}>
        <span><strong style={{ color: "#FF7A1F" }}>APP.TANGERINE.EXCHANGE</strong></span>
      </div>
    </div>
  );
}

// ── S3: Stencil poster ────────────────────────────────────────────────────────
function S3({ d }: { d: CardData }) {
  const badgeLabel = d.marketType ? `NEW LISTING · ${d.marketType}` : "NEW LISTING";
  return (
    <div style={{ width: CW, height: CH, position: "relative", overflow: "hidden",
      background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(60,22,6,0.85), #060404 70%), #060404",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 15% 90%, rgba(255,122,31,0.14), transparent 42%), radial-gradient(circle at 85% 15%, rgba(255,60,0,0.14), transparent 40%)", pointerEvents: "none" }} />
      <Brandbar style={{ top: 56, left: 60 }} />

      {/* Badge top-right */}
      <div style={{ position: "absolute", top: 56, right: 60, zIndex: 10, display: "flex", alignItems: "center", gap: 12, fontFamily: "IBM Plex Mono, monospace", fontSize: 20, color: "rgba(255,255,255,0.85)", letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, padding: "12px 20px", background: "rgba(255,122,31,0.12)", border: "1px solid rgba(255,122,31,0.45)", borderRadius: 10 }}>
        {badgeLabel.split("·").map((part, i) => (
          <span key={i} style={i === 1 ? { color: "#FF7A1F", fontWeight: 800 } : {}}>{part.trim()}{i === 0 && <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 8px" }}>·</span>}</span>
        ))}
      </div>

      {/* Giant "LISTED" stroke */}
      {["stroke", "fill"].map((type) => (
        <div key={type} style={{
          position: "absolute", left: "50%", top: "52%",
          transform: "translate(-50%, -50%)",
          fontFamily: "Inter, sans-serif", fontWeight: 900,
          fontSize: 440, letterSpacing: -22, lineHeight: 0.82,
          whiteSpace: "nowrap", zIndex: type === "fill" ? 0 : 1,
          ...(type === "stroke"
            ? { color: "transparent", WebkitTextStroke: "2px rgba(255,122,31,0.65)" }
            : { background: "linear-gradient(180deg, rgba(255,180,120,0.06), rgba(255,90,0,0.02))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }),
        }}>LISTED</div>
      ))}

      {/* Center coin */}
      <div style={{ position: "absolute", left: "50%", top: "48%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
        <div style={{ position: "absolute", inset: -28, borderRadius: "50%", border: "1px dashed rgba(255,122,31,0.3)", zIndex: -1 }} />
        <div style={{ borderRadius: "50%", boxShadow: "0 0 70px rgba(255,122,31,0.55), 0 30px 60px rgba(0,0,0,0.6)" }}>
          <CoinOrb size={380} imgSrc={d.coinImg} imgBg={d.coinBg} colorIdx={d.colorIdx} ticker={d.ticker} />
        </div>
      </div>

      {/* Bottom plate */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 110, display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 5 }}>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 108, letterSpacing: -4.5, lineHeight: 0.92, color: "#fff", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>$</span>
            <span>{d.ticker.toUpperCase()}</span>
          </div>
          {d.fullName && (
            <div style={{ marginTop: 8, fontFamily: "IBM Plex Mono, monospace", fontSize: 15, fontWeight: 500, letterSpacing: 2.6, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{d.fullName}</div>
          )}
        </div>
        {d.showLeverage && d.leverageText && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, letterSpacing: 2.4, textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Leverage</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 72, letterSpacing: -2.5, lineHeight: 1, color: "#FF7A1F" }}>{d.leverageText}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CardContent({ variant, data }: { variant: Variant; data: CardData }) {
  if (variant === "S1") return <S1 d={data} />;
  if (variant === "S2") return <S2 d={data} />;
  return <S3 d={data} />;
}

// ── Page component ────────────────────────────────────────────────────────────
export default function Page() {
  const [variant, setVariant] = useState<Variant>("S1");
  const [ticker, setTicker] = useState("BTC");
  const [fullName, setFullName] = useState("Bitcoin");
  const [marketType, setMarketType] = useState<MarketType>("PERP");
  const [leverageText, setLeverageText] = useState("Up to 50× Leverage");
  const [showLeverage, setShowLeverage] = useState(true);
  const [coinImg, setCoinImg] = useState<string | null>(null);
  const [coinImgPreview, setCoinImgPreview] = useState<string | null>(null);
  const [coinBg, setCoinBg] = useState("none");
  const [colorIdx, setColorIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data: CardData = { ticker: ticker.trim() || "COIN", fullName, marketType, leverageText, showLeverage, coinImg, coinBg, colorIdx };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setScale(el.clientWidth / CW));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setCoinImgPreview(url);
    setCoinImg(url);
  }

  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) loadFile(f);
  }, []);

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e: React.DragEvent) { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }

  function clearImage() { setCoinImg(null); setCoinImgPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }

  async function download() {
    const el = exportRef.current;
    if (!el || isDownloading) return;
    setIsDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(el, { pixelRatio: 1, width: CW, height: CH, skipFonts: false });
      const link = document.createElement("a");
      link.download = `tangerine-listing-${(ticker.trim() || "coin").toLowerCase()}.png`;
      link.href = url;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col">
      {/* Off-screen export target */}
      <div style={{ position: "fixed", left: -9999, top: -9999, pointerEvents: "none", zIndex: -100, opacity: 0, overflow: "hidden", width: CW, height: CH }}>
        <div ref={exportRef} style={{ width: CW, height: CH }}>
          <CardContent variant={variant} data={data} />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        <div className="h-7 w-7 rounded-full bg-[#FF7A1F] flex items-center justify-center text-white font-bold text-sm">T</div>
        <span className="font-semibold text-white/90">Listing Card Maker</span>
        <span className="text-white/20">·</span>
        <Link href="/" className="text-sm text-[#FF7A1F] font-medium">Single Coin</Link>
        <Link href="/multi" className="text-sm text-white/40 hover:text-white/70 transition-colors">Multi Coin</Link>
        <span className="ml-auto text-xs text-white/20 font-mono">tangerine.exchange</span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 gap-0">
        {/* Controls */}
        <aside className="w-full lg:w-[340px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-6 space-y-5 overflow-y-auto">

          {/* Variant */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Template</label>
            <div className="flex gap-2">
              {(["S1", "S2", "S3"] as Variant[]).map((v) => (
                <button key={v} onClick={() => setVariant(v)} className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all border ${variant === v ? "bg-[#FF7A1F]/15 border-[#FF7A1F]/60 text-[#FF7A1F]" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/60"}`}>{v}</button>
              ))}
            </div>
            <p className="text-xs text-white/25">{variant === "S1" ? "Hero medallion — coin left, ticker right" : variant === "S2" ? "Terminal readout — coin + data panel" : "Stencil poster — giant LISTED behind coin"}</p>
          </div>

          {/* Ticker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Coin Ticker</label>
            <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 12))} placeholder="BTC" className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FF7A1F]/60 focus:ring-1 focus:ring-[#FF7A1F]/30 transition-all" />
          </div>

          {/* Full name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Full Name <span className="normal-case font-normal text-white/25">(optional)</span></label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value.slice(0, 40))} placeholder="Bitcoin" className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF7A1F]/60 focus:ring-1 focus:ring-[#FF7A1F]/30 transition-all" />
          </div>

          {/* Market type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Market Type</label>
            <div className="flex gap-2">
              {(["PERP", "SPOT", ""] as MarketType[]).map((t) => (
                <button key={t} onClick={() => setMarketType(t)} className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all border ${marketType === t ? "bg-[#FF7A1F]/15 border-[#FF7A1F]/60 text-[#FF7A1F]" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/60"}`}>{t || "—"}</button>
              ))}
            </div>
          </div>

          {/* Leverage */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Leverage Label</label>
            <div className="flex gap-2">
              <input type="text" value={leverageText} onChange={(e) => setLeverageText(e.target.value.slice(0, 40))} placeholder="Up to 50× Leverage" disabled={!showLeverage} className="flex-1 bg-[#18181b] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF7A1F]/60 focus:ring-1 focus:ring-[#FF7A1F]/30 transition-all disabled:opacity-40" />
              <button onClick={() => setShowLeverage(v => !v)} className={`relative h-[46px] w-11 shrink-0 rounded-xl transition-colors ${showLeverage ? "bg-[#FF7A1F]" : "bg-white/10"}`}>
                <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow transition-opacity ${showLeverage ? "opacity-100" : "opacity-60"}`} />
              </button>
            </div>
          </div>

          {/* Coin Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Coin Image</label>
            {coinImgPreview ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coinImgPreview} alt="coin" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70">Image loaded</p>
                    <button onClick={clearImage} className="text-xs text-red-400/80 hover:text-red-400 mt-0.5">Remove</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-white/40">Image background</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["none", "#ffffff", "#000000", "#1a1a1a"] as const).map((bg) => {
                      const labels: Record<string, string> = { none: "None", "#ffffff": "White", "#000000": "Black", "#1a1a1a": "Dark" };
                      return (
                        <button key={bg} onClick={() => setCoinBg(bg)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${coinBg === bg ? "border-[#FF7A1F] text-white bg-[#FF7A1F]/10" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/60"}`}>
                          <span className="h-3 w-3 rounded-sm shrink-0 border border-white/20" style={{ background: bg === "none" ? "conic-gradient(#444 90deg, #777 90deg 180deg, #444 180deg 270deg, #777 270deg)" : bg }} />
                          {labels[bg]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragEnter={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className={`w-full h-20 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${isDragging ? "border-[#FF7A1F] bg-[#FF7A1F]/10 text-white/80 scale-[1.02]" : "border-white/[0.10] hover:border-[#FF7A1F]/50 hover:bg-[#FF7A1F]/[0.04] text-white/40 hover:text-white/60"}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                <span className="text-xs font-medium">{isDragging ? "Drop to use" : "Click or drop image"}</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Coin color */}
          {!coinImg && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Coin Color</label>
              <div className="flex gap-2 flex-wrap">
                {GRADIENTS.map((g, i) => (
                  <button key={i} onClick={() => setColorIdx(i)} title={g.label}
                    className={`h-7 w-7 rounded-full transition-all ring-offset-[#0a0a0b] ${colorIdx === i ? "ring-2 ring-white ring-offset-2 scale-110" : "hover:scale-110"}`}
                    style={{ background: `radial-gradient(circle at 35% 30%, ${g.from}, ${g.to} 70%)` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.06]" />

          <button onClick={download} disabled={isDownloading}
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
              <span className="text-xs text-white/20 font-mono">{variant} · {marketType || "—"}</span>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.05]">
              <div ref={containerRef} style={{ width: "100%", height: 0, paddingBottom: `${(CH / CW) * 100}%`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: CW, height: CH, transformOrigin: "top left", transform: `scale(${scale})` }}>
                  <CardContent variant={variant} data={data} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
