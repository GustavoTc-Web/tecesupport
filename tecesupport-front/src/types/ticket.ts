export interface Comment {
  id: number;
  ticket: number;
  author: number;
  author_username: string;
  message: string;
  created_at: string;
}

export interface TicketHistory {
  id: number;
  action: string;
  description: string;
  created_at: string;
  user_username?: string | null;
  user_name?: string | null;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed" | string;
  priority: "low" | "medium" | "high" | string;
  author: number | string;
  author_username?: string | null;
  author_name?: string | null;
  author_email?: string | null;
  assigned_to: number | null;
  assigned_to_username?: string | null;
  assigned_to_name?: string | null;
  created_at?: string;
  updated_at?: string;
  contact_phone1?: string | null;
  contact_phone2?: string | null;
  comments?: Comment[];
  histories?: TicketHistory[];
}
