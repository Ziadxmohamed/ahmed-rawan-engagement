import { describe, it, expect } from "vitest";
import { journeyAt, chapterStart, journeyLength } from "../src/lib/journey";
import { scenes } from "../src/story";
describe("scroll-driven story", () => {
  it("begins with the introduction and changes chapters only as scroll moves", () => {
    expect(journeyAt(0).phase).toBe("intro");
    expect(journeyAt(chapterStart(0) + 0.01)).toMatchObject({
      phase: "story",
      scene: 0,
    });
    expect(journeyAt(chapterStart(4) + 0.01)).toMatchObject({
      phase: "story",
      scene: 4,
    });
    expect(journeyAt(journeyLength)).toMatchObject({
      phase: "envelope",
      progress: 1,
    });
  });
  it("reveals each exact Arabic dialogue line through scroll progress", () => {
    scenes.forEach((scene, i) => {
      const start = chapterStart(i);
      expect(journeyAt(start + 0.001).line).toBe(0);
      const end = chapterStart(i + 1);
      expect(journeyAt(end - 0.001).announcement).toBe(true);
      for (let line = 0; line < scene.lines.length; line++) {
        const position =
          start + (end - start) * (((line + 0.5) / scene.lines.length) * 0.82);
        expect(journeyAt(position).line).toBe(line);
      }
    });
  });
  it("supports reverse scrolling and clamps out-of-range positions", () => {
    expect(journeyAt(-20).phase).toBe("intro");
    expect(journeyAt(999).phase).toBe("envelope");
    expect(journeyAt(chapterStart(2) - 0.01).scene).toBe(1);
    expect(journeyAt(chapterStart(2) + 0.01).scene).toBe(2);
  });
});
