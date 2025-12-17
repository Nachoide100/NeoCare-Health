import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getProfile } from "../services/authService";
import BoardContent from "../components/BoardContent"; // Importar BoardContent
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton, // Changed from ListItem to ListItemButton
  ListItemIcon,
  ListItemText,
  CssBaseline,
  CircularProgress,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

// Definir un tipo para el perfil del usuario
interface UserProfile {
  email: string;
  id: number;
}

const Board: React.FC = () => {
  const navigate = useNavigate();
  // Estado para guardar el perfil del usuario
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hook para buscar los datos al cargar el componente
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        // Si el token es inválido o expiró, cerramos sesión y redirigimos
        logout();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            NeoCare Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <List>
          <ListItemButton component="li" key="tablero"> {/* Changed to ListItemButton */}
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Mi Tablero" />
          </ListItemButton>
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <List>
           <ListItemButton component="li" key="logout" onClick={handleLogout}> {/* Changed to ListItemButton */}
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar />
        {/* Mostrar contenido dinámico basado en el estado de carga y el usuario */}
        {loading ? (
          <CircularProgress />
        ) : user ? (
          // Renderizar BoardContent si el usuario está cargado
          <BoardContent boardId={user.id} />
        ) : (
          <Typography paragraph>
            No se pudieron cargar los datos del usuario.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Board;
