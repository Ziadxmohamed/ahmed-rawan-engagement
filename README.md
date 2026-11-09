# Ahmed & Rawan — Our Next Chapter

A full-screen engagement story controlled by scrolling. Scrolling forwards or backwards controls five Egyptian Arabic conversations, camera movement, character entrances, interlocking gold rings and the final envelope opening. The invitation grows directly out of the envelope in the same viewport, without jumping to a separate section. It opens automatically at the end; the header and keyboard skip link provide immediate access.

## Event

Friday, November 13, 2026 at 8:00 PM Africa/Cairo (`2026-11-13T18:00:00Z`). Location: https://maps.google.com/?q=30.137796,31.370340. No venue name is assumed.

## Run locally

Use Node.js 24 or later.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```

The build creates `public/engagement.ics`, then type-checks and builds Vite into `dist/`. No environment variables, database, paid APIs or accounts are required by guests.

## Change the invitation

- Edit `src/config.ts` for the names, start time, timezone, coordinates, tagline and Arabic invitation line. Dates and time shown in the invitation are derived from the start time in the configured timezone.
- Edit `src/story.ts` for the exact dialogue. Omar (عمر) and Youssef (يوسف) are fictional supporting characters, not claims about the real couple’s friends or history.
- Edit `src/lib/journey.ts` for the scroll length of each chapter.
- Run `npm run social` after changing the names or date to regenerate the sharing image. The metadata in `index.html` must match the event; the build also updates it from the event configuration.
- Set `VITE_SITE_URL` to the production origin if its URL changes, and rebuild.

The invitation is general. A `guest` query parameter does **not** personalize it, following the final design request. `?lite=1` selects the illustrated fallback without loading WebGL.

## Calendar and sharing

Add to Calendar offers a prefilled Google Calendar event, an inline `.ics` link for Apple Calendar, and a file download for other calendars. Guests review and confirm the event in their own app. Whether a mobile browser opens the installed app or its web view depends on the device, browser and installed applications. On iPhone, Safari is the best entry point for the calendar preview.

The calendar end time uses a configurable **120-minute default**, explicitly described in the event. This is not a confirmed end time.

Sharing offers WhatsApp, the operating system’s share sheet where supported, and copying the actual invitation URL. No messages are sent automatically.

The old RSVP form has been removed. A direct attendance-confirmation button opens a fixed Arabic message in WhatsApp for the configured recipient. Guests review and send the message themselves; the site does not store responses or claim a message was sent automatically. Edit `confirmationWhatsApp` and `confirmationMessage` in `src/config.ts` to change the recipient or message.

The invitation can also be saved as a separate 1440 × 1920 PNG through the download button. The portrait artwork is regenerated with the social preview during the build.

## Animation and accessibility

The visual style combines original generated film-style artwork with articulated 2.5D character puppets in Three.js, actual 3D rings, particles, camera movement and a hinged 3D envelope. Character legs, knees, arms and body motion are driven by scroll; these are not fully modelled film-quality 3D characters or facially rigged talking actors. Dialogue is silent and appears in named speech bubbles attached to the speaker. Rawan’s message appears in a phone UI. The finale shows the couple holding hands.

The controls are in the footer; the film header is intentionally clear. The card locks the page behind it and scrolls internally. Only its persistent × close button returns to the previous story position and restores page scrolling. Wheel gestures, touch pull-down and Escape do not dismiss it.

The designs are fictional and do not claim to depict the real couple. Approved likenesses can replace the artwork later. See `artwork/PROMPTS.md` for the art sources and generation briefs.

The experience respects system reduced motion and has a manual motion toggle. Reduced motion keeps scroll-based chapter changes while removing camera drift, gait and entrance effects. WebGL is lazy-loaded, pixel density and particle count adapt to small screens, and rendering pauses in hidden tabs and after reaching the invitation. The invitation, full story transcript, sharing and calendar controls remain usable without WebGL; there is also a JavaScript-free invitation in the HTML.

Fonts are self-hosted Tajawal and Cormorant Garamond under the SIL Open Font License; notices are in `licenses/`. The instrumental is an original 54-second piano-and-strings miniature, rendered from the score in `scripts/compose_music.py` and delivered as a 624 KB AAC file. It starts only after an explicit start or sound interaction, with no recordings or commercial music.

## Publish

Repository: https://github.com/Ziadxmohamed/ahmed-rawan-engagement

Target Pages project: `ahmed-rawan2026`. Vite build command: `npm run build`. Output: `dist`. Set `NODE_VERSION=24` for hosted builds. Deployment integration status is recorded in `docs/DEPLOYMENT.md` after verification.

For a direct upload:

```sh
npm ci
npm test
npm run build
npx wrangler pages deploy dist --project-name ahmed-rawan2026 --branch main
```

Only deploy to this project. Do not overwrite another Pages project, add a domain or alter DNS.

## Verification

`npm test` covers time conversion, countdown rollover, calendar serialization, sharing URLs, forward/reverse scroll mapping, automatic invitation opening, general guest addressing, named speech bubbles, RSVP removal and invitation closing and structural accessibility with axe. TypeScript and the production build are required checks. Actual device behavior and browser-specific app handoff must be checked on target devices; automated DOM tests do not certify those behaviors.

## Heart QR image

The shareable heart design is `public/heart-qr.png` (1600 × 1800). Run `npm run qr` to regenerate it, or let the standard build do so. The build decodes the finished image and checks that its content is the configured canonical invitation URL. Burgundy modules form the heart itself. The complete QR data matrix sits within that pattern, with clearance around the detection markers. The finished image is decoded at widths of 1600, 1000, 700 and 480 pixels and after JPEG compression and slight rotation.
