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

    // បម្លែងពាក្យសំខាន់ៗ
    const formattedQuote = quote
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')
      .replace(/«\s*(.*?)\s*»/g, '« <span class="quote-body">$1</span> »');

    // បង្កើតបញ្ជីពណ៌ Highlight (Random Colors)
    const gradients = [
      { text: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)", shadow: "rgba(245, 158, 11, 0.45)" }, // មាស (Gold)
      { text: "linear-gradient(135deg, #67e8f9 0%, #06b6d4 50%, #0891b2 100%)", shadow: "rgba(6, 182, 212, 0.45)" }, // ខៀវស្រាល (Cyan)
      { text: "linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #be185d 100%)", shadow: "rgba(236, 72, 153, 0.45)" }, // ផ្កាឈូក (Pink)
      { text: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #6d28d9 100%)", shadow: "rgba(139, 92, 246, 0.45)" }, // ស្វាយ (Purple)
      { text: "linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #047857 100%)", shadow: "rgba(16, 185, 129, 0.45)" }  // បៃតង (Emerald)
    ];
    // ចាប់យកពណ៌មួយដោយចៃដន្យ
    const randomStyle = gradients[Math.floor(Math.random() * gradients.length)];

    const isLocal = process.env.NODE_ENV === "development";
    const executablePath = isLocal
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
        );

    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: { width: 1080, height: 1350, deviceScaleFactor: 2 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: 1080px;
              height: 1350px;
              position: relative;
              display: flex; flex-direction: column; justify-content: space-between; align-items: center;
              font-family: 'Kantumruy Pro', sans-serif; background-color: #0b0f19; overflow: hidden;
            }
            .bg-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; transform: scale(1.03); }
            .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(15, 23, 42, 0.65) 0%, rgba(10, 15, 29, 0.92) 100%); backdrop-filter: blur(2px); z-index: 2; }
            .badge { position: relative; z-index: 3; margin-top: 90px; padding: 10px 28px; background: rgba(255, 255, 255, 0.1); border: 1.5px solid rgba(255, 255, 255, 0.2); border-radius: 50px; font-size: 26px; font-weight: 700; color: #f8fafc; letter-spacing: 2px; box-shadow: 0 0 20px rgba(0,0,0,0.3); }
            .quote-container { position: relative; z-index: 3; width: 86%; text-align: center; font-size: 50px; line-height: 1.75; font-weight: 600; color: #f8fafc; text-shadow: 0 4px 30px rgba(0, 0, 0, 0.9); padding: 20px; }
            
            /* CSS សម្រាប់ពណ៌ដែលលោត Random */
            .highlight {
              font-size: 62px;
              font-weight: 800;
              background: ${randomStyle.text};
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              display: inline-block;
              padding: 0 4px;
              filter: drop-shadow(0 4px 15px ${randomStyle.shadow});
            }
            
            .footer-card { position: relative; z-index: 3; margin-bottom: 75px; padding: 12px 32px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 30px; font-size: 22px; font-weight: 600; color: #cbd5e1; letter-spacing: 1.5px; backdrop-filter: blur(8px); }
          </style>
        </head>
        <body>
          ${bgUrl ? `<img class="bg-img" src="${bgUrl}" />` : ""}
          <div class="overlay"></div>
          <div class="badge">ផែនការអាជីវកម្ម</div>
          <div class="quote-container">${formattedQuote}</div>
          <div class="footer-card">${brand}</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const screenshotBuffer = await page.screenshot({ type: "png" });
    await browser.close();

    return new Response(screenshotBuffer as any, { status: 200, headers: { "Content-Type": "image/png" } });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}