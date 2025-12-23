import type { Worklog, WorklogCreate, WorklogUpdate } from '../types';

const API_URL = "http://127.0.0.1:8000";

const getHeaders = () => {
    const token = localStorage.getItem("user-token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const worklogService = {
    // Obtener registros de una tarjeta específica
    getWorklogsByCard: async (cardId: number): Promise<Worklog[]> => {
        const response = await fetch(`${API_URL}/worklogs/card/${cardId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al cargar registros");
        return await response.json();
    },

    // Crear registro
    createWorklog: async (cardId: number, worklog: WorklogCreate): Promise<Worklog> => {
        const response = await fetch(`${API_URL}/worklogs/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ ...worklog, card_id: cardId }),
        });
        if (!response.ok) throw new Error("Error al crear registro");
        return await response.json();
    },

    // Actualizar registro (Evita error 422 enviando solo los campos necesarios)
    updateWorklog: async (worklogId: number, worklogUpdate: WorklogUpdate): Promise<Worklog> => {
        // EXTRAEMOS SOLO LOS CAMPOS PERMITIDOS
        // Si enviamos el objeto entero, el Backend dará error 422
        const dataToSend = {
            date: worklogUpdate.date,
            hours: worklogUpdate.hours,
            note: worklogUpdate.note
        };

        const response = await fetch(`${API_URL}/worklogs/${worklogId}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Detalle del error 422:", JSON.stringify(errorData, null, 2));
            console.log("Data enviado:", JSON.stringify(dataToSend, null, 2));
            throw new Error("Error al actualizar el registro");
        }

        return await response.json();
    },

    // Eliminar registro
    deleteWorklog: async (worklogId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/worklogs/${worklogId}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al eliminar");
    },

    // LISTADO GENERAL (Lo que faltaba para "Mis horas")
    getMyWorklogs: async (week?: string): Promise<Worklog[]> => {
        const url = week ? `${API_URL}/worklogs/me?week=${week}` : `${API_URL}/worklogs/me`;
        const response = await fetch(url, { headers: getHeaders() });
        if (!response.ok) return []; 
        return await response.json();
    }
};