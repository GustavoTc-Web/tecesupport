import { Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import { getDefaultRoute, getStoredUser, hasAccessToken } from "./auth/session";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import MyTickets from "./pages/MyTickets";
import NewTicket from "./pages/NewTicket";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import TicketDetail from "./pages/TicketDetail";
import Tickets from "./pages/Tickets";

function HomeRedirect() {
  const user = getStoredUser();

  if (!hasAccessToken() || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRoute(user.role)} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute allowedRoles={["analyst"]}>
            <Tickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["analyst"]}>
            <Tickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["analyst"]}>
            <TicketDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <MyTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-ticket"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <NewTicket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;
