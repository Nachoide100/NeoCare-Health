import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { worklogService } from "../services/worklogService";
import type { Worklog, WorklogCreate, WorklogUpdate } from "../types";
import WorklogForm from "./WorklogForm";
import { getProfile } from "../services/authService";

interface WorklogListProps {
  cardId: number;
}

const WorklogList: React.FC<WorklogListProps> = ({ cardId }) => {
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorklog, setEditingWorklog] = useState<Worklog | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadWorklogs();
    loadCurrentUser();
  }, [cardId]);

  const loadCurrentUser = async () => {
    try {
      const user = await getProfile();
      setCurrentUserId(user.id);
    } catch (err) {
      console.error("Error al cargar usuario:", err);
    }
  };

  const loadWorklogs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await worklogService.getWorklogsByCard(cardId);
      setWorklogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las horas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (worklog: WorklogCreate) => {
    try {
      setSaving(true);
      await worklogService.createWorklog(cardId, worklog);
      await loadWorklogs();
      setIsFormOpen(false);
      setSuccessMessage("Registro de horas creado exitosamente");
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el registro");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (worklog: WorklogUpdate) => {
    if (!editingWorklog) return;
    try {
      setSaving(true);
      await worklogService.updateWorklog(editingWorklog.id, worklog);
      await loadWorklogs();
      setEditingWorklog(null);
      setIsFormOpen(false);
      setSuccessMessage("Registro de horas actualizado exitosamente");
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el registro");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId === null) return;
    try {
      setDeleting(true);
      await worklogService.deleteWorklog(deleteConfirmId);
      await loadWorklogs();
      setSuccessMessage("Registro de horas eliminado exitosamente");
      setShowSuccess(true);
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el registro");
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalHours = worklogs.reduce((sum, w) => sum + w.hours, 0);

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon />
          Horas Trabajadas
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => {
            setEditingWorklog(null);
            setIsFormOpen(true);
          }}
        >
          Añadir Horas
        </Button>
      </Box>

      {totalHours > 0 && (
        <Chip
          label={`Total: ${totalHours.toFixed(2)} horas`}
          color="primary"
          sx={{ mb: 2 }}
        />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : worklogs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay horas registradas para esta tarjeta.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {worklogs.map((worklog) => (
            <Paper key={worklog.id} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {formatDate(worklog.date)}
                    </Typography>
                    <Chip
                      label={`${worklog.hours.toFixed(2)}h`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  {worklog.note && (
                    <Typography variant="body2" color="text.secondary">
                      {worklog.note}
                    </Typography>
                  )}
                </Box>
                {currentUserId === worklog.user_id && (
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingWorklog(worklog);
                        setIsFormOpen(true);
                      }}
                      disabled={saving || deleting}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirmId(worklog.id)}
                      color="error"
                      disabled={saving || deleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <WorklogForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWorklog(null);
        }}
        onSubmit={editingWorklog ? handleUpdate : handleCreate}
        initialWorklog={editingWorklog}
        cardId={cardId}
        isSaving={saving}
      />

      <Dialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que quieres eliminar este registro de horas? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </Box>
  );
};

export default WorklogList;
