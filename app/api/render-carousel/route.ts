import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const THEMES = [
  { name: "emerald", pGlow: "rgba(16, 185, 129, 0.35)", sGlow: "rgba(6, 182, 212, 0.2)", accent: "#34d399", dot: "#10b981", border: "rgba(16, 185, 129, 0.4)" },
  { name: "sapphire", pGlow: "rgba(59, 130, 246, 0.35)", sGlow: "rgba(147, 51, 234, 0.2)", accent: "#60a5fa", dot: "#3b82f6", border: "rgba(59, 130, 246, 0.4)" },
  { name: "amethyst", pGlow: "rgba(139, 92, 246, 0.35)", sGlow: "rgba(236, 72, 153, 0.2)", accent: "#c084fc", dot: "#a855f7", border: "rgba(139, 92, 246, 0.4)" },
  { name: "amber", pGlow: "rgba(245, 158, 11, 0.35)", sGlow: "rgba(239, 68, 68, 0.2)", accent: "#fbbf24", dot: "#f59e0b", border: "rgba(245, 158, 11, 0.4)" },
  { name: "crimson", pGlow: "rgba(244, 63, 94, 0.35)", sGlow: "rgba(168, 85, 247, 0.2)", accent: "#fb7185", dot: "#f43f5e", border: "rgba(244, 63, 94, 0.4)" }
];

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const slides = body.slides;
    const brand = body.brand || "weread.businessplan | weread.asia";
    const topic = body.topic || (slides[0] && (slides[0].title || slides[0].category)) || "Default";

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
    }

    let hash = 0;
    for (let i = 0; i < topic.length; i++) {
      hash = topic.charCodeAt(i) + ((hash << 5) - hash);
    }
    const currentTheme = THEMES[Math.abs(hash) % THEMES.length];

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

        // Dynamic Layout Scaffolding for each slide position
        let cardInnerContent = "";
        if (index === 0) {
          // Slide 1: Cover Hook Big Typography
          cardInnerContent = `
            <div class="hook-badge">TOPIC FOCUS</div>
            <h1 class="hero-title">« ${titleText} »</h1>
            <div class="swipe-indicator">អូសទៅឆ្វេងដើម្បីអានបន្ត ➔</div>
          `;
        } else if (index === 1) {
          // Slide 2: Problem Frame
          cardInnerContent = `
            <div class="section-label problem-label">⚠️ បញ្ហាប្រឈម</div>
            <div class="focus-box problem-box">
              <p class="body-text">${bodyText || titleText}</p>
            </div>
          `;
        } else if (index === 2) {
          // Slide 3: Solution Frame
          cardInnerContent = `
            <div class="section-label solution-label">💡 ដំណោះស្រាយគន្លឹះ</div>
            <div class="focus-box solution-box">
              <p class="body-text">${bodyText || titleText}</p>
            </div>
          `;
        } else if (index === 3) {
          // Slide 4: Result Frame
          cardInnerContent = `
            <div class="section-label result-label">📈 លទ្ធផលទទួលបាន</div>
            <div class="focus-box result-box">
              <p class="body-text">${bodyText || titleText}</p>
            </div>
          `;
        } else {
          // Slide 5: Call to Action (CTA)
          cardInnerContent = `
            <div class="cta-badge">ACTION PLAN</div>
            <h2 class="cta-title">${titleText}</h2>
            <div class="cta-button">${bodyText || "ចូលរួម Telegram Group ឥឡូវនេះ"}</div>
          `;
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8" />
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Kantumruy Pro', sans-serif; }
            body {
              width: 1080px; height: 1350px; background-color: #06080E;
              position: relative; display: flex; align-items: center; justify-content: center;
              padding: 70px 60px; overflow: hidden;
            }
            .glow-orb-1 {
              position: absolute; width: 750px; height: 750px; top: -150px; right: -150px;
              background: radial-gradient(circle, ${currentTheme.pGlow} 0%, rgba(6, 8, 14, 0) 70%);
              border-radius: 50%; filter: blur(60px); z-index: 0;
            }
            .glow-orb-2 {
              position: absolute; width: 650px; height: 650px; bottom: -100px; left: -100px;
              background: radial-gradient(circle, ${currentTheme.sGlow} 0%, rgba(6, 8, 14, 0) 70%);
              border-radius: 50%; filter: blur(60px); z-index: 0;
            }
            .mesh-grid {
              position: absolute; top: 0; left: 0; width: 100%; height: 100%;
              background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px),
                                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px);
              background-size: 60px 60px; z-index: 1;
            }
            .glass-card {
              position: relative; z-index: 2; width: 100%; height: 100%;
              background: linear-gradient(135deg, rgba(17, 24, 39, 0.82) 0%, rgba(10, 15, 26, 0.92) 100%);
              border: 1.5px solid rgba(255, 255, 255, 0.12); border-radius: 40px;
              box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.9);
              display: flex; flex-direction: column; justify-content: space-between; padding: 65px;
            }
            .card-header { display: flex; justify-content: space-between; align-items: center; }
            .tag-pill {
              display: inline-flex; align-items: center; gap: 12px;
              background: rgba(255, 255, 255, 0.06); border: 1px solid ${currentTheme.border};
              padding: 10px 24px; border-radius: 100px; color: ${currentTheme.accent}; font-size: 24px; font-weight: 600;
            }
            .glowing-dot { width: 12px; height: 12px; background-color: ${currentTheme.dot}; border-radius: 50%; box-shadow: 0 0 14px ${currentTheme.dot}; }
            .slide-counter { font-size: 22px; font-weight: 600; color: #64748b; letter-spacing: 2px; }

            .card-body { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; flex: 1; padding: 20px 0; }
            
            /* Specific Template Styles */
            .hero-title { font-size: 56px; line-height: 1.5; font-weight: 700; color: #ffffff; max-width: 820px; }
            .hook-badge { font-size: 20px; font-weight: 600; color: ${currentTheme.accent}; letter-spacing: 4px; margin-bottom: 25px; }
            .swipe-indicator { margin-top: 40px; font-size: 24px; color: #94a3b8; font-weight: 500; }
            
            .section-label { font-size: 32px; font-weight: 700; margin-bottom: 30px; }
            .problem-label { color: #f87171; }
            .solution-label { color: #38bdf8; }
            .result-label { color: #34d399; }

            .focus-box {
              width: 100%; max-width: 840px; padding: 50px 45px; border-radius: 28px;
              background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
            }
            .problem-box { border-left: 6px solid #ef4444; }
            .solution-box { border-left: 6px solid #0ea5e9; }
            .result-box { border-left: 6px solid #10b981; }

            .body-text { font-size: 38px; line-height: 1.65; color: #f1f5f9; font-weight: 500; }
            
            .cta-badge { font-size: 22px; letter-spacing: 4px; color: ${currentTheme.accent}; font-weight: 700; margin-bottom: 25px; }
            .cta-title { font-size: 46px; line-height: 1.5; color: #ffffff; margin-bottom: 40px; max-width: 800px; font-weight: 700; }
            .cta-button {
              padding: 22px 50px; border-radius: 100px; font-size: 30px; font-weight: 700;
              background: ${currentTheme.accent}; color: #06080E; box-shadow: 0 10px 25px ${currentTheme.pGlow};
            }

            .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 25px; }
            .footer-text { font-size: 22px; font-weight: 600; color: ${currentTheme.accent}; }
            .swipe-hint { font-size: 20px; color: #94a3b8; }
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
              ${cardInnerContent}
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