import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const slides = body.slides;
    const brand = body.brand || "ស្ដាប់សៀវភៅ @weread.asia";

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
    }

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
        const titleText = (slide.title || "").trim();
        const bodyText = (slide.body || slide.description || "").trim().replace(/^(បញ្ហា|ដំណោះស្រាយ|លទ្ធផល|គន្លឹះ|យុទ្ធសាស្ត្រ)\s*[៖:]\s*/i, "");

        let innerHtml = "";

        if (index === 0) {
          // Slide 1: Minimalist Cover Hook (Golden Highlight + White Accent)
          innerHtml = `
            <div class="content-wrapper">
              <h1 class="minimal-cover-title">${titleText}</h1>
            </div>
          `;
        } else {
          // Slide 2-5: Minimal Clean Content (Gold Header + Clear White Body)
          innerHtml = `
            <div class="content-wrapper">
              ${titleText ? `<h2 class="minimal-section-title">${titleText}</h2>` : ""}
              ${bodyText ? `<p class="minimal-body-text">${bodyText}</p>` : ""}
            </div>
          `;
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: 'Kantumruy Pro', sans-serif;
            }
            body {
              width: 1080px;
              height: 1350px;
              background-color: #121212;
              color: #ffffff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 100px 90px;
              overflow: hidden;
            }

            .header-bar {
              display: flex;
              justify-content: flex-end;
              align-items: center;
            }
            .counter {
              font-size: 24px;
              font-weight: 600;
              color: #71717a;
              letter-spacing: 1px;
            }

            .content-wrapper {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              padding: 40px 20px;
            }

            .minimal-cover-title {
              font-size: 64px;
              line-height: 1.6;
              font-weight: 700;
              color: #fbbf24; /* Warm Gold */
              max-width: 900px;
            }

            .minimal-section-title {
              font-size: 52px;
              line-height: 1.5;
              font-weight: 700;
              color: #fbbf24;
              margin-bottom: 35px;
              max-width: 880px;
            }

            .minimal-body-text {
              font-size: 44px;
              line-height: 1.7;
              font-weight: 500;
              color: #f4f4f5;
              max-width: 880px;
            }

            .footer-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 30px;
            }
            .brand-name {
              font-size: 26px;
              font-weight: 600;
              color: #a1a1aa;
            }
            .swipe-hint {
              font-size: 24px;
              font-weight: 500;
              color: #71717a;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div class="counter">${index + 1} / ${slides.length}</div>
          </div>

          ${innerHtml}

          <div class="footer-bar">
            <div class="brand-name">${brand}</div>
            <div class="swipe-hint">${index === slides.length - 1 ? "" : "អូសទៅឆ្វេង ➔"}</div>
          </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
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