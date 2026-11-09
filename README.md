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

## Calendar, sharing and RSVP

Add to Calendar offers a prefilled Google Calendar event, an inline `.ics` link for Apple Calendar, and a file download for other calendars. Guests review and confirm the event in their own app. Whether a mobile browser opens the installed app or its web view depends on the device, browser and installed applications. On iPhone, Safari is the best entry point for the calendar preview.

The calendar end time uses a configurable **120-minute default**, explicitly described in the event. This is not a confirmed end time.

Sharing offers WhatsApp, the operating system’s share sheet where supported, and copying the actual invitation URL. No messages are sent automatically.

RSVP is a personal plan saved only in the guest’s browser, with a text export. It is **not delivered to the couple**. There is no backend or saved-response dashboard.

## Animation and accessibility

The visual style combines original generated film-style artwork with articulated 2.5D character puppets in Three.js, actual 3D rings, particles, camera movement and a hinged 3D envelope. Character legs, knees, arms and body motion are driven by scroll; these are not fully modelled film-quality 3D characters or facially rigged talking actors. Dialogue is silent and appears in named speech bubbles attached to the speaker. Rawan’s message appears in a phone UI. The finale shows the couple holding hands.

The designs are fictional and do not claim to depict the real couple. Approved likenesses can replace the artwork later. See `artwork/PROMPTS.md` for the art sources and generation briefs.

The experience respects system reduced motion and has a manual motion toggle. Reduced motion keeps scroll-based chapter changes while removing camera drift, gait and entrance effects. WebGL is lazy-loaded, pixel density and particle count adapt to small screens, and rendering pauses in hidden tabs and after reaching the invitation. The invitation, full story transcript, sharing and calendar controls remain usable without WebGL; there is also a JavaScript-free invitation in the HTML.

Fonts are self-hosted Tajawal and Cormorant Garamond under the SIL Open Font License; notices are in `licenses/`. The instrumental is an original, locally synthesized Web Audio arpeggio. It starts only through the sound control, with no recordings or commercial music.

## Publish

Repository: https://github.com/Ziadxmohamed/ahmed-rawan-engagement

Target Pages project: `ahmed-rawan`. Vite build command: `npm run build`. Output: `dist`. Set `NODE_VERSION=24` for hosted builds. Deployment integration status is recorded in `docs/DEPLOYMENT.md` after verification.

For a direct upload:

```sh
npm ci
npm test
npm run build
npx wrangler pages deploy dist --project-name ahmed-rawan --branch main
```

Only deploy to this project. Do not overwrite another Pages project, add a domain or alter DNS.

## Verification

`npm test` covers time conversion, countdown rollover, calendar serialization, sharing URLs, forward/reverse scroll mapping, automatic invitation opening, general guest addressing, named speech bubbles, local RSVP drafts and structural accessibility with axe. TypeScript and the production build are required checks. Actual device behavior and browser-specific app handoff must be checked on target devices; automated DOM tests do not certify those behaviors.
