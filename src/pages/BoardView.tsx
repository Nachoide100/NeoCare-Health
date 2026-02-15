import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";

const BoardView: React.FC = () => {
  const navigate = useNavigate();

  // 👉 Verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // 👉 Redirigir al login si no hay token
    }
  }, [navigate]);

  return (
    <div>
      <Board />
    </div>
  );
};

export default BoardView;
