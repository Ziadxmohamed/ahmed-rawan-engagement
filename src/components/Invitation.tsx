import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  Copy,
  Download,
  MapPin,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";
import { event } from "../config";
import {
  calendar,
  googleCalendarUrl,
  shareText,
  confirmationUrl,
} from "../lib/core";
import Countdown from "./Countdown";
function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Invitation({
  onReplay,
  embedded = false,
  active = true,
}: {
  onReplay: () => void;
  embedded?: boolean;
  active?: boolean;
}) {
  const [share, setShare] = useState(false),
    [copied, setCopied] = useState(false),
    [cal, setCal] = useState(false),
    [shareStatus, setShareStatus] = useState("");
  const calDialog = useRef<HTMLDialogElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (active) heading.current?.focus({ preventScroll: true });
  }, [active]);
  useEffect(() => {
    if (cal) calDialog.current?.showModal();
    else calDialog.current?.close();
  }, [cal]);
  useEffect(() => {
    if (share) dialog.current?.showModal();
    else dialog.current?.close();
  }, [share]);
  const url = window.location.origin + window.location.pathname;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setShareStatus("Copy the invitation link from the field below.");
    }
  }
  async function nativeShare() {
    try {
      if (navigator.share)
        await navigator.share({
          title: "Ahmed & Rawan",
          text: shareText(url),
          url,
        });
      else setShare(true);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setShare(true);
    }
  }
  return (
    <section
      className={`invitation-section ${embedded ? "embedded-invitation" : ""}`}
      id="invitation"
      aria-label="Your invitation"
    >
      <div className="section-kicker">
        <span />
        THE NEXT CHAPTER IS OURS TO SHARE
        <span />
      </div>
      <article className="invitation-paper">
        <div className="paper-ornament" aria-hidden="true">
          ✧
        </div>
        <p className="eyebrow">YOU ARE CORDIALLY INVITED</p>
        <p className="paper-intro">to celebrate the engagement of</p>

        <h2 ref={heading} tabIndex={-1}>
          {event.groom} <span>&</span> {event.bride}
        </h2>
        <p className="paper-script">Our next chapter begins with you.</p>
        <div className="invitation-date">
          <span>{event.dateParts.weekday.toUpperCase()}</span>
          <strong>{event.dateParts.day}</strong>
          <span>
            {event.dateParts.month.toUpperCase()}
            <br />
            {event.dateParts.year}
          </span>
        </div>
        <p className="event-time">
          {event.timeLabel} <span>· Cairo time</span>
        </p>
        <div className="fine-rule" />
        <p className="arabic-invite" lang="ar" dir="rtl">
          {event.arabic}
        </p>
        <p className="paper-tagline">{event.tagline}</p>
        <div className="invitation-actions">
          <a
            className="button primary"
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={17} /> View Location <ArrowUpRight size={16} />
          </a>
          <button className="button outline" onClick={() => setCal(true)}>
            <CalendarPlus size={17} /> Add to Calendar
          </button>
        </div>
        <div className="attendance-confirmation" lang="ar" dir="rtl">
          <a
            className="button primary attendance-confirm"
            href={confirmationUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} /> إرسال تأكيد الحضور{" "}
            <ArrowUpRight size={17} />
          </a>
          <p>هتفتح لك رسالة واتساب جاهزة لإرسالها.</p>
          <a
            className="button outline download-invitation-card"
            href="/invitation-card.png"
            download="ahmed-rawan-invitation.png"
          >
            <Download size={18} /> تنزيل كارت الدعوة
          </a>
        </div>
        <button
          className="text-link paper-share"
          onClick={() => setShare(true)}
        >
          <Share2 size={15} /> Share Invitation
        </button>
        <span className="paper-corner corner-tl" />
        <span className="paper-corner corner-tr" />
        <span className="paper-corner corner-bl" />
        <span className="paper-corner corner-br" />
      </article>
      <div className="awaiting">
        <p className="eyebrow">COUNTING THE MOMENTS UNTIL FOREVER</p>
        <Countdown />
        <p>Good company. Full hearts. A night to remember.</p>
      </div>
      {!embedded && (
        <button className="text-link replay-bottom" onClick={onReplay}>
          Explore our story again <ArrowUpRight size={15} />
        </button>
      )}
      <dialog
        ref={calDialog}
        className="modal calendar-modal"
        onCancel={() => setCal(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCal(false);
        }}
      >
        <button
          className="icon-button modal-close"
          aria-label="Close calendar options"
          onClick={() => setCal(false)}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">SAVE OUR LITTLE DATE</span>
        <h2>A lovely reason to make time.</h2>
        <p>
          {event.dateLabel}
          <br />
          {event.timeLabel} · Cairo time
        </p>
        <a
          className="button primary"
          href={googleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Calendar <ArrowUpRight size={17} />
        </a>
        <a className="button outline" href="/engagement.ics">
          Apple Calendar / iPhone <CalendarPlus size={17} />
        </a>
        <button
          className="text-link"
          onClick={() =>
            download(
              calendar(),
              "ahmed-rawan-engagement.ics",
              "text/calendar;charset=utf-8",
            )
          }
        >
          <Download size={15} /> Download for another calendar
        </button>
        <p className="calendar-note">
          Choose your calendar to review and save the event. On iPhone, open the
          invitation in Safari if your in-app browser does not show the calendar
          preview.
        </p>
      </dialog>
      <dialog
        ref={dialog}
        className="modal"
        onCancel={() => setShare(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShare(false);
        }}
      >
        <button
          className="icon-button modal-close"
          aria-label="Close sharing"
          onClick={() => setShare(false)}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">LOVE IS BETTER SHARED</span>
        <h2>Pass a little joy along.</h2>
        <p>Invite someone to the beginning of our next chapter.</p>
        <a
          className="button primary"
          href={`https://wa.me/?text=${encodeURIComponent(shareText(url))}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on WhatsApp <ArrowUpRight size={17} />
        </a>
        <button className="button outline" onClick={nativeShare}>
          <Share2 size={17} /> Share with another app
        </button>
        <label className="copy-label">
          Invitation link
          <input
            readOnly
            value={url}
            aria-label="Invitation link"
            onFocus={(e) => e.target.select()}
          />
        </label>
        <button className="text-link" onClick={copy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
          {copied ? "Link copied" : "Copy invitation link"}
        </button>
        <p role="status">{shareStatus}</p>
      </dialog>
    </section>
  );
}
