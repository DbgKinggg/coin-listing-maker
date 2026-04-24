"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";

// ── Canvas output dimensions — 1600×900 (16:9) optimal for X / Twitter ───────
const CW = 1600;
const CH = 900;

// ── Drawing helpers ───────────────────────────────────────────────────────────

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity = 0.85
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.22;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  img: HTMLImageElement | null,
  tilt = -0.18
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  // Drop shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetX = 28;
  ctx.shadowOffsetY = 40;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.01)";
  ctx.fill();
  ctx.restore();

  // Coin rim (offset slightly to simulate thickness/perspective)
  const rimDx = r * 0.07;
  const rimDy = r * 0.09;
  ctx.beginPath();
  ctx.arc(rimDx, rimDy, r, 0, Math.PI * 2);
  const rimGrad = ctx.createRadialGradient(
    rimDx - r * 0.25, rimDy - r * 0.25, r * 0.2,
    rimDx, rimDy, r
  );
  rimGrad.addColorStop(0, "#FFA040");
  rimGrad.addColorStop(0.6, "#FF7A1F");
  rimGrad.addColorStop(1, "#A03800");
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Coin face gradient
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  const faceGrad = ctx.createRadialGradient(
    -r * 0.28, -r * 0.28, r * 0.04,
    0, 0, r
  );
  faceGrad.addColorStop(0, "#FFB050");
  faceGrad.addColorStop(0.5, "#FF8820");
  faceGrad.addColorStop(1, "#CC5200");
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Inner image / logo area
  const innerR = r * 0.76;
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.clip();

  if (img) {
    // Cover-fit the uploaded image
    const aspect = img.naturalWidth / img.naturalHeight;
    let sw = innerR * 2, sh = innerR * 2;
    if (aspect > 1) {
      sh = sw / aspect;
    } else {
      sw = sh * aspect;
    }
    ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
  } else {
    // Dark placeholder with subtle gradient
    const darkGrad = ctx.createRadialGradient(
      -innerR * 0.3, -innerR * 0.3, 0,
      0, 0, innerR
    );
    darkGrad.addColorStop(0, "#2a2030");
    darkGrad.addColorStop(1, "#0c0a10");
    ctx.fillStyle = darkGrad;
    ctx.fillRect(-innerR, -innerR, innerR * 2, innerR * 2);
  }
  ctx.restore();

  // Gloss highlight overlay (top-left arc)
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  const glossGrad = ctx.createLinearGradient(-r * 0.9, -r * 0.6, r * 0.4, r * 0.5);
  glossGrad.addColorStop(0, "rgba(255,255,255,0.30)");
  glossGrad.addColorStop(0.35, "rgba(255,255,255,0.07)");
  glossGrad.addColorStop(1, "rgba(0,0,0,0.10)");
  ctx.fillStyle = glossGrad;
  ctx.fill();

  ctx.restore();
}

// ── Main render function ──────────────────────────────────────────────────────

function renderCard(
  canvas: HTMLCanvasElement,
  coinName: string,
  leverageText: string,
  showLeverage: boolean,
  coinImg: HTMLImageElement | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = CW;
  canvas.height = CH;

  // ── Background ──────────────────────────────────────────────────────────
  const bg = ctx.createRadialGradient(
    CW * 0.27, CH * 0.48, 0,
    CW * 0.27, CH * 0.48, CW * 0.72
  );
  bg.addColorStop(0, "#FFBE55");
  bg.addColorStop(0.35, "#FF9510");
  bg.addColorStop(0.72, "#E06800");
  bg.addColorStop(1, "#B84800");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  // Subtle vignette at corners
  const vig = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.3, CW / 2, CH / 2, CW * 0.8);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, CW, CH);

  // ── Sparkles ────────────────────────────────────────────────────────────
  drawSparkle(ctx, 500,  175, 17, 0.88);
  drawSparkle(ctx, 225,  390, 11, 0.75);
  drawSparkle(ctx, 700,  620, 20, 0.90);
  drawSparkle(ctx, 880,  770, 14, 0.80);
  drawSparkle(ctx, 1290, 745, 19, 0.85);
  drawSparkle(ctx, 1400, 270, 15, 0.78);
  drawSparkle(ctx, 1140, 175, 12, 0.72);
  drawSparkle(ctx, 1490, 560,  9, 0.62);

  // ── Logo — top left ─────────────────────────────────────────────────────
  const logoSize = 34;

  ctx.save();
  ctx.beginPath();
  ctx.arc(68 + logoSize / 2, 72, logoSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#FF7A1F";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${logoSize * 0.6}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("T", 68 + logoSize / 2, 72);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "bold 28px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillText("tangerine.exchange", 68 + logoSize + 12, 82);

  // ── "NEW LISTING" ────────────────────────────────────────────────────────
  ctx.font = "bold 68px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.80)";
  ctx.fillText("NEW LISTING", 72, 340);

  // ── Coin name (auto-scale) ───────────────────────────────────────────────
  const name = (coinName.trim() || "COIN").toUpperCase();
  let fs = 190;
  const maxWidth = 820;
  ctx.font = `900 ${fs}px Inter, system-ui, sans-serif`;
  while (ctx.measureText(name).width > maxWidth && fs > 52) {
    fs -= 4;
    ctx.font = `900 ${fs}px Inter, system-ui, sans-serif`;
  }
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#050505";
  ctx.fillText(name, 72, 548);
  ctx.restore();

  // ── Leverage badge ───────────────────────────────────────────────────────
  if (showLeverage && leverageText.trim()) {
    const label = leverageText.trim();
    ctx.font = "bold 40px Inter, system-ui, sans-serif";
    const tw = ctx.measureText(label).width;
    const bw = tw + 56;
    const bh = 66;
    const bx = 72;
    const by = 598;
    const br = bh / 2;

    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.lineTo(bx + bw - br, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + br, br);
    ctx.lineTo(bx + bw, by + bh - br);
    ctx.arcTo(bx + bw, by + bh, bx + bw - br, by + bh, br);
    ctx.lineTo(bx + br, by + bh);
    ctx.arcTo(bx, by + bh, bx, by + bh - br, br);
    ctx.lineTo(bx, by + br);
    ctx.arcTo(bx, by, bx + br, by, br);
    ctx.closePath();
    ctx.fillStyle = "rgba(8,8,8,0.88)";
    ctx.fill();

    ctx.fillStyle = "#FF7A1F";
    ctx.font = "bold 40px Inter, system-ui, sans-serif";
    ctx.fillText(label, bx + 28, by + bh - 14);
  }

  // ── 3D Coin ──────────────────────────────────────────────────────────────
  drawCoin(ctx, 1185, 440, 278, coinImg);
}

// ── UI Component ──────────────────────────────────────────────────────────────

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coinName, setCoinName] = useState("BTC");
  const [leverageText, setLeverageText] = useState("Up to 50x Leverage");
  const [showLeverage, setShowLeverage] = useState(true);
  const [coinImgEl, setCoinImgEl] = useState<HTMLImageElement | null>(null);
  const [coinImgPreview, setCoinImgPreview] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wait for Inter to load before first draw
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fontsReady) return;
    renderCard(canvas, coinName, leverageText, showLeverage, coinImgEl);
  }, [coinName, leverageText, showLeverage, coinImgEl, fontsReady]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setCoinImgPreview(url);
    const img = new Image();
    img.onload = () => setCoinImgEl(img);
    img.src = url;
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the drop zone entirely (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  function clearImage() {
    setCoinImgEl(null);
    setCoinImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `tangerine-listing-${(coinName.trim() || "coin").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-[#FF7A1F] flex items-center justify-center text-white font-bold text-sm">
          T
        </div>
        <span className="font-semibold text-white/90">Listing Card Maker</span>
        <span className="ml-2 text-xs text-white/30 font-mono">tangerine.exchange</span>
      </header>

      {/* Body */}
      <div className="flex flex-col lg:flex-row flex-1 gap-0">
        {/* ── Controls panel ─────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[340px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-6 space-y-6">

          {/* Coin Name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">
              Coin Ticker
            </label>
            <input
              type="text"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value.slice(0, 20))}
              placeholder="BTC"
              className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FF7A1F]/60 focus:ring-1 focus:ring-[#FF7A1F]/30 transition-all uppercase"
            />
          </div>

          {/* Coin Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">
              Coin Image
            </label>
            {coinImgPreview ? (
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coinImgPreview} alt="coin" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">Image loaded</p>
                  <button
                    onClick={clearImage}
                    className="text-xs text-red-400/80 hover:text-red-400 transition-colors mt-0.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-24 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer
                  ${isDragging
                    ? "border-[#FF7A1F] bg-[#FF7A1F]/10 text-white/80 scale-[1.02]"
                    : "border-white/[0.10] hover:border-[#FF7A1F]/50 hover:bg-[#FF7A1F]/[0.04] text-white/40 hover:text-white/60"
                  }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs font-medium">
                  {isDragging ? "Drop to use" : "Click or drop image here"}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Leverage Label */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                Leverage Label
              </label>
              <button
                onClick={() => setShowLeverage((v) => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${showLeverage ? "bg-[#FF7A1F]" : "bg-white/10"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${showLeverage ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            {showLeverage && (
              <input
                type="text"
                value={leverageText}
                onChange={(e) => setLeverageText(e.target.value.slice(0, 40))}
                placeholder="Up to 50x Leverage"
                className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF7A1F]/60 focus:ring-1 focus:ring-[#FF7A1F]/30 transition-all"
              />
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Download */}
          <button
            onClick={download}
            className="w-full h-12 rounded-xl bg-[#FF7A1F] hover:bg-[#FF8F3F] active:bg-[#E06010] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PNG (1600×900)
          </button>

          <p className="text-xs text-white/25 text-center leading-relaxed">
            Image is generated in-browser.<br />No data is uploaded.
          </p>
        </aside>

        {/* ── Canvas preview ──────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-[#0c0c0e]">
          <div className="w-full max-w-5xl">
            {/* Label */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/30 font-mono">preview — 1600 × 900 · 16:9</span>
              <span className="text-xs text-white/20">PNG export</span>
            </div>

            {/* Canvas wrapper with rounded corners + shadow */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.05]">
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
