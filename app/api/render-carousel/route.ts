import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface SlideData {
  index: number;
  topic?: string;
  title?: string;
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      topic = "WERead Business Insight",
      slides, 
      brand = "@weread.businessplan | weread.asia" 
    } = body;

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
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

    const renderedImages: string[] = [];

    for (const slide of slides as SlideData[]) {
      const page = await browser.newPage();
      const isCover = slide.index === 1;
      const isCTA = slide.index === slides.length;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                width: 1080px;
                height: 1350px;
                font-family: 'Kantumruy Pro', sans-serif;
                background-color: #0b0f19;
                color: #ffffff;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 100px 90px 90px 90px;
                position: relative;
                overflow: hidden;
              }
              .glow-bg {
                position: absolute;
                top: -150px;
                right: -150px;
                width: 650px;
                height: 650px;
                background: radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(11, 15, 25, 0) 70%);
                z-index: 1;
              }
              .glow-bg-2 {
                position: absolute;
                bottom: -150px;
                left: -150px;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(11, 15, 25, 0) 70%);
                z-index: 1;
              }
              .content-wrapper {
                position: relative;
                z-index: 2;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .badge {
                padding: 12px 28px;
                background: rgba(6, 182, 212, 0.1);
                border: 1.5px solid rgba(6, 182, 212, 0.4);
                border-radius: 40px;
                font-size: 24px;
                font-weight: 700;
                color: #38bdf8;
                letter-spacing: 1px;
              }
              .page-num {
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 32px;
                font-weight: 800;
                color: #64748b;
                background: rgba(255, 255, 255, 0.05);
                padding: 6px 20px;
                border-radius: 20px;
              }
              .main-box {
                margin: auto 0;
                display: flex;
                flex-direction: column;
                gap: 30px;
              }
              .topic-label {
                font-size: 26px;
                font-weight: 600;
                color: #94a3b8;
                text-transform: uppercase;
              }
              .slide-title {
                font-size: ${isCover ? "66px" : "52px"};
                font-weight: 800;
                line-height: 1.45;
                color: ${isCover ? "#38bdf8" : "#f8fafc"};
              }
              .slide-body {
                font-size: ${isCover ? "36px" : "42px"};
                line-height: 1.7;
                font-weight: 500;
                color: #cbd5e1;
                background: ${!isCover ? "rgba(255, 255, 255, 0.03)" : "transparent"};
                padding: ${!isCover ? "40px" : "0px"};
                border-radius: 24px;
                border: ${!isCover ? "1px solid rgba(255, 255, 255, 0.07)" : "none"};
              }
              .footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid rgba(255, 255, 255, 0.12);
                padding-top: 35px;
              }
              .brand {
                font-size: 24px;
                font-weight: 600;
                color: #94a3b8;
              }
              .swipe-hint {
                font-size: 24px;
                font-weight: 700;
                color: #38bdf8;
              }
            </style>
          </head>
          <body>
            <div class="glow-bg"></div>
            <div class="glow-bg-2"></div>
            <div class="content-wrapper">
              <div class="header">
                <div class="badge">${isCTA ? "ACTION PLAN" : "KNOWLEDGE INSIGHT"}</div>
                <div class="page-num">${slide.index} / ${slides.length}</div>
              </div>
              <div class="main-box">
                <div class="topic-label">${topic}</div>
                ${slide.title ? `<div class="slide-title">${slide.title}</div>` : ""}
                <div class="slide-body">${slide.text}</div>
              </div>
              <div class="footer">
                <div class="brand">${brand}</div>
                <div class="swipe-hint">${!isCTA ? "អូសទៅមុខទៀត ➔" : "WERead Asia"}</div>
              </div>
            </div>
          </body>
        </html>
      `;

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const buffer = await page.screenshot({ type: "png" });
      renderedImages.push(buffer.toString("base64"));
      await page.close();
    }

    await browser.close();

    return NextResponse.json({ 
      success: true, 
      count: renderedImages.length,
      images: renderedImages 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Carousel Render Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}