export interface Card {
    id: number;
    title: string;
    description?: string;
    deadline?: string;
    list_id: number;
    board_id: number;
}

export interface ListColumn {
    id: number;
    title: string;
    position: number;
    board_id: number;
    cards?: Card[];
}