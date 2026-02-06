# Tambola Multiplayer - Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. MongoDB running (local or cloud)
2. Backend server running on port 8000
3. Frontend app running on Expo
4. At least 2 devices/emulators for multiplayer testing

---

## 📋 Backend Testing

### 1. Start Backend Server

```bash
cd tambola/backend

# Install dependencies (first time only)
pip install -r requirements-multiplayer.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=tambola_multiplayer" >> .env
echo "SECRET_KEY=your-super-secret-key-at-least-32-characters-long" >> .env

# Run server
python server_multiplayer.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Socket.IO handlers registered
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Test API Endpoints

#### Test Authentication
```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "+919876543210",
    "password": "password123"
  }'

# Expected: {"access_token": "...", "token_type": "bearer", "user": {...}}

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save the access_token for next requests
```

#### Test Room Creation
```bash
# Create room (replace TOKEN with your access_token)
curl -X POST http://localhost:8000/api/rooms/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Test Game",
    "room_type": "public",
    "ticket_price": 10,
    "max_players": 50,
    "min_players": 2,
    "auto_start": true,
    "prizes": [
      {"prize_type": "early_five", "amount": 100, "enabled": true},
      {"prize_type": "top_line", "amount": 200, "enabled": true},
      {"prize_type": "full_house", "amount": 500, "enabled": true}
    ]
  }'

# Expected: Room object with id, room_code, etc.
```

#### Test Wallet
```bash
# Add money to wallet
curl -X POST http://localhost:8000/api/wallet/add-money \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "amount": 1000,
    "payment_method": "razorpay"
  }'

# Check balance
curl -X GET http://localhost:8000/api/wallet/balance \
  -H "Authorization: Bearer TOKEN"

# Get transactions
curl -X GET http://localhost:8000/api/wallet/transactions \
  -H "Authorization: Bearer TOKEN"
```

---

## 📱 Frontend Testing

### 1. Configure Frontend

Edit `tambola/frontend/services/api.ts`:
```typescript
// Find your computer's IP address
// Windows: ipconfig
// Mac/Linux: ifconfig

const API_URL = 'http://YOUR_IP:8000/api';  // e.g., http://192.168.1.100:8000/api
```

### 2. Start Frontend

```bash
cd tambola/frontend
yarn install
yarn start

# Press 'a' for Android or 'i' for iOS
```

### 3. Test User Flow

#### A. Authentication Flow
1. **Open app** → Should show landing page
2. **Tap "Sign Up"** → Fill form:
   - Name: Test User 1
   - Email: user1@test.com
   - Mobile: +919876543210
   - Password: password123
3. **Submit** → Should auto-login and show lobby
4. **Check wallet** → Should show ₹0

#### B. Create Room Flow
1. **Tap "Create Room"** button
2. **Fill room details**:
   - Name: "My First Game"
   - Type: Public
   - Ticket Price: ₹10
   - Max Players: 50
   - Min Players: 2
3. **Configure prizes**:
   - Early 5: ₹100
   - Top Line: ₹200
   - Full House: ₹500
4. **Tap "Create Room"**
5. **Should navigate to room waiting screen**

#### C. Join Room Flow (Second Device)
1. **Sign up as different user** (user2@test.com)
2. **Add money to wallet** (₹100)
3. **Go to lobby** → See the created room
4. **Tap on room** → Join
5. **Should see both players in room**

#### D. Game Play Flow
1. **Host starts game** (Device 1)
2. **Both devices should see "Game Started"**
3. **Host calls numbers** (auto or manual)
4. **Both devices should see numbers in real-time**
5. **Players mark tickets**
6. **Player claims prize** when condition met
7. **Server validates** → Winner announced
8. **Wallet credited** automatically

---

## 🧪 Test Scenarios

### Scenario 1: Full Game Flow (2 Players)

**Setup:**
- Device 1: Host (user1@test.com)
- Device 2: Player (user2@test.com)

**Steps:**
1. ✅ User1 creates room "Test Game"
2. ✅ User2 joins room
3. ✅ User1 starts game
4. ✅ User1 calls 5 numbers
5. ✅ User2 claims "Early 5" (if valid)
6. ✅ Verify winner announcement
7. ✅ Check User2 wallet increased
8. ✅ Continue game for other prizes
9. ✅ Complete Full House
10. ✅ Game ends

**Expected Results:**
- All numbers appear on both devices simultaneously
- Prize claims validated correctly
- Wallet updates in real-time
- No crashes or disconnections

### Scenario 2: Private Room with Password

**Steps:**
1. ✅ User1 creates private room with password "1234"
2. ✅ User2 tries to join without password → Should fail
3. ✅ User2 enters correct password → Should join
4. ✅ Play game normally

### Scenario 3: Insufficient Wallet Balance

**Steps:**
1. ✅ User with ₹0 balance tries to buy tickets
2. ✅ Should show error "Insufficient balance"
3. ✅ User adds money to wallet
4. ✅ Can now buy tickets

### Scenario 4: Invalid Prize Claim

**Steps:**
1. ✅ Player claims "Top Line" without completing it
2. ✅ Server validates → Should reject
3. ✅ Show error message
4. ✅ No wallet credit

### Scenario 5: Multiple Winners

**Steps:**
1. ✅ Configure prize with "multiple_winners: true"
2. ✅ Two players complete same prize
3. ✅ Both should win
4. ✅ Both wallets credited

### Scenario 6: Disconnection & Reconnection

**Steps:**
1. ✅ Start game with 2 players
2. ✅ Turn off WiFi on Device 2
3. ✅ Host continues calling numbers
4. ✅ Turn on WiFi on Device 2
5. ✅ Should reconnect and sync state
6. ✅ All called numbers should appear

---

## 🐛 Common Issues & Solutions

### Backend Issues

#### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution:**
```bash
pip install -r requirements-multiplayer.txt
```

#### Issue: "Connection refused to MongoDB"
**Solution:**
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or use MongoDB Atlas (cloud)
# Update MONGO_URL in .env
```

#### Issue: "Socket.IO not working"
**Solution:**
- Check CORS settings in server_multiplayer.py
- Verify Socket.IO client version matches server
- Check firewall settings

### Frontend Issues

#### Issue: "Network request failed"
**Solution:**
- Verify API_URL in services/api.ts
- Use computer's IP, not localhost
- Ensure backend is running
- Check if devices are on same network

#### Issue: "Socket connection failed"
**Solution:**
- Check Socket.IO URL in services/socket.ts
- Verify port 8000 is accessible
- Check firewall/antivirus settings

#### Issue: "Token expired"
**Solution:**
- Tokens expire after 7 days
- App should auto-refresh
- If not, logout and login again

---

## 📊 Performance Testing

### Load Testing (100 Players)

**Tools:**
- Apache JMeter
- Locust
- Artillery

**Test Script (Locust):**
```python
from locust import HttpUser, task, between

class TambolaUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/api/auth/login", json={
            "email": f"user{self.user_id}@test.com",
            "password": "password123"
        })
        self.token = response.json()["access_token"]
    
    @task
    def get_rooms(self):
        self.client.get("/api/rooms", headers={
            "Authorization": f"Bearer {self.token}"
        })
    
    @task
    def join_room(self):
        # Join random room
        pass
```

**Run:**
```bash
locust -f load_test.py --host=http://localhost:8000
```

**Metrics to Monitor:**
- Response time < 200ms
- Error rate < 1%
- Concurrent connections > 100
- Memory usage stable
- CPU usage < 80%

---

## ✅ Testing Checklist

### Backend API
- [ ] User signup with validation
- [ ] User login with correct credentials
- [ ] User login with wrong credentials (should fail)
- [ ] Get user profile
- [ ] Create public room
- [ ] Create private room with password
- [ ] List rooms with filters
- [ ] Join room
- [ ] Join full room (should fail)
- [ ] Join with wrong password (should fail)
- [ ] Buy tickets
- [ ] Buy tickets with insufficient balance (should fail)
- [ ] Get my tickets
- [ ] Add money to wallet
- [ ] Get wallet balance
- [ ] Get transaction history
- [ ] Start game (host only)
- [ ] Start game (non-host should fail)
- [ ] Call number (auto)
- [ ] Call number (manual)
- [ ] Claim valid prize
- [ ] Claim invalid prize (should fail)
- [ ] Get winners list

### Socket.IO Events
- [ ] Connect to server
- [ ] Authenticate with token
- [ ] Join room
- [ ] Receive player_joined event
- [ ] Leave room
- [ ] Receive player_left event
- [ ] Start game event
- [ ] Number called event
- [ ] Prize claimed event
- [ ] Chat message event
- [ ] Disconnect handling
- [ ] Reconnection handling

### Frontend UI
- [ ] Landing page displays correctly
- [ ] Signup form validation
- [ ] Login form validation
- [ ] Lobby shows rooms
- [ ] Filter rooms by type
- [ ] Create room form
- [ ] Prize configuration
- [ ] Room waiting screen
- [ ] Player list updates
- [ ] Game screen loads
- [ ] Tickets display correctly
- [ ] Numbers appear in real-time
- [ ] Ticket marking works
- [ ] Claim button enables/disables
- [ ] Winner announcement shows
- [ ] Wallet balance updates
- [ ] Navigation works
- [ ] Back button handling
- [ ] Loading states
- [ ] Error messages

### Integration
- [ ] End-to-end game flow
- [ ] Multiple players simultaneously
- [ ] Network disconnection recovery
- [ ] Concurrent games
- [ ] Prize validation accuracy
- [ ] Wallet transaction consistency
- [ ] Real-time synchronization
- [ ] No race conditions
- [ ] No memory leaks
- [ ] No crashes

---

## 📈 Success Criteria

### Functional
✅ Users can signup/login
✅ Users can create/join rooms
✅ Users can buy tickets
✅ Game plays in real-time
✅ Prizes validated correctly
✅ Wallet transactions accurate
✅ No data loss

### Performance
✅ API response < 200ms
✅ Socket latency < 100ms
✅ Supports 100+ concurrent users
✅ No memory leaks
✅ Stable for 24+ hours

### User Experience
✅ Intuitive UI
✅ Smooth animations
✅ Clear error messages
✅ Fast loading
✅ Responsive design

---

## 🎯 Next Steps After Testing

1. **Fix Bugs** - Address any issues found
2. **Optimize Performance** - Improve slow endpoints
3. **Add Features** - Wallet UI, profile, etc.
4. **Security Audit** - Check for vulnerabilities
5. **Deploy** - Production deployment
6. **Monitor** - Set up logging and analytics

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error logs (backend console)
3. Check network tab (frontend)
4. Verify environment variables
5. Restart servers

Happy Testing! 🎉
