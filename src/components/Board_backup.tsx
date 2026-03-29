import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import ListColumn from "./ListColumn";
import CardItem from "./CardItem";
import CardForm from "./CardForm";

interface Card {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  list_id: number;
  order: number;
}

interface List {
  id: number;
  title: string;
}

const Board: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Estado para edición de tarjeta
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  //  worklogs reales
  const [worklogs, setWorklogs] = useState<any[]>([]);

  //  edición de worklogs
  const [editingWorklogId, setEditingWorklogId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editNote, setEditNote] = useState("");

  const currentUserId = parseInt(localStorage.getItem("user_id") || "0");

  const boardId = 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchLists();
    fetchCards();
  }, []);

  const fetchLists = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/lists?board_id=${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLists(data);
  };

  const fetchCards = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/cards?board_id=${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCards(data);
  };

  //   cargar worklogs reales
  const fetchWorklogs = async (cardId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/worklogs/card/${cardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWorklogs(data);
  };

  //  eliminar worklog
  const handleDeleteWorklog = async (id: number) => {
    const ok = window.confirm("¿Eliminar este registro de horas?");
    if (!ok) return;

    const token = localStorage.getItem("token");
    await fetch(`http://localhost:8000/worklogs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchWorklogs(editingCard!.id);
  };

  //  editar worklog
  const handleEditWorklog = async (id: number) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8000/worklogs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: editDate,
        hours: parseFloat(editHours),
        note: editNote,
      }),
    });

    setEditingWorklogId(null);
    fetchWorklogs(editingCard!.id);
  };

// ⬇️ AQUI AGREGA handleDeleteCard
  const handleDeleteCard = async (cardId: number) => {
    const ok = window.confirm("¿Eliminar esta tarjeta?");
    if (!ok) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8000/cards/${cardId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

  // Recargar tarjetas
  fetchCards();
};

  const handleDragStart = (event: any) => {
    const rawId = event.active.id;
    if (!rawId) return;
    const id = parseInt(rawId.replace("card-drag-", ""));
    setActiveId(id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    console.log("🔥 DRAG OVER", active?.id, over?.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!active?.id || !over?.id) return;

    const activeId = parseInt(active.id.replace("card-drag-", ""));
    const draggedCard = cards.find((c) => c.id === activeId);
    if (!draggedCard) return;

    let targetListId = draggedCard.list_id;
    let targetOrder = draggedCard.order;

    if (over.id.startsWith("list-")) {
      targetListId = parseInt(over.id.replace("list-", ""));
      targetOrder = cards.filter(c => c.list_id === targetListId).length;
    }

    if (over.id.startsWith("card-")) {
      const overCardId = parseInt(over.id.replace("card-", ""));
      const overCard = cards.find((c) => c.id === overCardId);

      if (overCard) {
        targetListId = overCard.list_id;

        const cardsInList = cards
          .filter((c) => c.list_id === targetListId && c.id !== activeId)
          .sort((a, b) => a.order - b.order);

        const overIndex = cardsInList.findIndex((c) => c.id === overCardId);
        targetOrder = overIndex !== -1 ? overIndex : cardsInList.length;
      }
    }

    const isSameColumn = targetListId === draggedCard.list_id;

    let finalCards = [...cards];

    if (isSameColumn) {
      const cardsInList = finalCards
        .filter((c) => c.list_id === targetListId && c.id !== activeId)
        .sort((a, b) => a.order - b.order);

      const overCardId = over.id.startsWith("card-")
        ? parseInt(over.id.replace("card-", ""))
        : null;

      let newIndex = cardsInList.length;

      if (overCardId) {
        const overIndex = cardsInList.findIndex((c) => c.id === overCardId);
        newIndex = overIndex !== -1 ? overIndex : cardsInList.length;
      }

      const newCardsInList = [
        ...cardsInList.slice(0, newIndex),
        draggedCard,
        ...cardsInList.slice(newIndex),
      ].map((c, i) => ({ ...c, order: i }));

      finalCards = finalCards.map((c) =>
        c.list_id === targetListId
          ? newCardsInList.find((r) => r.id === c.id) || c
          : c
      );
    } else {
      const sourceListId = draggedCard.list_id;

      const sourceCards = finalCards
        .filter(c => c.list_id === sourceListId && c.id !== activeId)
        .sort((a, b) => a.order - b.order)
        .map((c, i) => ({ ...c, order: i }));

      const targetCards = finalCards
        .filter(c => c.list_id === targetListId && c.id !== activeId)
        .sort((a, b) => a.order - b.order);

      const newIndex = Math.min(targetOrder, targetCards.length);

      const newTargetCards = [
        ...targetCards.slice(0, newIndex),
        { ...draggedCard, list_id: targetListId },
        ...targetCards.slice(newIndex),
      ].map((c, i) => ({ ...c, order: i }));

      finalCards = finalCards.map(c => {
        if (c.id === activeId) {
          return newTargetCards.find(x => x.id === c.id) || c;
        }
        if (c.list_id === sourceListId) {
          return sourceCards.find(x => x.id === c.id) || c;
        }
        if (c.list_id === targetListId) {
          return newTargetCards.find(x => x.id === c.id) || c;
        }
        return c;
      });
    }

    setCards(finalCards);

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/cards/${activeId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          list_id: targetListId,
          order: targetOrder,
        }),
      });
    } catch (error) {
      console.error("Error al enviar PATCH:", error);
    }
  };

  // ⭐ Abrir modal + cargar worklogs reales
  const handleEditCard = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      setEditingCard(card);
      setShowEditModal(true);
      fetchWorklogs(card.id);
    }
  };
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ padding: "2rem" }}>
        <h2>Tablero</h2>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
            minHeight: "500px",
          }}
        >
          {lists.map((list) => (
            <ListColumn key={list.id} list={list}>
              <CardForm
                onCreate={(cardData) =>
                  fetch("http://localhost:8000/cards", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                      ...cardData,
                      board_id: boardId,
                      list_id: list.id,
                    }),
                  }).then(fetchCards)
                }
              />

              {cards
                .filter((card) => card.list_id === list.id)
                .sort((a, b) => a.order - b.order)
                .map((card) => (
                  <CardItem
                    key={card.id}
                    {...card}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}   // ⬅️ AQUÍ VA
                  />
                ))}
            </ListColumn>
          ))}
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && editingCard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
              boxShadow: "0px 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            <h3>Editar tarjeta</h3>

            <label>Título</label>
            <input
              type="text"
              defaultValue={editingCard.title}
              id="edit-title"
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <label>Descripción</label>
            <textarea
              defaultValue={editingCard.description}
              id="edit-description"
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <label>Fecha</label>
            <input
              type="date"
              defaultValue={editingCard.due_date}
              id="edit-date"
              style={{ width: "100%", marginBottom: "1rem" }}
            />

                
                   {/* ⭐ SECCIÓN HORAS TRABAJADAS */}
            <div style={{ marginTop: "2rem", padding: "1rem", borderTop: "1px solid #ccc" }}>
              <h3 style={{ marginBottom: "1rem" }}>Horas trabajadas</h3>

              {/* Formulario para añadir horas */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  background: "#f9f9f9",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                <label>Fecha</label>
                <input type="date" id="worklog-date" />

                <label>Horas (mínimo 0.25)</label>
                <input type="number" step="0.25" min="0.25" id="worklog-hours" />

                <label>Nota (opcional)</label>
                <textarea id="worklog-note" maxLength={200} />

                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");

                    const date = (document.getElementById("worklog-date") as HTMLInputElement).value;
                    const hours = parseFloat((document.getElementById("worklog-hours") as HTMLInputElement).value);
                    const note = (document.getElementById("worklog-note") as HTMLTextAreaElement).value;
                    
                    if (!date) {
                      alert("Debes ingresar una fecha.");
                      return;
                    }

                    if (!hours || hours < 0.25) {
                      alert("Las horas deben ser al menos 0.25.");
                      return;
                    }
// ⭐ VALIDACIONES NUEVAS
                    await fetch("http://localhost:8000/worklogs", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        card_id: editingCard!.id,
                        date,
                        hours,
                        note,
                      }),
                    });

                    fetchWorklogs(editingCard!.id);
                  }}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Añadir horas
                </button>
              </div>

              {/* Lista real de worklogs */}
              <div
                style={{
                  padding: "1rem",
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              >
                {worklogs.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>No hay horas registradas todavía.</p>
                ) : (
                  worklogs.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        padding: "0.5rem",
                        borderBottom: "1px solid #eee",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {editingWorklogId === w.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            value={editHours}
                            onChange={(e) => setEditHours(e.target.value)}
                          />
                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                          />

                          // ⭐ VALIDACIONES al editar worklogs
                          <button
                            onClick={() => {
                              if (!editDate) {
                                alert("Debes ingresar una fecha.");
                                return;
                              }

                              if (!editHours || parseFloat(editHours) < 0.25) {
                                alert("Las horas deben ser al menos 0.25.");
                                return;
                              }

                              handleEditWorklog(w.id);
                            }}
                            style={{
                              padding: "0.3rem 0.6rem",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Guardar
                          </button>

                          <button onClick={() => setEditingWorklogId(null)}>Cancelar</button>
                        </div>
                      ) : (
                        <div>
                          <strong>{w.date}</strong> — {w.hours}h
                          <br />
                          <span style={{ opacity: 0.7 }}>{w.note}</span>

                          {w.user_id === currentUserId && (
                            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => {
                                  setEditingWorklogId(w.id);
                                  setEditDate(w.date);
                                  setEditHours(w.hours.toString());
                                  setEditNote(w.note || "");
                                }}
                              >
                                🖊 Editar
                              </button>

                              <button onClick={() => handleDeleteWorklog(w.id)}>
                                🗑 Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button onClick={() => setShowEditModal(false)}>Cancelar</button>

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  await fetch(`http://localhost:8000/cards/${editingCard.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      title: (document.getElementById("edit-title") as HTMLInputElement).value,
                      description: (document.getElementById("edit-description") as HTMLTextAreaElement).value,
                      due_date: (document.getElementById("edit-date") as HTMLInputElement).value,
                    }),
                  });

                  setShowEditModal(false);
                  fetchCards();
                }}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <DragOverlay>
        {activeId ? (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "260px",
              boxShadow: "0px 8px 20px rgba(0,0,0,0.25)",
              zIndex: 1000,
            }}
          >
            <h4>{cards.find((c) => c.id === activeId)?.title}</h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
               