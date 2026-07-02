import axios from "axios";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import BrandLogo from "../components/BrandLogo";

type FeedbackState = {
  type: "error" | "success";
  message: string;
};

function getRegisterErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.detail === "string") return data.detail;

    if (Array.isArray(data?.email) && data.email[0]) {
      return "E-mail já cadastrado. Tente usar outro e-mail.";
    }

    if (Array.isArray(data?.username) && data.username[0]) {
      return "Nome de usuário indisponível. Escolha outro.";
    }

    if (Array.isArray(data?.password) && data.password[0]) {
      return data.password[0];
    }

    if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
      return data.non_field_errors[0];
    }
  }

  return "Não foi possível criar sua conta agora. Tente novamente mais tarde.";
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setFeedback({
        type: "error",
        message: "Todos os campos devem ser preenchidos.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/users/register/", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setFeedback({
        type: "success",
        message: "Conta criada com sucesso. Você já pode fazer login.",
      });

      navigate("/login", {
        state: {
          successMessage: "Conta criada com sucesso. Agora faça seu login.",
        },
      });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      setFeedback({
        type: "error",
        message: getRegisterErrorMessage(error),
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
        <h1>Crie sua conta e acompanhe seus chamados.</h1>
        <p>
          Cadastre-se para acessar a plataforma e visualizar os tickets
          vinculados ao seu usuário.
        </p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <span className="login-chip">Novo cadastro</span>
            <h2>Criar conta</h2>
            <p>Preencha os dados abaixo para acessar o sistema.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Usuário</span>
              <input
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </label>

            <label className="login-field">
              <span>E-mail</span>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="login-field">
              <span>Senha</span>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            {feedback && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: `1px solid ${
                    feedback.type === "error"
                      ? "rgba(248, 113, 113, 0.45)"
                      : "rgba(74, 222, 128, 0.45)"
                  }`,
                  background:
                    feedback.type === "error"
                      ? "rgba(127, 29, 29, 0.22)"
                      : "rgba(20, 83, 45, 0.22)",
                  color: feedback.type === "error" ? "#fecaca" : "#bbf7d0",
                  lineHeight: 1.5,
                }}
              >
                {feedback.message}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
