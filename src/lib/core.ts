import { event } from "../config.ts";
export type Mode = "story" | "envelope";
export function getCountdown(now = Date.now()) {
  const remaining = Math.max(
    0,
    Math.floor((Date.parse(event.startsAt) - now) / 1000),
  );
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor(remaining / 3600) % 24,
    minutes: Math.floor(remaining / 60) % 60,
    seconds: remaining % 60,
    started: now >= Date.parse(event.startsAt),
  };
}
function icsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}
function escapeIcs(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
function fold(line: string) {
  const parts: string[] = [];
  let chunk = "",
    bytes = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (bytes + n > 75) {
      parts.push(chunk);
      chunk = " ";
      bytes = 1;
    }
    chunk += ch;
    bytes += n;
  }
  parts.push(chunk);
  return parts.join("\r\n");
}
export function calendar() {
  const start = new Date(event.startsAt),
    end = new Date(start.getTime() + event.calendarDurationMinutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ahmed and Rawan//Our Next Chapter//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:ahmed-rawan-engagement-20261113@our-next-chapter",
    "DTSTAMP:" + icsDate(new Date()),
    "DTSTART:" + icsDate(start),
    "DTEND:" + icsDate(end),
    "SUMMARY:" + escapeIcs(`${event.groom} & ${event.bride} Engagement`),
    "LOCATION:" + escapeIcs(event.mapsUrl),
    `GEO:${event.latitude.toFixed(6)};${event.longitude.toFixed(6)}`,
    "DESCRIPTION:" +
      escapeIcs(
        `Join us for ${event.groom} & ${event.bride}’s engagement. ${event.timeLabel} Africa/Cairo. Calendar end time uses a configurable ${event.calendarDurationMinutes}-minute default; the event end time is not confirmed.\n${event.mapsUrl}`,
      ),
    "URL:" + event.mapsUrl,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
export function shareText(url: string) {
  return `${event.groom} & ${event.bride} 💍\nOur Next Chapter Begins.\n\nYou’re invited to our engagement celebration!\n${event.dateLabel} · ${event.timeLabel} (Cairo time)\n\nEvery Beautiful Forever Has a Beginning.\n${url}`;
}

export function googleCalendarUrl() {
  const start = new Date(event.startsAt),
    end = new Date(start.getTime() + event.calendarDurationMinutes * 60000);
  const details = `${event.tagline}\n${event.arabic}\n${event.mapsUrl}\nCalendar end time uses a ${event.calendarDurationMinutes}-minute default; the actual end time is not confirmed.`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.groom} & ${event.bride} Engagement`,
    dates: `${icsDate(start)}/${icsDate(end)}`,
    ctz: event.timeZone,
    location: event.mapsUrl,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
