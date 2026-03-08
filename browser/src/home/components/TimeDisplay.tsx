import React, { useState, useEffect } from 'react';

function getGreeting(hour: number): string {
  if (hour >= 5 && hour <= 11) return 'Good morning.';
  if (hour >= 12 && hour <= 16) return 'Good afternoon.';
  return 'Good evening.';
}

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mins = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mins} ${ampm}`;
}

export function TimeDisplay() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Align to the next minute boundary for smoother updates
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      setNow(new Date());
      // After the first aligned tick, update every 60s
      intervalId = setInterval(() => {
        setNow(new Date());
      }, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-2 mb-10">
      <span
        className="text-5xl font-extralight tracking-tight"
        style={{ color: 'var(--chrome-text)' }}
      >
        {formatTime(now)}
      </span>
      <span
        className="text-lg font-light"
        style={{ color: 'var(--chrome-text-secondary)' }}
      >
        {getGreeting(now.getHours())}
      </span>
    </div>
  );
}
