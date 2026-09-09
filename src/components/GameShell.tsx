// Shared frame for the game pages: back link, instructions and the end-of-round result.
import { Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { store, type TaskKind } from "@/lib/store";
import { useState } from "react";

export function GameShell({
  title,
  instructions,
  children,
}: {
  title: string;
  instructions: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-8 pb-24">
      <Link
        to="/play"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to today
      </Link>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{instructions}</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}

export function ResultPanel({
  kind,
  correct,
  total,
  startedAt,
  onAgain,
}: {
  kind: TaskKind;
  correct: number;
  total: number;
  startedAt: number;
  onAgain: () => void;
}) {
  const accuracy = total > 0 ? correct / total : 0;
  const duration = Date.now() - startedAt;
  const avg = total > 0 ? duration / total : 0;
  const [saved] = useState(() => {
    store.recordSession({
      kind,
      accuracy,
      avgResponseMs: avg,
      difficulty: store.get().resident.difficulty,
      durationMs: duration,
    });
    return true;
  });
  void saved;
  const message =
    accuracy >= 0.9
      ? "Wonderful work!"
      : accuracy >= 0.6
        ? "Nicely done."
        : "Good try. Every round helps.";
  return (
    <div className="card-soft p-8 text-center">
      <Trophy className="mx-auto size-12 text-accent" />
      <h2 className="mt-4 font-display text-3xl">{message}</h2>
      <p className="mt-2 text-muted-foreground">
        {correct} of {total} correct · {Math.round(avg / 100) / 10}s avg
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <button
          onClick={onAgain}
          className="btn-large bg-primary text-primary-foreground"
        >
          <RotateCcw className="size-4" /> Play again
        </button>
        <Link to="/play" className="btn-large bg-card border border-border">
          Back
        </Link>
      </div>
    </div>
  );
}
