import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Heart,
  RotateCcw,
  Volume2,
  VolumeX,
  Wind,
  X,
} from "lucide-react";
import gsap from "gsap";
import { event } from "./config";
import {
  chapterStart,
  journeyAt,
  journeyLength,
  segmentLengths,
  scrollUnit,
} from "./lib/journey";
import { InvitationAudio } from "./lib/audio";
import { scenes } from "./story";
import Invitation from "./components/Invitation";
import SceneFallback from "./components/SceneFallback";
const World = lazy(() => import("./three/World"));
class WorldBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(
    previous: Readonly<{
      children: ReactNode;
      fallback: ReactNode;
      resetKey: string;
    }>,
  ) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey)
      this.setState({ failed: false });
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function App() {
  const [pose, setPose] = useState(() => journeyAt(0)),
    [music, setMusic] = useState(false),
    [audioError, setAudioError] = useState(""),
    [invited, setInvited] = useState(false);
  const [failed, setFailed] = useState(
    () => new URLSearchParams(window.location.search).get("lite") === "1",
  );
  const [reduced, setReduced] = useState(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [visible, setVisible] = useState(!document.hidden),
    [onStage, setOnStage] = useState(true);
  const returnPoint = useRef(0),
    openedByScroll = useRef(false),
    cardTouch = useRef(0);
  const audio = useRef<InvitationAudio | null>(null),
    journey = useRef<HTMLElement>(null),
    viewport = useRef<HTMLDivElement>(null),
    copy = useRef<HTMLDivElement>(null);
  const [introAnchors, setIntroAnchors] = useState({
    ahmed: 0.32,
    rawan: 0.68,
  });
  const intro = pose.phase === "intro",
    story = pose.phase === "story",
    envelope = pose.phase === "envelope",
    current = scenes[pose.scene],
    line = current.lines[pose.line];
  useEffect(() => {
    if (!intro) return;
    const measure = () => {
      const a = document
          .querySelector("[data-couple-name=ahmed]")
          ?.getBoundingClientRect(),
        r = document
          .querySelector("[data-couple-name=rawan]")
          ?.getBoundingClientRect();
      if (a?.width && r?.width)
        setIntroAnchors({
          ahmed: (a.left + a.width / 2) / window.innerWidth,
          rawan: (r.left + r.width / 2) / window.innerWidth,
        });
    };
    const frame = requestAnimationFrame(measure);
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [intro]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReduced(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const root = journey.current,
        stage = viewport.current;
      if (!root || !stage) return;
      const bounds = root.getBoundingClientRect();
      const position =
        -bounds.top / scrollUnit(bounds.height, stage.clientHeight);
      setPose(journeyAt(position));
      setOnStage(position <= journeyLength + 0.8);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);
  useEffect(() => {
    const listener = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, []);
  useEffect(
    () => () => {
      audio.current?.dispose();
    },
    [],
  );
  useEffect(() => {
    if (!visible) audio.current?.pause();
    else if (music)
      void audio.current?.play().catch(() => {
        setMusic(false);
        setAudioError("Audio is unavailable in this browser.");
      });
  }, [visible, music]);
  useEffect(() => {
    if (story && pose.announcement) audio.current?.chime();
  }, [story, pose.scene, pose.announcement]);
  useEffect(() => {
    if (reduced || !copy.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        copy.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
    });
    return () => ctx.revert();
  }, [pose.phase, pose.scene, reduced]);
  function goTo(position: number, smooth = true) {
    const root = journey.current,
      stage = viewport.current;
    if (!root || !stage) return;
    const bounds = root.getBoundingClientRect();
    const top =
      window.scrollY +
      bounds.top +
      position * scrollUnit(bounds.height, stage.clientHeight);
    window.scrollTo({
      top,
      behavior: smooth && !reduced ? "smooth" : "instant",
    });
  }
  function start() {
    if (!music) void toggleMusic();
    goTo(chapterStart(0), false);
  }
  function replay() {
    setInvited(false);
    setPose(journeyAt(0));
    goTo(0, false);
  }
  function skip() {
    goTo(chapterStart(5) + 0.04, false);
  }
  const read = useCallback(() => {
    const root = journey.current,
      stage = viewport.current;
    const bounds = root?.getBoundingClientRect();
    const position =
      bounds && stage
        ? -bounds.top / scrollUnit(bounds.height, stage.clientHeight)
        : 0;
    returnPoint.current = Math.max(
      0,
      Math.min(position, chapterStart(5) + 0.55),
    );
    openedByScroll.current = false;
    setInvited(true);
  }, []);
  function closeCard() {
    const target = returnPoint.current;
    setInvited(false);
    setPose(journeyAt(target));
    goTo(target, false);
  }
  useEffect(() => {
    if (!invited) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]"))
        closeCard();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [invited]);
  useEffect(() => {
    document.body.style.removeProperty("overflow");
  }, []);
  useEffect(() => {
    if (
      invited &&
      openedByScroll.current &&
      (!envelope || pose.progress < 0.8)
    ) {
      setInvited(false);
      openedByScroll.current = false;
    }
  }, [invited, envelope, pose.progress]);
  function nextBeat() {
    if (intro) {
      start();
      return;
    }
    if (envelope) {
      read();
      return;
    }
    const beatSize = 0.82 / current.lines.length,
      next = pose.announcement
        ? 1.01
        : pose.line === current.lines.length - 1
          ? 0.86
          : (pose.line + 1.05) * beatSize;
    goTo(
      chapterStart(pose.scene) + next * segmentLengths[pose.scene + 1],
      true,
    );
  }
  async function toggleMusic() {
    if (music) {
      audio.current?.pause();
      setMusic(false);
    } else {
      try {
        audio.current?.dispose();
        audio.current = new InvitationAudio();
        await audio.current.play();
        setMusic(true);
        setAudioError("");
      } catch {
        setAudioError("Audio is unavailable. The whole story is subtitled.");
      }
    }
  }
  const openProgress = envelope
    ? Math.max(0, Math.min(1, (pose.progress - 0.1) / 0.75))
    : 0;
  useEffect(() => {
    if (envelope && pose.progress >= 0.94 && !invited) {
      returnPoint.current = chapterStart(5) + 0.55;
      openedByScroll.current = true;
      setInvited(true);
    }
  }, [envelope, pose.progress, invited]);
  const cardReveal = invited
    ? 1
    : envelope
      ? Math.max(0, Math.min(1, (pose.progress - 0.65) / 0.29))
      : 0;
  const ringFocus = intro
    ? Math.max(0, Math.min(1, (pose.progress - 0.28) / 0.22))
    : 0;
  const fallback = (
    <SceneFallback
      envelope={envelope}
      open={openProgress > 0.5}
      scene={pose.scene}
      dialogue={story && !pose.announcement ? line : null}
      reduced={reduced}
      intro={intro}
      progress={pose.progress}
    />
  );
  return (
    <>
      <a
        className="skip-link"
        href="#invitation"
        onClick={(e) => {
          e.preventDefault();
          read();
        }}
      >
        Read the invitation directly
      </a>
      <header
        className={`journey-header ${invited && pose.phase === "envelope" && pose.progress > 0.99 ? "on-paper" : ""}`}
      >
        <a
          className="monogram"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            replay();
          }}
          aria-label="Ahmed and Rawan home"
        >
          A<span>&</span>R
        </a>
        <span className="header-title">OUR NEXT CHAPTER</span>
      </header>
      <main id="main" className={reduced ? "reduced-motion" : ""}>
        <section
          ref={journey}
          className={`story-journey ${invited ? "journey-finished" : ""}`}
          style={{
            height: `calc(${journeyLength} * var(--story-step) + var(--story-screen))`,
          }}
          aria-label="A love story you explore by scrolling"
        >
          <div
            ref={viewport}
            className={`journey-viewport phase-${pose.phase} ${invited ? "invitation-open" : ""} ${ringFocus > 0.2 ? "rings-focus" : ""}`}
          >
            <svg
              key={`backdrop-${intro ? "intro" : pose.scene}`}
              className="scene-backdrop"
              viewBox={`${(intro || pose.scene === 2 || pose.scene === 4 || envelope ? 0 : pose.scene === 1 || pose.scene === 3 ? 1 : 0) * 836} ${(intro || pose.scene >= 2 || envelope ? 1 : 0) * 470.5} 836 470.5`}
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              style={{
                transform: reduced
                  ? "none"
                  : `scale(${1.03 + pose.progress * 0.035}) translateX(${(pose.progress - 0.5) * -0.6}%)`,
              }}
            >
              <image href="/environments.webp" width="1672" height="941" />
            </svg>
            <div
              className="immersive-world"
              aria-hidden="true"
              style={{ opacity: 1 - cardReveal * 0.7 }}
            >
              {failed || !visible || !onStage ? (
                fallback
              ) : (
                <WorldBoundary
                  fallback={fallback}
                  resetKey={`${pose.phase}-${pose.scene}`}
                >
                  <Suspense fallback={fallback}>
                    <World
                      scene={pose.scene}
                      mode={story || intro ? "story" : "envelope"}
                      talking={
                        story && !pose.announcement ? line.character : ""
                      }
                      reduced={reduced || invited}
                      open={openProgress > 0}
                      openProgress={openProgress}
                      progress={pose.progress}
                      intro={intro}
                      introAnchors={introAnchors}
                      dialogue={story && !pose.announcement ? line : null}
                      onOpen={envelope ? read : () => {}}
                      onFailure={() => setFailed(true)}
                    />
                  </Suspense>
                </WorldBoundary>
              )}
            </div>
            <div className="cinematic-shade" aria-hidden="true" />
            <div
              className="chapter-copy"
              ref={copy}
              key={`${pose.phase}-${pose.scene}`}
              style={{
                opacity: invited ? 0 : intro ? 1 - ringFocus : 1 - cardReveal,
                visibility: invited ? "hidden" : "visible",
              }}
            >
              {intro ? (
                <>
                  <p className="eyebrow">
                    EVERY BEAUTIFUL FOREVER HAS A BEGINNING
                  </p>
                  <p className="intro-script">And so begins…</p>
                  <h1>
                    <b data-couple-name="ahmed">{event.groom}</b> <span>&</span>{" "}
                    <b data-couple-name="rawan">{event.bride}</b>
                  </h1>
                  <p className="intro-chapter">Our next chapter.</p>
                  <p className="intro-arabic" lang="ar" dir="rtl">
                    حكاية حب… وإنتوا جزء منها.
                  </p>
                </>
              ) : story ? (
                <>
                  <p className="eyebrow">
                    CHAPTER 0{pose.scene + 1} <span>/</span> 05
                  </p>
                  <h2>
                    {current.title}
                    <em>.</em>
                  </h2>
                  <p className="chapter-aside">
                    {
                      [
                        "Some news is too good to keep.",
                        "A perfect suit. A racing heart.",
                        "Exactly where we’re meant to be.",
                        "A little dream of our tomorrow.",
                        "The best moments are the ones we share.",
                      ][pose.scene]
                    }
                  </p>
                </>
              ) : (
                <>
                  <p className="eyebrow">THE NEXT CHAPTER IS OURS TO SHARE</p>
                  <h2>
                    Sealed with <em>love.</em>
                  </h2>
                  <p className="envelope-subtitle">Of Course You’re Invited!</p>
                </>
              )}
            </div>
            {intro && ringFocus > 0 && (
              <div className="ring-moment-copy" style={{ opacity: ringFocus }}>
                <span className="eyebrow">TWO HEARTS. ONE PROMISE.</span>
                <p>A beautiful kind of forever.</p>
              </div>
            )}
            {story && (
              <div
                className="scroll-dialogue-area"
                aria-live="polite"
                aria-atomic="true"
              >
                {pose.announcement ? (
                  <div className="scroll-announcement" key={`a-${pose.scene}`}>
                    <span
                      className={pose.scene === 1 ? "arabic-message" : ""}
                      dir={pose.scene === 1 ? "rtl" : undefined}
                    >
                      {current.caption}
                    </span>
                    <strong>{current.announcement}</strong>
                  </div>
                ) : (
                  <div className="sr-only" key={`${pose.scene}-${pose.line}`}>
                    <span>{line.speaker}</span>
                    <p lang="ar" dir="rtl">
                      {line.text}
                    </p>
                  </div>
                )}
              </div>
            )}
            {envelope && (
              <div className="envelope-actions">
                <p className="auto-open-note" lang="ar" dir="rtl">
                  كمّل نزول… دعوتكم بتتفتح.
                </p>
                <button className="text-link" onClick={read}>
                  Read invitation directly
                </button>
              </div>
            )}
            <div className="journey-bottom">
              <span className="journey-date">
                {event.dateParts.short} <i /> {event.timeLabel} · CAIRO
              </span>
              {!envelope && (
                <button className="scroll-prompt" onClick={nextBeat}>
                  <span lang="ar" dir="rtl">
                    {intro
                      ? "انزل لتحت… الحكاية بتبدأ"
                      : "كمّل نزول… الحكاية لسه مخلصتش"}
                  </span>
                  <ArrowDown size={19} />
                  <small>
                    {intro ? "SCROLL TO BEGIN" : "SCROLL TO CONTINUE"}
                  </small>
                </button>
              )}
              <span className="journey-signature">
                A LITTLE LAUGHTER.
                <br />A LIFETIME OF LOVE.
              </span>
            </div>
            <div
              className="journey-progress"
              role="progressbar"
              aria-label="Story progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(
                Math.min(
                  100,
                  (((intro ? 0 : envelope ? 6 : pose.scene + 1) +
                    pose.progress) /
                    7) *
                    100,
                ),
              )}
            >
              <span
                style={{
                  height: `${Math.min(100, (((intro ? 0 : envelope ? 6 : pose.scene + 1) + pose.progress) / 7) * 100)}%`,
                }}
              />
            </div>
            {invited && (
              <button
                className="invitation-close"
                aria-label="Close invitation"
                aria-controls="invitation"
                title="Close invitation"
                onClick={closeCard}
              >
                <X size={21} />
              </button>
            )}
            {(invited || cardReveal > 0) && (
              <div
                className={`invitation-overlay ${invited ? "fully-open" : ""}`}
                onWheel={(e) => {
                  if (e.deltaY < 0 && e.currentTarget.scrollTop <= 1)
                    closeCard();
                }}
                onTouchStart={(e) => {
                  cardTouch.current = e.touches[0]?.clientY ?? 0;
                }}
                onTouchMove={(e) => {
                  if (
                    e.currentTarget.scrollTop <= 1 &&
                    (e.touches[0]?.clientY ?? 0) - cardTouch.current > 16
                  )
                    closeCard();
                }}
                style={{
                  opacity: cardReveal,
                  transform: reduced
                    ? "none"
                    : `translateY(${(1 - cardReveal) * 150}px) scale(${0.42 + 0.58 * cardReveal})`,
                  pointerEvents: cardReveal > 0.98 ? "auto" : "none",
                }}
                aria-hidden={cardReveal < 0.98}
              >
                <Invitation
                  embedded
                  active={cardReveal > 0.98}
                  onReplay={replay}
                />
                <button
                  className="invitation-back text-link"
                  onClick={closeCard}
                >
                  Back to the story
                </button>
              </div>
            )}
            {audioError && (
              <p className="audio-status" role="status">
                {audioError}
              </p>
            )}
          </div>
          {/* All dialogue also remains available to screen readers without canvas support. */}
          <div className="sr-only" aria-label="Complete story transcript">
            {scenes.map((scene) => (
              <section key={scene.title}>
                <h2>{scene.title}</h2>
                {scene.lines.map((line, i) => (
                  <p key={i} lang="ar" dir="rtl">
                    {line.speaker}: {line.text}
                  </p>
                ))}
                <p>
                  {scene.announcement} {scene.caption}
                </p>
              </section>
            ))}
          </div>
        </section>

        <footer className={`site-footer ${invited ? "" : "before-invitation"}`}>
          <span>WITH LOVE, AHMED & RAWAN</span>
          <span>
            THE FIRST PAGE OF OUR FOREVER <Heart size={11} />
          </span>
          <button className="text-link" onClick={() => setFailed((v) => !v)}>
            {failed ? "Use 3D view" : "Use illustrated view"}
          </button>
          <button className="text-link" onClick={replay}>
            <RotateCcw size={12} /> Replay Story
          </button>
          <div className="footer-controls">
            <button
              className="motion-toggle"
              onClick={() => setReduced((v) => !v)}
              aria-label={reduced ? "Enable animation" : "Reduce motion"}
              aria-pressed={reduced}
              title={reduced ? "Animation reduced" : "Reduce motion"}
            >
              <Wind size={18} />
            </button>
            <button
              className="music-toggle"
              onClick={toggleMusic}
              aria-pressed={music}
              aria-label={`Music ${music ? "on" : "off"}`}
              title={`Turn music ${music ? "off" : "on"}`}
            >
              {music ? <Volume2 size={17} /> : <VolumeX size={17} />}
              <span>Sound {music ? "on" : "off"}</span>
            </button>
            <button
              className="header-invitation"
              onClick={invited ? read : skip}
            >
              The invitation <ArrowUpRight size={14} />
            </button>
          </div>
        </footer>
      </main>
    </>
  );
}
