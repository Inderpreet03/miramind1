import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  Brain,
  Layers,
  Hash,
  Eye,
  Users,
  MessageCircle,
  Check,
  Clock,
} from "lucide-react";
import { useStore, useMounted, store, type TaskKind } from "@/lib/store";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Today's Session | MiraMind" },
      {
        name: "description",
        content:
          "Five short memory games plus any tasks your family has sent. Take as long as you need.",
      },
    ],
  }),
  component: PlayLayout,
});

const games: {
  kind: TaskKind;
  to: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: string;
}[] = [
  {
    kind: "memory-match",
    to: "/play/memory-match",
    title: "Memory Match",
    subtitle: "Find the matching tiles",
    icon: <Layers />,
    tone: "bg-accent/15 text-accent",
  },
  {
    kind: "category-sort",
    to: "/play/category-sort",
    title: "Category Sort",
    subtitle: "Sort items into groups",
    icon: <Brain />,
    tone: "bg-primary/15 text-primary",
  },
  {
    kind: "sequence",
    to: "/play/sequence",
    title: "Sequence",
    subtitle: "What number comes next?",
    icon: <Hash />,
    tone: "bg-success/20 text-success-foreground",
  },
  {
    kind: "whats-missing",
    to: "/play/whats-missing",
    title: "What's Missing?",
    subtitle: "Spot the missing piece",
    icon: <Eye />,
    tone: "bg-warning/30 text-warning-foreground",
  },
  {
    kind: "family-faces",
    to: "/play/family-faces",
    title: "Family Faces",
    subtitle: "Recognise your loved ones",
    icon: <Users />,
    tone: "bg-accent/20 text-accent",
  },
];

function PlayLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/play") return <Outlet />;
  return <PlayHub />;
}

function PlayHub() {
  const mounted = useMounted();
  const resident = useStore((s) => s.resident);
  const tasks = useStore((s) => s.tasks);
  const open = mounted ? tasks.filter((t) => !t.completedAt) : [];
  const done = mounted ? tasks.filter((t) => t.completedAt) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Hello {resident.name} 👋
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">
            Today's session
          </h1>
          <p className="mt-2 text-muted-foreground">
            Take your time. There is no clock today.
          </p>
        </div>
        <div className="rounded-2xl bg-card border border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Difficulty </span>
          <span className="font-semibold text-primary">
            Level {resident.difficulty}
          </span>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <span className="text-accent">♥</span> From your family
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {open.length === 0 && (
            <div className="card-soft p-6 text-muted-foreground">
              No new tasks. Try a game below.
            </div>
          )}
          {open.map((t) => (
            <div key={t.id} className="card-soft p-5 flex items-start gap-4">
              <div className="grid place-items-center size-12 rounded-xl bg-accent/15 text-accent">
                {t.kind === "family-message" ? <MessageCircle /> : <Users />}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  From {t.assignedBy}
                </div>
                <div className="font-display text-xl mt-0.5">{t.title}</div>
                {t.detail && (
                  <p className="text-muted-foreground mt-1">{t.detail}</p>
                )}
                {t.voiceNote && (
                  <audio
                    controls
                    src={t.voiceNote}
                    className="voice-note-player"
                    aria-label={`Voice note from ${t.assignedBy}`}
                  />
                )}
                <div className="mt-3 flex gap-2">
                  {t.kind === "family-faces" && (
                    <Link
                      to="/play/family-faces"
                      className="btn-large py-2 px-4 text-base bg-primary text-primary-foreground"
                    >
                      Start
                    </Link>
                  )}
                  {t.kind === "family-message" && (
                    <button
                      onClick={() => store.completeTask(t.id)}
                      className="btn-large py-2 px-4 text-base bg-primary text-primary-foreground"
                    >
                      <Check className="size-4" /> Mark heard
                    </button>
                  )}
                  {t.kind !== "family-faces" && t.kind !== "family-message" && (
                    <Link
                      to={`/play/${t.kind}`}
                      className="btn-large py-2 px-4 text-base bg-primary text-primary-foreground"
                    >
                      Open game
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Games</h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className="card-soft p-6 hover:-translate-y-0.5 hover:shadow-lift transition-all group"
            >
              <div
                className={`grid place-items-center size-14 rounded-2xl ${g.tone}`}
              >
                {g.icon}
              </div>
              <div className="mt-4 font-display text-2xl">{g.title}</div>
              <div className="text-muted-foreground">{g.subtitle}</div>
              <div className="mt-4 text-primary font-semibold group-hover:translate-x-1 transition-transform">
                Play →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {done.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Clock className="size-5" /> Completed today
          </h2>
          <ul className="mt-3 space-y-2">
            {done.slice(0, 5).map((t) => (
              <li
                key={t.id}
                className="card-soft px-4 py-3 flex justify-between items-center"
              >
                <span>
                  {t.title}{" "}
                  <span className="text-muted-foreground text-sm">
                    from {t.assignedBy}
                  </span>
                </span>
                <Check className="size-5 text-success" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
