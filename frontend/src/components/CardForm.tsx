// frontend/src/components/CardForm.tsx

import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { Card, List } from "../types"; // Assuming Card and List types are in ../types

// Using Card as base for CardCreate, and adding optional fields for CardUpdate
// This simplified CardFormData will be used internally by the form
interface CardFormData {
  title: string;
  description: string;
  list_id: number;
  due_date?: string; // Representing date as string for input for now
}

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (cardData: Partial<Card> & { list_id: number, board_id: number }) => void; // Submitting partial Card for update, or full for create
  initialCard?: Card | null; // Card data if editing, null/undefined if creating
  boardLists: List[];
  boardId: number; // boardId is required for creation
  initialListId?: number; // New prop: ID of the list to pre-select for new cards
}

const CardForm: React.FC<CardFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialCard,
  boardLists,
  boardId,
  initialListId, // Destructure new prop
}) => {
  const [formData, setFormData] = useState<CardFormData>({
    title: "",
    description: "",
    list_id: initialListId || (boardLists.length > 0 ? boardLists[0].id : 0), // Prioritize initialListId
    due_date: "",
  });

  useEffect(() => {
    if (initialCard) {
      setFormData({
        title: initialCard.title,
        description: initialCard.description || "",
        list_id: initialCard.list_id,
        due_date: initialCard.due_date ? initialCard.due_date.toString() : "", // Convert Date object to string
      });
    } else {
      // Reset for creation form, prioritizing initialListId
      setFormData({
        title: "",
        description: "",
        list_id: initialListId || (boardLists.length > 0 ? boardLists[0].id : 0),
        due_date: "",
      });
    }
  }, [initialCard, boardLists, initialListId]); // Add initialListId to dependencies


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      list_id: e.target.value as number,
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert("El título de la tarjeta es obligatorio.");
      return;
    }
    
    // Construct card data for submission
    const submitData: Partial<Card> & { list_id: number, board_id: number } = {
      title: formData.title,
      description: formData.description,
      list_id: formData.list_id,
      board_id: boardId, // Always include boardId
    };

    // Add due_date if provided
    if (formData.due_date) {
        submitData.due_date = formData.due_date; // Backend expects string/date format
    } else {
        submitData.due_date = undefined; // Ensure it's not sent if empty
    }


    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialCard ? "Editar Tarjeta" : "Nueva Tarjeta"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Título"
          fullWidth
          variant="outlined"
          value={formData.title}
          onChange={handleChange}
          inputProps={{ maxLength: 80 }}
          required
          error={!formData.title.trim()}
          helperText={!formData.title.trim() && "El título es obligatorio"}
        />
        <TextField
          margin="dense"
          name="description"
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.description}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          margin="dense"
          name="due_date"
          label="Fecha límite"
          type="date" // Use type date for a date picker
          fullWidth
          variant="outlined"
          value={formData.due_date}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 2 }}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="list-select-label">Estado (Columna)</InputLabel>
          <Select
            labelId="list-select-label"
            name="list_id"
            value={formData.list_id}
            label="Estado (Columna)"
            onChange={handleSelectChange}
          >
            {boardLists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialCard ? "Guardar Cambios" : "Crear Tarjeta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardForm;
