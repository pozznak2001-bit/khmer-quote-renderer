import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bgUrl, quote, brand = "@weread.businessplan | weread.asia" } = body;

    if (!quote) {
      return NextResponse.json({ error: "Quote is required" }, { status: 400 });
    }

    // ១. បម្លែងពាក្យ Highlight ក្នុង **...** និងរៀបចំសញ្ញាសម្រង់
    let formattedQuote = quote
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')
      .replace(/«\s*(.*?)\s*»/g, '« <span class="quote-body">$1</span> »');

    // បន្ថែមសញ្ញា « » ស្វ័យប្រវត្តិ ប្រសិនបើអត់មាន
    if (!formattedQuote.includes('«') && !formattedQuote.includes('“')) {
        formattedQuote = '« ' + formattedQuote + ' »';
    }

    // ២. បញ្ជីពណ៌ Highlight ចម្រុះ (Premium Color Palettes)
    const colorThemes = [
      { primary: "#f59e0b", gradient: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)", glow: "rgba(245, 158, 11, 0.45)" }, // មាស (Gold)
      { primary: "#06b6d4", gradient: "linear-gradient(135deg, #67e8f9 0%, #06b6d4 50%, #0891b2 100%)", glow: "rgba(6, 182, 212, 0.45)" }, // ទឹកប៊ិច (Cyan)
      { primary: "#ec4899", gradient: "linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #be185d 100%)", glow: "rgba(236, 72, 153, 0.45)" }, // ផ្កាឈូក (Pink)
      { primary: "#a78bfa", gradient: "linear-gradient(135deg, #d8b4fe 0%, #a78bfa 50%, #7c3aed 100%)", glow: "rgba(167, 139, 250, 0.45)" }, // ស្វាយ (Purple)
      { primary: "#10b981", gradient: "linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #059669 100%)", glow: "rgba(16, 185, 129, 0.45)" }  // បៃតង (Emerald)
    ];

    const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
    const templateIndex = Math.floor(Math.random() * 3) + 1; // ចាប់ Random យកលេខ 1, 2, ឬ 3

    const isLocal = process.env.NODE_ENV === "development";
    const executablePath = isLocal
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar");

    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: { width: 1080, height: 1350, deviceScaleFactor: 2 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // ៣. រៀបចំ Template Layout ទាំង ៣
    let templateHTML = "";

    if (templateIndex === 1) {
      // Template 1: Premium Minimalist (Centered)
      templateHTML = `
        <div class="t1-wrapper">
          <div class="t1-badge">ផែនការអាជីវកម្ម</div>
          <div class="t1-quote">${formattedQuote}</div>
          <div class="t1-footer">${brand}</div>
        </div>
      `;
    } else if (templateIndex === 2) {
      // Template 2: Editorial Magazine (Left-Aligned)
      templateHTML = `
        <div class="t2-wrapper">
          <div class="t2-top">
            <div class="t2-category">BUSINESS INSIGHT</div>
            <div class="t2-quote-mark">“</div>
          </div>
          <div class="t2-content-box">
            <div class="t2-quote">${formattedQuote.replace(/«|»/g, '')}</div>
          </div>
          <div class="t2-footer">
            <div class="t2-brand-line"></div>
            <div class="t2-brand-text">${brand}</div>
          </div>
        </div>
      `;
    } else {
      // Template 3: Glassmorphism Card
      templateHTML = `
        <div class="t3-wrapper">
          <div class="t3-card">
            <div class="t3-header">
              <span class="t3-dot"></span>
              <span class="t3-title">ផែនការអាជីវកម្ម</span>
            </div>
            <div class="t3-quote">${formattedQuote}</div>
            <div class="t3-footer">${brand}</div>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: 1080px; height: 1350px; position: relative;
              font-family: 'Kantumruy Pro', sans-serif;
              background-color: #0f172a; overflow: hidden;
            }
            .bg-img {
              position: absolute; top: 0; left: 0; width: 100%; height: 100%;
              object-fit: cover; z-index: 1; transform: scale(1.05);
            }
            .overlay {
              position: absolute; top: 0; left: 0; width: 100%; height: 100%;
              background: radial-gradient(circle at center, rgba(15, 23, 42, 0.7) 0%, rgba(8, 12, 22, 0.95) 100%);
              backdrop-filter: blur(4px); z-index: 2;
            }

            .highlight {
              font-size: 1.15em; font-weight: 800;
              background: ${theme.gradient};
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              display: inline-block; padding: 0 4px;
              filter: drop-shadow(0 4px 15px ${theme.glow});
            }

            /* T1: Centered */
            .t1-wrapper { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 100px 70px 80px 70px; }
            .t1-badge { padding: 12px 32px; background: rgba(255, 255, 255, 0.08); border: 1.5px solid ${theme.primary}55; border-radius: 50px; font-size: 26px; font-weight: 700; color: ${theme.primary}; letter-spacing: 2px; box-shadow: 0 0 25px ${theme.glow}; }
            .t1-quote { text-align: center; font-size: 52px; line-height: 1.7; font-weight: 600; color: #f8fafc; text-shadow: 0 4px 30px rgba(0,0,0,0.9); width: 90%; }
            .t1-footer { padding: 12px 32px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 30px; font-size: 24px; font-weight: 600; color: #cbd5e1; letter-spacing: 1.5px; backdrop-filter: blur(8px); }

            /* T2: Editorial Left */
            .t2-wrapper { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 110px 90px 100px 90px; }
            .t2-top { display: flex; justify-content: space-between; align-items: flex-end; }
            .t2-category { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 4px; color: ${theme.primary}; }
            .t2-quote-mark { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 160px; line-height: 0.6; color: ${theme.primary}44; }
            .t2-content-box { border-left: 8px solid ${theme.primary}; padding-left: 45px; margin: 20px 0; }
            .t2-quote { font-size: 54px; line-height: 1.65; font-weight: 600; color: #f8fafc; text-align: left; text-shadow: 0 4px 25px rgba(0,0,0,0.8); }
            .t2-footer { display: flex; align-items: center; gap: 20px; }
            .t2-brand-line { width: 60px; height: 4px; background: ${theme.primary}; border-radius: 2px;}
            .t2-brand-text { font-size: 26px; font-weight: 600; color: #94a3b8; letter-spacing: 1.5px; }

            /* T3: Glass Card */
            .t3-wrapper { position: relative; z-index: 3; height: 100%; display: flex; align-items: center; justify-content: center; padding: 70px; }
            .t3-card { width: 100%; background: rgba(15, 23, 42, 0.6); border: 1.5px solid rgba(255, 255, 255, 0.15); border-radius: 40px; padding: 80px 60px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 900px; backdrop-filter: blur(25px); box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8); }
            .t3-header { display: flex; align-items: center; gap: 14px; }
            .t3-dot { width: 16px; height: 16px; border-radius: 50%; background: ${theme.primary}; box-shadow: 0 0 15px ${theme.primary}; }
            .t3-title { font-size: 28px; font-weight: 700; color: #e2e8f0; letter-spacing: 2px; }
            .t3-quote { text-align: center; font-size: 50px; line-height: 1.7; font-weight: 600; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
            .t3-footer { font-size: 24px; font-weight: 600; color: ${theme.primary}; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          ${bgUrl ? `<img class="bg-img" src="${bgUrl}" />` : ""}
          <div class="overlay"></div>
          ${templateHTML}
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const screenshotBuffer = await page.screenshot({ type: "png" });
    await browser.close();

    return new Response(screenshotBuffer as any, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}