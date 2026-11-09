// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "../src/App";
import Invitation from "../src/components/Invitation";
import axe from "axe-core";
import { chapterStart, segmentLengths } from "../src/lib/journey";
vi.mock("../src/three/World", () => ({
  default: () => <div data-testid="world" />,
}));
beforeEach(() => {
  window.history.replaceState({}, "", "/?guest=محمد");
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
    writable: true,
  });
  window.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    get: () => 800,
    configurable: true,
  });
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  URL.createObjectURL = vi.fn(() => "blob:test");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("the complete invitation flow", () => {
  it("starts as a full-screen scroll journey, stays general and skips to the envelope", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Ahmed & Rawan" })).toBeTruthy();
    expect(screen.queryByText(/Dear محمد/)).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Pause|Play scene/ }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "The invitation" }));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "instant",
    });
    await screen.findByTestId("world");
  });
  it("opens a readable invitation directly in lightweight mode", async () => {
    window.history.replaceState({}, "", "/?lite=1&guest=Mohamed");
    render(<App />);
    fireEvent.click(
      screen.getByRole("link", { name: "Read the invitation directly" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Ahmed & Rawan", level: 2 }),
    ).toBeTruthy();
    expect(screen.queryByText(/Dear Mohamed/)).toBeNull();
    expect(
      screen.getByRole("link", { name: /View Location/ }).getAttribute("href"),
    ).toBe("https://maps.google.com/?q=30.137796,31.370340");
  });
  it("downloads a calendar and offers a correctly encoded WhatsApp message", async () => {
    render(<Invitation onReplay={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Add to Calendar" }));
    const calendarLink = screen
      .getByRole("link", { name: /Google Calendar/ })
      .getAttribute("href")!;
    expect(calendarLink).toContain("calendar.google.com");
    expect(calendarLink).toContain("20261113T180000Z");
    expect(
      screen.getByRole("link", { name: /Apple Calendar/ }).getAttribute("href"),
    ).toBe("/engagement.ics");
    fireEvent.click(
      screen.getByRole("button", { name: "Close calendar options" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Share Invitation" }));
    const href = screen
      .getByRole("link", { name: /Share on WhatsApp/ })
      .getAttribute("href")!;
    expect(decodeURIComponent(href)).toContain("November 13, 2026");
    expect(decodeURIComponent(href)).toContain("8:00 PM (Cairo time)");
    expect(screen.getByRole("dialog").hasAttribute("open")).toBe(true);
  });
  it("saves only a local RSVP draft with explicit delivery status", () => {
    localStorage.clear();
    render(<Invitation onReplay={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /My RSVP plan/ }));
    fireEvent.change(screen.getByLabelText("Your name"), {
      target: { value: "محمد" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Save on this device/ }),
    );
    expect(localStorage.getItem("ahmed-rawan-rsvp-v1")).toContain("محمد");
    expect(
      screen.getByText(
        "Your plan is saved on this device only. It has not been sent to Ahmed & Rawan.",
      ),
    ).toBeTruthy();
  });
  it("has no structural accessibility violations in the readable invitation", async () => {
    const { container } = render(
      <main>
        <Invitation onReplay={() => {}} />
      </main>,
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
  it("opens the invitation automatically at the end of the scroll journey", async () => {
    render(<App />);
    const journey = document.querySelector(".story-journey")!;
    vi.spyOn(journey, "getBoundingClientRect").mockReturnValue({
      top: -(chapterStart(5) + segmentLengths[6] * 0.96) * 800,
    } as DOMRect);
    fireEvent.scroll(window);
    expect(
      await screen.findByRole("heading", { name: "Ahmed & Rawan", level: 2 }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Tap to Open/ })).toBeNull();
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(
      document
        .querySelector(".journey-viewport")
        ?.contains(document.getElementById("invitation")),
    ).toBe(true);
  });
  it("identifies Omar and Youssef in bubbles attached to their characters", async () => {
    window.history.replaceState({}, "", "/?lite=1");
    render(<App />);
    const journey = document.querySelector(".story-journey")!;
    const geometry = vi.spyOn(journey, "getBoundingClientRect");
    geometry.mockReturnValue({
      top: -(chapterStart(0) + 0.01) * 800,
    } as DOMRect);
    fireEvent.scroll(window);
    expect(
      await screen.findByText("عمر", { selector: ".bubble-name" }),
    ).toBeTruthy();
    geometry.mockReturnValue({
      top: -(chapterStart(0) + segmentLengths[1] * 0.3) * 800,
    } as DOMRect);
    fireEvent.scroll(window);
    expect(
      await screen.findByText("يوسف", { selector: ".bubble-name" }),
    ).toBeTruthy();
  });
  it("uses keyboard-accessible direct invitation and motion controls", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Reduce motion" }));
    expect(
      screen
        .getByRole("button", { name: "Enable animation" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    await waitFor(() =>
      expect(screen.getByText("انزل لتحت… الحكاية بتبدأ")).toBeTruthy(),
    );
  });
});
