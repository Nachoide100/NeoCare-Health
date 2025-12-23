import React, { useState } from "react";
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

  if (!card) return null;

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
            {card.title}
          </Typography>
          <Box>
            <IconButton onClick={() => setIsEditFormOpen(true)} size="small" color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => { onDelete(card.id); onClose(); }} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {card.description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {card.description}
            </Typography>
          )}
          {card.due_date && (
            <Chip
              label={`Fecha límite: ${formatDate(card.due_date)}`}
              size="small"
              sx={{ mb: 2 }}
            />
          )}
          <WorklogList cardId={card.id} />
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
            await cardService.updateCard(card.id, updateData);
            onCardUpdated(); // Recarga los datos en el tablero
            setIsEditFormOpen(false);
          } catch (error) {
            alert(error instanceof Error ? error.message : "Error al actualizar");
          }
        }}
        initialCard={card}
        boardLists={boardLists}
        boardId={boardId}
      />
    </>
  );
};

export default CardDetail;