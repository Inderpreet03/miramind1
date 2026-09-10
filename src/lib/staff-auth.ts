const PASSWORD_KEY = "miramind-staff-password-v1";
const UNLOCKED_KEY = "miramind-staff-unlocked-v1";

async function digest(password: string) {
  const bytes = new TextEncoder().encode(`${password}:miramind-staff`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export const staffAuth = {
  hasPassword() {
    return (
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem(PASSWORD_KEY))
    );
  },
  isUnlocked() {
    return (
      typeof window !== "undefined" &&
      sessionStorage.getItem(UNLOCKED_KEY) === "1"
    );
  },
  async setPassword(password: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PASSWORD_KEY, await digest(password));
    sessionStorage.setItem(UNLOCKED_KEY, "1");
  },
  async verify(password: string) {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(PASSWORD_KEY);
    if (!saved || saved !== (await digest(password))) return false;
    sessionStorage.setItem(UNLOCKED_KEY, "1");
    return true;
  },
  lock() {
    if (typeof window !== "undefined") sessionStorage.removeItem(UNLOCKED_KEY);
  },
};
