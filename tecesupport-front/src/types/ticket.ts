export interface Comment {
  id: number;
  ticket: number;
  author: number;
  author_username: string;
  message: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  author: number;
  author_username: string;
  assigned_to: number | null;
  assigned_to_username: string | null;
  created_at: string;
  updated_at: string;
  comments: Comment[];
}