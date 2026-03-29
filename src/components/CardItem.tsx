import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface CardItemProps {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  list_id: number;
  labels?: { id: number; name: string; color: string }[]; // ⬅️ NUEVO
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const CardItem: React.FC<CardItemProps> = ({
  id,
  title,
  description,
  due_date,
  list_id,
  labels = [], // ⬅️ NUEVO
  onEdit,
  onDelete,
}) => {
  const { setNodeRef: setDropRef } = useDroppable({ id: `card-${id}` });

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: `card-drag-${id}` });

  const isAlert = (() => {
    if (!due_date) return false;
    const due = new Date(due_date);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return diff < threeDays;
  })();

  return (
    <div ref={setDropRef} style={{ marginBottom: "1rem" }}>
      <div
        style={{
          backgroundColor: isAlert ? "#ffe5e5" : "#fff",
          border: isAlert ? "2px solid #d00" : "2px solid #ccc",
          borderRadius: "8px",
          boxShadow: isDragging
            ? "0px 8px 20px rgba(0,0,0,0.25)"
            : "0px 2px 6px rgba(0,0,0,0.15)",
          opacity: isDragging ? 0.5 : 1,
          transition: "0.2s ease",
        }}
      >
        {/* Handler superior */}
        <div
          ref={setDragRef}
          {...listeners}
          {...attributes}
          style={{
            height: "10px",
            backgroundColor: "#ddd",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            cursor: "grab",
          }}
        />

        {/* Contenido */}
        <div style={{ padding: "1rem" }}>

          {/* ⭐ ETIQUETAS (NUEVO BLOQUE) */}
          {labels.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginBottom: "6px",
                flexWrap: "wrap",
              }}
            >
              {labels.map((label) => (
                <span
                  key={label.id}
                  style={{
                    background: label.color,
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <strong>{title}</strong>

          {description && (
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.9rem",
                color: "#444",
              }}
            >
              {description}
            </div>
          )}

          {due_date && (
            <div
              style={{
                fontSize: "0.8rem",
                marginTop: "0.5rem",
                opacity: 0.8,
              }}
            >
              Fecha: {new Date(due_date).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Botones Editar + Eliminar */}
        <div
          style={{
            borderTop: "1px solid #ccc",
            padding: "0.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #bbb",
                borderRadius: "4px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              Editar
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              🗑 Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardItem;











