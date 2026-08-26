import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const THEMES = [
  {
    name: "Cyber Cyan",
    bg: "#090d16",
    bgGrad: "radial-gradient(circle at 15% 15%, rgba(14, 165, 233, 0.18) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.12) 0%, transparent 50%)",
    accent: "#38bdf8",
    accentGlow: "rgba(56, 189, 248, 0.35)",
    badgeBg: "rgba(14, 165, 233, 0.12)",
    badgeBorder: "rgba(56, 189, 248, 0.3)",
    cardBg: "rgba(15, 23, 42, 0.75)",
    cardBorder: "rgba(56, 189, 248, 0.18)",
    highlightColor: "#7dd3fc"
  },
  {
    name: "Emerald Growth",
    bg: "#061311",
    bgGrad: "radial-gradient(circle at 20% 10%, rgba(16, 185, 129, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgba(5, 150, 105, 0.12) 0%, transparent 50%)",
    accent: "#34d399",
    accentGlow: "rgba(52, 211, 153, 0.35)",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    badgeBorder: "rgba(52, 211, 153, 0.3)",
    cardBg: "rgba(6, 30, 24, 0.75)",
    cardBorder: "rgba(52, 211, 153, 0.2)",
    highlightColor: "#6ee7b7"
  },
  {
    name: "Electric Violet",
    bg: "#0d0b1a",
    bgGrad: "radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
    accent: "#a78bfa",
    accentGlow: "rgba(167, 139, 250, 0.35)",
    badgeBg: "rgba(139, 92, 246, 0.12)",
    badgeBorder: "rgba(167, 139, 250, 0.3)",
    cardBg: "rgba(22, 17, 43, 0.75)",
    cardBorder: "rgba(167, 139, 250, 0.2)",
    highlightColor: "#c4b5fd"
  },
  {
    name: "Royal Amber",
    bg: "#140e06",
    bgGrad: "radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.18) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(217, 119, 6, 0.12) 0%, transparent 50%)",
    accent: "#fbbf24",
    accentGlow: "rgba(251, 191, 36, 0.35)",
    badgeBg: "rgba(245, 158, 11, 0.12)",
    badgeBorder: "rgba(251, 191, 36, 0.3)",
    cardBg: "rgba(31, 21, 10, 0.8)",
    cardBorder: "rgba(251, 191, 36, 0.2)",
    highlightColor: "#fde68a"
  },
  {
    name: "Crimson Pro",
    bg: "#14080b",
    bgGrad: "radial-gradient(circle at 15% 15%, rgba(244, 63, 94, 0.18) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(225, 29, 72, 0.12) 0%, transparent 50%)",
    accent: "#fb7185",
    accentGlow: "rgba(251, 113, 133, 0.35)",
    badgeBg: "rgba(244, 63, 94, 0.12)",
    badgeBorder: "rgba(251, 113, 133, 0.3)",
    cardBg: "rgba(33, 13, 19, 0.8)",
    cardBorder: "rgba(251, 113, 133, 0.2)",
    highlightColor: "#fecdd3"
  }
];

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const slides = body.slides;
    const brand = body.brand || "WERead Asia";

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
    }

    const themeIndex = Math.floor(Math.random() * THEMES.length);
    const theme = THEMES[themeIndex];

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const renderedImages: string[] = [];

    for (let index = 0; index < slides.length; index++) {
      const slide = slides[index];
      const isCover = index === 0;
      const isCTA = index === slides.length - 1;
      const categoryText = slide.category || "ចំណេះដឹងអាជីវកម្ម";
      const titleText = slide.title || "";
      
      // សម្អាតពាក្យជាន់គ្នានៅដើមប្រយោគ (ដូចជា បញ្ហា៖ / ដំណោះស្រាយ៖ / លទ្ធផល៖)
      let bodyText = (slide.body || slide.description || "").trim();
      bodyText = bodyText.replace(/^(បញ្ហា|ដំណោះស្រាយ|លទ្ធផល|គន្លឹះ|យុទ្ធសាស្ត្រ)\s*[៖:]\s*/i, "");

      let stepBadge = `ជំហានទី ${index}`;
      if (isCover) stepBadge = "INSIGHT";
      if (isCTA) stepBadge = "ACTION";

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
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
            background-color: ${theme.bg};
            background-image: ${theme.bgGrad};
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 80px 75px;
            overflow: hidden;
            position: relative;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge-container {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .badge {
            background: ${theme.badgeBg};
            border: 1.5px solid ${theme.badgeBorder};
            color: ${theme.accent};
            padding: 10px 24px;
            border-radius: 9999px;
            font-size: 24px;
            font-weight: 700;
          }
          .sub-badge {
            color: #94a3b8;
            font-size: 22px;
            font-weight: 600;
          }
          .slide-counter {
            font-size: 24px;
            color: #94a3b8;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 20px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .content-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            margin: 40px 0;
          }

          /* Slide 1: Cover */
          .cover-layout .topic-tag {
            color: ${theme.accent};
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .cover-layout .topic-tag::before {
            content: "";
            display: inline-block;
            width: 32px;
            height: 5px;
            background: ${theme.accent};
            border-radius: 3px;
          }
          .cover-layout .main-title {
            font-size: 66px;
            line-height: 1.35;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 35px;
          }
          .cover-layout .highlight-title {
            color: ${theme.accent};
            text-shadow: 0 0 35px ${theme.accentGlow};
          }
          .cover-layout .cover-footer-note {
            background: rgba(255, 255, 255, 0.04);
            border-left: 4px solid ${theme.accent};
            padding: 22px 26px;
            border-radius: 0 16px 16px 0;
            font-size: 28px;
            color: #cbd5e1;
          }

          /* Slide 2,3,4: Standard Content */
          .standard-layout .main-title {
            font-size: 58px;
            line-height: 1.35;
            font-weight: 700;
            color: ${theme.accent};
            margin-bottom: 35px;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .standard-layout .body-box {
            background: ${theme.cardBg};
            border: 1.5px solid ${theme.cardBorder};
            border-radius: 28px;
            padding: 50px 45px;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
          }
          .standard-layout .body-text {
            font-size: 36px;
            line-height: 1.65;
            color: #e2e8f0;
            font-weight: 400;
          }

          /* Slide 5: CTA */
          .cta-layout {
            text-align: center;
            align-items: center;
          }
          .cta-layout .main-title {
            font-size: 58px;
            line-height: 1.35;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 35px;
          }
          .cta-layout .cta-card {
            background: linear-gradient(135deg, ${theme.badgeBg} 0%, rgba(255, 255, 255, 0.02) 100%);
            border: 2px solid ${theme.badgeBorder};
            border-radius: 32px;
            padding: 60px 45px;
            width: 100%;
            box-shadow: 0 0 50px ${theme.accentGlow};
          }
          .cta-layout .body-text {
            font-size: 38px;
            line-height: 1.6;
            color: ${theme.highlightColor};
            font-weight: 600;
          }
          .cta-button-mock {
            margin-top: 40px;
            display: inline-block;
            background: ${theme.accent};
            color: #040711;
            font-size: 28px;
            font-weight: 700;
            padding: 18px 48px;
            border-radius: 9999px;
            box-shadow: 0 10px 25px ${theme.accentGlow};
          }

          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 32px;
          }
          .brand {
            font-size: 26px;
            color: #64748b;
            font-weight: 700;
          }
          .swipe-hint {
            font-size: 26px;
            color: ${theme.accent};
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .arrow-svg {
            width: 26px;
            height: 26px;
            fill: ${theme.accent};
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="badge-container">
            <div class="badge">${categoryText}</div>
            <div class="sub-badge">${stepBadge}</div>
          </div>
          <div class="slide-counter">${index + 1} / ${slides.length}</div>
        </div>

        <div class="content-container ${isCover ? "cover-layout" : isCTA ? "cta-layout" : "standard-layout"}">
          ${
            isCover
              ? `<div class="topic-tag">${categoryText}</div>
                 <h1 class="main-title"><span class="highlight-title">${titleText}</span></h1>
                 <div class="cover-footer-note">👉 អូសទៅស្លាយបន្ទាប់ដើម្បីស្វែងយល់លម្អិត</div>`
              : isCTA
              ? `<h1 class="main-title">${titleText}</h1>
                 <div class="cta-card">
                   <p class="body-text">${bodyText}</p>
                   <div class="cta-button-mock">ចុចចូលរួមឥឡូវនេះ 🚀</div>
                 </div>`
              : `<h1 class="main-title">${titleText}</h1>
                 <div class="body-box">
                   <p class="body-text">${bodyText}</p>
                 </div>`
          }
        </div>

        <div class="footer">
          <div class="brand">@${brand.toLowerCase().replace(/\s+/g, '')} • ${brand}</div>
          <div class="swipe-hint">
            ${isCTA ? "ចែករំលែកបន្ត" : "អូសទៅមុខ"}
            <svg class="arrow-svg" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
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