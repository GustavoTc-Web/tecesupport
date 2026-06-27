import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import "./App.css";
import Login from "./pages/Login";
import MyTickets from "./pages/MyTickets";
import NewTicket from "./pages/NewTicket";
import Register from "./pages/Register";
import TicketDetail from "./pages/TicketDetail";
import Tickets from "./pages/Tickets";

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

function AnalystRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("access_token");
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "analyst") {
    return <Navigate to="/my-tickets" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/tickets"
        element={
          <AnalystRoute>
            <Tickets />
          </AnalystRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <AnalystRoute>
            <TicketDetail />
          </AnalystRoute>
        }
      />
      <Route
        path="/my-tickets"
        element={
          <PrivateRoute>
            <MyTickets />
          </PrivateRoute>
        }
      />
      <Route
        path="/new-ticket"
        element={
          <PrivateRoute>
            <NewTicket />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
