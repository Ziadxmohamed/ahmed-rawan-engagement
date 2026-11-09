import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const origin = process.argv[2];
if (!origin?.startsWith("https://"))
  throw Error("Pass the verified HTTPS deployment origin");
const entries = [];
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(name);
    else if (entry.name !== "_headers") entries.push(name);
  }
}
await walk("dist");
const failures = [];
let verified = 0;
for (let offset = 0; offset < entries.length; offset += 5) {
  await Promise.all(
    entries.slice(offset, offset + 5).map(async (file) => {
      const route =
        file === "dist/index.html"
          ? "/"
          : "/" + path.relative("dist", file).split(path.sep).join("/");
      try {
        const response = await fetch(new URL(route, origin), {
          signal: AbortSignal.timeout(20000),
        });
        const body = Buffer.from(await response.arrayBuffer()),
          local = await fs.readFile(file);
        const hash = (buffer) =>
          crypto.createHash("sha256").update(buffer).digest("hex");
        if (response.status !== 200 || hash(body) !== hash(local))
          failures.push({
            route,
            status: response.status,
            contentMatches: hash(body) === hash(local),
          });
        else verified++;
        if (route === "/engagement.ics" || route.includes("/music/"))
          console.log(
            JSON.stringify({
              route,
              status: response.status,
              type: response.headers.get("content-type"),
              disposition: response.headers.get("content-disposition"),
            }),
          );
      } catch (error) {
        failures.push({ route, error: error.message });
      }
    }),
  );
}
console.log(
  JSON.stringify(
    { origin, verified, total: entries.length, failures },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
