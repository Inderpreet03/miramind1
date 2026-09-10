import { useEffect, useState, useSyncExternalStore } from "react";
import {
  fetchCloudState,
  fetchCloudSummary,
  saveCloudState,
  summarizeState,
} from "@/lib/cloud-data";
import { supabase } from "@/lib/supabase";

export type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  emoji: string;
  note?: string;
  birthday?: string;
  image?: string;
};

export type TaskKind =
  | "memory-match"
  | "category-sort"
  | "sequence"
  | "whats-missing"
  | "family-faces"
  | "family-message";

export type FamilyTask = {
  id: string;
  kind: TaskKind;
  title: string;
  detail?: string;
  voiceNote?: string;
  assignedBy: string;
  createdAt: number;
  completedAt?: number;
};

export type GameSession = {
  id: string;
  kind: TaskKind;
  accuracy: number;
  avgResponseMs: number;
  difficulty: number;
  durationMs: number;
  at: number;
};

export type Resident = {
  name: string;
  difficulty: number;
  streakDays: number;
};

export type AppState = {
  resident: Resident;
  family: FamilyMember[];
  tasks: FamilyTask[];
  sessions: GameSession[];
};

const LEGACY_KEY = "dct-app-state-v1";
const USER_KEY = "miramind-user-state-v1";

const seed: AppState = {
  resident: { name: "Resident", difficulty: 2, streakDays: 3 },
  family: [
    {
      id: "f1",
      name: "Anna",
      relation: "Daughter",
      emoji: "👩🏼",
      note: "Lives in Hamburg, visits on Sundays.",
      birthday: "1978-04-12",
    },
    {
      id: "f2",
      name: "Lukas",
      relation: "Grandson",
      emoji: "🧒🏻",
      note: "Plays football, age 9.",
      birthday: "2017-09-03",
    },
    {
      id: "f3",
      name: "Peter",
      relation: "Son",
      emoji: "👨🏻",
      note: "Loves gardening together.",
    },
    {
      id: "f4",
      name: "Mira",
      relation: "Granddaughter",
      emoji: "👧🏽",
      note: "Paints flowers for Oma.",
    },
  ],
  tasks: [
    {
      id: "t1",
      kind: "family-faces",
      title: "Recognise our family today",
      assignedBy: "Anna",
      createdAt: Date.now() - 86400000,
    },
    {
      id: "t2",
      kind: "family-message",
      title: "Listen to Lukas's hello",
      detail: "He says: 'Hallo Oma, ich hab dich lieb!'",
      assignedBy: "Lukas",
      createdAt: Date.now() - 3600000,
    },
    {
      id: "t3",
      kind: "memory-match",
      title: "Match the morning tiles",
      assignedBy: "Peter",
      createdAt: Date.now() - 7200000,
    },
  ],
  sessions: [],
};

function copySeed(): AppState {
  return {
    resident: { ...seed.resident },
    family: seed.family.map((member) => ({ ...member })),
    tasks: seed.tasks.map((task) => ({ ...task })),
    sessions: [],
  };
}

function keyFor(userId: string) {
  return `${USER_KEY}:${userId}`;
}

function removeLegacyResidentName(appState: AppState) {
  if (appState.resident.name.trim().toLowerCase() !== "oma helga") {
    return appState;
  }
  return {
    ...appState,
    resident: { ...appState.resident, name: "Resident" },
  };
}

function load(userId: string | null): AppState {
  if (typeof window === "undefined" || !userId) return copySeed();
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (raw) {
      const loaded = removeLegacyResidentName({
        ...copySeed(),
        ...JSON.parse(raw),
      });
      localStorage.setItem(keyFor(userId), JSON.stringify(loaded));
      return loaded;
    }

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = removeLegacyResidentName({
        ...copySeed(),
        ...JSON.parse(legacy),
      });
      localStorage.setItem(keyFor(userId), JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
    return copySeed();
  } catch {
    return copySeed();
  }
}

export type UserStateSummary = {
  resident: Resident;
  familyCount: number;
  sessionsCount: number;
  tasksCompleted: number;
  lastSessionAt: number | null;
};

let activeUserId: string | null = null;
let state: AppState = copySeed();
const serverState = copySeed();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined" && activeUserId) {
    localStorage.setItem(keyFor(activeUserId), JSON.stringify(state));
    if (supabase) {
      void saveCloudState(activeUserId, state).catch(() => undefined);
    }
  }
  listeners.forEach((l) => l());
}

async function hydrateFromCloud(userId: string) {
  if (!supabase) return;
  try {
    const remote = await fetchCloudState(userId);
    if (activeUserId !== userId) return;
    if (remote) {
      state = removeLegacyResidentName({ ...copySeed(), ...remote });
      localStorage.setItem(keyFor(userId), JSON.stringify(state));
      listeners.forEach((listener) => listener());
    } else {
      await saveCloudState(userId, state);
    }
  } catch {
    // Keep the cached state usable while the cloud project is being configured.
  }
}

export const store = {
  get: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  summaryFor(userId: string): UserStateSummary {
    return summarizeState(load(userId));
  },
  async summaryForAsync(userId: string): Promise<UserStateSummary> {
    if (supabase) {
      try {
        const remote = await fetchCloudSummary(userId);
        if (remote) return remote;
      } catch {
        // Fall back to the cached state if the remote row is unavailable.
      }
    }
    return this.summaryFor(userId);
  },
  activateUser(userId: string) {
    if (activeUserId === userId) return;
    activeUserId = userId;
    state = load(userId);
    listeners.forEach((listener) => listener());
    void hydrateFromCloud(userId);
  },
  deactivateUser() {
    activeUserId = null;
    state = copySeed();
    listeners.forEach((listener) => listener());
  },
  setResident(patch: Partial<Resident>) {
    state = { ...state, resident: { ...state.resident, ...patch } };
    persist();
  },
  addFamily(m: Omit<FamilyMember, "id">) {
    state = {
      ...state,
      family: [...state.family, { ...m, id: crypto.randomUUID() }],
    };
    persist();
  },
  removeFamily(id: string) {
    state = { ...state, family: state.family.filter((f) => f.id !== id) };
    persist();
  },
  addTask(t: Omit<FamilyTask, "id" | "createdAt">) {
    const task: FamilyTask = {
      ...t,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    state = { ...state, tasks: [task, ...state.tasks] };
    persist();
  },
  completeTask(id: string) {
    state = {
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completedAt: Date.now() } : t,
      ),
    };
    persist();
  },
  recordSession(s: Omit<GameSession, "id" | "at">) {
    const session: GameSession = {
      ...s,
      id: crypto.randomUUID(),
      at: Date.now(),
    };
    let d = state.resident.difficulty;
    if (s.accuracy > 0.8 && s.avgResponseMs < 5000) d = Math.min(5, d + 1);
    else if (s.accuracy < 0.5 || s.avgResponseMs > 15000)
      d = Math.max(1, d - 1);
    state = {
      ...state,
      sessions: [session, ...state.sessions].slice(0, 200),
      resident: { ...state.resident, difficulty: d },
    };
    persist();
  },
  reset() {
    state = copySeed();
    persist();
  },
};

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(serverState),
  );
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
