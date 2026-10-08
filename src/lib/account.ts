import { useMemo, useSyncExternalStore } from "react";
import { readJSON, writeJSON } from "./storage";

/*
 * Prototype-only "accounts": the signed-in profile lives in this browser's localStorage.
 * No password is ever stored or sent anywhere — the forms only check that they're filled in sensibly.
 */

export interface Account {
  name: string;
  email: string;
}

const ACCOUNT_KEY = "pikup.account";
/** the last account created here, so signing back in with that email restores the name */
const PROFILE_KEY = "pikup.profile";
const ACCOUNT_EVENT = "pikup:account";

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === ACCOUNT_KEY) onChange();
  };
  window.addEventListener(ACCOUNT_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ACCOUNT_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The signed-in account, or null. Re-renders everywhere when someone signs in or out. */
export function useAccount(): Account | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(ACCOUNT_KEY),
    () => null,
  );
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Account;
    } catch {
      return null;
    }
  }, [raw]);
}

function setAccount(account: Account | null) {
  if (account) writeJSON(ACCOUNT_KEY, account);
  else localStorage.removeItem(ACCOUNT_KEY);
  window.dispatchEvent(new Event(ACCOUNT_EVENT));
}

export function createAccount(account: Account) {
  writeJSON(PROFILE_KEY, account);
  setAccount(account);
}

export function signIn(email: string) {
  const known = readJSON<Account | null>(PROFILE_KEY, () => null);
  const name =
    known && known.email.toLowerCase() === email.toLowerCase()
      ? known.name
      : email.split("@")[0]!.replace(/^\w/, (c) => c.toUpperCase());
  setAccount({ name, email });
}

export function signOut() {
  setAccount(null);
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Live password rules shown as a checklist while typing. */
export function passwordChecks(password: string, confirm: string) {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Includes a number", met: /\d/.test(password) },
    { label: "Both passwords match", met: password.length > 0 && password === confirm },
  ];
}
