/**
 * In-memory cache for game_started tickets.
 * When the user is on the lobby and game_started fires, we navigate to the game screen.
 * The game screen mounts after the event, so it never receives game_started. This cache
 * lets the lobby store the tickets so the game screen can apply them on mount.
 */
const pendingTicketsByRoom: Record<string, any[]> = {};

export function setPendingTicketsForRoom(roomId: string, tickets: any[]): void {
  if (roomId && Array.isArray(tickets)) {
    pendingTicketsByRoom[roomId] = tickets;
  }
}

export function getPendingTickets(roomId: string): any[] | null {
  return pendingTicketsByRoom[roomId] ?? null;
}

export function clearPendingTickets(roomId: string): void {
  delete pendingTicketsByRoom[roomId];
}
