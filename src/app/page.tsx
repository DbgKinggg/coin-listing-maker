"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";

const CW = 1600;
const CH = 900;

// Manual letter-spacing helper (ctx.letterSpacing has patchy browser support)
function fillTextTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number
) {
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
}

function trackedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  spacing: number
) {
  let w = 0;
  for (const ch of text) {
    w += ctx.measureText(ch).width + spacing;
  }
  return w - spacing;
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  const spacing = 80;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.022)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= CW; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CH);
    ctx.stroke();
  }
  for (let y = 0; y <= CH; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CW, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  img: HTMLImageElement | null,
  coinBg: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer glow ring
  ctx.save();
  ctx.shadowColor = "rgba(255,122,31,0.45)";
  ctx.shadowBlur = 90;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.001)";
  ctx.fill();
  ctx.restore();

  // Rim (3D depth)
  const rimDx = r * 0.065;
  const rimDy = r * 0.085;
  ctx.beginPath();
  ctx.arc(rimDx, rimDy, r, 0, Math.PI * 2);
  const rimGrad = ctx.createRadialGradient(
    rimDx - r * 0.2, rimDy - r * 0.2, r * 0.1,
    rimDx, rimDy, r
  );
  rimGrad.addColorStop(0, "#FFA040");
  rimGrad.addColorStop(0.55, "#D96010");
  rimGrad.addColorStop(1, "#5A1800");
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Face
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  const faceGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.02, 0, 0, r);
  faceGrad.addColorStop(0, "#FFB560");
  faceGrad.addColorStop(0.45, "#FF8C28");
  faceGrad.addColorStop(1, "#7A1E00");
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Coin logo clip area
  const innerR = r * 0.76;
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    // Fill background behind transparent images
    if (coinBg !== "none") {
      ctx.fillStyle = coinBg;
      ctx.fillRect(-innerR, -innerR, innerR * 2, innerR * 2);
    }
    const aspect = img.naturalWidth / img.naturalHeight;
    let sw = innerR * 2, sh = innerR * 2;
    if (aspect > 1) sh = sw / aspect;
    else sw = sh * aspect;
    ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
  } else {
    const darkGrad = ctx.createRadialGradient(-innerR * 0.3, -innerR * 0.3, 0, 0, 0, innerR);
    darkGrad.addColorStop(0, "#1c1820");
    darkGrad.addColorStop(1, "#080608");
    ctx.fillStyle = darkGrad;
    ctx.fillRect(-innerR, -innerR, innerR * 2, innerR * 2);
  }
  ctx.restore();

  // Gloss
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  const gloss = ctx.createLinearGradient(-r, -r * 0.7, r * 0.3, r * 0.6);
  gloss.addColorStop(0, "rgba(255,255,255,0.28)");
  gloss.addColorStop(0.4, "rgba(255,255,255,0.04)");
  gloss.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = gloss;
  ctx.fill();

  ctx.restore();
}

// ── Rounded rectangle helper ──────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── Main render ───────────────────────────────────────────────────────────────
function renderCard(
  canvas: HTMLCanvasElement,
  coinName: string,
  leverageText: string,
  showLeverage: boolean,
  coinImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  coinBg: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = CW;
  canvas.height = CH;

  // ── Background ───────────────────────────────────────────────────────────
  ctx.fillStyle = "#07070b";
  ctx.fillRect(0, 0, CW, CH);

  // Left-center warm glow
  const leftGlow = ctx.createRadialGradient(200, CH * 0.5, 0, 200, CH * 0.5, 700);
  leftGlow.addColorStop(0, "rgba(255,110,20,0.09)");
  leftGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, CW, CH);

  // Coin area warm glow
  const coinGlow = ctx.createRadialGradient(1145, 450, 80, 1145, 450, 480);
  coinGlow.addColorStop(0, "rgba(255,130,20,0.15)");
  coinGlow.addColorStop(0.6, "rgba(255,90,10,0.05)");
  coinGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = coinGlow;
  ctx.fillRect(0, 0, CW, CH);

  // ── Grid ─────────────────────────────────────────────────────────────────
  drawGrid(ctx);

  // ── Horizontal separator line ─────────────────────────────────────────────
  // Thin glowing line at ~36% from top
  const sepY = 330;
  ctx.save();
  const sepGrad = ctx.createLinearGradient(72, sepY, 800, sepY);
  sepGrad.addColorStop(0, "rgba(255,122,31,0.7)");
  sepGrad.addColorStop(0.6, "rgba(255,122,31,0.2)");
  sepGrad.addColorStop(1, "rgba(255,122,31,0)");
  ctx.strokeStyle = sepGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(72, sepY);
  ctx.lineTo(820, sepY);
  ctx.stroke();
  ctx.restore();

  // ── Logo — top left ───────────────────────────────────────────────────────
  if (logoImg) {
    const logoH = 38;
    const logoAspect = logoImg.naturalWidth / logoImg.naturalHeight;
    const logoW = logoH * logoAspect;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(logoImg, 72, 60, logoW, logoH);
    ctx.restore();
  }

  // ── "NEW LISTING" badge ───────────────────────────────────────────────────
  const badgeLabel = "NEW LISTING";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  const badgeTracking = 5;
  const badgeTW = trackedWidth(ctx, badgeLabel, badgeTracking);
  const badgePadX = 22, badgePadY = 10;
  const badgeW = badgeTW + badgePadX * 2;
  const badgeH = 42;
  const badgeX = 72;
  const badgeY = 228;

  ctx.save();
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
  ctx.fillStyle = "rgba(255,122,31,0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,122,31,0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#FF9A50";
  fillTextTracked(ctx, badgeLabel, badgeX + badgePadX, badgeY + badgeH - 13, badgeTracking);
  ctx.restore();

  // ── Coin name ─────────────────────────────────────────────────────────────
  const name = (coinName.trim() || "COIN").toUpperCase();
  let fs = 220;
  const maxW = 760;
  ctx.font = `900 ${fs}px Inter, system-ui, sans-serif`;
  while (ctx.measureText(name).width > maxW && fs > 64) {
    fs -= 4;
    ctx.font = `900 ${fs}px Inter, system-ui, sans-serif`;
  }
  ctx.save();
  // Subtle dark shadow for depth
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(name, 72, 560);
  ctx.restore();

  // ── Leverage / tag badge ──────────────────────────────────────────────────
  if (showLeverage && leverageText.trim()) {
    const label = leverageText.trim();
    ctx.font = "600 32px Inter, system-ui, sans-serif";
    const lw = ctx.measureText(label).width;
    const lbw = lw + 44;
    const lbh = 54;
    const lbx = 72;
    const lby = 604;

    ctx.save();
    roundRect(ctx, lbx, lby, lbw, lbh, 8);
    ctx.fillStyle = "rgba(255,122,31,0.10)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,122,31,0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#FFA060";
    ctx.font = "600 32px Inter, system-ui, sans-serif";
    ctx.fillText(label, lbx + 22, lby + lbh - 13);
    ctx.restore();
  }

  // ── Tagline at bottom ─────────────────────────────────────────────────────
  ctx.save();
  ctx.font = "400 24px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillText("Trade now on app.tangerine.exchange", 72, CH - 56);
  ctx.restore();

  // ── Vertical separator right of text area ─────────────────────────────────
  ctx.save();
  const vsGrad = ctx.createLinearGradient(860, 0, 860, CH);
  vsGrad.addColorStop(0, "rgba(255,122,31,0)");
  vsGrad.addColorStop(0.3, "rgba(255,122,31,0.15)");
  vsGrad.addColorStop(0.7, "rgba(255,122,31,0.15)");
  vsGrad.addColorStop(1, "rgba(255,122,31,0)");
  ctx.strokeStyle = vsGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(860, 0);
  ctx.lineTo(860, CH);
  ctx.stroke();
  ctx.restore();

  // ── 3D coin ───────────────────────────────────────────────────────────────
  drawCoin(ctx, 1155, 450, 288, coinImg, coinBg);
}

// ── UI ────────────────────────────────────────────────────────────────────────
export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coinName, setCoinName] = useState("BTC");
  const [leverageText, setLeverageText] = useState("Up to 50x Leverage");
  const [showLeverage, setShowLeverage] = useState(true);
  const [coinImgEl, setCoinImgEl] = useState<HTMLImageElement | null>(null);
  const [coinImgPreview, setCoinImgPreview] = useState<string | null>(null);
  const [coinBg, setCoinBg] = useState<string>("none");
  const [logoImgEl, setLogoImgEl] = useState<HTMLImageElement | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogoImgEl(img);
    img.src = "/logo-text-white.png";
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fontsReady) return;
    renderCard(canvas, coinName, leverageText, showLeverage, coinImgEl, logoImgEl, coinBg);
  }, [coinName, leverageText, showLeverage, coinImgEl, logoImgEl, coinBg, fontsReady]);

  useEffect(() => { redraw(); }, [redraw]);

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
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
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
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-[#FF7A1F] flex items-center justify-center text-white font-bold text-sm">T</div>
        <span className="font-semibold text-white/90">Listing Card Maker</span>
        <span className="ml-2 text-xs text-white/30 font-mono">tangerine.exchange</span>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 gap-0">
        <aside className="w-full lg:w-[340px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-6 space-y-6">

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest">Coin Ticker</label>
            <input
              type="text"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value.slice(0, 20))}
              placeholder="BTC"
              className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FF7A1F]/60 focus:ring-1 focus:ring-[#FF7A1F]/30 transition-all uppercase"
            />
          </div>

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
                    <p className="text-sm text-white/70 truncate">Image loaded</p>
                    <button onClick={clearImage} className="text-xs text-red-400/80 hover:text-red-400 transition-colors mt-0.5">Remove</button>
                  </div>
                </div>
                {/* Coin image background */}
                <div className="space-y-1.5">
                  <p className="text-xs text-white/40">Image background</p>
                  <div className="flex gap-2">
                    {(["none", "#ffffff", "#000000", "#1a1a1a"] as const).map((bg) => {
                      const labels: Record<string, string> = { none: "None", "#ffffff": "White", "#000000": "Black", "#1a1a1a": "Dark" };
                      const active = coinBg === bg;
                      return (
                        <button
                          key={bg}
                          onClick={() => setCoinBg(bg)}
                          title={labels[bg]}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                            ${active ? "border-[#FF7A1F] text-white bg-[#FF7A1F]/10" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/60"}`}
                        >
                          <span
                            className="h-3 w-3 rounded-sm shrink-0 border border-white/20"
                            style={{ background: bg === "none" ? "conic-gradient(#555 90deg, #888 90deg 180deg, #555 180deg 270deg, #888 270deg)" : bg }}
                          />
                          {labels[bg]}
                        </button>
                      );
                    })}
                  </div>
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
                <span className="text-xs font-medium">{isDragging ? "Drop to use" : "Click or drop image here"}</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Leverage Label</label>
              <button
                onClick={() => setShowLeverage((v) => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${showLeverage ? "bg-[#FF7A1F]" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${showLeverage ? "translate-x-4" : "translate-x-0.5"}`} />
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

          <div className="border-t border-white/[0.06]" />

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

        <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-[#0c0c0e]">
          <div className="w-full max-w-5xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/30 font-mono">preview — 1600 × 900 · 16:9</span>
              <span className="text-xs text-white/20">PNG export</span>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.05]">
              <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
