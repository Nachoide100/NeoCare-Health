import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    // Si el usuario no está autenticado, redirige a la página de login
    return <Navigate to="/" />;
  }

  // Si el usuario está autenticado, renderiza el componente hijo (la página protegida)
  return <>{children}</>;
};

export default ProtectedRoute;
