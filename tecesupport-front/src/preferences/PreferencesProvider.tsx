import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import api from "../api/api";
import { getApiErrorMessage } from "../api/errors";
import {
  getStoredUser,
  hasAccessToken,
  SESSION_CHANGED_EVENT,
} from "../auth/session";
import PreferencesContext from "./PreferencesContext";
import {
  applyPreferences,
  cachePreferences,
  DEFAULT_PREFERENCES,
  getCachedPreferences,
  normalizePreferences,
  type UserPreferences,
} from "./preferences";

export default function PreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState(getCachedPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const refreshPreferences = useCallback(async () => {
    const user = getStoredUser();

    if (!user || !hasAccessToken()) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoadError("");
      setIsLoading(false);
      return;
    }

    const cachedPreferences = getCachedPreferences(user.id);
    setPreferences(cachedPreferences);
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await api.get("/users/preferences/");
      const nextPreferences = normalizePreferences(
        response.data,
        cachedPreferences,
      );

      setPreferences(nextPreferences);
      cachePreferences(nextPreferences, user.id);
    } catch (error) {
      setLoadError(
        getApiErrorMessage(
          error,
          "Não foi possível carregar suas preferências.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePreferences = useCallback(
    async (nextPreferences: UserPreferences) => {
      const response = await api.patch(
        "/users/preferences/",
        nextPreferences,
      );
      const savedPreferences = normalizePreferences(
        response.data,
        nextPreferences,
      );
      const user = getStoredUser();

      setPreferences(savedPreferences);
      cachePreferences(savedPreferences, user?.id);
      setLoadError("");

      return savedPreferences;
    },
    [],
  );

  useEffect(() => {
    void refreshPreferences();
    window.addEventListener(SESSION_CHANGED_EVENT, refreshPreferences);

    return () =>
      window.removeEventListener(SESSION_CHANGED_EVENT, refreshPreferences);
  }, [refreshPreferences]);

  useEffect(() => {
    applyPreferences(preferences);

    if (preferences.theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => applyPreferences(preferences);

    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, [preferences]);

  const value = useMemo(
    () => ({
      isLoading,
      loadError,
      preferences,
      refreshPreferences,
      savePreferences,
    }),
    [
      isLoading,
      loadError,
      preferences,
      refreshPreferences,
      savePreferences,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
