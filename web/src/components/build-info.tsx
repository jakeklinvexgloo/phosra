"use client";

import { useEffect, useState } from "react";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function BuildInfo() {
  const [ago, setAgo] = useState("");
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
  const env = process.env.NEXT_PUBLIC_BUILD_ENV ?? "development";
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 7);
  const branch = process.env.NEXT_PUBLIC_BUILD_BRANCH;

  useEffect(() => {
    if (!buildTime) return;
    setAgo(timeAgo(buildTime));
    const interval = setInterval(() => setAgo(timeAgo(buildTime)), 60000);
    return () => clearInterval(interval);
  }, [buildTime]);

  if (!buildTime) return null;

  const envColor =
    env === "production"
      ? "bg-green-600"
      : env === "preview"
        ? "bg-amber-500"
        : "bg-gray-500";

  return (
    <div className="fixed bottom-2 right-2 z-50 flex items-center gap-1.5 rounded-md border border-white/10 bg-black/80 px-2 py-1 font-mono text-[10px] text-white/60 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100 opacity-40">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${envColor}`} />
      <span className="uppercase font-medium">{env === "preview" ? "staging" : env}</span>
      {sha && <span className="text-white/30">·</span>}
      {sha && <span>{sha}</span>}
      {branch && <span className="text-white/30">·</span>}
      {branch && <span>{branch}</span>}
      <span className="text-white/30">·</span>
      <span>{ago}</span>
    </div>
  );
}
