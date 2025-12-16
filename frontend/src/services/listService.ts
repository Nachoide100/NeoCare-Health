import { List } from '../types';

const API_URL = "http://127.0.0.1:8000";

const getHeaders = () => {
    const token = localStorage.getItem("user-token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const listService = {
    fetchLists: async (boardId: number): Promise<List[]> => {
        const response = await fetch(`${API_URL}/lists/?board_id=${boardId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al cargar las listas");
        return await response.json();
    }
};
