import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // 👈 Hook para redirigir

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/board"); // 👈 Redirección automática
    } else {
      setMessage("❌ Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" style={{ marginTop: "1rem" }}>
          Entrar
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "1rem", color: "blue", fontWeight: "bold" }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </div>
    </div>
  );
};

export default Login;
