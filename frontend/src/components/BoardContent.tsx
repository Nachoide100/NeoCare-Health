import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { cardService } from "../services/cardService";
import { listService } from "../services/listService";
import type { Card, List } from "../types"; // Changed to type-only import

// Import new components
import ListColumn from "./ListColumn";
import CardForm from "./CardForm";
import CardDetail from "./CardDetail";

const BoardContent: React.FC<{ boardId: number }> = ({ boardId }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [boardLists, setBoardLists] = useState<List[]>([]); // New state for lists
  
  // State for CardForm
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [initialListIdForCardForm, setInitialListIdForCardForm] = useState<number | undefined>(undefined); // New state
  
  // State for CardDetail
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);

  // Sensores para DnD (mejor UX en puntero/ratón)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // 1. Cargar tarjetas y listas
  useEffect(() => {
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]); // Trigger when boardId changes

  const loadBoardData = async () => {
    try {
      // Fetch lists for the board
      const fetchedLists = await listService.fetchLists(boardId);
      setBoardLists(fetchedLists);

      // Fetch cards for the board
      const fetchedCards = await cardService.fetchCards(boardId);
      setCards(fetchedCards);
    } catch (error) {
      console.error("Error cargando datos del tablero:", error);
    }
  };

  // --- Drag & Drop: manejo al soltar una tarjeta ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Si no hay destino, no hacemos nada
    if (!over) return;

    const activeCardId = active.data?.current?.cardId as number | undefined;
    const sourceListId = active.data?.current?.listId as number | undefined;

    if (!activeCardId || !sourceListId) return;

    // El over.id será del tipo "list-<id>"
    const overId = String(over.id);
    if (!overId.startsWith("list-")) return;
    const targetListId = Number(overId.replace("list-", ""));
    if (Number.isNaN(targetListId)) return;

    // Si la lista destino es la misma, moveremos la tarjeta al final de la columna
    // (estrategia simple que mantiene un orden consistente)
    setCards((prevCards) => {
      const movingCard = prevCards.find((c) => c.id === activeCardId);
      if (!movingCard) return prevCards;

      // Eliminamos la tarjeta de su posición actual
      const withoutMoving = prevCards.filter((c) => c.id !== activeCardId);

      // Calculamos el nuevo order al final de la lista destino
      const targetCards = withoutMoving
        .filter((c) => c.list_id === targetListId)
        .sort((a, b) => a.order - b.order);

      const newOrder = targetCards.length;

      const updatedCard: Card = {
        ...movingCard,
        list_id: targetListId,
        order: newOrder,
      };

      return [...withoutMoving, updatedCard];
    });

    // UI optimista: usamos un snapshot anterior por si hay que revertir
    const previousSnapshot = [...cards];

    try {
      const targetCards = cards
        .filter((c) => c.list_id === targetListId && c.id !== activeCardId)
        .sort((a, b) => a.order - b.order);
      const newOrder = targetCards.length;

      const updated = await cardService.moveCard(activeCardId, {
        list_id: targetListId,
        order: newOrder,
      });

      // Sincronizamos el estado con la respuesta final del backend
      setCards((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (error) {
      console.error("Error al mover la tarjeta:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error desconocido al mover la tarjeta"
      );
      // Revertimos al estado anterior si falla la API
      setCards(previousSnapshot);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
        await cardService.deleteCard(cardId);
        setCards(cards.filter((card) => card.id !== cardId));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al eliminar la tarjeta";
        console.error("Error en handleDeleteCard:", error);
        alert(errorMessage);
    }
  };

  // --- Handlers for CardForm (creation and editing) ---
  const handleOpenCreateCardForm = (listId: number) => {
    setCardToEdit(null); // Clear any editing card
    setInitialListIdForCardForm(listId); // Set the listId for the form
    setIsCardFormOpen(true);
  };

  const handleOpenEditCardForm = (card: Card) => {
    setCardToEdit(card);
    setInitialListIdForCardForm(card.list_id); // Set the card's listId for editing
    setIsCardFormOpen(true);
  };

  const handleCloseCardForm = () => {
    setIsCardFormOpen(false);
    setCardToEdit(null);
    setInitialListIdForCardForm(undefined); // Reset
  };

  const handleCardFormSubmit = async (cardData: Partial<Card> & { list_id: number, board_id: number }) => {
    try {
      if (cardToEdit) {
        // Update existing card - solo enviar campos que el backend acepta
        const updateData: Partial<Card> = {
          title: cardData.title,
          description: cardData.description,
          list_id: cardData.list_id,
          due_date: cardData.due_date || undefined,
        };
        const updatedCard = await cardService.updateCard(cardToEdit.id, updateData);
        setCards(cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
      } else {
        // Create new card
        const { title = '', description = '', due_date, ...restCardData } = cardData;
        const newCardData = {
            ...restCardData,
            title,
            description,
            due_date: due_date === undefined ? null : due_date,
            board_id: boardId
        };
        const newCard = await cardService.createCard(newCardData as Card); // Cast to Card as createCard expects Card
        setCards([...cards, newCard]);
      }
      handleCloseCardForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al ${cardToEdit ? "actualizar" : "crear"} la tarjeta`;
      console.error("Error en handleCardFormSubmit:", error);
      alert(errorMessage);
    }
  };
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          overflowX: "auto",
          height: "calc(100vh - 80px)",
          padding: 2,
          gap: 2,
        }}
      >
        {/* RENDERIZADO DE COLUMNAS */}
        {boardLists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            // Aseguramos que vayan ordenadas por 'order'
            cards={cards
              .filter((card) => card.list_id === list.id)
              .sort((a, b) => a.order - b.order)}
            onAddCard={handleOpenCreateCardForm}
            onEditCard={handleOpenEditCardForm}
            onDeleteCard={handleDeleteCard}
            onViewCard={(card) => {
              setSelectedCard(card);
              setIsCardDetailOpen(true);
            }}
          />
        ))}

        {/* --- CardForm (unified for CREATE/EDIT) --- */}
        {isCardFormOpen && (
          <CardForm
            open={isCardFormOpen}
            onClose={handleCloseCardForm}
            onSubmit={handleCardFormSubmit}
            initialCard={cardToEdit}
            boardLists={boardLists}
            boardId={boardId}
            initialListId={initialListIdForCardForm}
          />
        )}

        {/* --- CardDetail (para ver detalles y horas trabajadas) --- */}
        <CardDetail
          open={isCardDetailOpen}
          onClose={() => {
            setIsCardDetailOpen(false);
            setSelectedCard(null);
          }}
          card={selectedCard}
          boardLists={boardLists}
          boardId={boardId}
          onEdit={handleOpenEditCardForm}
          onDelete={handleDeleteCard}
          onCardUpdated={loadBoardData}
        />
      </Box>
    </DndContext>
  );
};

export default BoardContent;