import React from "react";
import { Box, Typography, Paper } from "@mui/material";

// Datos de ejemplo para las columnas. Más adelante, esto vendrá de la API.
const mockColumns = [
  { id: "col-1", title: "Por Hacer" },
  { id: "col-2", title: "En Progreso" },
  { id: "col-3", title: "Hecho" },
];

const Column = ({ title }: { title: string }) => {
  return (
    <Paper
      sx={{
        minWidth: 300,
        margin: 1,
        backgroundColor: "#f4f5f7",
        padding: 1,
      }}
    >
      <Typography variant="h6" sx={{ padding: 1 }}>{title}</Typography>
      {/* Aquí irán las tarjetas más adelante */}
    </Paper>
  );
};

const BoardContent: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        overflowX: "auto", // Permite el scroll horizontal
        height: 'calc(100vh - 64px)', // Ajusta la altura al viewport menos el appbar
        padding: 2,
      }}
    >
      {mockColumns.map((col) => (
        <Column key={col.id} title={col.title} />
      ))}
    </Box>
  );
};

export default BoardContent;
