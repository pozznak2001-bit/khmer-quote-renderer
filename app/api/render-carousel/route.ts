import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const THEMES = [
  { name: "dark_gold", bg: "#151515", titleColor: "#FCD34D", bodyColor: "#F3F4F6", layout: "centered" },
  { name: "navy_icon", bg: "#0D2C3E", titleColor: "#FFFFFF", bodyColor: "#E2E8F0", layout: "icon_top" },
  { name: "shadow_box", bg: "radial-gradient(circle, #27272A 0%, #09090B 100%)", titleColor: "#D4AF37", bodyColor: "#FFFFFF", layout: "box" },
  { name: "paper_highlight", bg: "#F8F9FA", titleColor: "#111827", bodyColor: "#1F2937", layout: "highlight" },
  { name: "green_frame", bg: "linear-gradient(135deg, #064E3B 0%, #022C22 100%)", titleColor: "#FFFFFF", bodyColor: "#D1FAE5", layout: "framed" }
];

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const slides = body.slides;
    const brand = body.brand || "@weread.asia";
    const topic = body.topic || (slides[0] && (slides[0].title || slides[0].category)) || "Default";

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
    }

    // Randomize Theme based on Topic Hash
    let hash = 0;
    for (let i = 0; i < topic.length; i++) { hash = topic.charCodeAt(i) + ((hash << 5) - hash); }
    const currentTheme = THEMES[Math.abs(hash) % THEMES.length];

    chromium.setGraphicsMode = false;
    browser = await puppeteer.launch({
      args: [...chromium.args, "--disable-web-security", "--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
      defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 1.5 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const renderSlide = async (slide: any, index: number) => {
      const page = await browser.newPage();
      try {
        const titleText = (slide.title || "").trim();
        const bodyText = (slide.body || slide.description || "").trim().replace(/^(បញ្ហា|ដំណោះស្រាយ|លទ្ធផល|គន្លឹះ|យុទ្ធសាស្ត្រ)\s*[៖:]\s*/i, "");
        const slideNum = index + 1;

        let contentHTML = "";
        
        if (currentTheme.layout === "box") {
          contentHTML = `
            <div class="inner-box">
              <h1 class="title">${titleText}</h1>
              ${bodyText ? `<p class="body">${bodyText}</p>` : ""}
              <div class="brand">${brand}</div>
            </div>
          `;
        } else if (currentTheme.layout === "framed") {
          contentHTML = `
            <div class="frame">
              <div class="quote-mark">❞</div>
              <h1 class="title">${titleText}</h1>
              ${bodyText ? `<p class="body">${bodyText}</p>` : ""}
              <div class="brand">${brand}</div>
            </div>
          `;
        } else if (currentTheme.layout === "icon_top") {
          contentHTML = `
            <div class="content-wrapper">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
              </svg>
              <h1 class="title">${titleText}</h1>
              ${bodyText ? `<p class="body">${bodyText}</p>` : ""}
              <div class="brand">${brand}</div>
            </div>
          `;
        } else if (currentTheme.layout === "highlight") {
          contentHTML = `
            <div class="content-wrapper">
              <h1 class="title"><span class="hl-pink">${titleText}</span></h1>
              ${bodyText ? `<p class="body"><span class="hl-yellow">${bodyText}</span></p>` : ""}
              <div class="brand" style="color: #6B7280;">ស្តាប់សៀវភៅ ${brand}</div>
            </div>
          `;
        } else {
          contentHTML = `
            <div class="content-wrapper">
              <div class="quote-mark-right">❞</div>
              <h1 class="title">${titleText}</h1>
              ${bodyText ? `<p class="body">${bodyText}</p>` : ""}
              <div class="brand" style="text-align: left; align-self: flex-start; margin-top: auto;">${brand}</div>
            </div>
          `;
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@500;600;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Kantumruy Pro', sans-serif; }
            body {
              width: 1080px; height: 1080px;
              background: ${currentTheme.bg};
              display: flex; justify-content: center; align-items: center;
              padding: 80px; position: relative; overflow: hidden;
            }
            .counter { position: absolute; top: 50px; right: 50px; font-size: 20px; font-weight: 600; color: rgba(255,255,255,0.4); }
            
            .title { font-size: 60px; line-height: 1.5; font-weight: 700; color: ${currentTheme.titleColor}; margin-bottom: 30px; text-align: center; max-width: 900px;}
            .body { font-size: 44px; line-height: 1.6; font-weight: 500; color: ${currentTheme.bodyColor}; text-align: center; max-width: 900px;}
            .brand { font-size: 24px; font-weight: 500; color: rgba(255,255,255,0.7); margin-top: 60px; text-align: center; letter-spacing: 1px;}
            
            .content-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; }
            
            .inner-box {
              background: #18181B; width: 850px; height: 850px; border-radius: 20px;
              display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            }

            .frame {
              width: 940px; height: 940px; border: 3px solid rgba(255,255,255,0.8);
              display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; position: relative;
            }

            .icon { width: 120px; height: 120px; color: #FFFFFF; margin-bottom: 40px; opacity: 0.9; }

            .hl-pink { background: #F9A8D4; padding: 8px 20px; border-radius: 8px; line-height: 1.8; display: inline-block; transform: rotate(-1deg); }
            .hl-yellow { background: #FDE047; padding: 8px 20px; border-radius: 8px; line-height: 1.8; display: inline-block; transform: rotate(1deg); color: #111;}
            
            .quote-mark { font-size: 80px; color: ${currentTheme.titleColor}; margin-bottom: 20px; line-height: 1; }
            .quote-mark-right { align-self: flex-end; font-size: 100px; color: ${currentTheme.titleColor}; opacity: 0.8; margin-bottom: -40px; line-height: 1;}
          </style>
        </head>
        <body>
          <div class="counter">${slideNum} / ${slides.length}</div>
          ${contentHTML}
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        await page.evaluateHandle("document.fonts.ready");
        const buffer = await page.screenshot({ type: "jpeg", quality: 95 });
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