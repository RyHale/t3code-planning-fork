import { useCallback, useSyncExternalStore } from "react";

export type ThemeAccent = "default" | "blue" | "cyan" | "green" | "violet" | "rose" | "amber";
export type ThemeFont =
  | "default"
  | "system"
  | "inter"
  | "roboto"
  | "open-sans"
  | "source-sans-3"
  | "montserrat"
  | "poppins"
  | "space-grotesk"
  | "jetbrains-mono"
  | "mono";
export type ThemeBackgroundEffect =
  | "default"
  | "none"
  | "grid"
  | "blueprint"
  | "circuit"
  | "graphite"
  | "paper"
  | "scanlines";

export type ThemeCustomization = {
  accent: ThemeAccent;
  font: ThemeFont;
  backgroundEffect: ThemeBackgroundEffect;
};

export const DEFAULT_THEME_CUSTOMIZATION: ThemeCustomization = {
  accent: "default",
  font: "default",
  backgroundEffect: "default",
};

export const THEME_ACCENT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "blue", label: "Blue" },
  { value: "cyan", label: "Cyan" },
  { value: "green", label: "Green" },
  { value: "violet", label: "Violet" },
  { value: "rose", label: "Rose" },
  { value: "amber", label: "Amber" },
] as const satisfies ReadonlyArray<{ value: ThemeAccent; label: string }>;

export const THEME_FONT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "system", label: "System" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "source-sans-3", label: "Source Sans 3" },
  { value: "montserrat", label: "Montserrat" },
  { value: "poppins", label: "Poppins" },
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "jetbrains-mono", label: "JetBrains Mono" },
  { value: "mono", label: "Mono" },
] as const satisfies ReadonlyArray<{ value: ThemeFont; label: string }>;

export const THEME_BACKGROUND_EFFECT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "none", label: "None" },
  { value: "grid", label: "Grid" },
  { value: "blueprint", label: "Blueprint" },
  { value: "circuit", label: "Circuit" },
  { value: "graphite", label: "Graphite" },
  { value: "paper", label: "Paper" },
  { value: "scanlines", label: "Scanlines" },
] as const satisfies ReadonlyArray<{ value: ThemeBackgroundEffect; label: string }>;

const STORAGE_KEY = "t3code:addon:theme-customization:v1";
const listeners = new Set<() => void>();
let snapshot: ThemeCustomization = DEFAULT_THEME_CUSTOMIZATION;
let snapshotStorageValue: string | null = null;

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isThemeAccent(value: unknown): value is ThemeAccent {
  return THEME_ACCENT_OPTIONS.some((option) => option.value === value);
}

function isThemeFont(value: unknown): value is ThemeFont {
  return THEME_FONT_OPTIONS.some((option) => option.value === value);
}

function isThemeBackgroundEffect(value: unknown): value is ThemeBackgroundEffect {
  return THEME_BACKGROUND_EFFECT_OPTIONS.some((option) => option.value === value);
}

function normalizeCustomization(value: unknown): ThemeCustomization {
  if (!value || typeof value !== "object") return DEFAULT_THEME_CUSTOMIZATION;
  const candidate = value as Partial<Record<keyof ThemeCustomization, unknown>>;
  return {
    accent: isThemeAccent(candidate.accent) ? candidate.accent : DEFAULT_THEME_CUSTOMIZATION.accent,
    font: isThemeFont(candidate.font) ? candidate.font : DEFAULT_THEME_CUSTOMIZATION.font,
    backgroundEffect: isThemeBackgroundEffect(candidate.backgroundEffect)
      ? candidate.backgroundEffect
      : DEFAULT_THEME_CUSTOMIZATION.backgroundEffect,
  };
}

function parseStoredCustomization(rawValue: string | null): ThemeCustomization {
  try {
    return normalizeCustomization(JSON.parse(rawValue ?? "null"));
  } catch {
    return DEFAULT_THEME_CUSTOMIZATION;
  }
}

function readStoredCustomization(): ThemeCustomization {
  if (!hasStorage()) return DEFAULT_THEME_CUSTOMIZATION;
  const rawValue = localStorage.getItem(STORAGE_KEY);
  if (rawValue === snapshotStorageValue) {
    return snapshot;
  }

  snapshotStorageValue = rawValue;
  snapshot = parseStoredCustomization(rawValue);
  return snapshot;
}

function emitChange() {
  for (const listener of listeners) listener();
}

function writeCustomization(next: ThemeCustomization): void {
  snapshot = next;
  applyThemeCustomization(next);
  if (hasStorage()) {
    snapshotStorageValue = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, snapshotStorageValue);
  }
  emitChange();
}

export function applyThemeCustomization(customization = readStoredCustomization()): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.themeAccent = customization.accent;
  root.dataset.themeFont = customization.font;
  root.dataset.themeBackgroundEffect = customization.backgroundEffect;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  snapshot = readStoredCustomization();
  applyThemeCustomization(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeCustomization {
  snapshot = readStoredCustomization();
  return snapshot;
}

export function useThemeCustomization() {
  const customization = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => DEFAULT_THEME_CUSTOMIZATION,
  );

  const setThemeCustomization = useCallback((patch: Partial<ThemeCustomization>) => {
    writeCustomization({
      ...readStoredCustomization(),
      ...patch,
    });
  }, []);

  const resetThemeCustomization = useCallback(() => {
    writeCustomization(DEFAULT_THEME_CUSTOMIZATION);
  }, []);

  return { customization, setThemeCustomization, resetThemeCustomization } as const;
}

applyThemeCustomization();
