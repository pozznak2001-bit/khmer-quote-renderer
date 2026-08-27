import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// 4 Distinct Visual Themes for Variety
const THEMES = [
  { name: "emerald", primary: "#10B981", secondary: "#06B6D4", bgOrb1: "rgba(16, 185, 129, 0.28)", bgOrb2: "rgba(6, 182, 212, 0.2)" },
  { name: "sapphire", primary: "#3B82F6", secondary: "#6366F1", bgOrb1: "rgba(59, 130, 246, 0.28)", bgOrb2: "rgba(99, 102, 241, 0.2)" },
  { name: "amethyst", primary: "#A855F7", secondary: "#EC4899", bgOrb1: "rgba(168, 85, 247, 0.28)", bgOrb2: "rgba(236, 72, 153, 0.2)" },
  { name: "amber", primary: "#F59E0B", secondary: "#EF4444", bgOrb1: "rgba(245, 158, 11, 0.28)", bgOrb2: "rgba(239, 68, 68, 0.2)" },
];

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const slides = body.slides;
    const brand = body.brand || "weread.businessplan | weread.asia";

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
    }

    // Pick a theme based on topic string or random
    const themeIndex = Math.floor(Math.random() * THEMES.length);
    const theme = THEMES[themeIndex];

    chromium.setGraphicsMode = false;
    browser = await puppeteer.launch({
      args: [...chromium.args, "--disable-web-security", "--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
      defaultViewport: { width: 1080, height: 1350, deviceScaleFactor: 1.5 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const renderSlide = async (slide: any, index: number) => {
      const page = await browser.newPage();
      try {
        const categoryText = slide.category || "ផែនការអាជីវកម្ម";
        const titleText = slide.title || "";
        const bodyText = (slide.body || slide.description || "").trim().replace(/^(បញ្ហា|ដំណោះស្រាយ|លទ្ធផល|គន្លឹះ|យុទ្ធសាស្ត្រ)\s*[៖:]\s*/i, "");
        const slideNum = index + 1;

        // Visual badges depending on slide step
        let stepBadge = { label: categoryText, color: theme.primary, bg: "rgba(255,255,255,0.08)" };
        if (index === 1) stepBadge = { label: "⚠️ បញ្ហាប្រឈម", color: "#F87171", bg: "rgba(239,68,68,0.15)" };
        if (index === 2) stepBadge = { label: "💡 ដំណោះស្រាយយុទ្ធសាស្ត្រ", color: "#34D399", bg: "rgba(16,185,129,0.15)" };
        if (index === 3) stepBadge = { label: "🚀 លទ្ធផលទទួលបាន", color: "#60A5FA", bg: "rgba(59,130,246,0.15)" };
        if (index === 4) stepBadge = { label: "🎯 ACTION PLAN", color: "#FBBF24", bg: "rgba(245,158,11,0.15)" };

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Kantumruy Pro', sans-serif; }
            body {
              width: 1080px;
              height: 1350px;
              background-color: #06080E;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 75px 65px;
              overflow: hidden;
            }
            .glow-orb-1 {
              position: absolute; width: 850px; height: 850px; top: -200px; right: -200px;
              background: radial-gradient(circle, ${theme.bgOrb1} 0%, rgba(6, 8, 14, 0) 70%);
              border-radius: 50%; filter: blur(70px); z-index: 0;
            }
            .glow-orb-2 {
              position: absolute; width: 750px; height: 750px; bottom: -150px; left: -150px;
              background: radial-gradient(circle, ${theme.bgOrb2} 0%, rgba(6, 8, 14, 0) 70%);
              border-radius: 50%; filter: blur(70px); z-index: 0;
            }
            .mesh-grid {
              position: absolute; top: 0; left: 0; width: 100%; height: 100%;
              background-image: 
                linear-gradient(rgba(255, 255, 255, 0.035) 1.5px, transparent 1.5px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1.5px, transparent 1.5px);
              background-size: 55px 55px; z-index: 1;
            }
            .glass-card {
              position: relative; z-index: 2; width: 100%; height: 100%;
              background: linear-gradient(145deg, rgba(17, 24, 39, 0.82) 0%, rgba(10, 15, 26, 0.94) 100%);
              border: 1.5px solid rgba(255, 255, 255, 0.12);
              border-radius: 40px;
              box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.95);
              display: flex; flex-direction: column; justify-content: space-between;
              padding: 70px 60px;
            }
            .card-header { display: flex; justify-content: space-between; align-items: center; }
            .tag-pill {
              display: inline-flex; align-items: center; gap: 12px;
              background: ${stepBadge.bg};
              border: 1.5px solid ${stepBadge.color}55;
              padding: 12px 28px; border-radius: 100px;
              color: ${stepBadge.color}; font-size: 26px; font-weight: 700;
            }
            .slide-counter { font-size: 24px; font-weight: 700; color: #64748b; letter-spacing: 2px; }
            
            .card-body {
              display: flex; flex-direction: column; justify-content: center; align-items: center;
              text-align: center; flex: 1; padding: 20px 10px;
            }
            
            /* Cover Typography */
            .cover-title {
              font-size: 64px; line-height: 1.45; font-weight: 800; color: #FFFFFF;
              max-width: 860px; text-shadow: 0 4px 20px rgba(0,0,0,0.6);
            }
            .cover-subtitle {
              font-size: 32px; color: ${theme.primary}; font-weight: 600; margin-top: 35px;
              letter-spacing: 1px;
            }

            /* Content Typography */
            .content-header-title {
              font-size: 52px; font-weight: 800; color: ${stepBadge.color};
              margin-bottom: 25px; line-height: 1.4;
            }
            .content-box {
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 28px;
              padding: 45px 40px;
              max-width: 860px;
              box-shadow: inset 0 2px 4px rgba(255,255,255,0.02);
            }
            .content-text {
              font-size: 42px; line-height: 1.65; color: #F1F5F9; font-weight: 500;
            }

            .card-footer {
              display: flex; justify-content: space-between; align-items: center;
              border-top: 1.5px solid rgba(255, 255, 255, 0.08); padding-top: 30px;
            }
            .footer-text { font-size: 24px; font-weight: 700; color: ${theme.primary}; letter-spacing: 0.5px; }
            .swipe-hint { font-size: 22px; color: #94a3b8; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="glow-orb-1"></div>
          <div class="glow-orb-2"></div>
          <div class="mesh-grid"></div>
          <div class="glass-card">
            <div class="card-header">
              <div class="tag-pill">${stepBadge.label}</div>
              <div class="slide-counter">0${slideNum} / 05</div>
            </div>

            <div class="card-body">
              ${
                index === 0
                  ? `<h1 class="cover-title">« ${titleText} »</h1><div class="cover-subtitle">SWIPE TO READ →</div>`
                  : `<div class="content-header-title">${titleText}</div>
                     <div class="content-box"><p class="content-text">${bodyText || titleText}</p></div>`
              }
            </div>

            <div class="card-footer">
              <div class="footer-text">@${brand}</div>
              <div class="swipe-hint">${index === 4 ? "Save Post ↗" : "Swipe Left →"}</div>
            </div>
          </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
        await page.evaluateHandle("document.fonts.ready");
        const buffer = await page.screenshot({ type: "jpeg", quality: 92 });
        return Buffer.from(buffer).toString("base64");
      } finally {
        await page.close();
      }
    };

    const renderedImages = await Promise.all(slides.map((s: any, idx: number) => renderSlide(s, idx)));

    return NextResponse.json({
      success: true,
      count: renderedImages.length,
      images: renderedImages,
    });
  } catch (error: any) {
    console.error("Render Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}