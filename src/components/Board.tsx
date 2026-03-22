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
import CardModal from "./CardModal";

const API_URL = import.meta.env.VITE_API_URL;

interface Card {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  list_id: number;
  order: number;
  labels?: any[];
}

interface List {
  id: number;
  title: string;
  cards?: Card[];
}

const Board: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [worklogs, setWorklogs] = useState<any[]>([]);
  const [editingWorklogId, setEditingWorklogId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editNote, setEditNote] = useState("");

  const boardId = 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/lists?board_id=${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setLists(data);

    // Rellenamos el estado de cards a partir de las listas devueltas
    if (Array.isArray(data)) {
      const allCards: Card[] = data
        .flatMap((l: any) => l.cards || [])
        .map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          due_date: c.due_date,
          list_id: c.list_id,
          order: c.order,
          labels: c.labels,
        }));
      setCards(allCards);
    } else {
      setCards([]);
    }
  };

  const fetchWorklogs = async (cardId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/worklogs/card/${cardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWorklogs(await res.json());
  };

  const handleDeleteWorklog = async (id: number) => {
    if (!window.confirm("¿Eliminar este registro de horas?")) return;

    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/worklogs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (editingCard) {
      fetchWorklogs(editingCard.id);
    }
  };

  const handleEditWorklog = async (id: number) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/worklogs/${id}`, {
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
    if (editingCard) {
      fetchWorklogs(editingCard.id);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!window.confirm("¿Eliminar esta tarjeta?")) return;

    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/cards/${cardId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    // En lugar de fetchCards, recargamos listas (que traen las cards)
    fetchLists();
  };

  const handleDragStart = (event: any) => {
    const rawId = event.active.id;
    if (!rawId) return;
    const id = parseInt(rawId.replace("card-drag-", ""));
    setActiveId(id);
  };

  const handleDragOver = () => {};

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
      targetOrder = cards.filter((c) => c.list_id === targetListId).length;
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
        .filter((c) => c.list_id === sourceListId && c.id !== activeId)
        .sort((a, b) => a.order - b.order)
        .map((c, i) => ({ ...c, order: i }));

      const targetCards = finalCards
        .filter((c) => c.list_id === targetListId && c.id !== activeId)
        .sort((a, b) => a.order - b.order);

      const newIndex = Math.min(targetOrder, targetCards.length);

      const newTargetCards = [
        ...targetCards.slice(0, newIndex),
        { ...draggedCard, list_id: targetListId },
        ...targetCards.slice(newIndex),
      ].map((c, i) => ({ ...c, order: i }));

      finalCards = finalCards.map((c) => {
        if (c.id === activeId) {
          return newTargetCards.find((x) => x.id === c.id) || c;
        }
        if (c.list_id === sourceListId) {
          return sourceCards.find((x) => x.id === c.id) || c;
        }
        if (c.list_id === targetListId) {
          return newTargetCards.find((x) => x.id === c.id) || c;
        }
        return c;
      });
    }

    setCards(finalCards);

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/cards/${activeId}/move`, {
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
    } catch {}

    // Tras mover, recargamos listas para sincronizar con backend
    fetchLists();
  };

  const handleEditCard = (id: number) => {
    const card = cards.find((c) => c.id === id);
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
                  fetch(`${API_URL}/cards`, {
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
                  }).then(() => fetchLists())
                }
              />

              {cards
                .filter((card) => card.list_id === list.id)
                .sort((a, b) => a.order - b.order)
                .map((card) => (
                  <CardItem
                    key={card.id}
                    {...card}
                    labels={card.labels}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                ))}
            </ListColumn>
          ))}
        </div>
      </div>

      {showEditModal && editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setShowEditModal(false)}
          refreshBoard={() => {
            fetchLists();
            fetchWorklogs(editingCard.id);
          }}
        />
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
