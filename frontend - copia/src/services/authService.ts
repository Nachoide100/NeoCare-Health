// La URL base de tu API. Asegúrate de que coincida con el puerto de tu backend.
const API_URL = "http://127.0.0.1:8000";

export async function login(email: string, password: string): Promise<boolean> {
  // FastAPI con OAuth2PasswordRequestForm espera los datos como 'form data'.
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (response.ok) {
      // Si el login es exitoso (status 200-299)
      const data = await response.json();
      
      // Guardamos el token en el almacenamiento local del navegador.
      // Esto es crucial para mantener al usuario autenticado.
      localStorage.setItem("user-token", data.access_token);
      
      console.log("✅ Login exitoso. Token guardado.");
      return true;
    } else {
      // Si el servidor responde con un error (ej. 401 Unauthorized)
      const errorData = await response.json();
      console.error("Error en el login:", errorData.detail);
      return false;
    }
  } catch (error) {
    // Si hay un error de red (ej. el backend no está corriendo)
          console.error("Error de red o de conexión:", error);
          return false;
        }
      }
      
      export async function register(email: string, password: string): Promise<boolean> {
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
      
          if (response.ok) {
            console.log("✅ Registro exitoso.");
            return true;
          } else {
            const errorData = await response.json();
            console.error("Error en el registro:", errorData.detail);
            return false;
          }
        } catch (error) {
          console.error("Error de red o de conexión durante el registro:", error);
          return false;
        }
      }
      
      /**
       * Cierra la sesión del usuario eliminando el token.
       */
      export function logout() {
        localStorage.removeItem("user-token");
      }
/**
 * Comprueba si hay un token de usuario guardado.
 * @returns {boolean} True si el usuario está autenticado, false en caso contrario.
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("user-token");
  return token != null;
}

/**
 * Obtiene el token de autenticación del almacenamiento local.
 * @returns {string | null}
 */
export function getToken(): string | null {
  return localStorage.getItem("user-token");
}

/**
 * Obtiene el perfil del usuario autenticado desde el backend.
 */
export async function getProfile(): Promise<any> {
  const token = getToken();
  if (!token) {
    throw new Error("No hay token de autenticación.");
  }

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 👈 Incluir el token aquí
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      console.error("Error al obtener el perfil:", errorData.detail);
      throw new Error(errorData.detail || "Error al obtener perfil.");
    }
  } catch (error) {
    console.error("Error de red o de conexión al obtener el perfil:", error);
    throw error;
  }
}
