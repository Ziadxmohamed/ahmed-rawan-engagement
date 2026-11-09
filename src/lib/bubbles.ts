type Point = { x: number; y: number };
type Size = { width: number; height: number };
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(Math.max(min, max), value));

/** Keep the entire bubble visible while its tail points back toward the speaker. */
export function fitSpeechBubble(anchor: Point, box: Size, screen: Size) {
  const x = clamp(
    anchor.x,
    box.width / 2 + 16,
    screen.width - box.width / 2 - 16,
  );
  const y = clamp(
    anchor.y,
    box.height / 2 + 80,
    screen.height - box.height / 2 - 16,
  );
  return {
    x,
    y,
    tailX: clamp(anchor.x - x + box.width / 2, 20, box.width - 20),
  };
}
