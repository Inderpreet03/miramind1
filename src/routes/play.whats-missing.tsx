import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell, ResultPanel } from "@/components/GameShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/play/whats-missing")({
  head: () => ({ meta: [{ title: "What's Missing | MiraMind" }] }),
  component: WhatsMissing,
});

const ITEMS = ["🌻", "🐦", "☕", "🍎", "🌳", "🎵", "🚲", "📚", "🧶", "🍰"];

function WhatsMissing() {
  const difficulty = useStore((s) => s.resident.difficulty);
  const showCount = Math.min(8, 3 + difficulty);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"study" | "guess">("study");
  const set = useMemo(
    () => [...ITEMS].sort(() => Math.random() - 0.5).slice(0, showCount),
    // `round` is a reshuffle nonce, not a value read here: bumping it re-runs the shuffle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, showCount],
  );
  const missing = useMemo(
    () => set[Math.floor(Math.random() * set.length)],
    [set],
  );
  const shown = useMemo(
    () => set.filter((s) => s !== missing).sort(() => Math.random() - 0.5),
    [set, missing],
  );
  const options = useMemo(() => {
    const opts = new Set<string>([missing]);
    while (opts.size < 4)
      opts.add(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
    return Array.from(opts).sort(() => Math.random() - 0.5);
  }, [missing]);
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [startedAt] = useState(Date.now());

  if (done) {
    return (
      <GameShell title="What's Missing?" instructions="">
        <ResultPanel
          kind="whats-missing"
          correct={correct}
          total={1}
          startedAt={startedAt}
          onAgain={() => {
            setDone(false);
            setCorrect(0);
            setPick(null);
            setPhase("study");
            setRound((r) => r + 1);
          }}
        />
      </GameShell>
    );
  }

  return (
    <GameShell
      title="What's Missing?"
      instructions={
        phase === "study"
          ? "Look carefully at all the items."
          : "One item from before is gone. Which one?"
      }
    >
      <div className="card-soft p-6">
        <div className="grid grid-cols-4 gap-4">
          {(phase === "study" ? set : shown).map((s, i) => (
            <div
              key={i}
              className="aspect-square grid place-items-center text-5xl sm:text-6xl rounded-2xl bg-secondary"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
      {phase === "study" ? (
        <button
          onClick={() => setPhase("guess")}
          className="mt-6 btn-large bg-primary text-primary-foreground w-full"
        >
          I'm ready
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                if (pick) return;
                setPick(o);
                if (o === missing) setCorrect(1);
                setTimeout(() => setDone(true), 900);
              }}
              className={[
                "aspect-square grid place-items-center text-5xl rounded-2xl border border-border",
                pick === o && o === missing
                  ? "bg-success text-success-foreground"
                  : pick === o
                    ? "bg-destructive/30"
                    : pick && o === missing
                      ? "bg-success/40"
                      : "bg-card hover:bg-secondary",
              ].join(" ")}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </GameShell>
  );
}
