import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Board from "./pages/Board";
import MyHours from "./pages/MyHours";
import Report from "./pages/Report";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Ruta pública para el login */}
      <Route path="/" element={<Login />} />
      {/* Ruta pública para el registro */}
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas */}
      <Route
        path="/board"
        element={
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-hours"
        element={
          <ProtectedRoute>
            <MyHours />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

