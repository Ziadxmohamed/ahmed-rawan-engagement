import { describe, expect, it } from "vitest";
import { fitSpeechBubble } from "../src/lib/bubbles";

describe("speaker bubbles stay fully readable", () => {
  for (const width of [320, 360, 390, 600, 1440]) {
    it(`keeps left and right speakers inside a ${width}px screen`, () => {
      const box = { width: Math.min(260, width - 32), height: 150 };
      for (const x of [-160, 0, width / 2, width, width + 160]) {
        const result = fitSpeechBubble({ x, y: 350 }, box, {
          width,
          height: 700,
        });
        expect(result.x - box.width / 2).toBeGreaterThanOrEqual(16);
        expect(result.x + box.width / 2).toBeLessThanOrEqual(width - 16);
        expect(result.tailX).toBeGreaterThanOrEqual(20);
        expect(result.tailX).toBeLessThanOrEqual(box.width - 20);
      }
    });
  }
  it("keeps tall Arabic dialogue inside a short screen", () => {
    const result = fitSpeechBubble(
      { x: 40, y: -50 },
      { width: 215, height: 190 },
      { width: 320, height: 450 },
    );
    expect(result.y - 95).toBeGreaterThanOrEqual(80);
    expect(result.y + 95).toBeLessThanOrEqual(434);
    expect(result.tailX).toBe(24);
  });
});
