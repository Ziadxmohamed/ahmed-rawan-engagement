import fs from "node:fs/promises";
import sharp from "sharp";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { event } from "../src/config.ts";

const target = event.siteUrl.replace(/\/$/, "") + "/";
const qr = QRCode.create(target, { errorCorrectionLevel: "H" });
const count = qr.modules.size,
  cell = 16;
const origin = { x: 176, y: 336 };
const code = { col: 22, row: 23 };
const heartPath =
  "M800 1580 C685 1490 190 1175 190 745 C190 490 350 350 560 350 C680 350 760 410 800 500 C840 410 920 350 1040 350 C1250 350 1410 490 1410 745 C1410 1175 915 1490 800 1580Z";
const mask = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1800"><path d="${heartPath}" fill="white"/></svg>`,
  ),
)
  .ensureAlpha()
  .raw()
  .toBuffer();
const insideHeart = (x, y) =>
  mask[(Math.floor(y) * 1600 + Math.floor(x)) * 4 + 3] > 250;
// The entire data matrix remains intact. Extra modules build the heart silhouette,
// with clear space next to the code and around all three detection patterns.
const inBox = (x, y, left, top, width, height) =>
  x >= left && x < left + width && y >= top && y < top + height;
const finders = [
  [0, 0],
  [count - 7, 0],
  [0, count - 7],
];
const decorative = (col, row) => {
  const x = col - code.col,
    y = row - code.row;
  if (inBox(x, y, -1, -1, count + 2, count + 2)) return false;
  if (finders.some(([fx, fy]) => inBox(x, y, fx - 4, fy - 4, 15, 15)))
    return false;
  // A repeatable texture, with no dependency on external images or services.
  let value = Math.imul(col + 157, 374761393) ^ Math.imul(row + 283, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296 < 0.55;
};
let modules = "";
for (let row = 0; row < 79; row++) {
  for (let col = 0; col < 79; col++) {
    const x = origin.x + col * cell,
      y = origin.y + row * cell;
    const core = inBox(col, row, code.col, code.row, count, count);
    const dark = core
      ? qr.modules.get(row - code.row, col - code.col)
      : decorative(col, row);
    if (dark && (core || insideHeart(x + cell / 2, y + cell / 2)))
      modules += `<rect x="${x}" y="${y}" width="${cell + 0.03}" height="${cell + 0.03}"/>`;
  }
}
const escape = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1800" viewBox="0 0 1600 1800">
<rect width="1600" height="1800" fill="#fff8ed"/>
<rect x="45" y="45" width="1510" height="1710" rx="3" fill="none" stroke="#d8b878" stroke-width="2"/>
<text x="800" y="175" text-anchor="middle" font-family="Georgia,serif" font-size="94" fill="#4a1828">${escape(event.groom)} &amp; ${escape(event.bride)}</text>
<text x="800" y="243" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" letter-spacing="7" fill="#8b6b42">OUR NEXT CHAPTER</text>
<g fill="#4a1828" shape-rendering="crispEdges">${modules}</g>
<text x="800" y="1653" text-anchor="middle" font-family="Georgia,serif" font-size="33" letter-spacing="4" fill="#4a1828">${event.dateLabel.replace(/^\w+, /, "").toUpperCase()}</text>
<text x="800" y="1713" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" letter-spacing="2" fill="#8b6b42">${new URL(target).hostname}</text>
</svg>`;
const png = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();
const checks = [];
for (const width of [1600, 1000, 700, 480]) {
  const { data, info } = await sharp(png)
    .resize({ width })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
    inversionAttempts: "dontInvert",
  });
  if (decoded?.data !== target)
    throw Error(
      `Heart QR failed at ${width}px: ${decoded?.data ?? "not detected"}`,
    );
  checks.push({ width, decoded: decoded.data });
}
// Also check a compressed, slightly rotated share-sized image.
const compressed = await sharp(png)
  .resize({ width: 700 })
  .rotate(7, { background: "#fff8ed" })
  .jpeg({ quality: 75 })
  .toBuffer();
const shared = await sharp(compressed)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const sharedDecoded = jsQR(
  new Uint8ClampedArray(shared.data),
  shared.info.width,
  shared.info.height,
  { inversionAttempts: "dontInvert" },
);
if (sharedDecoded?.data !== target)
  throw Error("Compressed heart QR failed to decode");
checks.push({
  format: "JPEG",
  quality: 75,
  rotation: 7,
  decoded: sharedDecoded.data,
});
await fs.writeFile("public/heart-qr.png", png);
await fs.mkdir("artifacts", { recursive: true });
await fs.writeFile("artifacts/ahmed-rawan-heart-qr.png", png);
console.log(
  JSON.stringify({
    file: "public/heart-qr.png",
    chatFile: "artifacts/ahmed-rawan-heart-qr.png",
    checks,
    verified: true,
  }),
);
