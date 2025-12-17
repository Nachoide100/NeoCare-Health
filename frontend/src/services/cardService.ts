import type { Card } from '../types';

const API_URL = "http://127.0.0.1:8000";

const getHeaders = () => {
    const token = localStorage.getItem("user-token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const cardService = {
    // Obtener todas las tarjetas
    fetchCards: async (boardId: number): Promise<Card[]> => {
        const response = await fetch(`${API_URL}/cards/?board_id=${boardId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al cargar tarjetas");
        return await response.json();
    },

    // Crear tarjeta (La barra final '/' en la URL es CRÍTICA para evitar errores de CORS)
    createCard: async (card: Omit<Card, "id" | "user_id" | "created_at" | "updated_at">): Promise<Card> => {
        const response = await fetch(`${API_URL}/cards/`, { 
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(card),
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Esto mostrará el mensaje de error del backend (ej: "Tablero no encontrado")
            throw new Error(errorData.detail || "Error al crear la tarjeta");
        }
        
        return await response.json();
    },

    // Actualizar tarjeta
    updateCard: async (cardId: number, cardData: Partial<Card>): Promise<Card> => {
        // Remover campos que no deben enviarse en el update (board_id, id, user_id, created_at, updated_at)
        const { board_id, id, user_id, created_at, updated_at, ...updateData } = cardData;
        
        // Limpiar el objeto para enviar solo campos válidos
        const payload: any = {};
        if (updateData.title !== undefined) payload.title = updateData.title;
        if (updateData.description !== undefined) payload.description = updateData.description || null;
        if (updateData.list_id !== undefined) payload.list_id = updateData.list_id;
        if (updateData.due_date !== undefined) {
            // Enviar null si está vacío (cadena vacía), o la fecha si tiene valor
            payload.due_date = (updateData.due_date && updateData.due_date.toString().trim() !== '') 
                ? updateData.due_date 
                : null;
        }
        
        const response = await fetch(`${API_URL}/cards/${cardId}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { detail: errorText || "Error al actualizar la tarjeta" };
            }
            console.error("Error response:", errorData);
            throw new Error(errorData.detail || "Error al actualizar la tarjeta");
        }
        
        return await response.json();
    },

    // Eliminar tarjeta
    deleteCard: async (cardId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/cards/${cardId}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Error al eliminar la tarjeta");
        }
    }
};
