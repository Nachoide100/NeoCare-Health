export async function login(email: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isValid = email === "demo@correo.com" && password === "123456";
      resolve(isValid);
    }, 1000);
  });
}
