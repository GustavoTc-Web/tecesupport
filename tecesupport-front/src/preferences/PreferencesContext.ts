import { createContext } from "react";

import type { UserPreferences } from "./preferences";

export type PreferencesContextValue = {
  isLoading: boolean;
  loadError: string;
  preferences: UserPreferences;
  refreshPreferences: () => Promise<void>;
  savePreferences: (
    preferences: UserPreferences,
  ) => Promise<UserPreferences>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export default PreferencesContext;
