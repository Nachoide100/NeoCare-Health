const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string) {
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    formData.append("grant_type", "password");

    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
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


