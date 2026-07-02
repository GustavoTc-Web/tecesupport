import { useContext } from "react";

import PreferencesContext from "./PreferencesContext";

export default function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences deve ser usado dentro de PreferencesProvider.");
  }

  return context;
}
