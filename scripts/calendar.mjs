import { writeFile } from "node:fs/promises";
import { calendar } from "../src/lib/core.ts";
await writeFile("public/engagement.ics", calendar());
console.log(
  "Created calendar with Cairo event start and documented default end.",
);
