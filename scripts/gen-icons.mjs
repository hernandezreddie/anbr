import sharp from "sharp";
import { writeFileSync } from "fs";

const sizes = [192, 512];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#059669"/>
  <text x="256" y="300" font-family="Inter, sans-serif" font-size="280" font-weight="700" fill="white" text-anchor="middle">L</text>
</svg>`;

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
  console.log(`✅ public/icon-${size}.png`);
}
