// frontend/src/components/ListColumn.tsx

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { Card, List } from "../types";
import { useDroppable } from "@dnd-kit/core";
import CardItem from "./CardItem";

interface ListColumnProps {
  list: List;
  cards: Card[];
  onAddCard: (listId: number) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: number) => void;
  onViewCard?: (card: Card) => void;
}

const ListColumn: React.FC<ListColumnProps> = ({
  list,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onViewCard,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `list-${list.id}`,
  });

  return (
    <Paper
      key={list.id}
      ref={setNodeRef}
      elevation={0}
      sx={{
        minWidth: 300,
        width: 300,
        backgroundColor: list.color || "#ebecf0",
        padding: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        border: isOver ? "2px dashed #1976d2" : "2px solid transparent",
        transition: "border 0.15s ease",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">{list.title}</Typography>
        <Chip label={cards.length} size="small" />
      </Box>

      <Box sx={{ overflowY: "auto", flexGrow: 1, mb: 2 }}>
        {cards.length === 0 && (
          <Box
            sx={{
              mb: 1,
              p: 1,
              borderRadius: 1,
              border: "1px dashed rgba(0,0,0,0.2)",
              color: "text.secondary",
              fontSize: "0.8rem",
              textAlign: "center",
            }}
          >
            Arrastra una tarjeta aquí
          </Box>
        )}
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            onView={onViewCard}
          />
        ))}
      </Box>

      <Button startIcon={<AddIcon />} fullWidth variant="contained" color="inherit" sx={{ backgroundColor: "rgba(255,255,255,0.5)", justifyContent: "flex-start" }} onClick={() => onAddCard(list.id)}>
        Añadir tarjeta
      </Button>
    </Paper>
  );
};

export default ListColumn;
