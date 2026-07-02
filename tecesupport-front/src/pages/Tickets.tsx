import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import AppLayout from "../components/AppLayout";
import Pagination from "../components/Pagination";
import TicketCard from "../components/TicketCard";
import usePagination from "../hooks/usePagination";
import usePreferences from "../preferences/usePreferences";
import type { Ticket } from "../types/ticket";

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
      return "Média";
    case "high":
      return "Alta";
    default:
      return priority;
  }
}

function getAuthorName(ticket: Ticket) {
  return ticket.author_name ?? ticket.author_username ?? String(ticket.author ?? "-");
}

function getAssignedName(ticket: Ticket) {
  return (
    ticket.assigned_to_name ??
    ticket.assigned_to_username ??
    (ticket.assigned_to ? String(ticket.assigned_to) : "Aguardando analista")
  );
}

export default function Tickets() {
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/tickets/")
      .then((response) => {
        const data = response.data;
        const ticketList = Array.isArray(data) ? data : data.results ?? [];

        setTickets(ticketList);

        if (ticketList.length > 0) {
          setSelectedTicketId(ticketList[0].id);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar tickets:", err);
        setError("Não foi possível carregar os tickets.");
        setLoading(false);
      });
  }, []);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      if (!normalizedSearch) {
        return true;
      }

      const content = [
        ticket.title,
        ticket.description,
        getAuthorName(ticket),
        getAssignedName(ticket),
        getStatusLabel(ticket.status),
        getPriorityLabel(ticket.priority),
      ]
        .join(" ")
        .toLowerCase();

      return content.includes(normalizedSearch);
    });
  }, [search, tickets]);
  const pagination = usePagination(
    filteredTickets,
    preferences.tickets_per_page,
  );

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;
  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "in_progress"
  ).length;
  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "resolved"
  ).length;
  const selectedTicket =
    pagination.pageItems.find((ticket) => ticket.id === selectedTicketId) ??
    pagination.pageItems[0] ??
    null;

  return (
    <AppLayout>
        <header className="topbar topbar-panel">
          <div className="topbar-copy">
            <span className="section-kicker">Operação</span>
            <h1>Painel de tickets</h1>
            <p>Gerencie chamados e acompanhe o andamento da equipe.</p>
          </div>

          <div className="topbar-actions">
            <input
              type="text"
              placeholder="Buscar ticket, autor ou prioridade..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="new-ticket-btn">+ Novo Ticket</button>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total</span>
            <strong>{tickets.length}</strong>
            <p>Tickets cadastrados</p>
          </div>
          <div className="stat-card">
            <span>Abertos</span>
            <strong>{openCount}</strong>
            <p>Precisam de atenção</p>
          </div>
          <div className="stat-card">
            <span>Em andamento</span>
            <strong>{inProgressCount}</strong>
            <p>Em fluxo pela equipe</p>
          </div>
          <div className="stat-card">
            <span>Resolvidos</span>
            <strong>{resolvedCount}</strong>
            <p>Já finalizados</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="ticket-list-panel surface-panel">
            <div className="panel-header">
              <div>
                <h3>Fila de atendimento</h3>
                <p className="panel-subtitle">
                  {search.trim()
                    ? `${filteredTickets.length} ${
                        filteredTickets.length === 1
                          ? "resultado"
                          : "resultados"
                      } para "${search}"`
                    : "Selecione um ticket para ver os detalhes."}
                </p>
              </div>
              <span>
                {pagination.rangeStart}–{pagination.rangeEnd} de{" "}
                {pagination.totalItems}
              </span>
            </div>

            {loading && <p className="panel-message">Carregando tickets...</p>}
            {error && <p className="panel-message error-text">{error}</p>}

            {!loading && !error && filteredTickets.length === 0 && (
              <div className="empty-state">
                <strong>Nenhum ticket encontrado</strong>
                <p>Tente ajustar a busca para localizar outro chamado.</p>
              </div>
            )}

            {!loading && !error && filteredTickets.length > 0 && (
              <div className="ticket-list">
                {pagination.pageItems.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={selectedTicket?.id === ticket.id}
                    onSelect={() => setSelectedTicketId(ticket.id)}
                    statusLabel={getStatusLabel(ticket.status)}
                    priorityLabel={getPriorityLabel(ticket.priority)}
                    authorName={getAuthorName(ticket)}
                    assignedName={getAssignedName(ticket)}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={pagination.currentPage}
              onPageChange={pagination.goToPage}
              pageSize={preferences.tickets_per_page}
              rangeEnd={pagination.rangeEnd}
              rangeStart={pagination.rangeStart}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
            />
          </div>

          <div className="ticket-details-panel surface-panel">
            <div className="panel-header">
              <div>
                <h3>Detalhes do ticket</h3>
                <p className="panel-subtitle">
                  Informações principais do chamado selecionado.
                </p>
              </div>
              <span>{selectedTicket ? `#${selectedTicket.id}` : "--"}</span>
            </div>

            {!selectedTicket ? (
              <div className="empty-state">
                <strong>Nada selecionado</strong>
                <p>Escolha um ticket da lista para abrir os detalhes.</p>
              </div>
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
                  <h4>Descrição</h4>
                  <p>{selectedTicket.description}</p>
                </div>

                <div className="details-section">
                  <h4>Informações</h4>
                  <div className="info-grid">
                    <div className="info-card">
                      <span className="info-label">Autor</span>
                      <span className="info-value">
                        {getAuthorName(selectedTicket)}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Responsável</span>
                      <span className="info-value">
                        {getAssignedName(selectedTicket)}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Status</span>
                      <span className="info-value">
                        {getStatusLabel(selectedTicket.status)}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Prioridade</span>
                      <span className="info-value">
                        {getPriorityLabel(selectedTicket.priority)}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Telefone principal</span>
                      <span className="info-value">
                        {selectedTicket.contact_phone1 || "-"}
                      </span>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Telefone secundário</span>
                      <span className="info-value">
                        {selectedTicket.contact_phone2 || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="new-ticket-btn"
                  onClick={() => navigate(`/tickets/${selectedTicket.id}`)}
                >
                  Abrir página completa
                </button>
              </div>
            )}
          </div>
        </section>
    </AppLayout>
  );
}
