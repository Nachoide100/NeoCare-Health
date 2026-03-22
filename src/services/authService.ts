const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    if (!response.ok) {
      throw new Error("Credenciales inválidas");
    }

    const data = await response.json();
    return data; // aquí viene el access_token
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}



