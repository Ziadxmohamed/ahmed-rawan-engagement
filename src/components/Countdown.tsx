import { useEffect, useState } from "react";
import { getCountdown } from "../lib/core";
export default function Countdown() {
  const [time, setTime] = useState(() => getCountdown());
  useEffect(() => {
    const id = setInterval(() => setTime(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);
  if (time.started)
    return (
      <p className="celebrating">
        The next chapter has begun. Let’s celebrate love.
      </p>
    );
  return (
    <div
      className="countdown"
      role="timer"
      aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes until the celebration`}
    >
      {(["days", "hours", "minutes", "seconds"] as const).map((key, i) => (
        <div className="time-unit" key={key}>
          {i > 0 && (
            <span className="time-separator" aria-hidden="true">
              :
            </span>
          )}
          <span className="time-value">
            {String(time[key]).padStart(2, "0")}
          </span>
          <span className="time-label">{key}</span>
        </div>
      ))}
    </div>
  );
}
