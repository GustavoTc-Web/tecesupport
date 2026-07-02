import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  clearStoredSession,
  getStoredUser,
  type UserRole,
} from "../auth/session";
import usePreferences from "../preferences/usePreferences";
import BrandLogo from "./BrandLogo";
import UiIcon, { type UiIconName } from "./UiIcon";

type MenuItem = {
  icon: UiIconName;
  label: string;
  to: string;
};

const menuByRole: Record<UserRole, MenuItem[]> = {
  client: [
    { icon: "ticket", label: "Meus tickets", to: "/my-tickets" },
    { icon: "user-circle", label: "Meu perfil", to: "/profile" },
    { icon: "settings", label: "Configurações", to: "/settings" },
  ],
  analyst: [
    { icon: "ticket", label: "Tickets", to: "/tickets" },
    { icon: "dashboard", label: "Dashboard", to: "/dashboard" },
    { icon: "user-circle", label: "Meu perfil", to: "/profile" },
    { icon: "settings", label: "Configurações", to: "/settings" },
  ],
};

const roleLabels: Record<UserRole, string> = {
  analyst: "Analista",
  client: "Cliente",
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [manualCollapse, setManualCollapse] = useState<{
    preference: boolean;
    value: boolean;
  } | null>(null);
  const { preferences } = usePreferences();
  const navigate = useNavigate();
  const user = getStoredUser();
  const isCollapsed =
    manualCollapse?.preference === preferences.sidebar_collapsed
      ? manualCollapse.value
      : preferences.sidebar_collapsed;

  if (!user) {
    return null;
  }

  function handleLogout() {
    clearStoredSession();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar--open" : ""} ${
        isCollapsed ? "sidebar--collapsed" : ""
      }`}
    >
      <div className="sidebar-header">
        <NavLink
          to={user.role === "analyst" ? "/tickets" : "/my-tickets"}
          className="sidebar-brand"
          aria-label="Página inicial do TeceSupport"
          onClick={() => setIsOpen(false)}
        >
          <BrandLogo variant="sidebar" />
          <span className="sidebar-brand-copy">
            <strong>TeceSupport</strong>
            <small>Service Desk</small>
          </span>
        </NavLink>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="sidebar-content"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          <UiIcon name={isOpen ? "x" : "menu"} />
        </button>
      </div>

      <button
        type="button"
        className="sidebar-collapse-toggle"
        onClick={() =>
          setManualCollapse({
            preference: preferences.sidebar_collapsed,
            value: !isCollapsed,
          })
        }
        aria-label={
          isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"
        }
        title={
          isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"
        }
      >
        <UiIcon
          name={isCollapsed ? "chevron-right" : "chevron-left"}
        />
      </button>

      <div className="sidebar-content" id="sidebar-content">
        <nav className="sidebar-nav" aria-label="Navegação principal">
          {menuByRole[user.role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to !== "/tickets"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? item.label : undefined}
            >
              <UiIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-avatar" aria-hidden="true">
              {user.username.charAt(0).toUpperCase()}
            </span>
            <span className="sidebar-user-copy">
              <strong>{user.username}</strong>
              <small>{roleLabels[user.role]}</small>
            </span>
          </div>

          <div className="sidebar-footer-actions">
            <NavLink
              to="/profile"
              className="sidebar-profile-link"
              onClick={() => setIsOpen(false)}
            >
              <UiIcon name="user-circle" />
              <span>Ver perfil</span>
            </NavLink>
            <button
              type="button"
              className="sidebar-logout"
              onClick={handleLogout}
            >
              <UiIcon name="log-out" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
