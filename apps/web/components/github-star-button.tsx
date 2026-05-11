"use client";

import { useEffect, useState } from "react";

const REPO = "meenakshi0786-svg/anything-api";
const REPO_URL = `https://github.com/${REPO}`;

export function GitHubStarButton({ compact = false }: { compact?: boolean }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    // Cache for 5 minutes in sessionStorage to avoid hitting GitHub rate limits
    const cached = typeof window !== "undefined"
      ? sessionStorage.getItem("afa_gh_stars")
      : null;
    if (cached) {
      try {
        const { count, expiresAt } = JSON.parse(cached);
        if (Date.now() < expiresAt) {
          setStars(count);
          return;
        }
      } catch {}
    }

    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => r.json())
      .then((data) => {
        const count = data.stargazers_count ?? 0;
        setStars(count);
        try {
          sessionStorage.setItem(
            "afa_gh_stars",
            JSON.stringify({ count, expiresAt: Date.now() + 300_000 })
          );
        } catch {}
      })
      .catch(() => {});
  }, []);

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm transition hover:border-gray-600 hover:bg-gray-800 ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      <svg className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
      <span className="font-medium text-white">Star on GitHub</span>
      {stars !== null && (
        <>
          <div className={`h-3 w-px bg-gray-700 ${compact ? "mx-0.5" : "mx-1"}`} />
          <span className="flex items-center gap-1 text-gray-300 group-hover:text-yellow-400">
            <svg className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
          </span>
        </>
      )}
    </a>
  );
}
