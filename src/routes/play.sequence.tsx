import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell, ResultPanel } from "@/components/GameShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/play/sequence")({
  head: () => ({ meta: [{ title: "Sequence | MiraMind" }] }),
  component: SequenceGame,
});

type Q = { seq: (number | null)[]; answer: number; options: number[] };

function makeQ(difficulty: number): Q {
  const start = 1 + Math.floor(Math.random() * 5);
  const step = difficulty < 3 ? 1 : Math.random() < 0.5 ? 2 : 3;
  const len = 5;
  const hideAt = 2 + Math.floor(Math.random() * (len - 2));
  const full = Array.from({ length: len }, (_, i) => start + i * step);
  const seq = full.map((v, i) => (i === hideAt ? null : v));
  const answer = full[hideAt];
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const offset = Math.floor(Math.random() * 6) - 3;
    if (offset !== 0) opts.add(Math.max(0, answer + offset));
  }
  return { seq, answer, options: Array.from(opts).sort(() => Math.random() - 0.5) };
}

function SequenceGame() {
  const difficulty = useStore((s) => s.resident.difficulty);
  const [round, setRound] = useState(0);
  const total = 5;
  const questions = useMemo(
    () => Array.from({ length: total }, () => makeQ(difficulty)),
    // `round` is a reshuffle nonce, not a value read here: bumping it re-runs the shuffle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, difficulty],
  );
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [startedAt] = useState(Date.now());

  if (i >= questions.length) {
    return (
      <GameShell title="Sequence" instructions="">
        <ResultPanel
          kind="sequence"
          correct={correct}
          total={questions.length}
          startedAt={startedAt}
          onAgain={() => {
            setI(0);
            setCorrect(0);
            setPick(null);
            setRound((r) => r + 1);
          }}
        />
      </GameShell>
    );
  }
  const q = questions[i];

  function choose(n: number) {
    if (pick !== null) return;
    setPick(n);
    if (n === q.answer) setCorrect((c) => c + 1);
    setTimeout(() => {
      setPick(null);
      setI((x) => x + 1);
    }, 800);
  }

  return (
    <GameShell title="Sequence" instructions="Which number is missing?">
      <div className="card-soft p-8">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {q.seq.map((v, idx) => (
            <div
              key={idx}
              className={[
                "size-20 sm:size-24 grid place-items-center rounded-2xl font-display text-4xl",
                v === null
                  ? "bg-accent/20 text-accent border-2 border-dashed border-accent"
                  : "bg-secondary text-secondary-foreground",
              ].join(" ")}
            >
              {v ?? "?"}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {q.options.map((o) => (
          <button
            key={o}
            onClick={() => choose(o)}
            className={[
              "btn-large py-6 text-2xl border border-border",
              pick === o && o === q.answer
                ? "bg-success text-success-foreground"
                : pick === o
                  ? "bg-destructive/30"
                  : pick !== null && o === q.answer
                    ? "bg-success/40"
                    : "bg-card hover:bg-secondary",
            ].join(" ")}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center text-muted-foreground">
        {i + 1} / {questions.length}
      </div>
    </GameShell>
  );
}
