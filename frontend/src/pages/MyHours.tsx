import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { worklogService } from "../services/worklogService";
import type { Worklog } from "../types";
import type { Card } from "../types"; // Asegúrate de importar Card
import AppLayout from "../components/AppLayout";

const MyHours: React.FC = () => {
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [cards] = useState<Record<number, Card>>({}); // Se asume que se cargará después
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekFilter, setWeekFilter] = useState("");

  useEffect(() => {
    document.title = "Mis Horas | NeoCare Health";
    loadWorklogs();
  }, [weekFilter]);

  const loadWorklogs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await worklogService.getMyWorklogs(weekFilter || undefined);
      setWorklogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tus horas");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeek = () => {
    const today = new Date();
    const year = today.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-${weekNumber.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const groupedByDate = worklogs.reduce((acc, worklog) => {
    const date = worklog.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(worklog);
    return acc;
  }, {} as Record<string, Worklog[]>);

  const dailyTotals = Object.entries(groupedByDate).map(([date, logs]) => ({
    date,
    total: logs.reduce((sum, log) => sum + log.hours, 0),
    logs,
  }));

  dailyTotals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const weeklyTotal = worklogs.reduce((sum, w) => sum + w.hours, 0);

  return (
    <AppLayout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <AccessTimeIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Mis Horas Trabajadas
          </Typography>
        </Box>

        <Box
          sx={{
            mb: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Semana (YYYY-WW)"
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            placeholder={getCurrentWeek()}
            helperText="Deja vacío para ver la semana actual"
            size="small"
            style={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            onClick={() => setWeekFilter("")}
          >
            Semana Actual
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : worklogs.length === 0 ? (
          <Alert severity="info">
            No hay horas registradas para esta semana.
          </Alert>
        ) : (
          <>
            <Paper sx={{ p: 2, mb: 3, backgroundColor: "primary.main", color: "white" }}>
              <Typography variant="h6" fontWeight="bold">
                Total Semanal: {weeklyTotal.toFixed(2)} horas
              </Typography>
            </Paper>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Tarjeta</strong></TableCell>
                    <TableCell><strong>Horas</strong></TableCell>
                    <TableCell><strong>Nota</strong></TableCell>
                    <TableCell align="right"><strong>Total del Día</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyTotals.map((dayGroup) => (
                    <React.Fragment key={dayGroup.date}>
                      {dayGroup.logs.map((worklog, logIdx) => (
                        <TableRow key={worklog.id}>
                          {logIdx === 0 && (
                            <TableCell
                              rowSpan={dayGroup.logs.length}
                              sx={{ fontWeight: "bold", verticalAlign: "top" }}
                            >
                              {formatDate(worklog.date)}
                            </TableCell>
                          )}
                          <TableCell>
                            {worklog.card_title || `Tarjeta #${worklog.card_id}`}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${worklog.hours.toFixed(2)}h`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{worklog.note || "-"}</TableCell>
                          {logIdx === 0 && (
                            <TableCell
                              align="right"
                              rowSpan={dayGroup.logs.length}
                              sx={{ fontWeight: "bold", verticalAlign: "top" }}
                            >
                              {dayGroup.total.toFixed(2)}h
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </AppLayout>
  );
};

export default MyHours;

