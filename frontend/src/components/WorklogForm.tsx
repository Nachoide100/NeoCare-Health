import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import type { Worklog, WorklogCreate, WorklogUpdate } from "../types";

interface WorklogFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (worklog: WorklogCreate | WorklogUpdate) => Promise<void>;
  initialWorklog?: Worklog | null;
  cardId: number;
}

const WorklogForm: React.FC<WorklogFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialWorklog,
  cardId,
}) => {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialWorklog) {
      setDate(initialWorklog.date);
      setHours(initialWorklog.hours.toString());
      setNote(initialWorklog.note || "");
    } else {
      // Fecha por defecto: hoy
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setHours("");
      setNote("");
    }
    setError("");
  }, [initialWorklog, open]);

  const handleSubmit = async () => {
    setError("");

    // Validaciones
    if (!date) {
      setError("La fecha es obligatoria");
      return;
    }

    const hoursNum = parseFloat(hours);
    if (!hours || isNaN(hoursNum) || hoursNum <= 0) {
      setError("Las horas deben ser un número mayor a 0");
      return;
    }

    if (hoursNum < 0.25) {
      setError("Las horas deben ser al menos 0.25");
      return;
    }

    if (note && note.length > 200) {
      setError("La nota no puede exceder 200 caracteres");
      return;
    }

    // Validar fecha no futura
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      setError("No se pueden registrar horas para fechas futuras");
      return;
    }

    try {
      if (initialWorklog) {
        // Editar
        await onSubmit({
          date,
          hours: hoursNum,
          note: note || undefined,
        });
      } else {
        // Crear
        await onSubmit({
          card_id: cardId,
          date,
          hours: hoursNum,
          note: note || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el registro");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialWorklog ? "Editar Registro de Horas" : "Añadir Horas Trabajadas"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Fecha"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: new Date().toISOString().split("T")[0],
            }}
          />
          <TextField
            label="Horas"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            fullWidth
            required
            inputProps={{
              min: 0.25,
              step: 0.25,
            }}
            helperText="Mínimo 0.25 horas"
          />
          <TextField
            label="Nota (opcional)"
            multiline
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            inputProps={{
              maxLength: 200,
            }}
            helperText={`${note.length}/200 caracteres`}
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialWorklog ? "Guardar Cambios" : "Añadir Horas"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorklogForm;
