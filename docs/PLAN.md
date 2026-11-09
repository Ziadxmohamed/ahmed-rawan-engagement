# Final interaction specification

The supplied master brief plus the subsequent Arabic direction define the implementation:

- Full-viewport story controlled by forward and reverse scroll, rather than timed playback in a framed player.
- Original animated-film-style fictional characters with lightweight articulated 2.5D motion. Ahmed and Rawan align below their names in the introduction. Supporting characters are Omar and Youssef.
- Named speech bubbles attach above the active speaker; Rawan's message comes from a clearly marked phone.
- An enlarged rings sequence shows a visible interlocking path, then luminous A and R initials. The final character pose joins the couple's hands.
- Scroll opens the envelope, raises the card and enlarges the readable invitation in place. There is no jump to another page section. The completed invitation can scroll internally; replay and returning to the story restore the main scroll.
- The invitation is general, with no guest-name addressing. The event remains November 13, 2026, 8 PM Cairo time, at the exact supplied map coordinates.
- Google Calendar opens a prefilled event; Apple/other calendars can consume the inline ICS file. Platform-specific native app handoff cannot be guaranteed from every browser.
- RSVP has been removed at the user’s request. The invitation has a persistent close button and Escape support that restore page scrolling. Audio is original and begins only with explicit interaction.

Verification: meaningful utility, scroll-flow and interface tests, structural axe checks, TypeScript and a production build. Browser access became unreliable during visual review; live GPU animation, final mobile layout and native calendar handoff need device review and must not be reported as fully certified.
