# Verification record

Passed locally:

- 16 automated tests across event timing/calendar/sharing, scroll mapping and UI behavior.
- Cairo start: Friday, November 13, 2026, 20:00 local = 18:00 UTC.
- Forward and reverse chapter navigation, exact Arabic dialogue, named character bubbles and general guest addressing.
- Automatic invitation reveal inside the same viewport, with an explicit regression assertion that no `scrollIntoView` jump occurs.
- Calendar links, ICS encoding/coordinates, WhatsApp message, local-only RSVP storage and reduced-motion controls.
- Structural accessibility with axe (color contrast excluded from the DOM-only test).
- TypeScript and the Vite production build.
- npm audit: no known vulnerabilities at verification time.
- Lazy 3D chunk is not preloaded by the HTML. Production character atlas is approximately 192 KB; environment atlas approximately 364 KB.

Browser evidence and limits:

The initial local experience rendered in Chrome with WebGL, Arabic dialogue and story navigation. Chrome's device toolbar reached the iPhone 16 viewport; its console showed no errors at that point. The user supplied visual evidence of the later character alignment and floor clipping, which was used for corrections. The later browser/screenshot interface repeatedly timed out, so the final rings, articulated gait, full mobile layout, production browser console and native calendar app handoff have not been certified by a final browser pass. JSDOM checks do not substitute for GPU/device tests.

Source art is original generated artwork. Characters are articulated 2.5D puppets, not complete 3D talking models. No required production asset is missing. Approved real-couple likenesses are optional future replacements.
