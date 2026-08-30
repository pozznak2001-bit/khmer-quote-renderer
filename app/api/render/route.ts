import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bgUrl, quote, brand = "@weread.businessplan | weread.asia", row = 0 } = body;

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

    // ២. កំណត់ Theme ទាំង ៦ (ផ្គូផ្គង Layout និង ពណ៌តាម Row)
    const rowNumber = parseInt(row) || 0;
    const themeIndex = rowNumber % 6;
    
    const THEMES = [
      // Theme 0: មាស (Gold) + Template 1 (Centered)
      { id: 1, primary: "#f59e0b", gradient: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)", glow: "rgba(245, 158, 11, 0.45)" },
      // Theme 1: ទឹកប៊ិច (Cyan) + Template 2 (Editorial Magazine)
      { id: 2, primary: "#06b6d4", gradient: "linear-gradient(135deg, #67e8f9 0%, #06b6d4 50%, #0891b2 100%)", glow: "rgba(6, 182, 212, 0.45)" },
      // Theme 2: ផ្កាឈូក (Pink) + Template 3 (Glassmorphism Card)
      { id: 3, primary: "#ec4899", gradient: "linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #be185d 100%)", glow: "rgba(236, 72, 153, 0.45)" },
      // Theme 3: ស្វាយ (Purple) + Template 4 (Modern Box Frame) - ថ្មី
      { id: 4, primary: "#a78bfa", gradient: "linear-gradient(135deg, #d8b4fe 0%, #a78bfa 50%, #7c3aed 100%)", glow: "rgba(167, 139, 250, 0.45)" },
      // Theme 4: បៃតង (Emerald) + Template 5 (Elegant Split Line) - ថ្មី
      { id: 5, primary: "#10b981", gradient: "linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #059669 100%)", glow: "rgba(16, 185, 129, 0.45)" },
      // Theme 5: ក្រហម (Ruby) + Template 6 (Bold Quote Marks) - ថ្មី
      { id: 6, primary: "#f43f5e", gradient: "linear-gradient(135deg, #fecdd3 0%, #f43f5e 50%, #be123c 100%)", glow: "rgba(244, 63, 94, 0.45)" }
    ];

    const currentTheme = THEMES[themeIndex];

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

    // ៣. រៀបចំ Template Layout ទាំង ៦
    let templateHTML = "";

    if (currentTheme.id === 1) {
      // Template 1: Premium Minimalist (Centered)
      templateHTML = `
        <div class="t1-wrapper">
          <div class="t1-badge">ផែនការអាជីវកម្ម</div>
          <div class="t1-quote">${formattedQuote}</div>
          <div class="t1-footer">${brand}</div>
        </div>
      `;
    } else if (currentTheme.id === 2) {
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
    } else if (currentTheme.id === 3) {
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
    } else if (currentTheme.id === 4) {
      // Template 4: Modern Box Frame (New)
      templateHTML = `
        <div class="t4-wrapper">
          <div class="t4-box">
            <div class="t4-quote">${formattedQuote.replace(/«|»/g, '')}</div>
          </div>
          <div class="t4-footer">${brand}</div>
        </div>
      `;
    } else if (currentTheme.id === 5) {
      // Template 5: Elegant Split Line (New)
      templateHTML = `
        <div class="t5-wrapper">
          <div class="t5-line top"></div>
          <div class="t5-quote">${formattedQuote}</div>
          <div class="t5-line bottom"></div>
          <div class="t5-footer">${brand}</div>
        </div>
      `;
    } else if (currentTheme.id === 6) {
      // Template 6: Bold Quote Marks Background (New)
      templateHTML = `
        <div class="t6-wrapper">
          <div class="t6-bg-mark">”</div>
          <div class="t6-content">
            <div class="t6-quote">${formattedQuote.replace(/«|»/g, '')}</div>
            <div class="t6-footer">${brand}</div>
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
            /* កាត់បន្ថយភាពងងឹត (0.4 ទៅ 0.75) ដើម្បីឱ្យ Background ភ្លឺជាងមុន */
            .overlay {
              position: absolute; top: 0; left: 0; width: 100%; height: 100%;
              background: radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(8, 12, 22, 0.75) 100%);
              backdrop-filter: blur(4px); z-index: 2;
            }

            .highlight {
              font-size: 1.15em; font-weight: 800;
              background: ${currentTheme.gradient};
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              display: inline-block; padding: 0 4px;
              filter: drop-shadow(0 4px 15px ${currentTheme.glow});
            }

            /* T1: Centered */
            .t1-wrapper { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 120px 70px 100px 70px; }
            .t1-badge { padding: 14px 36px; background: rgba(255, 255, 255, 0.1); border: 1.5px solid ${currentTheme.primary}55; border-radius: 50px; font-size: 28px; font-weight: 700; color: ${currentTheme.primary}; letter-spacing: 2px; box-shadow: 0 0 25px ${currentTheme.glow}; }
            .t1-quote { text-align: center; font-size: 64px; line-height: 1.6; font-weight: 700; color: #f8fafc; text-shadow: 0 4px 30px rgba(0,0,0,0.9); width: 95%; }
            .t1-footer { padding: 14px 36px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 30px; font-size: 26px; font-weight: 600; color: #cbd5e1; letter-spacing: 1.5px; backdrop-filter: blur(8px); }

            /* T2: Editorial Left */
            .t2-wrapper { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 120px 90px 100px 90px; }
            .t2-top { display: flex; justify-content: space-between; align-items: flex-end; }
            .t2-category { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: ${currentTheme.primary}; }
            .t2-quote-mark { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 180px; line-height: 0.6; color: ${currentTheme.primary}44; }
            .t2-content-box { border-left: 10px solid ${currentTheme.primary}; padding-left: 50px; margin: 20px 0; }
            .t2-quote { font-size: 66px; line-height: 1.6; font-weight: 700; color: #f8fafc; text-align: left; text-shadow: 0 4px 25px rgba(0,0,0,0.8); }
            .t2-footer { display: flex; align-items: center; gap: 20px; }
            .t2-brand-line { width: 70px; height: 5px; background: ${currentTheme.primary}; border-radius: 3px;}
            .t2-brand-text { font-size: 28px; font-weight: 600; color: #e2e8f0; letter-spacing: 1.5px; }

            /* T3: Glass Card */
            .t3-wrapper { position: relative; z-index: 3; height: 100%; display: flex; align-items: center; justify-content: center; padding: 70px; }
            .t3-card { width: 100%; background: rgba(15, 23, 42, 0.65); border: 1.5px solid rgba(255, 255, 255, 0.2); border-radius: 40px; padding: 90px 70px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 950px; backdrop-filter: blur(25px); box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8); }
            .t3-header { display: flex; align-items: center; gap: 16px; }
            .t3-dot { width: 18px; height: 18px; border-radius: 50%; background: ${currentTheme.primary}; box-shadow: 0 0 20px ${currentTheme.primary}; }
            .t3-title { font-size: 30px; font-weight: 700; color: #e2e8f0; letter-spacing: 2px; }
            .t3-quote { text-align: center; font-size: 62px; line-height: 1.65; font-weight: 700; color: #ffffff; text-shadow: 0 4px 15px rgba(0,0,0,0.6); }
            .t3-footer { font-size: 28px; font-weight: 600; color: ${currentTheme.primary}; letter-spacing: 1.5px; }

            /* T4: Modern Box Frame */
            .t4-wrapper { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px; gap: 60px; }
            .t4-box { border: 4px solid ${currentTheme.primary}; padding: 100px 70px; position: relative; background: rgba(0,0,0,0.3); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
            .t4-box::before { content: "“"; position: absolute; top: -70px; left: 40px; font-size: 150px; color: ${currentTheme.primary}; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; }
            .t4-quote { text-align: left; font-size: 64px; line-height: 1.6; font-weight: 700; color: #ffffff; }
            .t4-footer { font-size: 28px; font-weight: 600; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; }

            /* T5: Elegant Split Line */
            .t5-wrapper { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 80px; }
            .t5-line { width: 150px; height: 4px; background: ${currentTheme.primary}; margin: 50px 0; border-radius: 2px; box-shadow: 0 0 15px ${currentTheme.glow}; }
            .t5-quote { text-align: center; font-size: 68px; line-height: 1.55; font-weight: 700; color: #f8fafc; }
            .t5-footer { margin-top: auto; font-size: 28px; font-weight: 600; color: #e2e8f0; letter-spacing: 2px; }

            /* T6: Bold Quote Marks Background */
            .t6-wrapper { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 100px 90px; }
            .t6-bg-mark { position: absolute; top: 15%; right: 5%; font-size: 400px; color: rgba(255,255,255,0.06); font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; pointer-events: none; }
            .t6-content { position: relative; z-index: 4; display: flex; flex-direction: column; gap: 80px; border-left: 6px solid ${currentTheme.primary}; padding-left: 50px; }
            .t6-quote { font-size: 66px; line-height: 1.6; font-weight: 700; color: #ffffff; text-align: left; }
            .t6-footer { font-size: 28px; font-weight: 700; color: ${currentTheme.primary}; letter-spacing: 2px; }
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