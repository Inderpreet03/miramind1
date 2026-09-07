import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus, Trash2, MessageCircle, Users, Calendar, Send } from "lucide-react";
import { useStore, store, useMounted, type TaskKind } from "@/lib/store";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family Hub | MiraMind" },
      {
        name: "description",
        content:
          "Add family members, send a task, photo or voice note, and follow how each session went.",
      },
    ],
  }),
  component: FamilyHub,
});

const EMOJIS = ["👩🏼", "👨🏻", "🧒🏻", "👧🏽", "👵🏻", "👴🏼", "👨🏾", "👩🏾", "🧑🏻", "👶🏻"];

function FamilyHub() {
  const mounted = useMounted();
  const family = useStore((s) => s.family);
  const tasks = useStore((s) => s.tasks);
  const sessions = useStore((s) => s.sessions);
  const resident = useStore((s) => s.resident);

  const last7 = mounted ? sessions.filter((s) => Date.now() - s.at < 7 * 86400000) : [];
  const avgAcc = last7.length
    ? Math.round((last7.reduce((a, s) => a + s.accuracy, 0) / last7.length) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Family hub
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">Be there, every day.</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Send {resident.name} a small task, a photo or a voice note, then see how the session
            went.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Family" value={`${family.length}`} />
          <Stat label="7-day acc." value={`${avgAcc}%`} />
          <Stat label="Sessions" value={`${last7.length}`} />
        </div>
      </header>

      {/* Send a task */}
      <section className="mt-10 grid lg:grid-cols-[1.1fr_1fr] gap-6">
        <SendTaskCard />
        <ProgressCard />
      </section>

      {/* Members */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Users className="size-5" /> Loved ones
          </h2>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {family.map((f) => (
            <div key={f.id} className="card-soft p-5 flex gap-4">
              <div className="text-5xl">{f.emoji}</div>
              <div className="flex-1">
                <div className="font-display text-xl">{f.name}</div>
                <div className="text-sm text-muted-foreground">{f.relation}</div>
                {f.note && <p className="text-sm mt-2">{f.note}</p>}
                {f.birthday && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> {f.birthday}
                  </div>
                )}
              </div>
              <button
                onClick={() => store.removeFamily(f.id)}
                className="self-start text-muted-foreground hover:text-destructive p-1"
                aria-label={`Remove ${f.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <AddMemberCard />
        </div>
      </section>

      {/* Task history */}
      <section className="mt-12">
        <h2 className="font-display text-2xl">Task history</h2>
        <ul className="mt-4 space-y-2">
          {tasks.slice(0, 8).map((t) => (
            <li key={t.id} className="card-soft px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`size-2.5 rounded-full ${t.completedAt ? "bg-success" : "bg-warning"}`}
                />
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground">From {t.assignedBy}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {t.completedAt ? "Completed" : "Open"}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft px-4 py-2">
      <div className="font-display text-2xl text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SendTaskCard() {
  const family = useStore((s) => s.family);
  const [from, setFrom] = useState(family[0]?.name ?? "");
  const [kind, setKind] = useState<TaskKind>("family-message");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !from) return;
    store.addTask({
      kind,
      title: title.trim(),
      detail: detail.trim() || undefined,
      assignedBy: from,
    });
    setTitle("");
    setDetail("");
  }

  return (
    <form onSubmit={submit} className="card-soft p-6">
      <h2 className="font-display text-2xl flex items-center gap-2">
        <Send className="size-5 text-accent" /> Send a task
      </h2>
      <p className="text-muted-foreground text-sm mt-1">It will appear in today's session.</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Field label="From">
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="input">
            {family.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as TaskKind)}
            className="input"
          >
            <option value="family-message">Personal message</option>
            <option value="family-faces">Recognise family faces</option>
            <option value="memory-match">Memory match</option>
            <option value="category-sort">Category sort</option>
            <option value="sequence">Sequence</option>
            <option value="whats-missing">What's missing</option>
          </select>
        </Field>
      </div>
      <Field label="Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. A morning hello from Lukas"
          className="input"
        />
      </Field>
      <Field label="Note (optional)">
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Add a message or context..."
          className="input min-h-24"
        />
      </Field>

      <button type="submit" className="mt-4 btn-large bg-primary text-primary-foreground w-full">
        <MessageCircle className="size-4" /> Send
      </button>

      <style>{`
        .input { width: 100%; padding: 0.7rem 0.9rem; border-radius: 0.9rem; background: var(--color-card); border: 1px solid var(--color-border); font-size: 1rem; }
        .input:focus { outline: 3px solid var(--color-ring); outline-offset: 2px; }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mt-3">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ProgressCard() {
  const sessions = useStore((s) => s.sessions);
  const mounted = useMounted();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  const buckets = days.map((day) => {
    const next = day + 86400000;
    const inDay = mounted ? sessions.filter((s) => s.at >= day && s.at < next) : [];
    const acc = inDay.length ? inDay.reduce((a, s) => a + s.accuracy, 0) / inDay.length : 0;
    return { day, acc, count: inDay.length };
  });
  const max = Math.max(0.1, ...buckets.map((b) => b.acc));

  return (
    <div className="card-soft p-6">
      <h2 className="font-display text-2xl flex items-center gap-2">
        <Heart className="size-5 text-accent" /> 7-day progress
      </h2>
      <div className="mt-6 flex items-end gap-2 h-40">
        {buckets.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-primary/50 to-primary transition-all"
              style={{ height: `${(b.acc / max) * 100}%`, minHeight: b.count ? 6 : 2 }}
              title={`${Math.round(b.acc * 100)}% across ${b.count} sessions`}
            />
            <div className="text-xs text-muted-foreground">
              {new Date(b.day).toLocaleDateString(undefined, { weekday: "short" })[0]}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Bars show average accuracy each day. Empty days are gentle reminders, not failures.
      </p>
    </div>
  );
}

function AddMemberCard() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [note, setNote] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    store.addFamily({
      name: name.trim(),
      relation: relation.trim() || "Family",
      note: note.trim() || undefined,
      emoji,
    });
    setName("");
    setRelation("");
    setNote("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="card-soft p-5 flex items-center justify-center gap-2 text-primary font-semibold border-dashed hover:bg-secondary/40 min-h-[8rem]"
      >
        <Plus className="size-5" /> Add a loved one
      </button>
    );
  }

  return (
    <form onSubmit={add} className="card-soft p-5">
      <div className="flex flex-wrap gap-2">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            className={`text-2xl size-10 rounded-xl ${emoji === e ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary"}`}
          >
            {e}
          </button>
        ))}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="mt-3 w-full px-3 py-2 rounded-lg border border-border bg-card"
      />
      <input
        value={relation}
        onChange={(e) => setRelation(e.target.value)}
        placeholder="Relation (Daughter, Grandson...)"
        className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-card"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="A small memory cue..."
        className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-card"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          className="flex-1 btn-large py-2 text-base bg-primary text-primary-foreground"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-large py-2 text-base bg-card border border-border"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
