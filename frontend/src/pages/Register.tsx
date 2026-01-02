import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { 
  Box, TextField, Button, Typography, Grid as Grid, Paper, InputAdornment, IconButton 
} from "@mui/material"; 
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Registro | NeoCare Health";
  }, []);

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{10,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("❌ Las contraseñas no coinciden.");
      return;
    }

    if (!validatePassword(password)) {
      setMessage("❌ La contraseña no cumple los requisitos (10+ caracteres, Mayúscula, Número, Símbolo).");
      return;
    }

    const success = await register(email, password);
    if (success) {
      setMessage("✅ Registro exitoso. Redirigiendo...");
      setTimeout(() => navigate("/"), 2000); 
    } else {
      setMessage("❌ Error al registrar. Intenta de nuevo.");
    }
  };

  return (
    <Grid container sx={{ height: "100vh", width: "100vw", overflow: "hidden", position: "fixed", top: 0, left: 0 }}>
      {/* LADO IZQUIERDO: FORMULARIO */}
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
            Crear Cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Únete a nuestra plataforma médica.
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
                endAdornment: <InputAdornment position="end"><EmailIcon color="action" /></InputAdornment>,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Mínimo 10 caracteres (A, a, 1, #)"
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar Contraseña"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword !== "" && password !== confirmPassword}
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
              Registrarse
            </Button>

            {message && (
              <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: message.includes("✅") ? "green" : "red" }}>
                {message}
              </Typography>
            )}

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2">
                ¿Ya tienes cuenta? <Link to="/" style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>Inicia Sesión</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* LADO DERECHO: IMAGEN */}
      <Grid
        size={{ xs: false, sm: 6, md: 7 }}
        sx={{
          backgroundImage: "url(https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=2000)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          position: "relative",
          zIndex: 0,
          minHeight: "100vh",
        }}
      />
    </Grid>
  );
};

export default Register;