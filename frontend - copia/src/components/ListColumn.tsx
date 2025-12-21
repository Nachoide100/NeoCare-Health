// frontend/src/components/ListColumn.tsx

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Card as MuiCard,
  CardContent,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { Card, List } from "../types";

interface ListColumnProps {
  list: List;
  cards: Card[];
  onAddCard: (listId: number) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: number) => void;
}

const ListColumn: React.FC<ListColumnProps> = ({
  list,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => {
  return (
    <Paper key={list.id} elevation={0} sx={{ minWidth: 300, width: 300, backgroundColor: list.color || "#ebecf0", padding: 2, borderRadius: 2, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">{list.title}</Typography>
        <Chip label={cards.length} size="small" />
      </Box>

      <Box sx={{ overflowY: "auto", flexGrow: 1, mb: 2 }}>
        {cards.map((card) => (
          <MuiCard key={card.id} sx={{ mb: 1, position: "relative" }}>
            <CardContent sx={{ p: 2, pb: "16px !important", pr: 6 }}>
              <Typography variant="subtitle1" fontWeight="bold">{card.title}</Typography>
              {card.description && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {card.description}
                </Typography>
              )}

              {/* Botones de Acción */}
              <Box sx={{ position: "absolute", top: 5, right: 5 }}>
                <IconButton size="small" onClick={() => onEditCard(card)} sx={{ "&:hover": { color: "primary.main" } }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteCard(card.id)} sx={{ "&:hover": { color: "error.main" } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </MuiCard>
        ))}
      </Box>

      <Button startIcon={<AddIcon />} fullWidth variant="contained" color="inherit" sx={{ backgroundColor: "rgba(255,255,255,0.5)", justifyContent: "flex-start" }} onClick={() => onAddCard(list.id)}>
        Añadir tarjeta
      </Button>
    </Paper>
  );
};

export default ListColumn;
