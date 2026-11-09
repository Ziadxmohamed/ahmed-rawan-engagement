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
import { event } from "../src/config";
import Invitation from "../src/components/Invitation";
import axe from "axe-core";
import {
  chapterStart,
  segmentLengths,
  journeyLength,
} from "../src/lib/journey";
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
  it("keeps the same chapter when mobile browser chrome expands or collapses", async () => {
    render(<App />);
    const root = document.querySelector(".story-journey")!;
    const stage = document.querySelector(".journey-viewport")!;
    let screenHeight = 700;
    const unit = 600,
      position = (chapterStart(2) + 0.1) * unit;
    Object.defineProperty(stage, "clientHeight", {
      get: () => screenHeight,
      configurable: true,
    });
    vi.spyOn(root, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          top: -position,
          height: journeyLength * unit + screenHeight,
        }) as DOMRect,
    );
    fireEvent.scroll(window);
    expect(
      await screen.findByRole("heading", { name: "Right where we belong." }),
    ).toBeTruthy();
    screenHeight = 800;
    fireEvent.resize(window);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Right where we belong." }),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: "The invitation" }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: -position + (chapterStart(5) + 0.04) * unit,
      behavior: "instant",
    });
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
  it("opens the fixed attendance confirmation in WhatsApp for the supplied number", () => {
    render(<Invitation onReplay={() => {}} />);
    const link = screen.getByRole("link", { name: /إرسال تأكيد الحضور/ });
    const url = new URL(link.getAttribute("href")!);
    expect(url.hostname).toBe("api.whatsapp.com");
    expect(url.searchParams.get("phone")).toBe("201117584007");
    expect(url.searchParams.get("text")).toBe(event.confirmationMessage);
    expect(url.searchParams.get("text")).toContain(
      String.fromCodePoint(0x1f90d),
    );
    expect(url.searchParams.get("text")).toContain(
      String.fromCodePoint(0x1f48d),
    );
    expect(url.searchParams.get("text")).toContain(
      String.fromCodePoint(0x2728),
    );
    expect(link.getAttribute("href")).not.toContain("%EF%BF%BD");

    expect(url.searchParams.get("text")).toContain(
      "بأكّد حضوري لخطوبة أحمد وروان",
    );
    expect(link.getAttribute("target")).toBe("_blank");
  });
  it("downloads a standalone high-resolution invitation card", () => {
    render(<Invitation onReplay={() => {}} />);
    const link = screen.getByRole("link", { name: /تنزيل كارت الدعوة/ });
    expect(link.getAttribute("href")).toBe("/invitation-card.png");
    expect(link.getAttribute("download")).toBe("ahmed-rawan-invitation.png");
  });
  it("omits the RSVP section from the invitation", () => {
    render(<Invitation onReplay={() => {}} />);
    expect(screen.queryByRole("button", { name: /My RSVP/ })).toBeNull();
    expect(
      screen.queryByText("Will you be part of our next chapter?"),
    ).toBeNull();
  });
  it("closes the invitation with a visible control and restores page scrolling", async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("link", { name: "Read the invitation directly" }),
    );
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(
      await screen.findByRole("button", { name: "Close invitation" }),
    );
    expect(
      screen.queryByRole("heading", { name: "Ahmed & Rawan", level: 2 }),
    ).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("keeps the card open through wheel, touch and Escape until X is pressed", async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("link", { name: "Read the invitation directly" }),
    );
    const card = document.querySelector(".invitation-overlay")!;
    expect(
      screen.getByRole("dialog", { name: "Engagement invitation" }),
    ).toBeTruthy();
    expect(document.body.style.position).toBe("fixed");
    fireEvent.wheel(card, { deltaY: -90 });
    fireEvent.touchStart(card, { touches: [{ clientY: 200 }] });
    fireEvent.touchMove(card, { touches: [{ clientY: 270 }] });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Close invitation" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Back to the story" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Explore our story again/ }),
    ).toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Close invitation" }));
    expect(document.body.style.position).not.toBe("fixed");
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(
      screen.queryByRole("dialog", { name: "Engagement invitation" }),
    ).toBeNull();
  });
  it("holds an automatically opened card even if the page receives a scroll event", async () => {
    render(<App />);
    const root = document.querySelector(".story-journey")!;
    const geometry = vi.spyOn(root, "getBoundingClientRect");
    geometry.mockReturnValue({
      top: -(chapterStart(5) + segmentLengths[6] * 0.96) * 800,
    } as DOMRect);
    fireEvent.scroll(window);
    await screen.findByRole("button", { name: "Close invitation" });
    geometry.mockReturnValue({ top: -chapterStart(2) * 800 } as DOMRect);
    fireEvent.scroll(window);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(
      screen.getByRole("button", { name: "Close invitation" }),
    ).toBeTruthy();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Close invitation" }));
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("restores the original page styles after closing and can open again", () => {
    document.body.style.margin = "3px";
    document.documentElement.style.scrollPaddingTop = "9px";
    render(<App />);
    const open = () =>
      fireEvent.click(
        screen.getByRole("link", { name: "Read the invitation directly" }),
      );
    open();
    expect(document.documentElement.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Close invitation" }));
    expect(document.body.style.margin).toBe("3px");
    expect(document.documentElement.style.scrollPaddingTop).toBe("9px");
    expect(document.documentElement.style.overflow).toBe("");
    open();
    expect(document.body.style.position).toBe("fixed");
    fireEvent.click(screen.getByRole("button", { name: "Close invitation" }));
    expect(document.body.style.position).toBe("");
    document.body.style.removeProperty("margin");
    document.documentElement.style.removeProperty("scroll-padding-top");
  });
  it("keeps keyboard focus within the card while the background is locked", () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("link", { name: "Read the invitation directly" }),
    );
    const close = screen.getByRole("button", { name: "Close invitation" });
    const share = screen.getByRole("button", { name: "Share Invitation" });
    close.focus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(share);
    fireEvent.keyDown(share, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    expect(
      document.querySelector(".journey-header")?.hasAttribute("inert"),
    ).toBe(true);
    expect(document.querySelector(".site-footer")?.hasAttribute("inert")).toBe(
      true,
    );
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
