import { useEffect, useState } from "react";
import { api } from "../api/api";

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  author_username: string;
  assigned_to_username?: string;
};

export default function Tickets() {

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tickets/")
      .then((response) => {
        console.log("Tickets da API:", response.data);
        setTickets(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar tickets:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Carregando tickets...</div>;
  }

  return (
    <div>
      <h1>Tickets</h1>

      {tickets.length === 0 ? (
        <p>Nenhum ticket encontrado.</p>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket.id}>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
            <p>Status: {ticket.status}</p>
            <p>Prioridade: {ticket.priority}</p>
            <p>Autor: {ticket.author_username}</p>
            <p>
              Responsável: {ticket.assigned_to_username ?? "Não atribuído"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}