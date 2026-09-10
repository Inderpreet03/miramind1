import { useSyncExternalStore } from "react";
import { store } from "@/lib/store";
import { cloudPassword, isCloudConfigured, supabase } from "@/lib/supabase";

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  pinHash: string;
  createdAt: number;
};

export type PublicUserAccount = Omit<UserAccount, "pinHash">;

type AuthState = {
  user: PublicUserAccount | null;
};

type CloudProfile = {
  id: string;
  display_name: string;
  email: string;
  created_at: string;
};

const ACCOUNTS_KEY = "miramind-accounts-v1";
const SESSION_KEY = "miramind-active-account-v1";
const emptyState: AuthState = { user: null };
const listeners = new Set<() => void>();

function readAccounts(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) ?? "[]",
    ) as UserAccount[];
  } catch {
    return [];
  }
}

function readInitialState(): AuthState {
  if (typeof window === "undefined") return emptyState;
  const activeId = localStorage.getItem(SESSION_KEY);
  const account = readAccounts().find((item) => item.id === activeId);
  if (!account) return emptyState;
  const { pinHash: _pinHash, ...user } = account;
  store.activateUser(user.id);
  return { user };
}

let state = readInitialState();

function publish(next: AuthState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function cloudSetupError() {
  return new Error(
    "Cloud sync is not ready yet. Run supabase/schema.sql in your project first.",
  );
}

function accountFromProfile(profile: CloudProfile): PublicUserAccount {
  return {
    id: profile.id,
    name: profile.display_name || "Resident",
    email: profile.email,
    createdAt: Date.parse(profile.created_at),
  };
}

async function publishCloudUser(
  cloudUser: {
    id: string;
    email?: string;
    created_at?: string;
    user_metadata?: Record<string, unknown>;
  } | null,
) {
  if (!cloudUser || !supabase) {
    store.deactivateUser();
    publish(emptyState);
    return;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, created_at")
    .eq("id", cloudUser.id)
    .maybeSingle<CloudProfile>();
  if (error) throw cloudSetupError();
  const profile =
    data ??
    ({
      id: cloudUser.id,
      display_name: String(cloudUser.user_metadata?.display_name ?? "Resident"),
      email: cloudUser.email ?? "",
      created_at: cloudUser.created_at ?? new Date().toISOString(),
    } satisfies CloudProfile);
  store.activateUser(cloudUser.id);
  publish({ user: accountFromProfile(profile) });
}

async function hashPin(email: string, pin: string) {
  const bytes = new TextEncoder().encode(
    `${email.toLowerCase()}:${pin}:miramind`,
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export const authStore = {
  get: () => state,
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  listAccounts(): PublicUserAccount[] {
    return readAccounts().map(({ pinHash: _pinHash, ...account }) => account);
  },
  async listAccountsAsync(): Promise<PublicUserAccount[]> {
    if (!supabase) return this.listAccounts();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email, created_at")
      .order("created_at", { ascending: true })
      .returns<CloudProfile[]>();
    if (error) throw cloudSetupError();
    return (data ?? []).map(accountFromProfile);
  },
  async signUp(name: string, email: string, pin: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: cloudPassword(pin),
        options: { data: { display_name: name.trim() } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("The account could not be created.");
      if (!data.session) {
        throw new Error(
          "Check your email to confirm the new profile, then sign in.",
        );
      }
      await publishCloudUser(data.user);
      return;
    }
    const accounts = readAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const account: UserAccount = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      pinHash: await hashPin(normalizedEmail, pin),
      createdAt: Date.now(),
    };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
    localStorage.setItem(SESSION_KEY, account.id);
    store.activateUser(account.id);
    const { pinHash: _pinHash, ...user } = account;
    publish({ user });
  },
  async signIn(email: string, pin: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: cloudPassword(pin),
      });
      if (error || !data.user) {
        throw new Error(error?.message ?? "The email or PIN is incorrect.");
      }
      await publishCloudUser(data.user);
      return;
    }
    const account = readAccounts().find(
      (item) => item.email === normalizedEmail,
    );
    const candidate = await hashPin(normalizedEmail, pin);
    if (!account || account.pinHash !== candidate) {
      throw new Error("The email or PIN is incorrect.");
    }
    localStorage.setItem(SESSION_KEY, account.id);
    store.activateUser(account.id);
    const { pinHash: _pinHash, ...user } = account;
    publish({ user });
  },
  signOut() {
    if (supabase) void supabase.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
    store.deactivateUser();
    publish(emptyState);
  },
};

if (supabase) {
  void supabase.auth.getSession().then(({ data, error }) => {
    if (!error) void publishCloudUser(data.session?.user ?? null);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    void publishCloudUser(session?.user ?? null);
  });
}

export function useAuth() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    () => emptyState,
  );
}
