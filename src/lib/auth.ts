import { useSyncExternalStore } from "react";
import { store } from "@/lib/store";

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
  async signUp(name: string, email: string, pin: string) {
    const normalizedEmail = email.trim().toLowerCase();
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
    localStorage.removeItem(SESSION_KEY);
    store.deactivateUser();
    publish(emptyState);
  },
};

export function useAuth() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    () => emptyState,
  );
}
