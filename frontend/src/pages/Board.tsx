import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getProfile } from "../services/authService";
import BoardContent from "../components/BoardContent";
import AppLayout from "../components/AppLayout";
import { CircularProgress, Typography } from "@mui/material";

// Definir un tipo para el perfil del usuario
interface UserProfile {
  email: string;
  id: number;
}

const Board: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Tablero | NeoCare Health";
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        logout();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <AppLayout>
      {loading ? (
        <CircularProgress />
      ) : user ? (
        <BoardContent boardId={user.id} />
      ) : (
        <Typography paragraph>
          No se pudieron cargar los datos del usuario.
        </Typography>
      )}
    </AppLayout>
  );
};

export default Board;
