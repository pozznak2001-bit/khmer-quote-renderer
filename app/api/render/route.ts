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
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: 1080px;
              height: 1350px;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              font-family: 'Kantumruy Pro', sans-serif;
              background-color: #f1f5f9;
              overflow: hidden;
            }
            .bg-img {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
              z-index: 1;
            }
            .overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(255, 255, 255, 0.45);
              backdrop-filter: blur(2px);
              z-index: 2;
            }
            .header {
              position: relative;
              z-index: 3;
              margin-top: 100px;
              font-size: 32px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 2px;
            }
            .quote-container {
              position: relative;
              z-index: 3;
              width: 82%;
              text-align: center;
              font-size: 54px;
              line-height: 1.6;
              font-weight: 700;
              color: #0f172a;
              text-shadow: 0 2px 10px rgba(255, 255, 255, 0.8);
            }
            .footer {
              position: relative;
              z-index: 3;
              margin-bottom: 80px;
              font-size: 24px;
              font-weight: 600;
              color: #334155;
            }
          </style>
        </head>
        <body>
          ${bgUrl ? `<img class="bg-img" src="${bgUrl}" />` : ""}
          <div class="overlay"></div>
          <div class="header">ផែនការអាជីវកម្ម</div>
          <div class="quote-container">${quote}</div>
          <div class="footer">${brand}</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const screenshotBuffer = await page.screenshot({ type: "png" });
    await browser.close();

    return new Response(screenshotBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}