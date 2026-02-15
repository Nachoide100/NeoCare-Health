import React, { useState } from "react";
import ReactDOM from "react-dom";

interface CardEditProps {
  card: {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    list_id: number;
  };
  onClose: () => void;
  onUpdated: () => void;
}

const CardEdit: React.FC<CardEditProps> = ({ card, onClose, onUpdated }) => {
  console.log("🟦 CardEdit montado para:", card.title);

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.due_date || "");
  const [error, setError] = useState("");

  const validate = () => {
    if (!title.trim()) {
      setError("El título es obligatorio");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/cards/${card.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          due_date: dueDate,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      console.log("✅ Tarjeta actualizada:", { title, description, dueDate });

      onUpdated(); // refresca tarjetas
      onClose();   // cierra modal
    } catch (err) {
      console.error("Error al editar:", err);
    }
  };

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.error("❌ No existe #modal-root en index.html");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,255,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          width: "400px",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
          border: "5px solid red",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ✖
        </button>

        <h3>Editar tarjeta</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <button type="submit">Guardar</button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "1rem" }}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default CardEdit;






