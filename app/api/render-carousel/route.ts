import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const THEMES = [
  { name: "shadow_box" },      // 1. ប្រអប់ខ្មៅមានស្រមោល
  { name: "paper_highlight" }, // 2. ផ្ទៃស មាន Highlight ផ្កាឈូក/លឿង
  { name: "glass_box" },       // 3. ប្រអប់ថ្លា (Glassmorphism)
  { name: "green_frame" },     // 4. ផ្ទៃបៃតង មានស៊ុមស
  { name: "dark_gold" },       // 5. ផ្ទៃខ្មៅ អក្សរមាស
  { name: "inverse_block" }    // 6. ផ្ទៃស អក្សរខ្មៅ មានប្រអប់អក្សរមាស
];

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const brand = body.brand || "@weread.asia";
    
    const titleText = (body.title || (body.slides && body.slides[0]?.title) || "").trim();
    const subText = (body.subtitle || (body.slides && body.slides[0]?.body) || "").trim();

    const rowNumber = parseInt(body.row) || 0;
    const currentTheme = THEMES[rowNumber % 6];

    if (!titleText) {
      return NextResponse.json({ error: "Title or Cover text is required" }, { status: 400 });
    }

    chromium.setGraphicsMode = false;
    browser = await puppeteer.launch({
      args: [...chromium.args, "--disable-web-security", "--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
      defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 1.5 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    let contentHTML = "";
    let cssStyles = "";

    // រៀបចំ CSS និង HTML តាម Theme នីមួយៗ
    if (currentTheme.name === "shadow_box") {
      cssStyles = `
        body { background: #383838; display: flex; justify-content: center; align-items: center; }
        .inner-box { background: #1C1C1C; width: 920px; height: 920px; border-radius: 16px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 60px 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
        .text-container { width: 100%; max-height: 720px; display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; }
        .title { color: #D4AF37; text-align: center; line-height: 1.35; font-weight: 700; word-break: break-word; }
        .sub { color: #FFFFFF; text-align: center; line-height: 1.35; margin-top: 24px; font-weight: 500; word-break: break-word; }
        .brand { color: #A0A0A0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px; }
      `;
      contentHTML = `
        <div class="inner-box">
          <div class="text-container" id="fit-box">
            <h1 class="title">${titleText}</h1>
            ${subText ? `<p class="sub">${subText}</p>` : ""}
          </div>
          <div class="brand">${brand}</div>
        </div>
      `;
    
    } else if (currentTheme.name === "paper_highlight") {
      cssStyles = `
        body { background: #F4F4F5; display: flex; justify-content: center; align-items: center; }
        .main-wrapper { width: 920px; height: 920px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 40px 20px; }
        .text-container { width: 100%; max-height: 760px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; }
        .hl-pink { background: #FF9BE6; color: #111; padding: 18px 36px; border-radius: 12px; display: inline-block; transform: rotate(-1.5deg); text-align: center; line-height: 1.35; font-weight: 700; word-break: break-word; }
        .hl-yellow { background: #FFF066; color: #111; padding: 16px 32px; border-radius: 12px; display: inline-block; transform: rotate(1.2deg); margin-top: 30px; text-align: center; line-height: 1.35; font-weight: 600; word-break: break-word; }
        .brand { color: #333333; font-size: 26px; font-weight: 700; }
      `;
      contentHTML = `
        <div class="main-wrapper">
          <div class="text-container" id="fit-box">
            <div class="hl-pink title">${titleText}</div>
            ${subText ? `<div class="hl-yellow sub">${subText}</div>` : ""}
          </div>
          <div class="brand">${brand}</div>
        </div>
      `;
    
    } else if (currentTheme.name === "glass_box") {
      cssStyles = `
        body { background: linear-gradient(135deg, #4b4b4b, #222222); display: flex; justify-content: center; align-items: center; }
        .glass { background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(25px); width: 920px; height: 920px; border: 2px solid rgba(255,255,255,0.25); border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 60px 40px; box-shadow: 0 25px 50px rgba(0,0,0,0.4); }
        .text-container { width: 100%; max-height: 720px; display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; }
        .title { color: #FFFFFF; text-align: center; line-height: 1.35; font-weight: 700; word-break: break-word; }
        .sub { color: rgba(255,255,255,0.9); text-align: center; line-height: 1.35; margin-top: 24px; font-weight: 500; word-break: break-word; }
        .brand { color: rgba(255,255,255,0.8); font-size: 26px; font-weight: 600; }
      `;
      contentHTML = `
        <div class="glass">
          <div class="text-container" id="fit-box">
            <h1 class="title">${titleText}</h1>
            ${subText ? `<p class="sub">${subText}</p>` : ""}
          </div>
          <div class="brand">${brand}</div>
        </div>
      `;
    
    } else if (currentTheme.name === "green_frame") {
      cssStyles = `
        body { background: #14301C; display: flex; justify-content: center; align-items: center; padding: 50px; }
        .frame { border: 3px solid #FFFFFF; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 50px 40px; }
        .quote-icon { font-size: 90px; color: #FFFFFF; line-height: 1; }
        .text-container { width: 100%; max-height: 640px; display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; }
        .title { color: #FFFFFF; text-align: center; line-height: 1.35; font-weight: 700; word-break: break-word; }
        .sub { color: #E0E0E0; text-align: center; line-height: 1.35; margin-top: 24px; font-weight: 500; word-break: break-word; }
        .brand { color: #FFFFFF; font-size: 26px; font-weight: 600; }
      `;
      contentHTML = `
        <div class="frame">
          <div class="quote-icon">❞</div>
          <div class="text-container" id="fit-box">
            <h1 class="title">${titleText}</h1>
            ${subText ? `<p class="sub">${subText}</p>` : ""}
          </div>
          <div class="brand">${brand}</div>
        </div>
      `;
    
    } else if (currentTheme.name === "dark_gold") {
      cssStyles = `
        body { background: #111111; display: flex; justify-content: center; align-items: center; padding: 60px; }
        .main-wrapper { width: 920px; height: 920px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 40px 20px; }
        .text-container { width: 100%; max-height: 780px; display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; }
        .title { color: #EAB308; text-align: center; line-height: 1.35; font-weight: 700; word-break: break-word; }
        .sub { color: #FFFFFF; text-align: center; line-height: 1.35; margin-top: 28px; font-weight: 500; word-break: break-word; }
        .brand { color: #888888; font-size: 26px; font-weight: 600; }
      `;
      contentHTML = `
        <div class="main-wrapper">
          <div class="text-container" id="fit-box">
            <h1 class="title">${titleText}</h1>
            ${subText ? `<p class="sub">${subText}</p>` : ""}
          </div>
          <div class="brand">${brand}</div>
        </div>
      `;
    
    } else if (currentTheme.name === "inverse_block") {
      cssStyles = `
        body { background: #FAFAFA; display: flex; justify-content: center; align-items: center; padding: 60px; }
        .main-wrapper { width: 920px; height: 920px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 40px 20px; }
        .text-container { width: 100%; max-height: 780px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; }
        .title { color: #111111; text-align: center; font-weight: 700; line-height: 1.35; word-break: break-word; }
        .block-body { background: #111111; color: #EAB308; padding: 18px 36px; border-radius: 8px; text-align: center; font-weight: 600; line-height: 1.35; margin-top: 30px; word-break: break-word; }
        .brand { color: #111111; font-size: 26px; font-weight: 700; }
      `;
      contentHTML = `
        <div class="main-wrapper">
          <div class="text-container" id="fit-box">
            <h1 class="title">${titleText}</h1>
            ${subText ? `<div class="block-body sub">${subText}</div>` : ""}
          </div>
          <div class="brand">${brand}</div>
        </div>
      `;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="UTF-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Kantumruy Pro', sans-serif; }
        body { width: 1080px; height: 1080px; overflow: hidden; position: relative; }
        ${cssStyles}
      </style>
    </head>
    <body>
      ${contentHTML}
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");

    // Dynamic Text Scale: គណនាទំហំ Font ស្វ័យប្រវត្តិឱ្យសមាមាត្រ 70% - 80% នៃផ្ទាំង
    await page.evaluate(() => {
      const container = document.getElementById("fit-box");
      const titleEl = document.querySelector(".title") as HTMLElement | null;
      const subEl = document.querySelector(".sub") as HTMLElement | null;

      if (!container || !titleEl) return;

      const maxHeight = container.clientHeight || 750;
      const maxWidth = container.clientWidth || 880;

      let low = 36;
      let high = 140;
      let bestTitleSize = low;

      // រកទំហំ Font ធំបំផុតដែលអាចផ្ទុកបានដោយមិន Overflows
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const subSize = Math.round(mid * 0.68); // subtitle មានសមាមាត្រ 68% នៃ title

        titleEl.style.fontSize = `${mid}px`;
        if (subEl) subEl.style.fontSize = `${subSize}px`;

        if (container.scrollHeight <= maxHeight && container.scrollWidth <= maxWidth) {
          bestTitleSize = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      // កំណត់ទំហំ Font ចុងក្រោយ
      titleEl.style.fontSize = `${bestTitleSize}px`;
      if (subEl) subEl.style.fontSize = `${Math.round(bestTitleSize * 0.68)}px`;
    });

    const buffer = await page.screenshot({ type: "jpeg", quality: 95 });
    const imageBase64 = Buffer.from(buffer).toString("base64");

    await page.close();

    return NextResponse.json({
      success: true,
      image: imageBase64,
      images: [imageBase64]
    });

  } catch (error: any) {
    console.error("Render Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}