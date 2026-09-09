import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell, ResultPanel } from "@/components/GameShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/play/family-faces")({
  head: () => ({ meta: [{ title: "Family Faces | MiraMind" }] }),
  component: FamilyFaces,
});

function FamilyFaces() {
  const family = useStore((s) => s.family);
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [startedAt] = useState(Date.now());

  const order = useMemo(() => {
    void round;
    return [...family].sort(() => Math.random() - 0.5);
  }, [family, round]);
  const current = order[i] ?? null;
  const options = useMemo(() => {
    if (!current) return [];
    const others = family
      .filter((f) => f.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [current, ...others].sort(() => Math.random() - 0.5);
  }, [current, family]);

  if (family.length < 2) {
    return (
      <GameShell
        title="Family Faces"
        instructions="Add at least 2 family members in the Family hub to start this game."
      >
        <div className="card-soft p-8 text-center text-muted-foreground">
          No family added yet.
        </div>
      </GameShell>
    );
  }

  if (!current) {
    return (
      <GameShell title="Family Faces" instructions="">
        <ResultPanel
          kind="family-faces"
          correct={correct}
          total={order.length}
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

  function choose(name: string) {
    if (pick || !current) return;
    setPick(name);
    if (name === current.name) setCorrect((c) => c + 1);
    setTimeout(() => {
      setPick(null);
      setI((x) => x + 1);
    }, 1000);
  }

  return (
    <GameShell title="Family Faces" instructions="Who is this?">
      <div className="card-soft p-10 text-center">
        <div className="text-9xl">{current.emoji}</div>
        <div className="mt-3 text-muted-foreground">{current.relation}</div>
        {current.note && (
          <div className="mt-3 text-sm text-muted-foreground italic max-w-md mx-auto">
            "{current.note}"
          </div>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => choose(o.name)}
            className={[
              "btn-large py-6 text-2xl border border-border",
              pick === o.name && o.name === current.name
                ? "bg-success text-success-foreground"
                : pick === o.name
                  ? "bg-destructive/30"
                  : pick && o.name === current.name
                    ? "bg-success/40"
                    : "bg-card hover:bg-secondary",
            ].join(" ")}
          >
            {o.name}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center text-muted-foreground">
        {i + 1} / {order.length}
      </div>
    </GameShell>
  );
}
