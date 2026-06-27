import axios from "axios";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

type FeedbackState = {
  type: "error" | "success";
  message: string;
};

type FormState = {
  title: string;
  description: string;
  contact_phone1: string;
  contact_phone2: string;
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.title) && data.title[0]) {
      return data.title[0];
    }

    if (Array.isArray(data?.description) && data.description[0]) {
      return data.description[0];
    }

    if (Array.isArray(data?.contact_phone1) && data.contact_phone1[0]) {
      return data.contact_phone1[0];
    }

    if (Array.isArray(data?.contact_phone2) && data.contact_phone2[0]) {
      return data.contact_phone2[0];
    }

    if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
      return data.non_field_errors[0];
    }

    if (error.response?.status === 401) {
      return "Sua sessao expirou. Entre novamente para criar um ticket.";
    }
  }

  return "Nao foi possivel criar o ticket agora. Revise os dados e tente novamente.";
}

export default function NewTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    contact_phone1: "",
    contact_phone2: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const token = localStorage.getItem("access_token");

    if (!token) {
      setFeedback({
        type: "error",
        message: "Voce precisa entrar novamente para criar um ticket.",
      });
      setIsSubmitting(false);
      return;
    }

    if (!form.contact_phone1.trim()) {
      setFeedback({
        type: "error",
        message: "Informe pelo menos um telefone para contato.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post(
        "/tickets/",
        {
          title: form.title,
          description: form.description,
          contact_phone1: form.contact_phone1,
          contact_phone2: form.contact_phone2,
        },
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFeedback({
        type: "success",
        message: "Ticket criado com sucesso. Redirecionando...",
      });

      navigate("/my-tickets");
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-header">
            <div className="logo-box">TS</div>
            <div>
              <h2>TeceSupport</h2>
              <p>Service Desk</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">Novo Ticket</button>
            <button className="nav-item">Meus Tickets</button>
            <button className="nav-item">Dashboard</button>
            <button className="nav-item">Configuracoes</button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-footer-label">Cliente</span>
          <strong>Abrir chamado</strong>
          <p>Descreva o problema com clareza para agilizar o atendimento.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar topbar-panel">
          <div className="topbar-copy">
            <span className="section-kicker">Novo chamado</span>
            <h1>Criar Ticket</h1>
            <p>Preencha os dados abaixo para registrar sua solicitação.</p>
          </div>
        </header>

        <section className="surface-panel" style={{ maxWidth: 860 }}>
          <div className="panel-header">
            <div>
              <h3>Formulário de abertura</h3>
              <p className="panel-subtitle">
                Informe um título claro, explique o problema e aguarde o contato dos analistas.
              </p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Título</span>
              <input
                type="text"
                name="title"
                placeholder="Ex: Nao consigo acessar minha conta"
                value={form.title}
                onChange={handleChange}
              />
            </label>

            <label className="login-field">
              <span>Descrição</span>
              <textarea
                name="description"
                placeholder="Explique o problema com o maximo de detalhes possivel"
                value={form.description}
                onChange={handleChange}
                rows={6}
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  border: "1px solid #243247",
                  background: "rgba(15, 23, 42, 0.88)",
                  color: "#f8fafc",
                  padding: "15px 16px",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.6,
                  font: "inherit",
                }}
              />
            </label>

            <label className="login-field">
              <span>Telefone para contato</span>
              <input
                type="text"
                name="contact_phone1"
                placeholder="Digite seu telefone principal"
                onChange={handleChange}
                value={form.contact_phone1}
              />
            </label>

            <label className="login-field">
              <span>Telefone secundario</span>
              <input
                type="text"
                name="contact_phone2"
                placeholder="Opcional"
                onChange={handleChange}
                value={form.contact_phone2}
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
              {isSubmitting ? "Criando..." : "Criar Ticket"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
