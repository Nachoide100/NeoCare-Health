import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { 
  Box, TextField, Button, Typography, Grid as Grid, Paper, InputAdornment, IconButton 
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Inicio de sesión | NeoCare Health";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/board");
    } else {
      setMessage("❌ Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  return (
    <Grid container sx={{ height: "100vh", width: "100vw", overflow: "hidden", position: "fixed", top: 0, left: 0 }}>
      {/* LADO IZQUIERDO: IMAGEN */}
      <Grid
        size={{ xs: false, sm: 6, md: 7 }}
        sx={{
          backgroundImage: "url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          position: "relative",
          zIndex: 0,
          minHeight: "100vh",
        }}
      />

      {/* LADO DERECHO: FORMULARIO */}
      <Grid 
        size={{ xs: 12, sm: 6, md: 5 }} 
        component={Paper} 
        elevation={6} 
        square 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: "100vh",
          maxHeight: "100vh",
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 }, width: "100%", maxWidth: "400px", position: "relative", zIndex: 11 }}>
          <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold", mb: 4 }}>
            ✚ NeoCare Health
          </Typography>

          <Typography component="h1" variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Bienvenido
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Ingresa tus credenciales para acceder.
          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: "8px", textTransform: "none" }}
            >
              Entrar
            </Button>

            {message && (
              <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: "center" }}>
                {message}
              </Typography>
            )}

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2">
                ¿No tienes cuenta? <Link to="/register" style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>Regístrate aquí</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;