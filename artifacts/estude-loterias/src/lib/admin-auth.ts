import { useState, useEffect } from "react";

const ADMIN_KEY_STORAGE = "estude_admin_key";
const ADMIN_KEY_EVENT = "estude_admin_key_changed";

export function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_KEY_STORAGE) || "";
}

export function setAdminKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) {
    window.localStorage.setItem(ADMIN_KEY_STORAGE, trimmed);
  } else {
    window.localStorage.removeItem(ADMIN_KEY_STORAGE);
  }
  window.dispatchEvent(new Event(ADMIN_KEY_EVENT));
}

export function removeAdminKey(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_KEY_STORAGE);
  window.dispatchEvent(new Event(ADMIN_KEY_EVENT));
}

export function hasAdminKey(): boolean {
  return Boolean(getAdminKey());
}

export function useAdminKey() {
  const [key, setKeyState] = useState<string>(getAdminKey);

  useEffect(() => {
    const handleStorage = () => {
      setKeyState(getAdminKey());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(ADMIN_KEY_EVENT, handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ADMIN_KEY_EVENT, handleStorage);
    };
  }, []);

  return {
    adminKey: key,
    hasKey: Boolean(key),
    setKey: setAdminKey,
    removeKey: removeAdminKey,
  };
}
