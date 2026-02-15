import React, { useState } from "react";

interface CardFormProps {
  onCreate: (card: {
    title: string;
    description: string;
    due_date: string;
  }) => void;
}

const CardForm: React.FC<CardFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!title || title.trim().length === 0) {
      setError("El título es obligatorio");
      return;
    }

    if (title.length > 80) {
      setError("El título no puede superar los 80 caracteres");
      return;
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      setError("La fecha límite no es válida");
      return;
    }

    // Si todo está bien
    setError("");
    const newCard = { title, description, due_date: dueDate };
    onCreate(newCard);
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Nueva tarjeta</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button type="submit">Crear</button>
    </form>
  );
};

export default CardForm;
