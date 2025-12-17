// frontend/src/services/boardService.ts

// SE AGREGÓ 'type' para cumplir con verbatimModuleSyntax
import type { Board, BoardCreate } from '../types'; 

const API_URL = "http://127.0.0.1:8000";

const getHeaders = () => {
    const token = localStorage.getItem("user-token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const boardService = {
    /** Carga todos los tableros del usuario actual (GET /boards) */
    fetchBoards: async (): Promise<Board[]> => {
        const response = await fetch(`${API_URL}/boards/`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al cargar tableros");
        return await response.json();
    },

    /** Crea un nuevo tablero (POST /boards) */
    createBoard: async (boardData: BoardCreate): Promise<Board> => {
        const response = await fetch(`${API_URL}/boards/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(boardData),
        });
        if (!response.ok) throw new Error("Error al crear tablero");
        return await response.json();
    },
};