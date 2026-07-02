import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import { setStoredUser } from "../auth/session";
import BrandLogo from "../components/BrandLogo";
import UiIcon from "../components/UiIcon";

type FeedbackState = {
  type: "error" | "success";
  message: string;
};

function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    }

    if (error.response.status === 400 || error.response.status === 401) {
      return "Usuário ou senha inválidos. Revise os dados e tente novamente.";
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.error === "string") {
      return data.error;
    }

    if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
      return data.non_field_errors[0];
    }

    if (Array.isArray(data?.username) && data.username[0]) {
      return data.username[0];
    }

  }

  return "Não foi possível entrar agora. Tente novamente em alguns instantes.";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { successMessage?: string } | null;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(() =>
    locationState?.successMessage
      ? { type: "success", message: locationState.successMessage }
      : null,
  );

  function clearFeedback() {
    if (feedback) {
      setFeedback(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await api.post("/login/", {
        username,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setStoredUser(user);

      if (user?.role === "analyst") {
        navigate("/tickets");
      } else {
        navigate("/my-tickets");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setFeedback({
        type: "error",
        message: getLoginErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <BrandLogo />
        <span className="login-kicker">TeceSupport</span>
        <h1>Suporte simples, rápido e transparente.</h1>
        <p>
          Abra chamados, acompanhe cada etapa do atendimento e mantenha todas
          as informações em um só lugar.
        </p>

        <div className="login-highlights">
          <div className="login-highlight-card">
            <strong>Acompanhe tudo</strong>
            <span>
              Consulte o status, a prioridade e o responsável por cada chamado.
            </span>
          </div>
          <div className="login-highlight-card">
            <strong>Atendimento sem complicação</strong>
            <span>
              Envie solicitações e acompanhe as respostas da equipe de suporte.
            </span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <span className="login-chip">Acesso ao sistema</span>
            <h2>Entrar</h2>
            <p>Acesse sua conta para abrir e acompanhar seus chamados.</p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
          >
            <div className="login-field">
              <label htmlFor="login-username">Usuário</label>
              <div className="login-input-shell">
                <UiIcon name="user" className="login-input-icon" />
                <input
                  id="login-username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearFeedback();
                  }}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={feedback?.type === "error"}
                  aria-describedby={
                    feedback?.type === "error" ? "login-feedback" : undefined
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Senha</label>
              <div className="login-input-shell login-input-shell--password">
                <UiIcon name="lock" className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFeedback();
                  }}
                  autoComplete="current-password"
                  aria-invalid={feedback?.type === "error"}
                  aria-describedby={
                    feedback?.type === "error" ? "login-feedback" : undefined
                  }
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((isVisible) => !isVisible)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <UiIcon name={showPassword ? "eye-off" : "eye"} />
                </button>
              </div>
            </div>

            {feedback && (
              <div
                id="login-feedback"
                className={`login-feedback login-feedback--${feedback.type}`}
                role={feedback.type === "error" ? "alert" : "status"}
                aria-live={feedback.type === "error" ? "assertive" : "polite"}
              >
                <UiIcon
                  name={
                    feedback.type === "error"
                      ? "alert-circle"
                      : "check-circle"
                  }
                />
                <span>{feedback.message}</span>
              </div>
            )}

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting && <span className="login-spinner" aria-hidden="true" />}
              <span>{isSubmitting ? "Entrando..." : "Entrar no sistema"}</span>
            </button>

            <div className="login-register-prompt">
              <span>Ainda não possui acesso?</span>
              <Link className="login-secondary-action" to="/register">
                Criar conta
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
