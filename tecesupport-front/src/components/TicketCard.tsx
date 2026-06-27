import type { Ticket } from "../types/ticket";

type TicketCardProps = {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: () => void;
  statusLabel: string;
  priorityLabel: string;
  authorName: string;
  assignedName: string;
};

export default function TicketCard({
  ticket,
  isSelected,
  onSelect,
  statusLabel,
  priorityLabel,
  authorName,
  assignedName,
}: TicketCardProps) {
  return (
    <button
      type="button"
      className={`ticket-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="ticket-card-top">
        <div className="ticket-card-heading">
          <span className="ticket-id">#{ticket.id}</span>
          <h4>{ticket.title}</h4>
        </div>
        <span className={`status-badge ${ticket.status}`}>{statusLabel}</span>
      </div>

      <p className="ticket-description">{ticket.description}</p>

      <div className="ticket-card-footer">
        <span className={`priority-badge ${ticket.priority}`}>{priorityLabel}</span>
        <div className="ticket-meta-inline">
          <span>{authorName}</span>
          <span>{assignedName}</span>
        </div>
      </div>
    </button>
  );
}
