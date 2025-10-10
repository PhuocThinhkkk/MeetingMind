import { useEffect, useState } from "react";

/**
 * Renders a local time string (e.g., "02:48 PM") from an ISO date string.
 *
 * Computes the display value on the client to avoid SSR timezone/hydration mismatches.
 *
 * @param dateString - ISO 8601 date string to format.
 * @returns A <span> element containing the formatted local time or "--:--" if the input is an invalid date.
 */
export default function TimeDisplay({ dateString }: { dateString: string }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      setTime("--:--");
      return;
    }
    const formatted = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTime(formatted);
  }, [dateString]);
  return <span>{time}</span>;
}