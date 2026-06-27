import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import type { Comment, Ticket } from "../types/ticket";

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

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/tickets/")
      .then((response) => {
        const data = response.data;
        const ticketList = Array.isArray(data) ? data : data.results ?? [];

        setTickets(ticketList);

        if (ticketList.length > 0) {
          setSelectedTicket(ticketList[0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar tickets:", err);
        setError("Nao foi possivel carregar os tickets.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    async function fetchSelectedTicketData() {
      if (!selectedTicket) {
        setComments([]);
        return;
      }

      setDetailsLoading(true);
      setCommentsLoading(true);

      try {
        const [ticketResponse, commentsResponse] = await Promise.all([
          api.get(`/tickets/${selectedTicket.id}/`),
          api.get(`/tickets/${selectedTicket.id}/comments/`),
        ]);

        setSelectedTicket(ticketResponse.data);
        setComments(commentsResponse.data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do ticket:", err);
        setComments([]);
      } finally {
        setDetailsLoading(false);
        setCommentsLoading(false);
      }
    }

    fetchSelectedTicketData();
  }, [selectedTicket?.id]);

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
            <button className="nav-item active">Meus Tickets</button>
            <button className="nav-item">Dashboard</button>
            <button className="nav-item">Usuarios</button>
            <button className="nav-item">Relatorios</button>
            <button className="nav-item">Configuracoes</button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-footer-label">Cliente</span>
          <strong>Meus chamados</strong>
          <p>Acompanhe apenas os tickets vinculados a voce.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar topbar-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div className="topbar-copy">
              <span className="section-kicker">Cliente</span>
              <h1>Meus Tickets</h1>
              <p>Veja o andamento dos seus chamados de forma simples.</p>
            </div>

            <button
              onClick={() => navigate("/new-ticket")}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                height: "fit-content",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              }}
            >
              + Novo Ticket
            </button>
          </div>
        </header>

        <section className="content-grid">
          <div className="ticket-list-panel surface-panel">
            <div className="panel-header">
              <div>
                <h3>Seus chamados</h3>
                <p className="panel-subtitle">
                  Lista simples dos tickets associados ao seu usuario.
                </p>
              </div>
              <span>{tickets.length} itens</span>
            </div>

            {loading && <p className="panel-message">Carregando tickets...</p>}
            {error && <p className="panel-message error-text">{error}</p>}

            {!loading && !error && tickets.length === 0 && (
              <div className="empty-state">
                <strong>Nenhum ticket encontrado</strong>
                <p>Assim que houver chamados, eles aparecerao aqui.</p>
              </div>
            )}

            {!loading && !error && tickets.length > 0 && (
              <div className="ticket-list">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    className={`ticket-card ${
                      selectedTicket?.id === ticket.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="ticket-card-top">
                      <div className="ticket-card-heading">
                        <span className="ticket-id">#{ticket.id}</span>
                        <h4>{ticket.title}</h4>
                      </div>
                      <span className={`status-badge ${ticket.status}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>

                    <p className="ticket-description">{ticket.description}</p>

                    <div className="ticket-card-footer">
                      <span className={`priority-badge ${ticket.priority}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>

                      <div className="ticket-meta-inline">
                        <span>{getAssignedName(ticket)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ticket-details-panel surface-panel">
            <div className="panel-header">
              <div>
                <h3>Detalhes do Ticket</h3>
                <p className="panel-subtitle">
                  Informacoes principais do chamado selecionado.
                </p>
              </div>
              <span>{selectedTicket ? `#${selectedTicket.id}` : "--"}</span>
            </div>

            {!selectedTicket ? (
              <div className="empty-state">
                <strong>Nada selecionado</strong>
                <p>Escolha um ticket da lista para abrir os detalhes.</p>
              </div>
            ) : detailsLoading ? (
              <p className="panel-message">Carregando detalhes do ticket...</p>
            ) : (
              <div className="details-content">
                <div className="details-hero">
                  <div>
                    <span className="ticket-id">Ticket #{selectedTicket.id}</span>
                    <h2>{selectedTicket.title}</h2>
                  </div>

                  <div className="details-badges">
                    <span className={`status-badge ${selectedTicket.status}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                    <span className={`priority-badge ${selectedTicket.priority}`}>
                      Prioridade {getPriorityLabel(selectedTicket.priority)}
                    </span>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Descricao</h4>
                  <p>{selectedTicket.description}</p>
                </div>

                <div className="details-section">
                  <h4>Informacoes</h4>
                  <div className="info-grid">
                    <div className="info-card">
                      <span className="info-label">Responsavel</span>
                      <span className="info-value">
                        {getAssignedName(selectedTicket)}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Prioridade</span>
                      <span className="info-value">
                        {getPriorityLabel(selectedTicket.priority)}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Status</span>
                      <span className="info-value">
                        {getStatusLabel(selectedTicket.status)}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Telefone principal</span>
                      <span className="info-value">
                        {selectedTicket.contact_phone1 || "-"}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Telefone secundario</span>
                      <span className="info-value">
                        {selectedTicket.contact_phone2 || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Comentarios</h4>
                  {commentsLoading ? (
                    <p className="panel-message">Carregando comentarios...</p>
                  ) : comments.length === 0 ? (
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
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
