import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/api";
import type { Comment, Ticket, TicketHistory } from "../types/ticket";

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Aberto";
    case "in_progress":
      return "Em andamento";
    case "resolved":
      return "Resolvido";
    default:
      return status;
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "low":
      return "Baixa";
    case "medium":
      return "Media";
    case "high":
      return "Alta";
    default:
      return priority;
  }
}

function getAssignedName(ticket: Ticket) {
  return (
    ticket.assigned_to_name ??
    ticket.assigned_to_username ??
    (ticket.assigned_to ? String(ticket.assigned_to) : "Aguardando analista")
  );
}

function formatCommentDate(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}

function getHistoryUserLabel(history: TicketHistory) {
  return history.user_name || history.user_username || "Sistema";
}

export default function TicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentFeedback, setCommentFeedback] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) {
        setError("Ticket nao encontrado.");
        setLoading(false);
        return;
      }

      try {
        const [ticketResponse, commentsResponse] = await Promise.all([
          api.get(`/tickets/${id}/`),
          api.get(`/tickets/${id}/comments/`),
        ]);

        setTicket(ticketResponse.data);
        setComments(commentsResponse.data);
      } catch (err) {
        console.error("Erro ao carregar detalhes do ticket:", err);
        setError("Nao foi possivel carregar os detalhes do ticket.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  async function handleAssign() {
    if (!id) {
      return;
    }

    setIsAssigning(true);
    setActionFeedback("");

    try {
      const response = await api.post(`/tickets/${id}/assign_to_me/`);
      setTicket(response.data);
      setActionFeedback("Chamado assumido com sucesso.");
    } catch (err) {
      console.error("Erro ao assumir chamado:", err);
      setActionFeedback("Nao foi possivel assumir este chamado.");
    } finally {
      setIsAssigning(false);
    }
  }

  async function handlePriorityChange(priority: string) {
    if (!id) {
      return;
    }

    setIsUpdatingPriority(true);
    setActionFeedback("");

    try {
      const response = await api.patch(`/tickets/${id}/update_priority/`, {
        priority,
      });
      setTicket(response.data);
      setActionFeedback("Prioridade atualizada com sucesso.");
    } catch (err) {
      console.error("Erro ao alterar prioridade:", err);
      setActionFeedback("Nao foi possivel alterar a prioridade.");
    } finally {
      setIsUpdatingPriority(false);
    }
  }

  async function handleStatusChange(nextStatus: "open" | "resolved") {
    if (!id || !ticket) {
      return;
    }

    const confirmMessage =
      nextStatus === "resolved"
        ? "Deseja resolver este chamado?"
        : "Deseja reabrir este chamado?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsUpdatingStatus(true);
    setActionFeedback("");

    try {
      const response = await api.patch(`/tickets/${id}/update_status/`, {
        status: nextStatus,
      });
      setTicket(response.data);
      setActionFeedback(
        nextStatus === "resolved"
          ? "Chamado resolvido com sucesso."
          : "Chamado reaberto com sucesso."
      );
    } catch (err) {
      console.error("Erro ao atualizar status do chamado:", err);
      setActionFeedback(
        nextStatus === "resolved"
          ? "Nao foi possivel resolver o chamado."
          : "Nao foi possivel reabrir o chamado."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleCommentSubmit() {
    if (!id) {
      return;
    }

    if (!commentMessage.trim()) {
      setCommentFeedback("Digite um comentario antes de enviar.");
      return;
    }

    setIsSubmittingComment(true);
    setCommentFeedback("");

    try {
      await api.post(`/tickets/${id}/comments/`, {
        message: commentMessage,
      });

      const commentsResponse = await api.get(`/tickets/${id}/comments/`);
      setComments(commentsResponse.data);
      setCommentMessage("");
      setCommentFeedback("Comentario enviado com sucesso.");
    } catch (err) {
      console.error("Erro ao enviar comentario:", err);
      setCommentFeedback("Nao foi possivel enviar o comentario.");
    } finally {
      setIsSubmittingComment(false);
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
            <button className="nav-item active">Detalhe do Ticket</button>
            <button className="nav-item">Dashboard</button>
            <button className="nav-item">Usuarios</button>
            <button className="nav-item">Relatorios</button>
            <button className="nav-item">Configuracoes</button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-footer-label">Ambiente</span>
          <strong>Visao detalhada</strong>
          <p>Acompanhe as informacoes completas e os comentarios do chamado.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar topbar-panel">
          <div className="topbar-copy">
            <span className="section-kicker">Ticket</span>
            <h1>Detalhes do Ticket</h1>
            <p>Veja descricao, prioridade, responsavel e historico de comentarios.</p>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="new-ticket-btn"
              onClick={() => navigate("/tickets")}
            >
              Voltar para tickets
            </button>
          </div>
        </header>

        <section className="surface-panel">
          {loading && <p className="panel-message">Carregando detalhes...</p>}
          {error && <p className="panel-message error-text">{error}</p>}

          {!loading && !error && !ticket && (
            <div className="empty-state">
              <strong>Ticket nao encontrado</strong>
              <p>Verifique o chamado e tente novamente.</p>
            </div>
          )}

          {!loading && !error && ticket && (
            <div className="details-content">
              <div className="panel-header">
                <div>
                  <h3>{ticket.title}</h3>
                  <p className="panel-subtitle">#{ticket.id}</p>
                </div>
                <div className="details-badges">
                  <span className={`status-badge ${ticket.status}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                  <span className={`priority-badge ${ticket.priority}`}>
                    Prioridade {getPriorityLabel(ticket.priority)}
                  </span>
                </div>
              </div>

              <div className="details-section">
                <h4>Descricao</h4>
                <p>{ticket.description}</p>
              </div>

              <div className="details-section">
                <h4>Informacoes</h4>
                <div className="info-grid">
                  <div className="info-card">
                    <span className="info-label">Responsavel</span>
                    <span className="info-value">{getAssignedName(ticket)}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Prioridade</span>
                    <span className="info-value">{getPriorityLabel(ticket.priority)}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Telefone principal</span>
                    <span className="info-value">{ticket.contact_phone1 || "-"}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Telefone secundario</span>
                    <span className="info-value">{ticket.contact_phone2 || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Acoes do chamado</h4>

                <div
                  className="info-card"
                  style={{
                    padding: "20px",
                    borderRadius: "22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  {actionFeedback && (
                    <div
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "14px",
                        border: `1px solid ${
                          actionFeedback.includes("sucesso")
                            ? "rgba(74, 222, 128, 0.45)"
                            : "rgba(248, 113, 113, 0.45)"
                        }`,
                        background: actionFeedback.includes("sucesso")
                          ? "rgba(20, 83, 45, 0.22)"
                          : "rgba(127, 29, 29, 0.22)",
                        color: actionFeedback.includes("sucesso")
                          ? "#bbf7d0"
                          : "#fecaca",
                        lineHeight: 1.5,
                      }}
                    >
                      {actionFeedback}
                    </div>
                  )}

                  {!ticket.assigned_to ? (
                    <button
                      type="button"
                      className="new-ticket-btn"
                      onClick={handleAssign}
                      disabled={isAssigning}
                    >
                      {isAssigning ? "Assumindo..." : "Assumir chamado"}
                    </button>
                  ) : (
                    <p className="panel-message" style={{ margin: 0 }}>
                      Responsavel: {getAssignedName(ticket)}
                    </p>
                  )}

                  <div className="login-field" style={{ width: "100%", maxWidth: 320 }}>
                    <span>Alterar prioridade</span>
                    <select
                      value={ticket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      disabled={isUpdatingPriority}
                      style={{
                        width: "100%",
                        borderRadius: "16px",
                        border: "1px solid #243247",
                        background: "rgba(15, 23, 42, 0.88)",
                        color: "#f8fafc",
                        padding: "15px 16px",
                        outline: "none",
                        font: "inherit",
                      }}
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    {(ticket.status === "open" || ticket.status === "in_progress") && (
                      <button
                        type="button"
                        className="new-ticket-btn"
                        onClick={() => handleStatusChange("resolved")}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Atualizando..." : "Resolver chamado"}
                      </button>
                    )}

                    {(ticket.status === "resolved" || ticket.status === "closed") && (
                      <button
                        type="button"
                        className="new-ticket-btn"
                        onClick={() => handleStatusChange("open")}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? "Atualizando..." : "Reabrir chamado"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Comentarios</h4>
                <div className="login-field" style={{ marginBottom: "16px" }}>
                  <span>Novo comentario</span>
                  <textarea
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    placeholder="Escreva seu comentario"
                    rows={4}
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
                </div>

                {commentFeedback && (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "14px",
                      border: `1px solid ${
                        commentFeedback.includes("sucesso")
                          ? "rgba(74, 222, 128, 0.45)"
                          : "rgba(248, 113, 113, 0.45)"
                      }`,
                      background: commentFeedback.includes("sucesso")
                        ? "rgba(20, 83, 45, 0.22)"
                        : "rgba(127, 29, 29, 0.22)",
                      color: commentFeedback.includes("sucesso")
                        ? "#bbf7d0"
                        : "#fecaca",
                      lineHeight: 1.5,
                      marginBottom: "16px",
                    }}
                  >
                    {commentFeedback}
                  </div>
                )}

                <button
                  type="button"
                  className="new-ticket-btn"
                  onClick={handleCommentSubmit}
                  disabled={isSubmittingComment}
                  style={{ marginBottom: "18px" }}
                >
                  {isSubmittingComment ? "Enviando..." : "Enviar comentario"}
                </button>

                {comments.length === 0 ? (
                  <p>Nenhum comentario registrado ainda.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-box">
                      <strong>{comment.author_username}</strong>
                      <span className="info-label" style={{ marginBottom: "8px" }}>
                        {formatCommentDate(comment.created_at)}
                      </span>
                      <p>{comment.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="details-section">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: isHistoryOpen ? "16px" : "0",
                  }}
                >
                  <h4 style={{ marginBottom: 0 }}>
                    Historico do chamado ({ticket.histories?.length ?? 0})
                  </h4>
                  <button
                    type="button"
                    className="new-ticket-btn"
                    onClick={() => setIsHistoryOpen((current) => !current)}
                    style={{
                      padding: "10px 16px",
                      minWidth: "fit-content",
                    }}
                  >
                    {isHistoryOpen ? "Ocultar historico do chamado" : "Ver historico do chamado"}
                  </button>
                </div>

                {isHistoryOpen &&
                  (!ticket.histories || ticket.histories.length === 0 ? (
                    <p>Nenhum historico registrado ainda.</p>
                  ) : (
                    ticket.histories.map((history) => (
                      <div
                        key={history.id}
                        style={{
                          position: "relative",
                          paddingLeft: "28px",
                          marginBottom: "18px",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: "0",
                            top: "6px",
                            width: "12px",
                            height: "12px",
                            borderRadius: "999px",
                            background: "linear-gradient(135deg, #60a5fa, #38bdf8)",
                            boxShadow: "0 0 0 4px rgba(96, 165, 250, 0.12)",
                          }}
                        />
                        <div
                          className="comment-box"
                          style={{
                            marginBottom: 0,
                            borderLeft: "1px solid rgba(96, 165, 250, 0.2)",
                          }}
                        >
                          <strong>{history.description}</strong>
                          <span className="info-label" style={{ marginBottom: "8px" }}>
                            {getHistoryUserLabel(history)} • {formatCommentDate(history.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
