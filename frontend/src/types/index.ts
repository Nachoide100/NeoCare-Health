export interface Card {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    order: number;
    list_id: number;
    board_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface List {
    id: number;
    title: string;
    position: number;
    board_id: number;
    cards?: Card[];
    color?: string; // Added to fix TS2339 error
}

export interface Board {
    id: number;
    title: string;
    owner_id: number;
}

export interface BoardCreate {
    title: string;
}

export interface Worklog {
    id: number;
    card_id: number;
    card_title?: string;
    user_id: number;
    date: string;
    hours: number;
    note?: string;
    created_at: string;
    updated_at?: string;
}

export interface WorklogCreate {
    card_id: number;
    date: string;
    hours: number;
    note?: string;
}

export interface WorklogUpdate {
    date?: string;
    hours?: number;
    note?: string;
}