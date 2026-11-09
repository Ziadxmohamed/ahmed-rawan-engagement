import { describe, it, expect } from "vitest";
import { event } from "../src/config";
import {
  getCountdown,
  calendar,
  shareText,
  googleCalendarUrl,
} from "../src/lib/core";
describe("Cairo event timing", () => {
  it("starts at 18:00 UTC and displays Friday at 20:00 Cairo time", () => {
    expect(new Date(event.startsAt).toISOString()).toBe(
      "2026-11-13T18:00:00.000Z",
    );
    expect(event.timeLabel).toBe("8:00 PM");
    expect(event.dateParts.weekday).toBe("Friday");
    expect(event.dateParts.short).toBe("13 . 11 . 2026");
  });
  it("counts units correctly and never goes negative", () => {
    expect(getCountdown(Date.parse(event.startsAt) - 90061000)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
      started: false,
    });
    expect(getCountdown(Date.parse(event.startsAt) + 1)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      started: true,
    });
  });
});
describe("calendar and sharing", () => {
  it("exports UTC dates, exact coordinates and a documented default end", () => {
    const ics = calendar();
    expect(ics).toContain("DTSTART:20261113T180000Z");
    expect(ics).toContain("DTEND:20261113T200000Z");
    expect(ics).toContain("GEO:30.137796;31.370340");
    expect(ics).toContain("default");
    expect(ics).toContain("https://maps.google.com/?q=30.137796\\,31.370340");
    expect(
      ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75),
    ).toBe(true);
  });
  it("prefills a calendar event with Cairo timezone and correct UTC dates", () => {
    const url = new URL(googleCalendarUrl());
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("dates")).toBe(
      "20261113T180000Z/20261113T200000Z",
    );
    expect(url.searchParams.get("ctz")).toBe("Africa/Cairo");
    expect(url.searchParams.get("location")).toBe(event.mapsUrl);
  });
  it("shares a general invitation with date, names, Cairo time and URL", () => {
    const text = shareText("https://example.com/");
    [
      "Ahmed & Rawan",
      "November 13, 2026",
      "8:00 PM",
      "Cairo",
      "https://example.com/",
    ].forEach((x) => expect(text).toContain(x));
    expect(text).not.toContain("Dear");
  });
});
