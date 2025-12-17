//7. frontend/src/services/cardService.ts
//NUEVO

import { Card } from '../types';

const API_URL = "http://127.0.0.1:8000";

const getHeaders = () => {
    const token = localStorage.getItem("user-token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const cardService = {
    fetchCards: async (boardId: number): Promise<Card[]> => {
        const response = await fetch(`${API_URL}/cards/?board_id=${boardId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al cargar tarjetas");
        return await response.json();
    },

    createCard: async (card: Omit<Card, 'id'>): Promise<Card> => {
        const response = await fetch(`${API_URL}/cards/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(card),
        });
        if (!response.ok) throw new Error("Error al crear tarjeta");
        return await response.json();
    },

    updateCard: async (cardId: number, updates: Partial<Card>): Promise<Card> => {
        const response = await fetch(`${API_URL}/cards/${cardId}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error("Error al actualizar tarjeta");
        return await response.json();
    },

    deleteCard: async (cardId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/cards/${cardId}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al eliminar tarjeta");
    }
};