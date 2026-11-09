import sharp from "sharp";
import { event } from "../src/config.ts";
const xml = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><radialGradient id="bg"><stop stop-color="#732d47"/><stop offset="1" stop-color="#341321"/></radialGradient><pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".4" fill="#d8b878" opacity=".15"/></pattern></defs><rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#grain)"/><rect x="27" y="27" width="1146" height="576" fill="none" stroke="#b99a64"/><rect x="36" y="36" width="1128" height="558" fill="none" stroke="#b99a64" opacity=".5"/><path d="M160 560V270a170 170 0 0 1 340 0M700 560V270a170 170 0 0 1 340 0" fill="none" stroke="#c6a064" opacity=".18" stroke-width="2"/><circle cx="600" cy="112" r="37" fill="none" stroke="#d8b878"/><text x="600" y="122" font-family="Georgia,serif" font-size="26" text-anchor="middle" fill="#d8b878">A &amp; R</text><text x="600" y="200" font-family="Georgia,serif" font-size="17" letter-spacing="7" text-anchor="middle" fill="#d8b878">OUR NEXT CHAPTER</text><text x="600" y="323" font-family="Georgia,serif" font-size="88" text-anchor="middle" fill="#fff8ed">${xml(event.groom)} &amp; ${xml(event.bride)}</text><text x="600" y="379" font-family="Georgia,serif" font-size="27" font-style="italic" text-anchor="middle" fill="#d8b878">Every Beautiful Forever Has a Beginning.</text><path d="M505 427H695" stroke="#b99a64"/><text x="600" y="477" font-family="Georgia,serif" font-size="22" letter-spacing="4" text-anchor="middle" fill="#fff8ed">${event.dateLabel.replace(/^\w+, /, "").toUpperCase()}</text><text x="600" y="523" font-family="Georgia,serif" font-size="16" letter-spacing="4" text-anchor="middle" fill="#d8b878">AN ENGAGEMENT CELEBRATION</text><path d="M70 100V70h30M1130 100V70h-30M70 530v30h30M1130 530v30h-30" stroke="#d8b878" fill="none"/></svg>`;
await sharp(Buffer.from(svg)).png().toFile("public/social-preview.png");
console.log("Created public/social-preview.png (1200 × 630)");

// A separate portrait card for guests to save, rather than a screenshot of the page.
const arabicLines = [];
let line = "";
for (const word of event.arabic.split(" ")) {
  if ((line + " " + word).trim().length > 34) {
    arabicLines.push(line);
    line = word;
  } else line = (line + " " + word).trim();
}
if (line) arabicLines.push(line);
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1920" viewBox="0 0 1440 1920">
<defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#fffaf1"/><stop offset="1" stop-color="#f4e9d5"/></linearGradient></defs>
<rect width="1440" height="1920" fill="#4a1828"/>
<rect x="45" y="45" width="1350" height="1830" fill="none" stroke="#d8b878" stroke-width="2"/>
<rect x="76" y="76" width="1288" height="1768" fill="url(#paper)"/>
<rect x="103" y="103" width="1234" height="1714" fill="none" stroke="#bd9b62" stroke-width="2"/>
<rect x="117" y="117" width="1206" height="1686" fill="none" stroke="#bd9b62"/>
<path d="M153 220V153h67M1287 220v-67h-67M153 1700v67h67M1287 1700v67h-67" fill="none" stroke="#a78247" stroke-width="3"/>
<circle cx="720" cy="268" r="65" fill="#4a1828"/>
<circle cx="720" cy="268" r="55" fill="none" stroke="#d8b878"/>
<text x="720" y="286" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="#e4c890">A &amp; R</text>
<text x="720" y="415" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" letter-spacing="6" fill="#765232">YOU ARE CORDIALLY INVITED</text>
<text x="720" y="475" text-anchor="middle" font-family="Georgia,serif" font-size="36" font-style="italic" fill="#8c6d45">to celebrate the engagement of</text>
<text x="720" y="698" text-anchor="middle" font-family="Georgia,serif" font-size="176" fill="#4a1828">${xml(event.groom)}</text>
<text x="720" y="826" text-anchor="middle" font-family="Georgia,serif" font-size="106" font-style="italic" fill="#b08b51">&amp;</text>
<text x="720" y="1018" text-anchor="middle" font-family="Georgia,serif" font-size="176" fill="#4a1828">${xml(event.bride)}</text>
<path d="M420 1105h600" stroke="#c8ab78"/>
<text x="486" y="1222" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" letter-spacing="3" fill="#765232">${event.dateParts.weekday.toUpperCase()}</text>
<path d="M590 1156v112M850 1156v112" stroke="#c8ab78"/>
<text x="720" y="1247" text-anchor="middle" font-family="Georgia,serif" font-size="112" fill="#4a1828">${event.dateParts.day}</text>
<text x="1012" y="1205" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" letter-spacing="3" fill="#765232">${event.dateParts.month.toUpperCase()}</text>
<text x="1012" y="1253" text-anchor="middle" font-family="Georgia,serif" font-size="35" fill="#765232">${event.dateParts.year}</text>
<text x="720" y="1350" text-anchor="middle" font-family="Georgia,serif" font-size="42" fill="#4a1828">${event.timeLabel} · Cairo time</text>
<path d="M630 1413h180" stroke="#c8ab78"/>
${arabicLines.map((text, i) => `<text x="720" y="${1500 + i * 68}" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Arial,sans-serif" font-size="43" fill="#4a1828">${xml(text)}</text>`).join("")}
<text x="720" y="1668" text-anchor="middle" font-family="Georgia,serif" font-size="35" font-style="italic" fill="#8c6d45">${xml(event.tagline)}</text>
<text x="720" y="1741" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" letter-spacing="2" fill="#8c6d45">${new URL(event.siteUrl).hostname}</text>
</svg>`;
await sharp(Buffer.from(card))
  .png({ compressionLevel: 9, palette: true })
  .toFile("public/invitation-card.png");
console.log("Created public/invitation-card.png (1440 × 1920)");
