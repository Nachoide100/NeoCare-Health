import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
} from "@mui/material"; // Reduced imports
import { cardService } from "../services/cardService";
import { listService } from "../services/listService";
import { Card, List } from "../types";

// Import new components
import ListColumn from "./ListColumn";
import CardForm from "./CardForm";

const BoardContent: React.FC<{ boardId: number }> = ({ boardId }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [boardLists, setBoardLists] = useState<List[]>([]); // New state for lists
  
  // State for CardForm
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [initialListIdForCreate, setInitialListIdForCreate] = useState<number | null>(null);

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





  // --- Handlers for CardForm (creation and editing) ---
  const handleOpenCreateCardForm = (listId: number) => {
    setCardToEdit(null); // Clear any editing card
    setInitialListIdForCreate(listId);
    setIsCardFormOpen(true);
  };

  const handleOpenEditCardForm = (card: Card) => {
    setCardToEdit(card);
    setIsCardFormOpen(true);
  };

  const handleCloseCardForm = () => {
    setIsCardFormOpen(false);
    setCardToEdit(null);
    setInitialListIdForCreate(null);
  };

  const handleCardFormSubmit = async (cardData: Partial<Card> & { list_id: number, board_id: number }) => {
    try {
      if (cardToEdit) {
        // Update existing card
        const updatedCard = await cardService.updateCard(cardToEdit.id, cardData);
        setCards(cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
      } else {
        // Create new card
        const newCard = await cardService.createCard({ ...cardData, board_id: boardId });
        setCards([...cards, newCard]);
      }
      handleCloseCardForm();
    } catch (error) {
      alert(`Error al ${cardToEdit ? "actualizar" : "crear"} la tarjeta`);
      console.error(error);
    }
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "row", overflowX: "auto", height: "calc(100vh - 80px)", padding: 2, gap: 2 }}>
      
      {/* RENDERIZADO DE COLUMNAS */}
      {boardLists.map((list) => ( // Use list instead of col for clarity
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
        />
      )}

    </Box>
  );
};

export default BoardContent;
