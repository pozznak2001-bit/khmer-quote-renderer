import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// 5 Premium Theme Palettes
const THEMES = [
  {
    name: "emerald",
    primaryGlow: "rgba(16, 185, 129, 0.3)",
    secondaryGlow: "rgba(6, 182, 212, 0.2)",
    accentText: "#34d399",
    borderAccent: "rgba(16, 185, 129, 0.4)",
    dotColor: "#10b981",
  },
  {
    name: "sapphire",
    primaryGlow: "rgba(59, 130, 246, 0.3)",
    secondaryGlow: "rgba(147, 51, 234, 0.2)",
    accentText: "#60a5fa",
    borderAccent: "rgba(59, 130, 246, 0.4)",
    dotColor: "#3b82f6",
  },
  {
    name: "amethyst",
    primaryGlow: "rgba(139, 92, 246, 0.32)",
    secondaryGlow: "rgba(236, 72, 153, 0.2)",
    accentText: "#c084fc",
    borderAccent: "rgba(139, 92, 246, 0.4)",
    dotColor: "#a855f7",
  },
  {
    name: "amber",
    primaryGlow: "rgba(245, 158, 11, 0.28)",
    secondaryGlow: "rgba(239, 68, 68, 0.2)",
    accentText: "#fbbf24",
    borderAccent: "rgba(245, 158, 11, 0.4)",
    dotColor: "#f59e0b",
  },
  {
    name: "crimson",
    primaryGlow: "rgba(244, 63, 94, 0.28)",
    secondaryGlow: "rgba(168, 85, 247, 0.2)",
    accentText: "#fb7185",
    borderAccent: "rgba(244, 63, 94, 0.4)",
    dotColor: "#f43f5e",
  }
];

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const slides = body.slides;
    const brand = body.brand || "weread.businessplan | weread.asia";
    const topic = body.topic || (slides[0] && slides[0].category) || "";

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
    }

    // Auto-select Theme based on Topic hash (so the same topic stays consistent, but different topics get different themes)
    let hash = 0;
    for (let i = 0; i < topic.length; i++) {
      hash = topic.charCodeAt(i) + ((hash << 5) - hash);
    }
    const themeIndex = Math.abs(hash) % THEMES.length;
    const currentTheme = THEMES[themeIndex];

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

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet">
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
              padding: 80px 70px;
              overflow: hidden;
            }

            /* --- PROCEDURAL DYNAMIC GRADIENT THEME --- */
            .glow-orb-1 {
              position: absolute; width: 750px; height: 750px; top: -150px; right: -150px;
              background: radial-gradient(circle, ${currentTheme.primaryGlow} 0%, rgba(6, 8, 14, 0) 70%);
              border-radius: 50%; filter: blur(60px); z-index: 0;
            }
            .glow-orb-2 {
              position: absolute; width: 650px; height: 650px; bottom: -100px; left: -100px;
              background: radial-gradient(circle, ${currentTheme.secondaryGlow} 0%, rgba(6, 8, 14, 0) 70%);
              border-radius: 50%; filter: blur(60px); z-index: 0;
            }
            .mesh-grid {
              position: absolute; top: 0; left: 0; width: 100%; height: 100%;
              background-image: 
                linear-gradient(rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px);
              background-size: 60px 60px; z-index: 1;
            }

            /* --- GLASSMORPHISM CARD --- */
            .glass-card {
              position: relative; z-index: 2; width: 100%; height: 100%;
              background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(10, 15, 26, 0.92) 100%);
              border: 1.5px solid rgba(255, 255, 255, 0.12);
              border-radius: 40px;
              box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.9);
              display: flex; flex-direction: column; justify-content: space-between;
              padding: 70px 65px;
            }

            /* --- CARD HEADER --- */
            .card-header { display: flex; justify-content: space-between; align-items: center; }
            .tag-pill {
              display: inline-flex; align-items: center; gap: 12px;
              background: rgba(255, 255, 255, 0.06); border: 1px solid ${currentTheme.borderAccent};
              padding: 10px 24px; border-radius: 100px; color: ${currentTheme.accentText}; font-size: 24px; font-weight: 600;
            }
            .glowing-dot { 
              width: 12px; height: 12px; 
              background-color: ${currentTheme.dotColor}; 
              border-radius: 50%; 
              box-shadow: 0 0 14px ${currentTheme.dotColor}; 
            }
            .slide-counter { font-size: 22px; font-weight: 600; color: #64748b; letter-spacing: 2px; }

            /* --- CARD BODY --- */
            .card-body { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; flex: 1; padding: 30px 10px; }
            .quote-title { font-size: ${index === 0 ? "54px" : "48px"}; line-height: 1.55; font-weight: 700; color: #ffffff; max-width: 820px; }
            .quote-body { font-size: 36px; line-height: 1.7; color: #cbd5e1; font-weight: 400; margin-top: 30px; max-width: 820px; }

            /* --- CARD FOOTER --- */
            .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 30px; }
            .footer-text { font-size: 22px; font-weight: 600; color: ${currentTheme.accentText}; letter-spacing: 0.5px; }
            .swipe-hint { font-size: 20px; color: #94a3b8; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="glow-orb-1"></div>
          <div class="glow-orb-2"></div>
          <div class="mesh-grid"></div>
          <div class="glass-card">
            <div class="card-header">
              <div class="tag-pill"><span class="glowing-dot"></span><span>${categoryText}</span></div>
              <div class="slide-counter">0${slideNum} / 05</div>
            </div>
            <div class="card-body">
              <h1 class="quote-title">${index === 0 ? `« ${titleText} »` : titleText}</h1>
              ${bodyText ? `<p class="quote-body">${bodyText}</p>` : ""}
            </div>
            <div class="card-footer">
              <div class="footer-text">@${brand}</div>
              <div class="swipe-hint">${index === 4 ? "Save for later ↗" : "Swipe left →"}</div>
            </div>
          </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
        await page.evaluateHandle("document.fonts.ready");
        const buffer = await page.screenshot({ type: "jpeg", quality: 90 });
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