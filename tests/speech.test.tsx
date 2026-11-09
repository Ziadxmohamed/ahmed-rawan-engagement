// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Object3D, PerspectiveCamera } from "three";
import type { ComponentProps } from "react";
import type { Html } from "@react-three/drei";
import ScreenSpeech from "../src/three/ScreenSpeech";
const captured = vi.hoisted(() => ({
  props: {} as ComponentProps<typeof Html>,
}));
vi.mock("@react-three/drei", () => ({
  Html: (props: ComponentProps<typeof Html>) => {
    captured.props = props;
    return <div>{props.children}</div>;
  },
}));
it("fits the actual speech panel after it mounts and after it changes size", () => {
  let resize!: ResizeObserverCallback;
  const observe = vi.fn(),
    disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  const { container } = render(
    <ScreenSpeech
      position={[-3, 3, 0]}
      name="عمر"
      text="طب يا جماعة… إحنا معزومين ولا إيه؟!"
    />,
  );
  const panel = container.querySelector(".screen-speech")!;
  expect(observe).toHaveBeenCalledWith(panel);
  const object = new Object3D();
  object.position.set(-3, 3, 0);
  object.updateMatrixWorld();
  const camera = new PerspectiveCamera(45, 390 / 800, 0.1, 100);
  camera.position.z = 6;
  camera.updateMatrixWorld();
  const measure = (width: number) =>
    resize(
      [{ contentRect: { width, height: 140 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
  measure(215);
  expect(
    captured.props.calculatePosition!(object, camera, {
      width: 390,
      height: 800,
    })[0],
  ).toBe(123.5);
  measure(260);
  expect(
    captured.props.calculatePosition!(object, camera, {
      width: 390,
      height: 800,
    })[0],
  ).toBe(146);
  cleanup();
  expect(disconnect).toHaveBeenCalled();
  vi.unstubAllGlobals();
});
