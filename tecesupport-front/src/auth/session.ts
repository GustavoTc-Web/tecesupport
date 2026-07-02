export type UserRole = "client" | "analyst";

export type AuthenticatedUser = {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
};

export const SESSION_CHANGED_EVENT = "tecesupport:session-changed";

export function getStoredUser(): AuthenticatedUser | null {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as Partial<AuthenticatedUser>;
    const hasKnownRole = user.role === "client" || user.role === "analyst";

    if (
      typeof user.id !== "number" ||
      typeof user.username !== "string" ||
      !hasKnownRole
    ) {
      return null;
    }

    return user as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function hasAccessToken() {
  return Boolean(localStorage.getItem("access_token"));
}

export function getDefaultRoute(role: UserRole) {
  return role === "analyst" ? "/tickets" : "/my-tickets";
}

export function setStoredUser(user: AuthenticatedUser) {
  const previousUser = getStoredUser();
  localStorage.setItem("user", JSON.stringify(user));

  if (previousUser?.id !== user.id) {
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  }
}

export function clearStoredSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}
