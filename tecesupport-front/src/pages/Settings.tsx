import { useState, type FormEvent } from "react";

import { getApiErrorMessage } from "../api/errors";
import AppLayout from "../components/AppLayout";
import FormFeedback from "../components/FormFeedback";
import UiIcon from "../components/UiIcon";
import {
  type ThemePreference,
  type TicketsPerPage,
  type UserPreferences,
} from "../preferences/preferences";
import usePreferences from "../preferences/usePreferences";

type DraftState = {
  baseKey: string;
  value: UserPreferences;
};

const themeOptions: Array<{
  description: string;
  icon: "monitor" | "moon" | "sun";
  label: string;
  value: ThemePreference;
}> = [
  {
    value: "dark",
    label: "Escuro",
    description: "Interface com baixo brilho e alto contraste.",
    icon: "moon",
  },
  {
    value: "light",
    label: "Claro",
    description: "Superfícies claras para ambientes iluminados.",
    icon: "sun",
  },
  {
    value: "system",
    label: "Seguir sistema",
    description: "Acompanha automaticamente o seu dispositivo.",
    icon: "monitor",
  },
];

function getPreferencesKey(preferences: UserPreferences) {
  return JSON.stringify(preferences);
}

export default function Settings() {
  const {
    isLoading,
    loadError,
    preferences,
    refreshPreferences,
    savePreferences,
  } = usePreferences();
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const preferencesKey = getPreferencesKey(preferences);
  const draft =
    draftState?.baseKey === preferencesKey
      ? draftState.value
      : preferences;
  const isDirty = getPreferencesKey(draft) !== preferencesKey;

  function updateDraft(partial: Partial<UserPreferences>) {
    setDraftState((current) => ({
      baseKey: preferencesKey,
      value: {
        ...(current?.baseKey === preferencesKey
          ? current.value
          : preferences),
        ...partial,
      },
    }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await savePreferences(draft);
      setDraftState(null);
      setFeedback({
        type: "success",
        message: "Preferências atualizadas com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível salvar suas preferências.",
        ),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppLayout>
      <header className="topbar topbar-panel">
        <div className="topbar-copy">
          <span className="section-kicker">Minha conta</span>
          <h1>Configurações</h1>
          <p>Preferências da conta e do ambiente de trabalho.</p>
        </div>
      </header>

      <form
        className="surface-panel settings-panel"
        onSubmit={handleSubmit}
        aria-busy={isLoading || isSaving}
      >
        <div className="settings-panel-header">
          <div>
            <span className="settings-heading-icon">
              <UiIcon name="settings" />
            </span>
            <h2>Preferências do sistema</h2>
            <p>
              Personalize a interface sem alterar seus dados ou permissões.
            </p>
          </div>
          {isLoading && (
            <span className="settings-loading" role="status">
              <span className="login-spinner" aria-hidden="true" />
              Sincronizando...
            </span>
          )}
        </div>

        {loadError && (
          <div className="settings-load-error">
            <FormFeedback type="error" message={loadError} />
            <button
              type="button"
              className="profile-button profile-button--secondary"
              onClick={() => void refreshPreferences()}
              disabled={isLoading}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <fieldset className="settings-section" disabled={isLoading || isSaving}>
          <legend>Aparência</legend>
          <p className="settings-section-description">
            Escolha como o TeceSupport deve aparecer neste dispositivo.
          </p>

          <div className="theme-options">
            {themeOptions.map((option) => (
              <label
                key={option.value}
                className={`theme-option ${
                  draft.theme === option.value ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={draft.theme === option.value}
                  onChange={() => updateDraft({ theme: option.value })}
                />
                <span className="theme-option-icon">
                  <UiIcon name={option.icon} />
                </span>
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                <span className="theme-option-check" aria-hidden="true">
                  <UiIcon name="check-circle" />
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="settings-section" aria-labelledby="accessibility-title">
          <div className="settings-section-heading">
            <span className="settings-section-icon">
              <UiIcon name="accessibility" />
            </span>
            <div>
              <h3 id="accessibility-title">Acessibilidade</h3>
              <p>Controle movimentos não essenciais da interface.</p>
            </div>
          </div>

          <label className="settings-toggle-row">
            <span>
              <strong>Reduzir animações</strong>
              <small>Minimiza transições, movimentos e efeitos decorativos.</small>
            </span>
            <input
              type="checkbox"
              checked={draft.reduce_motion}
              onChange={(event) =>
                updateDraft({ reduce_motion: event.target.checked })
              }
              disabled={isLoading || isSaving}
            />
            <span className="settings-switch" aria-hidden="true" />
          </label>
        </section>

        <section className="settings-section" aria-labelledby="navigation-title">
          <div className="settings-section-heading">
            <span className="settings-section-icon">
              <UiIcon name="panel-left" />
            </span>
            <div>
              <h3 id="navigation-title">Navegação</h3>
              <p>Defina o estado inicial da barra lateral.</p>
            </div>
          </div>

          <label className="settings-toggle-row">
            <span>
              <strong>Manter a barra lateral recolhida</strong>
              <small>
                Inicia a navegação compacta; ainda será possível expandi-la.
              </small>
            </span>
            <input
              type="checkbox"
              checked={draft.sidebar_collapsed}
              onChange={(event) =>
                updateDraft({ sidebar_collapsed: event.target.checked })
              }
              disabled={isLoading || isSaving}
            />
            <span className="settings-switch" aria-hidden="true" />
          </label>
        </section>

        <section className="settings-section" aria-labelledby="tickets-title">
          <div className="settings-section-heading">
            <span className="settings-section-icon">
              <UiIcon name="ticket" />
            </span>
            <div>
              <h3 id="tickets-title">Tickets</h3>
              <p>Escolha quantos chamados aparecem em cada página.</p>
            </div>
          </div>

          <label className="settings-select-field">
            <span>Tickets por página</span>
            <select
              value={draft.tickets_per_page}
              onChange={(event) =>
                updateDraft({
                  tickets_per_page: Number(
                    event.target.value,
                  ) as TicketsPerPage,
                })
              }
              disabled={isLoading || isSaving}
            >
              <option value={10}>10 tickets</option>
              <option value={20}>20 tickets</option>
              <option value={50}>50 tickets</option>
            </select>
          </label>
        </section>

        {feedback && (
          <FormFeedback type={feedback.type} message={feedback.message} />
        )}

        <div className="settings-actions">
          <span>
            {isDirty
              ? "Você possui alterações não salvas."
              : "Suas preferências estão sincronizadas."}
          </span>
          <button
            type="submit"
            className="profile-button profile-button--primary"
            disabled={!isDirty || isLoading || isSaving}
          >
            {isSaving && <span className="login-spinner" aria-hidden="true" />}
            {isSaving ? "Salvando..." : "Salvar preferências"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
