import { scenes } from "../story";
export type JourneyPose = {
  phase: "intro" | "story" | "envelope";
  scene: number;
  progress: number;
  line: number;
  announcement: boolean;
};
// Lengths in viewport-height scroll units: intro, five chapters, envelope.
export const segmentLengths = [2.6, 2.8, 2.8, 3.2, 2.8, 1.9, 1.6];
export const journeyLength = segmentLengths.reduce((a, b) => a + b, 0);
export function chapterStart(scene: number) {
  return segmentLengths
    .slice(0, Math.min(6, scene + 1))
    .reduce((a, b) => a + b, 0);
}
export function journeyAt(position: number): JourneyPose {
  let remaining = Math.max(0, position),
    segment = 0;
  while (
    segment < segmentLengths.length - 1 &&
    remaining >= segmentLengths[segment]
  ) {
    remaining -= segmentLengths[segment];
    segment++;
  }
  const progress = Math.min(1, remaining / segmentLengths[segment]);
  if (segment === 0)
    return { phase: "intro", scene: 2, progress, line: 0, announcement: false };
  if (segment === 6)
    return {
      phase: "envelope",
      scene: 4,
      progress,
      line: 0,
      announcement: false,
    };
  const scene = segment - 1;
  return {
    phase: "story",
    scene,
    progress,
    line: Math.min(
      scenes[scene].lines.length - 1,
      Math.floor((progress / 0.82) * scenes[scene].lines.length),
    ),
    announcement: progress >= 0.84,
  };
}
