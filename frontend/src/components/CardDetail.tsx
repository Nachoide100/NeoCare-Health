import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Card, List } from "../types";
import WorklogList from "./WorklogList";
import CardForm from "./CardForm";
import { cardService } from "../services/cardService";

interface CardDetailProps {
  open: boolean;
  onClose: () => void;
  card: Card | null;
  boardLists: List[];
  boardId: number;
  onEdit: (card: Card) => void;
  onDelete: (cardId: number) => void;
  onCardUpdated: () => void;
}

const CardDetail: React.FC<CardDetailProps> = ({
  open,
  onClose,
  card,
  boardLists,
  boardId,
  onEdit,
  onDelete,
  onCardUpdated,
}) => {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [displayCard, setDisplayCard] = useState<Card | null>(card);

  useEffect(() => {
    setDisplayCard(card);
  }, [card]);

  if (!card || !displayCard) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* TÍTULO CORREGIDO: Trae el título de la base de datos */}
          <Typography variant="h6" component="div">
            {displayCard.title}
          </Typography>
          <Box>
            <IconButton onClick={() => setIsEditFormOpen(true)} size="small" color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => { onDelete(displayCard.id); onClose(); }} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {displayCard.description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {displayCard.description}
            </Typography>
          )}
          {displayCard.due_date && (
            <Chip
              label={`Fecha límite: ${formatDate(displayCard.due_date)}`}
              size="small"
              sx={{ mb: 2 }}
            />
          )}
          <WorklogList cardId={displayCard.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <CardForm
        open={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={async (cardData) => {
          try {
            const updateData: Partial<Card> = {
              title: cardData.title,
              description: cardData.description,
              list_id: cardData.list_id,
              due_date: cardData.due_date || undefined,
            };
            const updatedCard = await cardService.updateCard(displayCard.id, updateData);
            // Actualiza el card mostrado en el modal con los nuevos datos
            setDisplayCard(updatedCard);
            onCardUpdated(); // Recarga los datos en el tablero
            setIsEditFormOpen(false);
          } catch (error) {
            alert(error instanceof Error ? error.message : "Error al actualizar");
          }
        }}
        initialCard={displayCard}
        boardLists={boardLists}
        boardId={boardId}
      />
    </>
  );
};

export default CardDetail;