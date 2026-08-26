import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60; // អនុញ្ញាតឱ្យ run ដល់ 60s
export const dynamic = "force-dynamic";

interface SlideData {
  category?: string;
  title: string;
  body?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const { slides, brand = "WERead Asia" } = await req.json();

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: "Slides array is required" },
        { status: 400 }
      );
    }

    // កំណត់ Chromium សម្រាប់ Vercel Serverless
    const isLocal = process.env.NODE_ENV === "development";
    browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // ឬផ្លូវ Chrome លើម៉ាស៊ីន
        : await chromium.executablePath(),
      headless: chromium.headless,
    });

    const renderedImages: string[] = [];

    for (let index = 0; index < slides.length; index++) {
      const slide = slides[index] as SlideData;
      const isCover = index === 0;
      const isCTA = index === slides.length - 1;
      const categoryText = slide.category || "KNOWLEDGE INSIGHT";
      const titleText = slide.title || "";
      const bodyText = slide.body || slide.description || "";

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet">
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
            background-color: #080c14;
            background-image: 
              radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%),
              radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.1) 0px, transparent 50%);
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 80px;
            overflow: hidden;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge {
            background: rgba(14, 165, 233, 0.15);
            border: 1px solid rgba(56, 189, 248, 0.3);
            color: #38bdf8;
            padding: 10px 24px;
            border-radius: 9999px;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .slide-counter {
            font-size: 24px;
            color: #64748b;
            font-weight: 600;
          }
          .content-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            margin: 40px 0;
          }
          .cover-layout .category-label {
            color: #94a3b8;
            font-size: 32px;
            margin-bottom: 24px;
            font-weight: 600;
          }
          .cover-layout .main-title {
            font-size: 64px;
            line-height: 1.35;
            font-weight: 700;
            color: #38bdf8;
            text-shadow: 0 0 40px rgba(56, 189, 248, 0.2);
          }
          .standard-layout .main-title {
            font-size: 52px;
            line-height: 1.35;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 36px;
          }
          .standard-layout .body-box {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 44px;
            backdrop-filter: blur(12px);
          }
          .standard-layout .body-text {
            font-size: 34px;
            line-height: 1.6;
            color: #cbd5e1;
          }
          .cta-layout {
            text-align: center;
            align-items: center;
          }
          .cta-layout .main-title {
            font-size: 56px;
            line-height: 1.35;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 30px;
          }
          .cta-layout .cta-card {
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.05) 100%);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 28px;
            padding: 50px 40px;
            width: 100%;
          }
          .cta-layout .body-text {
            font-size: 34px;
            line-height: 1.6;
            color: #e0f2fe;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 36px;
          }
          .brand {
            font-size: 26px;
            color: #64748b;
            font-weight: 600;
          }
          .swipe-hint {
            font-size: 26px;
            color: #38bdf8;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="badge">${categoryText}</div>
          <div class="slide-counter">${index + 1} / ${slides.length}</div>
        </div>

        <div class="content-container ${isCover ? "cover-layout" : isCTA ? "cta-layout" : "standard-layout"}">
          ${
            isCover
              ? `<div class="category-label">${categoryText}</div>
                 <h1 class="main-title">${titleText}</h1>`
              : isCTA
              ? `<h1 class="main-title">${titleText}</h1>
                 <div class="cta-card"><p class="body-text">${bodyText}</p></div>`
              : `<h1 class="main-title">${titleText}</h1>
                 <div class="body-box"><p class="body-text">${bodyText}</p></div>`
          }
        </div>

        <div class="footer">
          <div class="brand">${brand}</div>
          <div class="swipe-hint">${isCTA ? "Follow សម្រាប់គន្លឹះថ្មីៗ" : "អូសទៅមុខ →"}</div>
        </div>
      </body>
      </html>
      `;

      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const buffer = await page.screenshot({ type: "png" });
      renderedImages.push(Buffer.from(buffer).toString("base64"));
      await page.close();
    }

    return NextResponse.json({
      success: true,
      count: renderedImages.length,
      images: renderedImages,
    });
  } catch (error: any) {
    console.error("Carousel Render Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}