import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService"; // Assuming a register function will be added

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(email, password);
    if (success) {
      setMessage("✅ Registro exitoso. Ahora puedes iniciar sesión.");
      navigate("/"); // Redirect to login after successful registration
    } else {
      setMessage("❌ Error al registrar. Intenta de nuevo."); // Simplified error message for now
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h2>Registro de Usuario</h2>
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
          Registrarse
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "1rem", color: "blue", fontWeight: "bold" }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        ¿Ya tienes cuenta? <Link to="/">Inicia Sesión</Link>
      </div>
    </div>
  );
};

export default Register;