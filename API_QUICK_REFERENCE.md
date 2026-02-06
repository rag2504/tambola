# Tambola API Quick Reference

## 🔗 Base URL
```
http://localhost:8000/api
```

## 🔑 Authentication
All protected routes require:
```
Authorization: Bearer {access_token}
```

---

## 📋 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login user |
| GET | `/auth/profile` | ✅ | Get current user |

### 🏠 Rooms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/rooms` | ✅ | List all rooms |
| POST | `/rooms/create` | ✅ | Create new room |
| GET | `/rooms/{id}` | ✅ | Get room details |
| POST | `/rooms/{id}/join` | ✅ | Join room |

### 🎫 Tickets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/tickets/buy` | ✅ | Purchase tickets |
| GET | `/tickets/my-tickets/{roomId}` | ✅ | Get my tickets |

### 💰 Wallet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wallet/balance` | ✅ | Get balance |
| POST | `/wallet/add-money` | ✅ | Add money |
| GET | `/wallet/transactions` | ✅ | Get history |

### 🎮 Game Control

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/game/{roomId}/start` | ✅ | Start game (host) |
| POST | `/game/{roomId}/call-number` | ✅ | Call number (host) |
| POST | `/game/{roomId}/claim` | ✅ | Claim prize |
| GET | `/game/{roomId}/winners` | ✅ | Get winners |

---

## 🔌 Socket.IO Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `authenticate` | `{user_id}` | Authenticate connection |
| `join_room` | `{room_id}` | Join game room |
| `leave_room` | `{room_id}` | Leave room |
| `call_number` | `{room_id, number?}` | Call number |
| `claim_prize` | `{room_id, ticket_id, prize_type}` | Claim prize |
| `chat_message` | `{room_id, message}` | Send message |
| `start_game` | `{room_id}` | Start game |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `connected` | `{sid}` | Connection established |
| `authenticated` | `{success}` | Auth successful |
| `room_joined` | `{room, user_id}` | Joined room |
| `player_joined` | `{user_id, room_id}` | Player joined |
| `player_left` | `{user_id, room_id}` | Player left |
| `game_started` | `{room_id, started_at}` | Game started |
| `number_called` | `{number, called_numbers, remaining}` | Number called |
| `prize_claimed` | `{user_id, ticket_id, prize_type}` | Prize claimed |
| `prize_won` | `{winner, room_id}` | Prize validated |
| `chat_message` | `{user_id, user_name, message, timestamp}` | New message |
| `error` | `{message}` | Error occurred |

---

## 📝 Request/Response Examples

### Signup
```json
POST /api/auth/signup

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+919876543210",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "+919876543210",
    "wallet_balance": 0.0,
    "total_games": 0,
    "total_wins": 0,
    "total_winnings": 0.0
  }
}
```

### Create Room
```json
POST /api/rooms/create
Authorization: Bearer {token}

Request:
{
  "name": "Friday Night Game",
  "room_type": "public",
  "ticket_price": 10,
  "max_players": 50,
  "min_players": 2,
  "auto_start": true,
  "prizes": [
    {
      "prize_type": "early_five",
      "amount": 100,
      "enabled": true
    },
    {
      "prize_type": "full_house",
      "amount": 500,
      "enabled": true
    }
  ]
}

Response:
{
  "id": "room-uuid",
  "room_code": "ABC12345",
  "name": "Friday Night Game",
  "host_id": "user-uuid",
  "host_name": "John Doe",
  "status": "waiting",
  "current_players": 0,
  ...
}
```

### Buy Tickets
```json
POST /api/tickets/buy
Authorization: Bearer {token}

Request:
{
  "room_id": "room-uuid",
  "quantity": 3
}

Response:
{
  "message": "Successfully purchased 3 ticket(s)",
  "data": {
    "tickets": [
      {
        "id": "ticket-uuid",
        "ticket_number": 1,
        "grid": [[null, 11, null, 34, 45, null, null, 79, 80], ...],
        "numbers": [11, 13, 14, 29, 30, 34, 36, 44, 45, 59, 76, 78, 79, 80, 88]
      }
    ],
    "new_balance": 970.0
  }
}
```

### Call Number
```json
POST /api/game/{roomId}/call-number
Authorization: Bearer {token}

Request:
{
  "room_id": "room-uuid",
  "number": null  // null = auto-generate
}

Response:
{
  "message": "Number 42 called",
  "data": {
    "number": 42,
    "remaining": 89
  }
}
```

### Claim Prize
```json
POST /api/game/{roomId}/claim
Authorization: Bearer {token}

Request:
{
  "room_id": "room-uuid",
  "ticket_id": "ticket-uuid",
  "prize_type": "top_line"
}

Response (Success):
{
  "message": "Congratulations! You won top_line",
  "data": {
    "winner": {
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "prize_type": "top_line",
      "amount": 200.0,
      "verified": true
    },
    "new_balance": 1200.0
  }
}

Response (Invalid):
{
  "detail": "Invalid claim - winning condition not met"
}
```

---

## 🎯 Prize Types

| Type | Value | Description |
|------|-------|-------------|
| Early Five | `early_five` | First 5 numbers |
| Top Line | `top_line` | All numbers in row 1 |
| Middle Line | `middle_line` | All numbers in row 2 |
| Bottom Line | `bottom_line` | All numbers in row 3 |
| Four Corners | `four_corners` | All 4 corner numbers |
| Full House | `full_house` | All 15 numbers |

---

## 🔄 Room Status

| Status | Description |
|--------|-------------|
| `waiting` | Waiting for players |
| `starting` | Game about to start |
| `active` | Game in progress |
| `completed` | Game finished |
| `cancelled` | Game cancelled |

---

## 🏷️ Room Types

| Type | Description |
|------|-------------|
| `public` | Anyone can join |
| `private` | Password required |

---

## 💳 Transaction Types

| Type | Description |
|------|-------------|
| `credit` | Money added |
| `debit` | Money deducted |

---

## ⚠️ Error Responses

```json
{
  "detail": "Error message here"
}
```

### Common Errors

| Status | Error | Reason |
|--------|-------|--------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not allowed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

---

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","mobile":"+919999999999","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Get Rooms
```bash
curl -X GET http://localhost:8000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Room
```bash
curl -X POST http://localhost:8000/api/rooms/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Game","room_type":"public","ticket_price":10,"max_players":50,"min_players":2,"auto_start":true,"prizes":[{"prize_type":"full_house","amount":500,"enabled":true}]}'
```

---

## 📱 Frontend Integration

### Axios Setup
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://YOUR_IP:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Socket.IO Setup
```typescript
import io from 'socket.io-client';

const socket = io('http://YOUR_IP:8000', {
  transports: ['websocket'],
  autoConnect: false
});

// Connect
socket.connect();

// Authenticate
socket.emit('authenticate', { user_id: userId });

// Listen for events
socket.on('number_called', (data) => {
  console.log('Number called:', data.number);
});
```

---

## 🎯 Quick Start Checklist

- [ ] MongoDB running
- [ ] Backend server running (port 8000)
- [ ] .env file configured
- [ ] Test signup endpoint
- [ ] Test login endpoint
- [ ] Test create room
- [ ] Test Socket.IO connection
- [ ] Frontend API_URL configured
- [ ] Frontend can signup/login
- [ ] Frontend can create/join rooms
- [ ] Real-time events working

---

**Happy Coding! 🚀**
