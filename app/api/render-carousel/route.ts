import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// តារាង Style ទាំង ៦ តាមលំដាប់លំដោយ
const THEMES = [
  { name: "shadow_box" },      // 1. ប្រអប់ខ្មៅមានស្រមោល (រូបទី១)
  { name: "paper_highlight" }, // 2. ផ្ទៃស មាន Highlight ផ្កាឈូក/លឿង (រូបទី២)
  { name: "glass_box" },       // 3. ប្រអប់ថ្លា (Glassmorphism) (រូបទី៣)
  { name: "green_frame" },     // 4. ផ្ទៃបៃតង មានស៊ុមស (រូបទី៤)
  { name: "dark_gold" },       // 5. ផ្ទៃខ្មៅ អក្សរមាសសាមញ្ញ (រូបទី៥)
  { name: "inverse_block" }    // 6. ផ្ទៃស អក្សរខ្មៅ មានប្រអប់អក្សរមាស (រូបទី៦)
];

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const slides = body.slides;
    const brand = body.brand || "@weread.asia";
    
    // ចាប់យកលេខរៀង Row Number ពី Google Sheets ដើម្បីវិលជុំ Style ទាំង ៦
    const rowNumber = parseInt(body.row) || Math.floor(Math.random() * 6);
    const currentTheme = THEMES[rowNumber % 6];

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
    }

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
        let cssStyles = "";

        if (currentTheme.name === "shadow_box") {
          cssStyles = `
            body { background: #383838; display: flex; justify-content: center; align-items: center; }
            .inner-box { background: #1C1C1C; width: 850px; height: 850px; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
            .title { font-size: 58px; color: #D4AF37; margin-bottom: 25px; text-align: center; }
            .body { font-size: 42px; color: #FFFFFF; text-align: center; }
            .brand { color: #FFFFFF; font-size: 24px; margin-top: 40px; }
          `;
          contentHTML = `<div class="inner-box"><h1 class="title">${titleText}</h1>${bodyText ? `<p class="body">${bodyText}</p>` : ""}<div class="brand">${brand}</div></div>`;
        
        } else if (currentTheme.name === "paper_highlight") {
          cssStyles = `
            body { background: #F4F4F5; display: flex; justify-content: center; align-items: center; }
            .content-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .hl-pink { background: #FF9BE6; color: #111; padding: 12px 30px; border-radius: 8px; display: inline-block; transform: rotate(-2deg); margin-bottom: 30px; font-size: 58px; font-weight: 700; line-height: 1.5; }
            .hl-yellow { background: #FFF066; color: #111; padding: 12px 30px; border-radius: 8px; display: inline-block; transform: rotate(1deg); font-size: 44px; font-weight: 600; line-height: 1.5;}
            .brand { color: #333; font-size: 24px; margin-top: 60px; font-weight: 600; }
          `;
          contentHTML = `<div class="content-wrapper">${titleText ? `<div class="hl-pink">${titleText}</div>` : ""}${bodyText ? `<div class="hl-yellow">${bodyText}</div>` : ""}<div class="brand">${brand}</div></div>`;
        
        } else if (currentTheme.name === "glass_box") {
          cssStyles = `
            body { background: linear-gradient(135deg, #4b4b4b, #222222); display: flex; justify-content: center; align-items: center; }
            .glass { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px); width: 880px; height: 600px; border: 2px solid rgba(255,255,255,0.2); border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 50px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
            .title { font-size: 58px; color: #FFFFFF; margin-bottom: 25px; text-align: center; }
            .body { font-size: 42px; color: #FFFFFF; text-align: center; }
            .brand { color: rgba(255,255,255,0.8); font-size: 24px; margin-top: 40px; }
          `;
          contentHTML = `<div class="glass"><h1 class="title">${titleText}</h1>${bodyText ? `<p class="body">${bodyText}</p>` : ""}<div class="brand">${brand}</div></div>`;
        
        } else if (currentTheme.name === "green_frame") {
          cssStyles = `
            body { background: #14301C; display: flex; justify-content: center; align-items: center; padding: 60px; }
            .frame { border: 2px solid #FFFFFF; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 50px; position: relative; }
            .quote-icon { font-size: 80px; color: #FFFFFF; margin-bottom: 20px; line-height: 1; }
            .title { font-size: 58px; color: #FFFFFF; margin-bottom: 25px; text-align: center; }
            .body { font-size: 42px; color: #FFFFFF; text-align: center; }
            .brand { color: #FFFFFF; font-size: 24px; position: absolute; bottom: 40px; }
          `;
          contentHTML = `<div class="frame"><div class="quote-icon">❞</div><h1 class="title">${titleText}</h1>${bodyText ? `<p class="body">${bodyText}</p>` : ""}<div class="brand">${brand}</div></div>`;
        
        } else if (currentTheme.name === "dark_gold") {
          cssStyles = `
            body { background: #111111; display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 100px; }
            .title { font-size: 64px; color: #EAB308; margin-bottom: 40px; text-align: center; }
            .body { font-size: 46px; color: #FFFFFF; text-align: center; }
            .brand { color: #FFFFFF; font-size: 24px; margin-top: 60px; align-self: flex-end; }
          `;
          contentHTML = `<h1 class="title">${titleText}</h1>${bodyText ? `<p class="body">${bodyText}</p>` : ""}<div class="brand">${brand}</div>`;
        
        } else if (currentTheme.name === "inverse_block") {
          cssStyles = `
            body { background: #FAFAFA; display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 80px; }
            .content-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .title { font-size: 60px; color: #111111; margin-bottom: 30px; text-align: center; font-weight: 700; }
            .block-body { background: #111111; color: #EAB308; padding: 15px 30px; font-size: 46px; text-align: center; font-weight: 600; display: inline-block; }
            .brand { color: #111111; font-size: 24px; margin-top: 60px; font-weight: 600;}
          `;
          contentHTML = `<div class="content-wrapper"><h1 class="title">${titleText}</h1>${bodyText ? `<div class="block-body">${bodyText}</div>` : ""}<div class="brand">${brand}</div></div>`;
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@500;600;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Kantumruy Pro', sans-serif; }
            body { width: 1080px; height: 1080px; overflow: hidden; position: relative; }
            .counter { position: absolute; top: 40px; right: 50px; font-size: 22px; font-weight: 600; color: #888; z-index: 10; }
            ${cssStyles}
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