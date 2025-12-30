import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Button, IconButton, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Collapse, Chip, List, ListItem, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import AppLayout from '../components/AppLayout';
import BarChartIcon from '@mui/icons-material/BarChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getSummary, getHoursByUser, getHoursByCardOrdered } from "../services/reportService";
import { getProfile } from "../services/authService";

function isoWeekFromInput(value: string) {
  if (!value) return "";
  return value.replace("-W", "-");
}

function isoWeekLabel(isoWeek: string) {
  if (!isoWeek) return '';
  const [yearStr, weekStr] = isoWeek.split('-');
  return `Semana ${weekStr}, ${yearStr}`;
}

function parseIsoWeekToMonday(isoWeek: string): Date {
  const parts = isoWeek.replace('-W', '-').split('-');
  const year = parseInt(parts[0], 10);
  const week = parseInt(parts[1], 10);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const day = simple.getDay() === 0 ? 7 : simple.getDay();
  const diff = simple.getDate() - day + 1;
  return new Date(simple.getFullYear(), simple.getMonth(), diff);
}

function isoWeekFromDate(d: Date) {
  const temp = new Date(d.getTime());
  const dayNum = temp.getDay() === 0 ? 7 : temp.getDay();
  temp.setDate(temp.getDate() + 4 - dayNum);
  const year = temp.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const weekNo = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${year}-W${String(weekNo).padStart(2, '0')}`;
}

function csvDownload(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

const SummaryItem: React.FC<{ title: string, data: any, color: 'success' | 'error' | 'info' }> = ({ title, data, color }) => {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  return (
    <Paper sx={{ p: 2, flex: '1 1 200px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip label={title} color={color} />
        <Typography variant="h6">{data.count}</Typography>
        {data.items.length > 0 && (
          <IconButton onClick={() => setOpen(!open)} size="small">
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense>
          {data.items.map((item: any) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={item.title}
                secondary={`Responsable: ${item.responsible || 'N/A'} | Estado: ${item.state}`}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};


const Report: React.FC = () => {
  const [weekInput, setWeekInput] = useState<string>(() => isoWeekFromDate(new Date()));
  const [boardId, setBoardId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [hoursByUser, setHoursByUser] = useState<any[]>([]);
  const [hoursByCard, setHoursByCard] = useState<any[]>([]);
  const [userPage] = useState(1);
  const [cardPage, setCardPage] = useState(1);
  const PAGE_SIZE = 10;
  const [cardOrderDesc, setCardOrderDesc] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then(p => {
      if (p && p.id) setBoardId(p.id);
    }).catch(() => {});
  }, []);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    const week = isoWeekFromInput(weekInput);
    try {
      const s = await getSummary(boardId, week);
      setSummary(s);
      const u = await getHoursByUser(boardId, week);
      setHoursByUser(u.data || []);
      const c = await getHoursByCardOrdered(boardId, week, cardOrderDesc);
      setHoursByCard(c.data || []);
    } catch (err: any) {
      setError(err?.detail || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (summary) {
      (async () => {
        setLoading(true);
        setError(null);
        const week = isoWeekFromInput(weekInput);
        try {
          const c = await getHoursByCardOrdered(boardId, week, cardOrderDesc);
          setHoursByCard(c.data || []);
          setCardPage(1);
        } catch (err: any) {
          setError(err?.detail || JSON.stringify(err));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [cardOrderDesc, summary, weekInput, boardId]);

  const pagedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;
    return hoursByUser.slice(start, start + PAGE_SIZE);
  }, [hoursByUser, userPage]);

  const pagedCards = useMemo(() => {
    const start = (cardPage - 1) * PAGE_SIZE;
    return hoursByCard.slice(start, start + PAGE_SIZE);
  }, [hoursByCard, cardPage]);

  return (
    <AppLayout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BarChartIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1" fontWeight="bold">Informe Semanal</Typography>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Semana (YYYY-WW)"
            type="week"
            value={weekInput}
            onChange={(e) => setWeekInput(e.target.value)}
            size="small"
            style={{ flexGrow: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" onClick={() => { setWeekInput(isoWeekFromDate(new Date())); }}>Semana Actual</Button>
          <TextField
            label="Board ID"
            type="number"
            value={boardId}
            onChange={(e) => setBoardId(Number(e.target.value))}
            size="small"
            sx={{ width: 120 }}
          />
          <Button variant="contained" onClick={loadReport}>Generar</Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {summary && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1">Resumen ({summary.start_date} → {summary.end_date})</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                  <SummaryItem title="Completadas" data={summary.completed} color="success" />
                  <SummaryItem title="Vencidas" data={summary.overdue} color="error" />
                  <SummaryItem title="Nuevas" data={summary.new} color="info" />
                </Box>
              </Paper>
            )}

            <Typography variant="h6" sx={{ mb: 1 }}>Horas por Persona</Typography>
            <Button variant="outlined" size="small" onClick={() => csvDownload('hours_by_user.csv', hoursByUser)} sx={{ mb: 1 }}>Exportar CSV</Button>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table sx={{ minWidth: 650 }} aria-label="Horas por persona">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Total horas</strong></TableCell>
                    <TableCell><strong>Nº tareas</strong></TableCell>
                    <TableCell align="right"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No hay datos</TableCell></TableRow>
                  ) : pagedUsers.map(u => (
                    <TableRow key={u.user_id}>
                      <TableCell>{u.user_email || u.user_id}</TableCell>
                      <TableCell>{u.total_hours.toFixed(2)}</TableCell>
                      <TableCell>{u.tasks_count}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => alert(`Detalles para ${u.user_email}`)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mb: 1 }}>Horas por Tarjeta</Typography>
            <Button variant="outlined" size="small" onClick={() => csvDownload('hours_by_card.csv', hoursByCard)} sx={{ mb: 1 }}>Exportar CSV</Button>
            <Button variant="text" size="small" onClick={() => { setCardOrderDesc(d => !d); }} sx={{ ml: 2 }}>Ordenar por horas: {cardOrderDesc ? 'Desc' : 'Asc'}</Button>
            <TableContainer component={Paper} sx={{ mb: 2, mt: 1 }}>
              <Table sx={{ minWidth: 650 }} aria-label="Horas por tarjeta">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Título</strong></TableCell>
                    <TableCell><strong>Responsable</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Total horas</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedCards.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No hay datos</TableCell></TableRow>
                  ) : pagedCards.map(c => (
                    <TableRow key={c.card_id}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.responsible || 'Sin responsable'}</TableCell>
                      <TableCell>{c.state}</TableCell>
                      <TableCell>{c.total_hours.toFixed(2)}</TableCell>
                    </TableRow>
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

export default Report;
