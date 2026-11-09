import { useCallback, useRef, type ComponentProps } from "react";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import SpeechBubble from "../components/SpeechBubble";
import { fitSpeechBubble } from "../lib/bubbles";

/** Project from the speaking character, then fit the measured speech panel to the screen. */
export default function ScreenSpeech({
  position,
  name,
  text,
  phone = false,
}: {
  position: [number, number, number];
  name: string;
  text: string;
  phone?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const dimensions = useRef({ width: 260, height: 150 });
  const projected = useRef(new Vector3());
  const observePanel = useCallback((node: HTMLDivElement | null) => {
    panel.current = node;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      dimensions.current = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const calculatePosition: NonNullable<
    ComponentProps<typeof Html>["calculatePosition"]
  > = (object, camera, screen) => {
    projected.current.setFromMatrixPosition(object.matrixWorld).project(camera);
    const anchor = {
      x: ((projected.current.x + 1) * screen.width) / 2,
      y: ((1 - projected.current.y) * screen.height) / 2,
    };
    const fitted = fitSpeechBubble(anchor, dimensions.current, screen);
    panel.current?.style.setProperty("--bubble-tail-x", `${fitted.tailX}px`);
    return [fitted.x, fitted.y];
  };
  return (
    <Html
      center
      position={position}
      calculatePosition={calculatePosition}
      zIndexRange={[8, 1]}
      style={{ pointerEvents: "none" }}
    >
      <div
        ref={observePanel}
        className={`screen-speech ${phone ? "screen-phone" : ""}`}
      >
        {phone ? (
          <div className="message-phone">
            <span className="phone-notch" />
            <SpeechBubble name={name} text={text} phone />
          </div>
        ) : (
          <SpeechBubble name={name} text={text} />
        )}
      </div>
    </Html>
  );
}
