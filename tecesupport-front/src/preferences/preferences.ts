import { getStoredUser } from "../auth/session";

export type ThemePreference = "dark" | "light" | "system";
export type TicketsPerPage = 10 | 20 | 50;

export type UserPreferences = {
  reduce_motion: boolean;
  sidebar_collapsed: boolean;
  theme: ThemePreference;
  tickets_per_page: TicketsPerPage;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  reduce_motion: false,
  sidebar_collapsed: false,
  theme: "dark",
  tickets_per_page: 10,
};

const STORAGE_PREFIX = "tecesupport_preferences";

function getStorageKey(userId?: number) {
  return userId ? `${STORAGE_PREFIX}_${userId}` : `${STORAGE_PREFIX}_default`;
}

export function normalizePreferences(
  value: unknown,
  fallback: UserPreferences = DEFAULT_PREFERENCES,
): UserPreferences {
  const data =
    value && typeof value === "object"
      ? (value as Partial<UserPreferences>)
      : {};
  const theme =
    data.theme === "dark" ||
    data.theme === "light" ||
    data.theme === "system"
      ? data.theme
      : fallback.theme;
  const pageSize = Number(data.tickets_per_page);
  const ticketsPerPage =
    pageSize === 10 || pageSize === 20 || pageSize === 50
      ? pageSize
      : fallback.tickets_per_page;

  return {
    theme,
    reduce_motion:
      typeof data.reduce_motion === "boolean"
        ? data.reduce_motion
        : fallback.reduce_motion,
    sidebar_collapsed:
      typeof data.sidebar_collapsed === "boolean"
        ? data.sidebar_collapsed
        : fallback.sidebar_collapsed,
    tickets_per_page: ticketsPerPage,
  };
}

export function getCachedPreferences(userId = getStoredUser()?.id) {
  try {
    const cached = localStorage.getItem(getStorageKey(userId));
    return cached
      ? normalizePreferences(JSON.parse(cached))
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function cachePreferences(
  preferences: UserPreferences,
  userId = getStoredUser()?.id,
) {
  localStorage.setItem(
    getStorageKey(userId),
    JSON.stringify(preferences),
  );
}

export function applyPreferences(preferences: UserPreferences) {
  const resolvedTheme =
    preferences.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preferences.theme;
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preferences.theme;
  root.dataset.reduceMotion = String(preferences.reduce_motion);
  root.style.colorScheme = resolvedTheme;
}

export function initializePreferences() {
  applyPreferences(getCachedPreferences());
}
