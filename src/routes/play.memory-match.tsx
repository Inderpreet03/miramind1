import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell, ResultPanel } from "@/components/GameShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/play/memory-match")({
  head: () => ({ meta: [{ title: "Memory Match | MiraMind" }] }),
  component: MemoryMatch,
});

const SYMBOLS = ["🌻", "🐦", "☕", "🍎", "🌳", "🎵", "🚲", "📚"];

function buildDeck(pairs: number) {
  const picks = SYMBOLS.slice(0, pairs);
  const deck = [...picks, ...picks]
    .map((s, i) => ({ id: i, sym: s, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

function MemoryMatch() {
  const difficulty = useStore((s) => s.resident.difficulty);
  const pairs = Math.min(8, 3 + difficulty); // 4..8
  const [round, setRound] = useState(0);
  // `round` is a reshuffle nonce, not a value read here: bumping it re-runs the shuffle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deck = useMemo(() => buildDeck(pairs), [round, pairs]);
  const [cards, setCards] = useState(deck);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startedAt] = useState(Date.now());

  useEffect(() => setCards(deck), [deck]);

  function flip(i: number) {
    if (open.includes(i) || cards[i].matched || open.length === 2) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].sym === cards[b].sym) {
        setTimeout(() => {
          setCards((cs) =>
            cs.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c)),
          );
          setOpen([]);
        }, 600);
      } else {
        setTimeout(() => setOpen([]), 1100);
      }
    }
  }

  const allMatched = cards.length > 0 && cards.every((c) => c.matched);

  return (
    <GameShell title="Memory Match" instructions="Tap two tiles to find a matching pair.">
      {allMatched ? (
        <ResultPanel
          kind="memory-match"
          correct={pairs}
          total={moves}
          startedAt={startedAt}
          onAgain={() => {
            setOpen([]);
            setMoves(0);
            setRound((r) => r + 1);
          }}
        />
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${pairs <= 4 ? 4 : pairs <= 6 ? 4 : 4}, minmax(0,1fr))`,
          }}
        >
          {cards.map((c, i) => {
            const shown = open.includes(i) || c.matched;
            return (
              <button
                key={c.id}
                onClick={() => flip(i)}
                aria-label={shown ? c.sym : "hidden tile"}
                className={[
                  "aspect-square rounded-2xl text-5xl sm:text-6xl font-semibold transition-all",
                  shown
                    ? "bg-card border border-border shadow-soft"
                    : "bg-primary text-primary-foreground hover:opacity-90",
                  c.matched ? "ring-4 ring-success/60" : "",
                ].join(" ")}
              >
                {shown ? c.sym : ""}
              </button>
            );
          })}
        </div>
      )}
    </GameShell>
  );
}
