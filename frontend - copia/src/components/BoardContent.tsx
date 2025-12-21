import React, { useEffect, useState } from "react";
import { Box } from "@mui/material"; 
import { cardService } from "../services/cardService";
import { listService } from "../services/listService";
import type { Card, List } from "../types"; // Changed to type-only import

// Import new components
import ListColumn from "./ListColumn";
import CardForm from "./CardForm";

const BoardContent: React.FC<{ boardId: number }> = ({ boardId }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [boardLists, setBoardLists] = useState<List[]>([]); // New state for lists
  
  // State for CardForm
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [initialListIdForCardForm, setInitialListIdForCardForm] = useState<number | undefined>(undefined); // New state

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
    <Box sx={{ display: "flex", flexDirection: "row", overflowX: "auto", height: "calc(100vh - 80px)", padding: 2, gap: 2 }}>
      
      {/* RENDERIZADO DE COLUMNAS */}
      {boardLists.map((list) => (
        <ListColumn
          key={list.id}
          list={list}
          cards={cards.filter((card) => card.list_id === list.id)}
          onAddCard={handleOpenCreateCardForm}
          onEditCard={handleOpenEditCardForm}
          onDeleteCard={handleDeleteCard}
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

    </Box>
  );
};

export default BoardContent;