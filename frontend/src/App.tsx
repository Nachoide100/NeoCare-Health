import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register"; // Import the new Register component
import Board from "./pages/Board";
import ProtectedRoute from "./components/ProtectedRoute"; // 👈 1. Importar el guardián
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Ruta pública para el login */}
      <Route path="/" element={<Login />} />
      {/* Ruta pública para el registro */}
      <Route path="/register" element={<Register />} />

      {/* Ruta protegida para el tablero */}
      <Route
        path="/board"
        element={
          // 2. Envolver la página Board con el guardián
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

