// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  renderHook,
  waitFor,
} from "@testing-library/react";
import { useInvitationMusic } from "../src/lib/useInvitationMusic";
const media = vi.hoisted(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  dispose: vi.fn(),
  chime: vi.fn(),
  created: vi.fn(),
}));
vi.mock("../src/lib/audio", () => ({
  InvitationAudio: class {
    constructor() {
      media.created();
    }
    play = media.play;
    pause = media.pause;
    dispose = media.dispose;
    chime = media.chime;
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  media.play.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
});
afterEach(cleanup);
it("attempts music immediately when opening the invitation site", async () => {
  const { result } = renderHook(() => useInvitationMusic());
  expect(media.play).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(result.current.phase).toBe("playing"));
  expect(result.current.hasPlayed).toBe(true);
});
it("retries a blocked autoplay synchronously inside the first touch interaction", async () => {
  media.play.mockRejectedValueOnce(
    new DOMException("Gesture required", "NotAllowedError"),
  );
  const { result } = renderHook(() => useInvitationMusic());
  await waitFor(() => expect(result.current.phase).toBe("blocked"));
  fireEvent.touchEnd(document);
  expect(media.play).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(result.current.phase).toBe("playing"));
  fireEvent.click(document);
  expect(media.created).toHaveBeenCalledTimes(1);
  expect(media.play).toHaveBeenCalledTimes(2);
});
it("retains gesture retries if a browser rejects the first swipe", async () => {
  media.play
    .mockRejectedValueOnce(
      new DOMException("Gesture required", "NotAllowedError"),
    )
    .mockRejectedValueOnce(
      new DOMException("Swipe not accepted", "NotAllowedError"),
    );
  const { result } = renderHook(() => useInvitationMusic());
  await waitFor(() => expect(result.current.phase).toBe("blocked"));
  fireEvent.touchEnd(document);
  await act(async () => {});
  fireEvent.click(document);
  expect(media.play).toHaveBeenCalledTimes(3);
  await waitFor(() => expect(result.current.phase).toBe("playing"));
});
it("lets a real gesture retry even before the initial autoplay promise settles", async () => {
  media.play.mockImplementationOnce(() => new Promise(() => {}));
  const { result } = renderHook(() => useInvitationMusic());
  fireEvent.click(document);
  expect(media.play).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(result.current.phase).toBe("playing"));
});
it("pauses in a hidden tab, resumes on return, and honors an intentional mute", async () => {
  const { result } = renderHook(() => useInvitationMusic());
  await waitFor(() => expect(result.current.phase).toBe("playing"));
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  fireEvent(document, new Event("visibilitychange"));
  expect(media.pause).toHaveBeenCalled();
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  fireEvent(document, new Event("visibilitychange"));
  await waitFor(() => expect(media.play).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(result.current.phase).toBe("playing"));
  act(() => result.current.toggleMute());
  const calls = media.play.mock.calls.length;
  fireEvent.click(document);
  fireEvent(document, new Event("visibilitychange"));
  expect(media.play).toHaveBeenCalledTimes(calls);
  expect(result.current.muted).toBe(true);
  act(() => result.current.toggleMute());
  await waitFor(() => expect(result.current.phase).toBe("playing"));
});
it("recovers from a playback failure on the next interaction", async () => {
  media.play.mockRejectedValueOnce(new Error("Network failure"));
  const { result } = renderHook(() => useInvitationMusic());
  await waitFor(() => expect(result.current.phase).toBe("unavailable"));
  fireEvent.keyDown(document, { key: "ArrowDown" });
  expect(media.play).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(result.current.phase).toBe("playing"));
});
it("disposes audio and removes activation listeners on leaving the app", async () => {
  const { result, unmount } = renderHook(() => useInvitationMusic());
  await waitFor(() => expect(result.current.phase).toBe("playing"));
  unmount();
  const calls = media.play.mock.calls.length;
  fireEvent.touchEnd(document);
  expect(media.play).toHaveBeenCalledTimes(calls);
  expect(media.dispose).toHaveBeenCalledTimes(1);
});
