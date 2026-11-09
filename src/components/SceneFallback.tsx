import type { Dialogue } from "../story";
import SpeechBubble from "./SpeechBubble";
export default function SceneFallback({
  envelope = false,
  open = false,
  scene = 2,
  dialogue = null,
  reduced = false,
  intro = false,
  progress = 0,
}: {
  envelope?: boolean;
  open?: boolean;
  scene?: number;
  dialogue?: Dialogue | null;
  reduced?: boolean;
  intro?: boolean;
  progress?: number;
}) {
  const cast =
    scene === 4
      ? ["friend"]
      : scene === 0
        ? ["friend", "other"]
        : scene === 1
          ? ["friend", "ahmed"]
          : ["ahmed", "rawan"];
  const positions: Record<string, string> = {
    ahmed: "0% 0%",
    rawan: "100% 0%",
    friend: "0% 100%",
    other: "100% 100%",
  };
  return (
    <div
      className={`fallback-art ${open ? "opened" : ""} ${reduced ? "still" : ""} ${intro && progress > 0.28 ? "show-fallback-rings" : ""}`}
      aria-hidden="true"
    >
      {intro && progress > 0.28 && (
        <div className="fallback-linked-rings">
          <i>A</i>
          <i>R</i>
        </div>
      )}
      {envelope ? (
        <>
          <div className="paper-envelope">
            <div className="paper-flap" />
            <span className="paper-seal">A&R</span>
          </div>
          <div className="fallback-rings">
            <i />
            <i />
          </div>
        </>
      ) : (
        <div
          className={`fallback-cast cast-${cast.length} ${scene === 4 ? "holding-finale" : ""}`}
        >
          {scene === 4 && (
            <img
              className="fallback-holding"
              src="/couple-holding.webp"
              alt=""
            />
          )}
          {cast.map((kind) => (
            <div
              className={`fallback-actor ${dialogue?.character === kind ? "speaking" : ""}`}
              key={kind}
            >
              <div
                className="fallback-character"
                style={{ backgroundPosition: positions[kind] }}
              />
            </div>
          ))}
          {dialogue && (
            <div
              className={`fallback-dialogue speaker-${dialogue.character === "other" || dialogue.character === "rawan" || (scene === 1 && dialogue.character === "ahmed") ? "right" : "left"}`}
            >
              <SpeechBubble
                name={dialogue.speaker}
                text={dialogue.text}
                phone={scene === 1 && dialogue.character === "rawan"}
                side={
                  dialogue.character === "other" ||
                  dialogue.character === "rawan"
                    ? "right"
                    : "left"
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
