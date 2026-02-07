# Ticket Visibility Debug Guide

## Problem: Tickets Not Showing in Game Screen

### Quick Checks

1. **Check if tickets exist in database:**
   ```bash
   cd backend
   python test_tickets.py
   ```

2. **Check console logs in app:**
   - Look for: `🎫 Loading tickets for room:`
   - Look for: `🎫 API Response:`
   - Look for: `✅ Processed tickets:`

3. **Check backend logs:**
   - Look for: `Found X tickets for user`
   - Look for: `Ticket purchased`

### Common Issues & Fixes

#### Issue 1: No Tickets in Database
**Symptoms:** API returns empty array `[]`

**Solutions:**
1. Buy tickets from room lobby before game starts
2. Check if auto-generation on room join is working
3. Verify user is authenticated (check user_id)

**Test:**
```bash
cd backend
python test_tickets.py
```

#### Issue 2: API Not Returning Tickets
**Symptoms:** Console shows `❌ Error loading tickets`

**Solutions:**
1. Check backend is running on correct port (8001)
2. Verify EXPO_PUBLIC_BACKEND_URL in .env
3. Check authentication token is valid

**Test:**
```bash
# Check backend is running
curl http://localhost:8001/api/rooms
```

#### Issue 3: Socket Not Connected
**Symptoms:** No real-time updates, tickets don't appear after purchase

**Solutions:**
1. Check socket connection logs: `✅ Socket connected`
2. Verify backend Socket.IO is running
3. Check for connection errors in console

**Test:**
- Look for: `🔌 Socket not connected, connecting...`
- Should see: `✅ Socket connected`
- Should see: `✅ Room joined`

#### Issue 4: Tickets Not Rendering
**Symptoms:** API returns tickets but UI shows empty

**Solutions:**
1. Check ticket structure has required fields:
   - id
   - ticket_number
   - grid (3x9 array)
   - numbers (array)
   - marked_numbers (array)

2. Check console for: `✅ First ticket:`
3. Verify FlatList is rendering

### Debug Steps

1. **Enable All Logs:**
   - Open game screen
   - Check React Native debugger console
   - Look for all 🎫 emoji logs

2. **Test API Directly:**
   ```bash
   # Get auth token from AsyncStorage
   # Then test API:
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8001/api/tickets/my-tickets/ROOM_ID
   ```

3. **Check Socket Events:**
   - Look for: `🎫 Ticket purchased:`
   - Look for: `ticket_updated`
   - Look for: `room_joined`

4. **Verify Room ID:**
   - Console should show: `🎮 Game screen mounted for room: ROOM_ID`
   - Verify this matches the actual room ID

### Manual Fix: Force Reload Tickets

In game screen, tap the ticket icon (top right), then tap "Reload Tickets" button.

### Backend Verification

1. **Check MongoDB:**
   ```python
   # In Python shell
   from motor.motor_asyncio import AsyncIOMotorClient
   client = AsyncIOMotorClient("your_mongo_url")
   db = client["tambola_db"]
   
   # Count tickets
   tickets = await db.tickets.find({}).to_list(100)
   print(f"Total tickets: {len(tickets)}")
   ```

2. **Check API Endpoint:**
   - Endpoint: `GET /api/tickets/my-tickets/{room_id}`
   - Should return: Array of ticket objects
   - Empty array if no tickets (not an error)

### Expected Flow

1. **User joins room:**
   - Socket emits `join_room`
   - Backend auto-generates 1 free ticket
   - Backend emits `ticket_purchased`
   - Frontend receives and displays ticket

2. **User buys tickets:**
   - API call to `/tickets/buy`
   - Backend creates tickets in DB
   - Backend emits `ticket_purchased` for each
   - Frontend receives and adds to state

3. **Game screen opens:**
   - API call to `/tickets/my-tickets/{room_id}`
   - Backend returns all user tickets
   - Frontend displays in UI

### Success Indicators

✅ Console shows: `✅ Processed tickets: 1` (or more)
✅ Console shows: `✅ Selected ticket: TICKET_ID`
✅ UI shows ticket grid with numbers
✅ Modal shows "My Tickets (1)" or more
✅ No "No tickets yet" message

### Still Not Working?

1. **Restart backend:**
   ```bash
   cd backend
   python server_multiplayer.py
   ```

2. **Clear app cache:**
   - Close app completely
   - Reopen and login again

3. **Check network:**
   - Verify phone/emulator can reach backend
   - Check firewall settings
   - Try localhost vs IP address

4. **Database reset (last resort):**
   ```python
   # WARNING: Deletes all data
   await db.tickets.delete_many({})
   await db.rooms.delete_many({})
   ```

### Contact Support

If still not working, provide:
1. Console logs (all 🎫 messages)
2. Backend logs
3. Output of `test_tickets.py`
4. Room ID and User ID
