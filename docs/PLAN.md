# Final interaction specification

The supplied master brief plus the subsequent Arabic direction define the implementation:

- Full-viewport story controlled by forward and reverse scroll, rather than timed playback in a framed player.
- Original animated-film-style fictional characters with lightweight articulated 2.5D motion. Ahmed and Rawan align below their names in the introduction. Supporting characters are Omar and Youssef.
- Named speech bubbles attach above the active speaker and fit within the viewport with safe margins, including the final left-edge speaker; Rawan's message comes from a clearly marked phone.
- An enlarged rings sequence shows a visible interlocking path, then luminous A and R initials. The final character pose joins the couple's hands.
- Scroll opens the envelope, raises the card and enlarges the readable invitation in place. There is no jump to another page section. The completed invitation scrolls internally while the main page is locked. Only the persistent × closes the card and restores the story position; wheel, touch, Escape, the monogram and replay cannot dismiss it.
- The invitation is general, with no guest-name addressing. The event remains November 13, 2026, 8 PM Cairo time, at the exact supplied map coordinates.
- Google Calendar opens a prefilled event; Apple/other calendars can consume the inline ICS file. Platform-specific native app handoff cannot be guaranteed from every browser.
- RSVP has been removed at the user’s request. The invitation has a persistent × close button that restores page scrolling. Audio is original and begins only with explicit interaction.

Verification: meaningful utility, scroll-flow and interface tests, structural axe checks, TypeScript and a production build. Browser access became unreliable during visual review; live GPU animation, final mobile layout and native calendar handoff need device review and must not be reported as fully certified.

## Mobile dialogue and modal refinement

1. Fit measured 3D dialogue panels to screen edges and move their tails toward the speaker; keep fallback dialogue within its cast container. Check left/right anchors at widths 320, 360, 390, 600 and 1440.
2. Latch the invitation open, freeze page position, contain internal scrolling and focus, and restore styles and story position after ×. Check direct and scroll-driven opening, wheel/touch/Escape persistence, repeat opening, and focus wrapping.
3. Run the full test suite, TypeScript and production build; inspect browser states where available, then publish and compare deployed asset bytes.
