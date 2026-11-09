/** The only place to edit event facts. November 13, 2026 is UTC+02 in Cairo. */
export const event = {
  groom: "Ahmed",
  bride: "Rawan",
  startsAt: "2026-11-13T20:00:00+02:00",
  timeZone: "Africa/Cairo",
  latitude: 30.137796,
  longitude: 31.37034,
  // Convenience default only; the couple has not confirmed the end time.
  calendarDurationMinutes: 120,
  tagline: "Every Beautiful Forever Has a Beginning.",
  arabic: "بكل الحب والفرحة، مستنيينكم تشاركونا بداية حكايتنا.",
  siteUrl:
    import.meta.env?.VITE_SITE_URL || "https://our-next-chapter-ar.pages.dev",
  get title(): string {
    return `${this.groom} & ${this.bride} — Our Next Chapter`;
  },
  get mapsUrl(): string {
    return `https://maps.google.com/?q=${this.latitude.toFixed(6)},${this.longitude.toFixed(6)}`;
  },
  get dateLabel(): string {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: this.timeZone,
    }).format(new Date(this.startsAt));
  },
  get timeLabel(): string {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: this.timeZone,
    }).format(new Date(this.startsAt));
  },
  get dateParts() {
    const date = new Date(this.startsAt),
      fmt = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("en-US", {
          ...options,
          timeZone: this.timeZone,
        }).format(date);
    return {
      weekday: fmt({ weekday: "long" }),
      day: fmt({ day: "2-digit" }),
      month: fmt({ month: "long" }),
      year: fmt({ year: "numeric" }),
      short: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: this.timeZone,
      })
        .format(date)
        .replaceAll("/", " . "),
    };
  },
} as const;
