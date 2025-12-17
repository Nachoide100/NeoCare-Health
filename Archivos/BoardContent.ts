//8. frontend/src/components/BoardContent.tsx
//MODIFICADO

import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Card as MuiCard, CardContent, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip,
  Select, MenuItem, InputLabel, FormControl, Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { cardService } from "../services/cardService";
import { Card } from "../types";

const columns = [
  { id: 1, title: "Por Hacer", color: "#ebecf0" },
  { id: 2, title: "En Progreso", color: "#e3f2fd" },
  { id: 3, title: "Hecho", color: "#e8f5e9" },
];

const BoardContent: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  
  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDeadline, setNewCardDeadline] = useState("");
  const [selectedListIdForCreate, setSelectedListIdForCreate] = useState<number>(1);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    try {
      const data = await cardService.fetchCards(1);
      setCards(data);
    } catch (error) { console.error("Error cargando tarjetas:", error); }
  };

  const formatDateDisplay = (isoString?: string) => isoString ? new Date(isoString).toLocaleDateString() : null;
  const isOverdue = (isoString?: string) => isoString ? new Date(isoString) < new Date() : false;

  const handleOpenCreateModal = (listId: number) => {
    setSelectedListIdForCreate(listId);
    setNewCardTitle("");
    setNewCardDeadline("");
    setIsCreateModalOpen(true);
  };

  const handleCreateCard = async () => {
    if (!newCardTitle.trim()) return;
    try {
      const newCard = await cardService.createCard({
        title: newCardTitle,
        list_id: selectedListIdForCreate,
        board_id: 1,
        description: "",
        deadline: newCardDeadline || undefined,
      });
      setCards([...cards, newCard]);
      setIsCreateModalOpen(false);
    } catch (error) { alert("Error al crear"); }
  };

  const handleOpenEditModal = (card: Card) => {
    const formattedCard = { ...card };
    if (formattedCard.deadline) formattedCard.deadline = formattedCard.deadline.split('T')[0];
    setEditingCard(formattedCard);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCard || !editingCard.title.trim()) return;
    try {
      const updatedCard = await cardService.updateCard(editingCard.id, {
        title: editingCard.title,
        description: editingCard.description,
        list_id: editingCard.list_id,
        deadline: editingCard.deadline || undefined
      });
      setCards(cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
      setIsEditModalOpen(false);
    } catch (error) { alert("Error al actualizar"); }
  };

  const handleDeleteCard = async (id: number) => {
    if (!confirm("¿Eliminar tarea?")) return;
    try {
      await cardService.deleteCard(id);
      setCards(cards.filter((c) => c.id !== id));
    } catch (error) { alert("Error al eliminar"); }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", overflowX: "auto", height: "calc(100vh - 80px)", padding: 2, gap: 2 }}>
      {columns.map((col) => {
        const colCards = cards.filter((c) => c.list_id === col.id);
        return (
          <Paper key={col.id} elevation={0} sx={{ minWidth: 300, width: 300, backgroundColor: col.color, padding: 2, borderRadius: 2, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">{col.title}</Typography>
              <Chip label={colCards.length} size="small" />
            </Box>
            <Box sx={{ overflowY: "auto", flexGrow: 1, mb: 2 }}>
              {colCards.map((card) => (
                <MuiCard key={card.id} sx={{ mb: 1, position: "relative" }}>
                  <CardContent sx={{ p: 2, pb: "16px !important", pr: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{card.title}</Typography>
                    {card.description && <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>{card.description}</Typography>}
                    {card.deadline && (
                        <Chip icon={<AccessTimeIcon fontSize="small" />} label={formatDateDisplay(card.deadline)} size="small" 
                            color={isOverdue(card.deadline) && col.id !== 3 ? "error" : "default"} variant="outlined" sx={{ mt: 1, fontSize: '0.75rem' }} />
                    )}
                    <Box sx={{ position: "absolute", top: 5, right: 5 }}>
                      <IconButton size="small" onClick={() => handleOpenEditModal(card)} sx={{ "&:hover": { color: "primary.main" } }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDeleteCard(card.id)} sx={{ "&:hover": { color: "error.main" } }}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </CardContent>
                </MuiCard>
              ))}
            </Box>
            <Button startIcon={<AddIcon />} fullWidth variant="contained" color="inherit" sx={{ backgroundColor: "rgba(255,255,255,0.5)", justifyContent: "flex-start" }} onClick={() => handleOpenCreateModal(col.id)}>Añadir tarjeta</Button>
          </Paper>
        );
      })}

      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nueva Tarjeta</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField autoFocus label="Título" fullWidth variant="outlined" value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} inputProps={{ maxLength: 80 }} />
                <TextField label="Fecha Límite" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newCardDeadline} onChange={(e) => setNewCardDeadline(e.target.value)} />
            </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button><Button onClick={handleCreateCard} variant="contained">Guardar</Button></DialogActions>
      </Dialog>

      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Tarjeta</DialogTitle>
        <DialogContent>
          {editingCard && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Título" fullWidth value={editingCard.title} onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })} inputProps={{ maxLength: 80 }} />
              <TextField label="Descripción" fullWidth multiline rows={3} value={editingCard.description || ""} onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })} />
              <TextField label="Fecha Límite" type="date" fullWidth InputLabelProps={{ shrink: true }} value={editingCard.deadline || ""} onChange={(e) => setEditingCard({ ...editingCard, deadline: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Estado (Columna)</InputLabel>
                <Select value={editingCard.list_id} label="Estado (Columna)" onChange={(e) => setEditingCard({ ...editingCard, list_id: Number(e.target.value) })}>
                  {columns.map((col) => (<MenuItem key={col.id} value={col.id}>{col.title}</MenuItem>))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setIsEditModalOpen(false)}>Cancelar</Button><Button onClick={handleSaveEdit} variant="contained" color="primary">Guardar Cambios</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoardContent;