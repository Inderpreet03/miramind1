import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell, ResultPanel } from "@/components/GameShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/play/category-sort")({
  head: () => ({ meta: [{ title: "Category Sort | MiraMind" }] }),
  component: CategorySort,
});

type Item = { word: string; cat: string; emoji: string };

const POOL: Item[] = [
  { word: "Apple", cat: "Fruit", emoji: "🍎" },
  { word: "Banana", cat: "Fruit", emoji: "🍌" },
  { word: "Pear", cat: "Fruit", emoji: "🍐" },
  { word: "Carrot", cat: "Vegetable", emoji: "🥕" },
  { word: "Tomato", cat: "Vegetable", emoji: "🍅" },
  { word: "Potato", cat: "Vegetable", emoji: "🥔" },
  { word: "Sparrow", cat: "Animal", emoji: "🐦" },
  { word: "Rabbit", cat: "Animal", emoji: "🐇" },
  { word: "Cat", cat: "Animal", emoji: "🐈" },
];

function CategorySort() {
  const difficulty = useStore((s) => s.resident.difficulty);
  const total = Math.min(9, 4 + difficulty);
  const [round, setRound] = useState(0);
  const items = useMemo(
    () => [...POOL].sort(() => Math.random() - 0.5).slice(0, total),
    // `round` is a reshuffle nonce, not a value read here: bumping it re-runs the shuffle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, total],
  );
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.cat))), [items]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<null | "ok" | "no">(null);
  const [startedAt] = useState(Date.now());

  if (idx >= items.length) {
    return (
      <GameShell title="Category Sort" instructions="">
        <ResultPanel
          kind="category-sort"
          correct={correct}
          total={items.length}
          startedAt={startedAt}
          onAgain={() => {
            setIdx(0);
            setCorrect(0);
            setFeedback(null);
            setRound((r) => r + 1);
          }}
        />
      </GameShell>
    );
  }

  const current = items[idx];
  function pick(c: string) {
    if (feedback) return;
    const ok = c === current.cat;
    setFeedback(ok ? "ok" : "no");
    if (ok) setCorrect((x) => x + 1);
    setTimeout(() => {
      setFeedback(null);
      setIdx((i) => i + 1);
    }, 700);
  }

  return (
    <GameShell title="Category Sort" instructions="Which group does this belong to?">
      <div className="card-soft p-10 text-center">
        <div className="text-7xl">{current.emoji}</div>
        <div className="mt-3 font-display text-3xl">{current.word}</div>
      </div>
      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => pick(c)}
            className={[
              "btn-large py-6 text-xl border border-border",
              feedback === "ok" && c === current.cat
                ? "bg-success text-success-foreground"
                : feedback === "no" && c === current.cat
                  ? "bg-success/40"
                  : "bg-card hover:bg-secondary",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center text-muted-foreground">
        {idx + 1} / {items.length}
      </div>
    </GameShell>
  );
}
