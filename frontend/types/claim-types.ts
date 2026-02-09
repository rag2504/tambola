export interface PrizeClaim {
    id: string;
    prize_id: string;
    prize_name: string;
    player_id: string;
    player_name: string;
    ticket_id: string;
    ticket_number: number;
    timestamp: string;
    verified: boolean;
}

export interface SelectedPrize {
    id: string;
    name: string;
    amount: string;
    enabled: boolean;
}
