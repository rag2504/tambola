# Backend Multiplayer Setup Guide

## ✅ What's Been Created

### New Files:
1. **models.py** - All Pydantic models for multiplayer
2. **auth.py** - JWT authentication & password hashing
3. **server_multiplayer.py** - Enhanced FastAPI server with multiplayer routes
4. **socket_handlers.py** - Socket.IO real-time event handlers
5. **requirements-multiplayer.txt** - Additional dependencies

### Features Implemented:

#### 1. Authentication System ✅
- User signup (name, email, mobile, password)
- User login with JWT tokens
- Password hashing with bcrypt
- Token-based authentication
- User profile management

#### 2. Room System ✅
- Create public/private rooms
- Join rooms with password protection
- Room listing with filters
- Real-time player tracking
- Host controls

#### 3. Real-time Communication ✅
- Socket.IO integration
- Room-based broadcasting
- Player join/leave events
- Number calling events
- Prize claim events
- Chat messages

#### 4. Database Models ✅
- Users (with wallet, stats)
- Rooms (with players, status)
- Tickets (with grid, numbers)
- Transactions (wallet history)
- Winners (prize claims)
- Chat messages

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
cd tambola/backend
pip install -r requirements-multiplayer.txt
```

### 2. Environment Variables
Create/update `.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=tambola_multiplayer
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
```

### 3. Run Server
```bash
# Development
python server_multiplayer.py

# Or with uvicorn
uvicorn server_multiplayer:socket_app --reload --host 0.0.0.0 --port 8000
```

Server will run on: `http://localhost:8000`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/signup       - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/profile      - Get current user profile
```

### Rooms
```
GET    /api/rooms             - List available rooms
POST   /api/rooms/create      - Create new room
GET    /api/rooms/{id}        - Get room details
POST   /api/rooms/{id}/join   - Join a room
```

### Tickets (To be added)
```
POST   /api/tickets/buy       - Purchase tickets
GET    /api/tickets/my-tickets/{roomId} - Get user's tickets
```

### Wallet (To be added)
```
GET    /api/wallet/balance    - Get wallet balance
POST   /api/wallet/add-money  - Add money to wallet
GET    /api/wallet/transactions - Get transaction history
```

### Game (To be added)
```
POST   /api/game/{roomId}/start - Start game
POST   /api/game/{roomId}/call  - Call number
POST   /api/game/{roomId}/claim - Claim prize
```

## 🔌 Socket.IO Events

### Client → Server
```javascript
socket.emit('authenticate', { user_id: 'xxx' })
socket.emit('join_room', { room_id: 'xxx' })
socket.emit('leave_room', { room_id: 'xxx' })
socket.emit('call_number', { room_id: 'xxx', number: 42 })
socket.emit('claim_prize', { room_id: 'xxx', ticket_id: 'xxx', prize_type: 'full_house' })
socket.emit('chat_message', { room_id: 'xxx', message: 'Hello!' })
socket.emit('start_game', { room_id: 'xxx' })
```

### Server → Client
```javascript
socket.on('connected', (data) => {})
socket.on('authenticated', (data) => {})
socket.on('room_joined', (data) => {})
socket.on('player_joined', (data) => {})
socket.on('player_left', (data) => {})
socket.on('game_started', (data) => {})
socket.on('number_called', (data) => {})
socket.on('prize_claimed', (data) => {})
socket.on('chat_message', (data) => {})
socket.on('error', (data) => {})
```

## 🧪 Testing

### Test Authentication
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

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Room Creation
```bash
curl -X POST http://localhost:8000/api/rooms/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Room",
    "room_type": "public",
    "ticket_price": 10,
    "max_players": 50,
    "min_players": 2,
    "auto_start": true,
    "prizes": [
      {
        "prize_type": "full_house",
        "amount": 1000,
        "enabled": true
      }
    ]
  }'
```

## 📊 Database Collections

### users
```javascript
{
  id: "uuid",
  name: "John Doe",
  email: "john@example.com",
  mobile: "+919876543210",
  password_hash: "bcrypt_hash",
  profile_pic: "url",
  wallet_balance: 100.0,
  total_games: 10,
  total_wins: 3,
  total_winnings: 500.0,
  is_active: true,
  is_banned: false,
  created_at: "2024-01-01T00:00:00",
  last_login: "2024-01-01T00:00:00"
}
```

### rooms
```javascript
{
  id: "uuid",
  room_code: "ABC123",
  name: "Fun Room",
  host_id: "user_id",
  host_name: "John Doe",
  room_type: "public",
  ticket_price: 10.0,
  max_players: 50,
  current_players: 5,
  status: "waiting",
  players: [{id, name, joined_at}],
  tickets_sold: 10,
  prize_pool: 100.0,
  called_numbers: [1, 5, 23, 45],
  current_number: 45,
  winners: [],
  created_at: "2024-01-01T00:00:00"
}
```

## 🔐 Security Features

1. **Password Hashing** - Bcrypt with salt
2. **JWT Tokens** - 7-day expiry
3. **Bearer Authentication** - All protected routes
4. **Input Validation** - Pydantic models
5. **CORS** - Configured for frontend
6. **Rate Limiting** - (To be added)
7. **Anti-Cheat** - Server-side validation

## 🎯 Next Steps

### Backend (Remaining):
- [ ] Wallet routes (add money, transactions)
- [ ] Ticket purchase routes
- [ ] Game control routes (start, call, claim)
- [ ] Winner verification logic
- [ ] Leaderboard routes
- [ ] Admin dashboard routes
- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] Rate limiting
- [ ] Redis caching

### Frontend (To be built):
- [ ] Authentication screens
- [ ] Socket.IO client integration
- [ ] Room lobby
- [ ] Live gameplay with real-time updates
- [ ] Wallet UI
- [ ] Chat system
- [ ] Notifications

## 📝 Notes

- Server uses FastAPI (Python) instead of Node.js
- Socket.IO works with both Python and JavaScript clients
- MongoDB for database (same as original)
- JWT for authentication
- Real-time updates via Socket.IO
- Ticket generation algorithm preserved from original

## 🐛 Troubleshooting

### Socket.IO Connection Issues
- Make sure server is running on correct port
- Check CORS settings
- Verify client is using correct URL

### Authentication Errors
- Check JWT secret key in .env
- Verify token is being sent in Authorization header
- Check token expiry

### Database Errors
- Verify MongoDB is running
- Check connection string in .env
- Ensure database name is correct

---

**Ready to continue with frontend multiplayer features!**
