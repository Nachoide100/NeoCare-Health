// frontend/src/components/CardItem.tsx

import React from "react";
import {
  Box,
  Typography,
  Card as MuiCard,
  CardContent,
  IconButton,
  Chip, 
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // Added AccessTimeIcon
import type { Card } from "../types";
import { useDraggable } from "@dnd-kit/core";

// Utility function to format date for display
const formatDateDisplay = (isoString?: string) => isoString ? new Date(isoString).toLocaleDateString() : null;

// Utility function to check if card is overdue
const isOverdue = (isoString?: string) => isoString ? new Date(isoString) < new Date() : false;

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: number) => void;
  onView?: (card: Card) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete, onView }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `card-${card.id}`,
      data: {
        cardId: card.id,
        listId: card.list_id,
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging
      ? "0 8px 20px rgba(0,0,0,0.25)"
      : "0 1px 3px rgba(0,0,0,0.2)",
    cursor: "grab",
    transition: "box-shadow 0.15s ease, opacity 0.15s ease",
  } as React.CSSProperties;

  return (
    <MuiCard
      key={card.id}
      ref={setNodeRef}
      sx={{ mb: 1, position: "relative" }}
      style={style}
      {...listeners}
      {...attributes}
    >
      <CardContent 
        sx={{ p: 2, pb: "16px !important", pr: 6, cursor: onView ? "pointer" : "default" }}
        onClick={() => onView && onView(card)}
      >
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
        <Box sx={{ position: "absolute", top: 5, right: 5, display: 'flex', gap: 0.5,
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '4px'
        }}>
          {/* BOTÓN DE HORAS - Abre el detalle de la tarjeta */}
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation(); 
              onView && onView(card); 
            }} 
            sx={{ color: "success.main", "&:hover": { backgroundColor: "#e8f5e9" } }}
            title="Registrar Horas"
          >
            <AccessTimeIcon fontSize="small" />
          </IconButton>

          {/* BOTÓN EDITAR - Abre el formulario de edición */}
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }} 
            sx={{ color: "primary.main", "&:hover": { backgroundColor: "#e3f2fd" } }}
            title="Editar"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          
          {/* BOTÓN BORRAR */}
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }} 
            sx={{ color: "error.main", "&:hover": { backgroundColor: "#ffebee" } }}
            title="Eliminar"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </MuiCard>
  );
};

export default CardItem;
