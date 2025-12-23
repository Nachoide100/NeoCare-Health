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
    await worklogService.createWorklog(cardId, worklog);
    await loadWorklogs();
  };

  const handleUpdate = async (worklog: WorklogUpdate) => {
    if (!editingWorklog) return;
    await worklogService.updateWorklog(editingWorklog.id, worklog);
    await loadWorklogs();
    setEditingWorklog(null);
  };

  const handleDelete = async (worklogId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este registro de horas?")) {
      return;
    }
    try {
      await worklogService.deleteWorklog(worklogId);
      await loadWorklogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el registro");
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
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(worklog.id)}
                      color="error"
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
      />
    </Box>
  );
};

export default WorklogList;
