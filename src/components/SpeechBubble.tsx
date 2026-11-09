import { MessageCircle } from "lucide-react";
export default function SpeechBubble({
  name,
  text,
  phone = false,
  side = "left",
}: {
  name: string;
  text: string;
  phone?: boolean;
  side?: "left" | "right";
}) {
  return (
    <div
      className={`character-bubble ${phone ? "phone-bubble" : ""} tail-${side}`}
      key={text}
    >
      <span className="bubble-name" lang="ar" dir="rtl">
        {phone && <MessageCircle size={13} />} {phone ? "رسالة من روان" : name}
      </span>
      <p lang="ar" dir="rtl">
        {text}
      </p>
      {phone && (
        <small lang="ar" dir="rtl">
          إلى أحمد · الآن
        </small>
      )}
      <span className="bubble-tail" aria-hidden="true" />
    </div>
  );
}
