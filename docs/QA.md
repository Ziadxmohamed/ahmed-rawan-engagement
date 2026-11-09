# Verification record

Passed locally:

- 39 automated tests across event timing/calendar/sharing, scroll mapping and UI behavior.
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

Later refinements: removed the top-right control group, separated the couple to prevent silhouette overlap, removed the RSVP section, added a persistent close button with a scrolling-unlock regression test, and replaced the repeating synth with a 54-second original piano/strings composition. Audio asset validation reports stereo AAC at 44.1 kHz and exactly 54 seconds; a final listening pass could not be performed through the unavailable browser tools. Attempts to generate authored walking-frame atlases were rejected by the image tool and produced no usable assets; the site retains restrained articulated 2.5D motion. Advanced film-style walking remains a limitation.

Invitation dismissal (updated at the user's request): the card stays open through upward wheel gestures, touch pull-down, Escape and attempted page scrolls. The page position is frozen with a fixed body, internal overscroll is contained, and background controls are inert. Only × dismisses it; original body/document styles and story scrolling are restored afterward. Regression coverage includes automatically opened cards, repeated open/close cycles and keyboard focus wrapping.

Mobile viewport and attendance update: the visible scene now uses dynamic viewport height, while its scroll track keeps a stable small-viewport step. A regression test expands/collapses the simulated browser chrome and verifies that the chapter and invitation navigation remain stable. Added tests for the exact WhatsApp recipient, the fixed confirmation message and its emoji code points, and the standalone downloadable portrait card. The card was rendered and visually checked for full content and Arabic shaping.

The new sharing domain is `ahmed-rawan2026.pages.dev`. The heart QR export is decoded from the complete rendered 1600 × 1800 PNG during every build; publication fails if the decoded URL differs from the configured invitation URL. Original projects remain intact.

Mobile speech refinement: 3D speech panels are measured with ResizeObserver and clamped inside the canvas with 16px side margins. The tail follows the projected speaker without pushing text outside the screen. The lightweight fallback places bubbles within the complete cast width, rather than centering overflowing bubbles on edge characters. Geometry tests cover 320, 360, 390, 600 and 1440px widths and tall dialogue on a short viewport.

Current browser review: Chrome's mobile emulation opened the invitation automatically. An upward scroll and Escape left it open, and clicking × returned to the envelope. Subsequent visual screenshots were unreliable and native UI controls reported offscreen elements, so a final visual certification of the corrected bubble and physical-device touch scrolling remains unavailable. The automated checks cover these interaction rules and safe bubble geometry.

The heart QR now uses burgundy QR-style modules to form the complete heart silhouette on ivory. Its central data matrix remains intact; surrounding modules are decorative. The finished PNG is decoded at 1600, 1000, 700 and 480px widths, plus a 700px JPEG at quality 75 rotated 7 degrees. Every check must return the canonical invitation URL before the export is written.

Apple Vision independently decoded the final full-size PNG to `https://ahmed-rawan2026.pages.dev/`. This is a local image-decoder check, not a physical phone camera test.

Automatic music update: autoplay is attempted when the app mounts, then retried directly inside page activation handlers if blocked. A dedicated play button is no longer required. Regression tests cover initial autoplay, a blocked first touch, a later accepted tap, a still-pending initial request, visibility pause/resume, intentional mute, recoverable failure and listener cleanup. Mute is available in the footer and inside the modal invitation. Chrome initially displayed the tap hint, then reported “Audio playing” after an ordinary page interaction and exposed the mute control; no music start control was clicked. Playback on physical iOS/Android hardware has not been tested. Browser restrictions can still require a tap rather than a scroll gesture.
