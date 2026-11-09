import { useCallback, useEffect, useRef, useState } from "react";
import { InvitationAudio } from "./audio";

type MusicPhase =
  "starting" | "playing" | "blocked" | "paused" | "muted" | "unavailable";

/** Try autoplay, then call play directly inside an accepted browser interaction. */
export function useInvitationMusic() {
  const [phase, setPhase] = useState<MusicPhase>("starting");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [muted, setMuted] = useState(false);
  const actions = useRef({ toggleMute: () => {}, chime: () => {} });
  useEffect(() => {
    const audio = new InvitationAudio();
    let disposed = false,
      playing = false,
      intentionalMute = false;
    let pending = false,
      pendingGesture = false,
      request = 0;
    function attempt(fromGesture = false) {
      if (
        disposed ||
        intentionalMute ||
        document.hidden ||
        playing ||
        (pending && (!fromGesture || pendingGesture))
      )
        return;
      pending = true;
      pendingGesture = fromGesture;
      const current = ++request;
      // Do not defer this call to an effect, timer or awaited operation: Safari
      // requires play() itself to run within the user-activation handler.
      void audio
        .play()
        .then(() => {
          if (disposed || current !== request) return;
          pending = false;
          playing = true;
          setHasPlayed(true);
          setPhase("playing");
        })
        .catch((error: unknown) => {
          if (disposed || current !== request) return;
          pending = false;
          playing = false;
          setPhase(
            (error as { name?: string })?.name === "NotAllowedError"
              ? "blocked"
              : "unavailable",
          );
        });
    }
    function activate(event: Event) {
      if (
        event.type === "pointerdown" &&
        (event as PointerEvent).pointerType === "touch"
      )
        return;
      if (event.type === "keydown") {
        const key = event as KeyboardEvent;
        if (
          key.metaKey ||
          key.ctrlKey ||
          key.altKey ||
          ["Shift", "Control", "Alt", "Meta", "Escape"].includes(key.key)
        )
          return;
      }
      attempt(true);
    }
    function visibility() {
      if (document.hidden) {
        request++;
        pending = false;
        playing = false;
        audio.pause();
        setPhase(intentionalMute ? "muted" : "paused");
      } else attempt();
    }
    actions.current = {
      chime: () => audio.chime(),
      toggleMute: () => {
        intentionalMute = !intentionalMute;
        setMuted(intentionalMute);
        if (intentionalMute) {
          request++;
          pending = false;
          playing = false;
          audio.pause();
          setPhase("muted");
        } else attempt(true);
      },
    };
    const events = ["pointerdown", "pointerup", "touchend", "click", "keydown"];
    events.forEach((name) =>
      document.addEventListener(name, activate, {
        capture: true,
        passive: true,
      }),
    );
    document.addEventListener("visibilitychange", visibility);
    attempt();
    return () => {
      disposed = true;
      events.forEach((name) =>
        document.removeEventListener(name, activate, true),
      );
      document.removeEventListener("visibilitychange", visibility);
      audio.dispose();
    };
  }, []);
  const toggleMute = useCallback(() => actions.current.toggleMute(), []);
  const chime = useCallback(() => actions.current.chime(), []);
  return { phase, hasPlayed, muted, toggleMute, chime };
}
