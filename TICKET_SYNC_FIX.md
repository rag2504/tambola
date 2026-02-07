# Purchased Ticket Sync & Visibility Fix

## Problem Fixed
When users bought tickets, the API showed success and backend saved the ticket, but the game screen did NOT display purchased tickets. The UI showed an empty ticket list after game start.

## Solution Implemented

### 1. Backend Changes (server_multiplayer.py)

**Fixed ticket purchase API to emit socket event:**
- After successful ticket purchase, emit `ticket_purchased` event to all users in the room
- Each ticket includes: id, room_id, user_id, ticket_number, grid, numbers, marked_numbers
- Properly serialize ticket data to remove MongoDB ObjectId

**Fixed ticket generation:**
- Ensure `generate_tambola_ticket()` returns both `grid` and `numbers` array
- Store both fields in database for proper ticket structure

### 2. Backend Socket Handler Changes (socket_handlers.py)

**Fixed auto-generated ticket on room join:**
- When user joins room, auto-generate free ticket
- Emit `ticket_purchased` event after creating ticket
- Include complete ticket structure with grid and numbers array

### 3. Frontend Socket Service Changes (socket.ts)

**Added ticket_purchased listener:**
```typescript
this.socket.on('ticket_purchased', (data: any) => {
  console.log('Ticket purchased:', data);
  // Handled by game screen component
});
```

### 4. Frontend Game Screen Changes (game/[id].tsx)

**Added handleTicketPurchased function:**
- Listen for `ticket_purchased` socket event
- Filter tickets by current user ID
- Add new ticket to state if not already present
- Auto-select ticket if none selected

**Enhanced loadTickets function:**
- Always initialize marked_numbers as empty array
- Handle null/undefined responses gracefully
- Preserve selected ticket when reloading

**Setup socket listener:**
- Register `ticket_purchased` event handler on mount
- Clean up listener on unmount

**Improved error handling:**
- Show alert when game data fails to load
- Log errors for debugging

## Expected Results

✅ Buy ticket → ticket instantly appears in game screen
✅ Game start → previously purchased tickets remain visible
✅ Socket updates add new tickets live
✅ No need to reload app
✅ Ticket UI never empty after purchase
✅ Auto-generated tickets on room join appear immediately
✅ Multiple users see their own tickets correctly

## Technical Flow

1. **User buys ticket:**
   - Frontend calls `/tickets/buy` API
   - Backend creates ticket in database
   - Backend emits `ticket_purchased` event to room
   - All users in room receive event
   - Frontend filters by user_id and adds to state

2. **User joins room:**
   - Frontend calls socket `join_room` event
   - Backend auto-generates free ticket
   - Backend emits `ticket_purchased` event
   - Frontend receives and displays ticket

3. **Game screen opens:**
   - Load tickets via API call
   - Setup socket listeners
   - Listen for new ticket purchases
   - Display all tickets with proper state

## Files Modified

1. `backend/server_multiplayer.py` - Emit socket event after ticket purchase
2. `backend/socket_handlers.py` - Emit socket event for auto-generated tickets
3. `frontend/services/socket.ts` - Add ticket_purchased listener
4. `frontend/app/room/game/[id].tsx` - Handle ticket_purchased event and improve state management

## Testing Checklist

- [ ] Buy ticket from lobby → appears in game screen
- [ ] Join room → auto-generated ticket appears
- [ ] Multiple tickets → all display correctly
- [ ] Game start → tickets persist
- [ ] Socket reconnect → tickets remain visible
- [ ] Multiple users → each sees only their tickets
- [ ] Marked numbers → persist across updates
