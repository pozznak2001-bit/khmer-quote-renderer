import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// បណ្តុំ 5 Color Palettes បែប Modern Premium
const THEMES = [
  {
    name: "Cyber Cyan",
    bg: "#090d16",
    bgGrad: "radial-gradient(circle at 15% 15%, rgba(14, 165, 233, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.12) 0%, transparent 50%)",
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
    bgGrad: "radial-gradient(circle at 20% 10%, rgba(16, 185, 129, 0.2) 0%, transparent 45%), radial-gradient(circle at 80% 90%, rgba(5, 150, 105, 0.12) 0%, transparent 50%)",
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
    bgGrad: "radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
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
    bgGrad: "radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(217, 119, 6, 0.12) 0%, transparent 50%)",
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
    bgGrad: "radial-gradient(circle at 15% 15%, rgba(244, 63, 94, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(225, 29, 72, 0.12) 0%, transparent 50%)",
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

    // ជ្រើសរើស Theme ចៃដន្យសម្រាប់ Post នីមួយៗ ដើម្បីកុំឱ្យជាន់ពណ៌គ្នា
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
      const bodyText = slide.body || slide.description || "";

      // កំណត់ icon និង sub-tag សម្រាប់ slide នីមួយៗ
      let stepBadge = `ជំហានទី ${index}`;
      if (isCover) stepBadge = "HOT TOPIC";
      if (isCTA) stepBadge = "ACTION NOW";

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
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
            padding: 75px 70px;
            overflow: hidden;
            position: relative;
          }

          /* Grid Line Effect */
          body::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 36px 36px;
            pointer-events: none;
            z-index: 0;
          }

          .header {
            position: relative;
            z-index: 1;
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
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .sub-badge {
            color: #64748b;
            font-size: 20px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .slide-counter {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 22px;
            color: #94a3b8;
            font-weight: 800;
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 18px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .content-container {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            margin: 40px 0;
          }

          /* Slide 1: Cover Design */
          .cover-layout .topic-tag {
            color: ${theme.accent};
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 24px;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .cover-layout .topic-tag::before {
            content: "";
            display: inline-block;
            width: 28px;
            height: 4px;
            background: ${theme.accent};
            border-radius: 2px;
          }
          .cover-layout .main-title {
            font-size: 68px;
            line-height: 1.35;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 30px;
          }
          .cover-layout .highlight-title {
            color: ${theme.accent};
            text-shadow: 0 0 35px ${theme.accentGlow};
          }
          .cover-layout .cover-footer-note {
            background: rgba(255, 255, 255, 0.04);
            border-left: 4px solid ${theme.accent};
            padding: 20px 24px;
            border-radius: 0 16px 16px 0;
            font-size: 26px;
            color: #cbd5e1;
            margin-top: 20px;
          }

          /* Slide 2,3,4: Standard Content Design */
          .standard-layout .title-pill {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: ${theme.accent};
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 20px;
          }
          .standard-layout .main-title {
            font-size: 52px;
            line-height: 1.35;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 35px;
          }
          .standard-layout .body-box {
            background: ${theme.cardBg};
            border: 1.5px solid ${theme.cardBorder};
            border-radius: 28px;
            padding: 48px;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
            position: relative;
          }
          .standard-layout .body-text {
            font-size: 34px;
            line-height: 1.65;
            color: #e2e8f0;
            font-weight: 400;
          }

          /* Slide 5: CTA Design */
          .cta-layout {
            text-align: center;
            align-items: center;
          }
          .cta-layout .main-title {
            font-size: 56px;
            line-height: 1.35;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 36px;
          }
          .cta-layout .cta-card {
            background: linear-gradient(135deg, ${theme.badgeBg} 0%, rgba(255, 255, 255, 0.02) 100%);
            border: 2px solid ${theme.badgeBorder};
            border-radius: 32px;
            padding: 56px 40px;
            width: 100%;
            box-shadow: 0 0 50px ${theme.accentGlow};
          }
          .cta-layout .body-text {
            font-size: 36px;
            line-height: 1.6;
            color: ${theme.highlightColor};
            font-weight: 600;
          }
          .cta-button-mock {
            margin-top: 36px;
            display: inline-block;
            background: ${theme.accent};
            color: #040711;
            font-size: 26px;
            font-weight: 700;
            padding: 16px 44px;
            border-radius: 9999px;
            box-shadow: 0 10px 25px ${theme.accentGlow};
          }

          .footer {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 30px;
          }
          .brand {
            font-family: 'Plus Jakarta Sans', 'Kantumruy Pro', sans-serif;
            font-size: 24px;
            color: #64748b;
            font-weight: 700;
          }
          .swipe-hint {
            font-size: 24px;
            color: ${theme.accent};
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
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
              : `<div class="title-pill">📌 ${titleText}</div>
                 <h1 class="main-title">${titleText}</h1>
                 <div class="body-box">
                   <p class="body-text">${bodyText}</p>
                 </div>`
          }
        </div>

        <div class="footer">
          <div class="brand">@${brand.toLowerCase().replace(/\s+/g, '')} • ${brand}</div>
          <div class="swipe-hint">${isCTA ? "ចែករំលែកបន្ត ↗" : "អូសទៅមុខ →"}</div>
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