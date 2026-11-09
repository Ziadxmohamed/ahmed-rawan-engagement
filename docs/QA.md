# Verification record

Passed locally:

- 21 automated tests across event timing/calendar/sharing, scroll mapping and UI behavior.
- Cairo start: Friday, November 13, 2026, 20:00 local = 18:00 UTC.
- Forward and reverse chapter navigation, exact Arabic dialogue, named character bubbles and general guest addressing.
- Automatic invitation reveal inside the same viewport, with an explicit regression assertion that no `scrollIntoView` jump occurs.
- Calendar links, ICS encoding/coordinates, WhatsApp message, RSVP removal, visible invitation closing and restored page scrolling and reduced-motion controls.
- Structural accessibility with axe (color contrast excluded from the DOM-only test).
- TypeScript and the Vite production build.
- npm audit: no known vulnerabilities at verification time.
- Lazy 3D chunk is not preloaded by the HTML. Production character atlas is approximately 192 KB; environment atlas approximately 364 KB.

Browser evidence and limits:

The initial local experience rendered in Chrome with WebGL, Arabic dialogue and story navigation. Chrome's device toolbar reached the iPhone 16 viewport; its console showed no errors at that point. The user supplied visual evidence of the later character alignment and floor clipping, which was used for corrections. The later browser/screenshot interface repeatedly timed out, so the final rings, articulated gait, full mobile layout, production browser console and native calendar app handoff have not been certified by a final browser pass. JSDOM checks do not substitute for GPU/device tests.

Source art is original generated artwork. Characters are articulated 2.5D puppets, not complete 3D talking models. No required production asset is missing. Approved real-couple likenesses are optional future replacements.

Later refinements: removed the top-right control group, separated the couple to prevent silhouette overlap, removed the RSVP section, added a persistent close button plus Escape with a scrolling-unlock regression test, and replaced the repeating synth with a 54-second original piano/strings composition. Audio asset validation reports stereo AAC at 44.1 kHz and exactly 54 seconds; a final listening pass could not be performed through the unavailable browser tools. Attempts to generate authored walking-frame atlases were rejected by the image tool and produced no usable assets; the site retains restrained articulated 2.5D motion. Advanced film-style walking remains a limitation.

Reverse-scroll regression: the invitation no longer locks body scrolling. An upward wheel gesture at the top of its content closes it; touch pull-down and the visible close/Escape paths also return to the story. Scroll-driven opening reverses naturally when the guest scrolls above the envelope reveal. Failed 3D initialization can retry on a chapter change instead of remaining permanently caught after a transient asset error.

Mobile viewport and attendance update: the visible scene now uses dynamic viewport height, while its scroll track keeps a stable small-viewport step. A regression test expands/collapses the simulated browser chrome and verifies that the chapter and invitation navigation remain stable. Added tests for the exact WhatsApp recipient, the fixed confirmation message and its emoji code points, and the standalone downloadable portrait card. The card was rendered and visually checked for full content and Arabic shaping.
