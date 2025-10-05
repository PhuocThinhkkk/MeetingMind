import { useEffect, useState } from "react";

/**
 *
 * Displays a time (in "hh:mm AM/PM" format) from a given ISO date string.
 * This component formats the date on the client only,
 * preventing SSR hydration mismatches caused by timezone differences.
 *
 * @example
 * ```tsx
 * <TimeDisplay dateString="2023-10-05T14:48:00.000Z" />
 * // Renders "02:48 PM" in a UTC-4 local timezone.
 * ```
 *
 * @param dateString - The ISO date string to format and display.
 * @returns A <span> element with the formatted local time.
 */
export default function TimeDisplay({ dateString }: { dateString: string }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const date = new Date(dateString);
    const formatted = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTime(formatted);
  }, [dateString]);

  return <span>{time}</span>;
}
