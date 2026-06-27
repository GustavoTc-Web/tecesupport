import axios from "axios";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

type FeedbackState = {
  type: "error" | "success";
  message: string;
};

function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

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

    if (error.response?.status === 401) {
      return "Usuario ou senha invalidos. Tente novamente.";
    }
  }

  return "Nao foi possivel entrar agora. Verifique seus dados e tente novamente.";
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const stateFeedback = location.state as { successMessage?: string } | null;

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
      localStorage.setItem("user", JSON.stringify(user));

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
        <div className="login-brand-badge">TC-S</div>
        <span className="login-kicker">TeceSupport</span>
        <h1>Seu painel de suporte com cara de produto de verdade.</h1>
        <p>
          Organize chamados, acompanhe prioridades e mantenha a equipe alinhada
          com um acesso mais limpo, moderno e profissional.
        </p>

        <div className="login-highlights">
          <div className="login-highlight-card">
            <strong>Visão rápida</strong>
            <span>Identifique o que esta aberto, em andamento e urgente.</span>
          </div>
          <div className="login-highlight-card">
            <strong>Rotina mais fluida</strong>
            <span>Entre e retome o atendimento sem distrações desnecessárias.</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <span className="login-chip">Acesso ao sistema</span>
            <h2>Entrar</h2>
            <p>Use suas credenciais para acessar os tickets da equipe.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Usuario</span>
              <input
                type="text"
                placeholder="Digite seu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </label>

            <label className="login-field">
              <span>Senha</span>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            {(feedback || stateFeedback?.successMessage) && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: `1px solid ${
                    feedback?.type === "error"
                      ? "rgba(248, 113, 113, 0.45)"
                      : "rgba(74, 222, 128, 0.45)"
                  }`,
                  background:
                    feedback?.type === "error"
                      ? "rgba(127, 29, 29, 0.22)"
                      : "rgba(20, 83, 45, 0.22)",
                  color: feedback?.type === "error" ? "#fecaca" : "#bbf7d0",
                  lineHeight: 1.5,
                }}
              >
                {feedback?.message ?? stateFeedback?.successMessage}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar no sistema"}
            </button>

            <button
              type="button"
              className="login-submit"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
