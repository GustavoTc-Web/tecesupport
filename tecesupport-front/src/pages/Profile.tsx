import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import api from "../api/api";
import { getApiErrorMessage } from "../api/errors";
import {
  getStoredUser,
  setStoredUser,
  type AuthenticatedUser,
} from "../auth/session";
import AppLayout from "../components/AppLayout";
import ChangePasswordModal from "../components/ChangePasswordModal";
import FormFeedback from "../components/FormFeedback";
import UiIcon from "../components/UiIcon";

type ProfileForm = {
  email: string;
  username: string;
};

type FeedbackState = {
  message: string;
  type: "error" | "success";
};

function getRoleLabel(user: AuthenticatedUser | null) {
  if (!user) {
    return "-";
  }

  return user.role === "analyst" ? "Analista" : "Cliente";
}

export default function Profile() {
  const storedUser = getStoredUser();
  const changePasswordButtonRef = useRef<HTMLButtonElement>(null);
  const [profile, setProfile] = useState<AuthenticatedUser | null>(storedUser);
  const [form, setForm] = useState<ProfileForm>({
    email: storedUser?.email ?? "",
    username: storedUser?.username ?? "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await api.get<AuthenticatedUser>("/users/me/");
      setProfile(response.data);
      setForm({
        email: response.data.email ?? "",
        username: response.data.username,
      });
      setStoredUser(response.data);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível carregar os dados do perfil.",
        ),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const closePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
    window.requestAnimationFrame(() => changePasswordButtonRef.current?.focus());
  }, []);

  function startEditing() {
    if (!profile) {
      return;
    }

    setForm({
      email: profile.email ?? "",
      username: profile.username,
    });
    setFeedback(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    if (profile) {
      setForm({
        email: profile.email ?? "",
        username: profile.username,
      });
    }

    setFeedback(null);
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await api.patch<Partial<AuthenticatedUser>>(
        "/users/me/",
        {
          email: form.email,
          username: form.username,
        },
      );
      const nextProfile: AuthenticatedUser = {
        ...profile,
        ...response.data,
        email: response.data.email ?? form.email,
        username: response.data.username ?? form.username,
        role:
          response.data.role === "analyst" || response.data.role === "client"
            ? response.data.role
            : profile.role,
      };

      setProfile(nextProfile);
      setForm({
        email: nextProfile.email ?? "",
        username: nextProfile.username,
      });
      setStoredUser(nextProfile);
      setIsEditing(false);
      setFeedback({
        type: "success",
        message: "Perfil atualizado com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível atualizar o perfil. Revise os dados.",
        ),
      });
    } finally {
      setIsSaving(false);
    }
  }

  const roleLabel = getRoleLabel(profile);

  return (
    <AppLayout>
      <header className="topbar topbar-panel">
        <div className="topbar-copy">
          <span className="section-kicker">Minha conta</span>
          <h1>Meu perfil</h1>
          <p>Gerencie seus dados de acesso e a segurança da sua conta.</p>
        </div>
      </header>

      <div className="profile-grid">
        <section className="surface-panel profile-card">
          <div className="profile-card-header">
            <div className="profile-identity">
              <span className="profile-avatar" aria-hidden="true">
                {(profile?.username ?? "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <h2>{profile?.username ?? "Seu perfil"}</h2>
                <p>{profile?.email || "E-mail não informado"}</p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="profile-button profile-button--secondary"
                onClick={startEditing}
                disabled={isLoading || !profile}
              >
                <UiIcon name="edit" />
                Editar perfil
              </button>
            )}
          </div>

          {isLoading && (
            <div className="profile-loading" role="status">
              <span className="login-spinner" aria-hidden="true" />
              Carregando dados do perfil...
            </div>
          )}

          {!isLoading && feedback && (
            <FormFeedback
              id="profile-feedback"
              type={feedback.type}
              message={feedback.message}
            />
          )}

          {!isLoading && !profile && (
            <button
              type="button"
              className="profile-button profile-button--secondary"
              onClick={() => void loadProfile()}
            >
              Tentar novamente
            </button>
          )}

          {!isLoading && profile && !isEditing && (
            <div className="profile-details">
              <div className="profile-detail-item">
                <span className="profile-detail-icon">
                  <UiIcon name="user" />
                </span>
                <span>
                  <small>Nome de usuário</small>
                  <strong>{profile.username}</strong>
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-icon">
                  <UiIcon name="mail" />
                </span>
                <span>
                  <small>E-mail</small>
                  <strong>{profile.email || "-"}</strong>
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-icon">
                  <UiIcon name="shield" />
                </span>
                <span>
                  <small>Papel de acesso</small>
                  <strong>{roleLabel}</strong>
                </span>
              </div>
            </div>
          )}

          {!isLoading && profile && isEditing && (
            <form className="profile-form" onSubmit={handleSave}>
              <label className="profile-field">
                <span>Nome de usuário</span>
                <span className="profile-input-shell">
                  <UiIcon name="user" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }));
                      setFeedback(null);
                    }}
                    autoComplete="username"
                    disabled={isSaving}
                    aria-describedby={
                      feedback?.type === "error"
                        ? "profile-feedback"
                        : undefined
                    }
                    required
                  />
                </span>
              </label>

              <label className="profile-field">
                <span>E-mail</span>
                <span className="profile-input-shell">
                  <UiIcon name="mail" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }));
                      setFeedback(null);
                    }}
                    autoComplete="email"
                    disabled={isSaving}
                    aria-describedby={
                      feedback?.type === "error"
                        ? "profile-feedback"
                        : undefined
                    }
                    required
                  />
                </span>
              </label>

              <div className="profile-readonly-field" aria-readonly="true">
                <span className="profile-detail-icon">
                  <UiIcon name="shield" />
                </span>
                <span>
                  <small>Papel de acesso</small>
                  <strong>{roleLabel}</strong>
                  <em>Definido pelas permissões do sistema.</em>
                </span>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-button profile-button--secondary"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="profile-button profile-button--primary"
                  disabled={isSaving}
                >
                  {isSaving && (
                    <span className="login-spinner" aria-hidden="true" />
                  )}
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="surface-panel profile-security-card">
          <span className="profile-security-icon">
            <UiIcon name="key" />
          </span>
          <span className="section-kicker">Segurança</span>
          <h2>Senha da conta</h2>
          <p>
            Atualize sua senha periodicamente para manter o acesso protegido.
          </p>
          <button
            ref={changePasswordButtonRef}
            type="button"
            className="profile-button profile-button--secondary"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <UiIcon name="key" />
            Alterar senha
          </button>
        </aside>
      </div>

      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={closePasswordModal} />
      )}
    </AppLayout>
  );
}
