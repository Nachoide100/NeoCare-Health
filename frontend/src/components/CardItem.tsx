// frontend/src/components/CardItem.tsx

import React from "react";
import {
  Box,
  Typography,
  Card as MuiCard,
  CardContent,
  IconButton,
  Chip, // Added Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // Added AccessTimeIcon
import type { Card } from "../types";

// Utility function to format date for display
const formatDateDisplay = (isoString?: string) => isoString ? new Date(isoString).toLocaleDateString() : null;

// Utility function to check if card is overdue
const isOverdue = (isoString?: string) => isoString ? new Date(isoString) < new Date() : false;

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: number) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  return (
    <MuiCard key={card.id} sx={{ mb: 1, position: "relative" }}>
      <CardContent sx={{ p: 2, pb: "16px !important", pr: 6 }}>
        <Typography variant="subtitle1" fontWeight="bold">{card.title}</Typography>
        {card.description && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {card.description}
          </Typography>
        )}

        {card.due_date && ( // Use due_date from current Card type
            <Chip 
                icon={<AccessTimeIcon fontSize="small" />} 
                label={formatDateDisplay(card.due_date)} 
                size="small" 
                color={isOverdue(card.due_date) && card.list_id !== 3 ? "error" : "default"} // Assumes list_id 3 is "Hecho"
                variant="outlined" 
                sx={{ mt: 1, fontSize: '0.75rem' }} 
            />
        )}

        {/* Botones de Acción */}
        <Box sx={{ position: "absolute", top: 5, right: 5 }}>
          <IconButton size="small" onClick={() => onEdit(card)} sx={{ "&:hover": { color: "primary.main" } }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(card.id)} sx={{ "&:hover": { color: "error.main" } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </MuiCard>
  );
};

export default CardItem;
