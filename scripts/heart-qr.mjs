import fs from "node:fs/promises";
import sharp from "sharp";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { event } from "../src/config.ts";

// Keep the entire QR matrix and its quiet zone intact inside a heart silhouette.
// The surrounding heart is decoration, not a destructive crop of the code.
const target = event.siteUrl.replace(/\/$/, "") + "/";
const qr = QRCode.create(target, { errorCorrectionLevel: "H" });
const count = qr.modules.size,
  quiet = 4,
  size = 600,
  cell = size / (count + quiet * 2);
const x = 500,
  y = 585;
let modules = "";
for (let row = 0; row < count; row++)
  for (let col = 0; col < count; col++) {
    if (qr.modules.get(row, col))
      modules += `<rect x="${x + (col + quiet) * cell}" y="${y + (row + quiet) * cell}" width="${cell + 0.03}" height="${cell + 0.03}"/>`;
  }
const escape = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1800" viewBox="0 0 1600 1800">
<rect width="1600" height="1800" fill="#fff8ed"/>
<rect x="45" y="45" width="1510" height="1710" rx="3" fill="none" stroke="#d8b878" stroke-width="2"/>
<text x="800" y="175" text-anchor="middle" font-family="Georgia,serif" font-size="94" fill="#4a1828">${escape(event.groom)} &amp; ${escape(event.bride)}</text>
<text x="800" y="243" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" letter-spacing="7" fill="#8b6b42">OUR NEXT CHAPTER</text>
<path d="M800 1580 C685 1490 190 1175 190 745 C190 490 350 350 560 350 C680 350 760 410 800 500 C840 410 920 350 1040 350 C1250 350 1410 490 1410 745 C1410 1175 915 1490 800 1580Z" fill="#4a1828" stroke="#d8b878" stroke-width="8"/>
<path d="M560 382 C385 382 230 503 230 745" fill="none" stroke="#d8b878" stroke-width="3" opacity=".48"/>
<path d="M1040 382 C1215 382 1370 503 1370 745" fill="none" stroke="#d8b878" stroke-width="3" opacity=".48"/>
<rect x="470" y="555" width="660" height="660" rx="22" fill="#ffffff" stroke="#d8b878" stroke-width="3"/>
<g fill="#35131f" shape-rendering="crispEdges">${modules}</g>
<text x="800" y="1310" text-anchor="middle" font-family="Georgia,serif" font-size="47" font-style="italic" fill="#ead0a1">Scan with love.</text>
<text x="800" y="1370" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" letter-spacing="4" fill="#d8b878">YOUR INVITATION STARTS HERE</text>
<text x="800" y="1653" text-anchor="middle" font-family="Georgia,serif" font-size="33" letter-spacing="4" fill="#4a1828">${event.dateLabel.replace(/^\w+, /, "").toUpperCase()}</text>
<text x="800" y="1713" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" letter-spacing="2" fill="#8b6b42">${new URL(target).hostname}</text>
</svg>`;
const png = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();
const { data, info } = await sharp(png)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
  inversionAttempts: "dontInvert",
});
if (decoded?.data !== target)
  throw Error(
    `Heart QR did not decode to the intended invitation: ${decoded?.data ?? "not detected"}`,
  );
await fs.writeFile("public/heart-qr.png", png);
await fs.mkdir("artifacts", { recursive: true });
await fs.writeFile("artifacts/ahmed-rawan-heart-qr.png", png);
console.log(
  JSON.stringify({
    file: "public/heart-qr.png",
    chatFile: "artifacts/ahmed-rawan-heart-qr.png",
    width: info.width,
    height: info.height,
    decoded: decoded.data,
    verified: true,
  }),
);
