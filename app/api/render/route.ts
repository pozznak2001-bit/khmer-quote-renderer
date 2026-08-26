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
              background-color: #0f172a;
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
              background: linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.88) 100%);
              backdrop-filter: blur(1.5px);
              z-index: 2;
            }
            .header {
              position: relative;
              z-index: 3;
              margin-top: 100px;
              font-size: 32px;
              font-weight: 700;
              color: #f59e0b;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .quote-container {
              position: relative;
              z-index: 3;
              width: 84%;
              text-align: center;
              font-size: 52px;
              line-height: 1.7;
              font-weight: 700;
              color: #ffffff;
              text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
            }
            .footer {
              position: relative;
              z-index: 3;
              margin-bottom: 80px;
              font-size: 24px;
              font-weight: 600;
              color: #94a3b8;
              letter-spacing: 1px;
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