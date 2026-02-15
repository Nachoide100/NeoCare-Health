import React, { useState } from "react";
import api from "../api";

interface CardModalProps {
  card: any;
  onClose: () => void;
  refreshCard: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, refreshCard }) => {
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#0d6efd");

  const addLabel = async () => {
    if (!labelName.trim()) return;

    await api.post(`/labels/cards/${card.id}`, null, {
      params: { name: labelName, color: labelColor }
    });

    setLabelName("");
    refreshCard();
  };

  const deleteLabel = async (id: number) => {
    await api.delete(`/labels/${id}`);
    refreshCard();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "10px",
          width: "500px",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <h2>{card.title}</h2>

        {/* Etiquetas */}
        <h3 style={{ marginTop: "1.5rem" }}>Etiquetas</h3>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "1rem" }}>
          {card.labels?.map((label: any) => (
            <span
              key={label.id}
              style={{
                background: label.color,
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {label.name}
              <button
                onClick={() => deleteLabel(label.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Añadir etiqueta */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Nombre"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            style={{ padding: "6px", flex: 1 }}
          />

          <input
            type="color"
            value={labelColor}
            onChange={(e) => setLabelColor(e.target.value)}
            style={{ width: "50px", cursor: "pointer" }}
          />

          <button
            onClick={addLabel}
            style={{
              background: "#0d6efd",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Añadir
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "2rem",
            background: "#ccc",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CardModal;
