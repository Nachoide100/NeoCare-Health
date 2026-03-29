import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await login(email, password); // data = { access_token, token_type }

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token); // Guarda el token
        localStorage.setItem("user_id", data.user_id); // AÑADIR ESTO
        navigate("/board"); // Redirige al tablero
      } else {
        setMessage("❌ Credenciales incorrectas. Intenta de nuevo.");
      }
    } catch (error) {
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
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
    </div>
  );
};

export default Login;



