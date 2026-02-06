# 🎲 Tambola Multiplayer Game

A complete online multiplayer Tambola (Housie/Bingo) game with real-time gameplay, wallet system, and beautiful UI.

## ✨ Features

### 🎮 Core Gameplay
- **Real-time Multiplayer** - Play with friends or join public rooms
- **Live Number Calling** - Auto or manual number calling with instant updates
- **Multiple Prize Types** - Early 5, Top/Middle/Bottom Line, Four Corners, Full House
- **Server-side Validation** - Prevent cheating with backend prize verification
- **Beautiful UI** - Modern design with gradients and smooth animations

### 👥 User Management
- **Authentication** - Secure signup/login with JWT tokens
- **User Profiles** - Track games played, wins, and total winnings
- **Wallet System** - Add money, buy tickets, win prizes
- **Transaction History** - Complete record of all transactions

### 🏠 Room Features
- **Public & Private Rooms** - Create open rooms or password-protected games
- **Flexible Configuration** - Set ticket price, player limits, prize amounts
- **Host Controls** - Start game, call numbers, manage room
- **Real-time Updates** - See players join/leave instantly

### 🎫 Ticket System
- **Standard Tambola Rules** - 3x9 grid with 15 numbers
- **Multiple Tickets** - Buy up to 10 tickets per game
- **Auto-generation** - Proper column distribution and validation
- **Share Tickets** - Share via WhatsApp or any app

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- Android/iOS device or emulator

### Installation

```bash
# Backend
cd backend
pip install -r requirements-multiplayer.txt
python server_multiplayer.py

# Frontend
cd frontend
yarn install
yarn start
```

**See [QUICK_START.md](./QUICK_START.md) for detailed instructions.**

## 📊 Project Status

**Overall: 85% Complete**

- ✅ Backend API (100%)
- ✅ Real-time gameplay (100%)
- ✅ Authentication (100%)
- ✅ Core UI screens (80%)
- ⏳ Wallet UI (pending)
- ⏳ Payment gateway (pending)

## 📁 Project Structure

```
tambola/
├── backend/              # FastAPI + Socket.IO server
│   ├── models.py         # Database models
│   ├── auth.py           # JWT authentication
│   ├── server_multiplayer.py  # Main server
│   └── socket_handlers.py     # Real-time events
│
├── frontend/             # React Native + Expo app
│   ├── app/              # Screens
│   ├── services/         # API & Socket.IO clients
│   └── contexts/         # State management
│
└── docs/                 # Documentation
    ├── QUICK_START.md
    ├── API_QUICK_REFERENCE.md
    ├── TESTING_GUIDE.md
    └── ARCHITECTURE.md
```

## 🎯 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database with Motor (async driver)
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **TypeScript** - Type-safe JavaScript
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete overview
- **[BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md)** - Backend documentation
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - API endpoints
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[MULTIPLAYER_PROGRESS.md](./MULTIPLAYER_PROGRESS.md)** - Progress tracking

## 🎮 How to Play

1. **Sign Up** - Create your account
2. **Add Money** - Load your wallet
3. **Join/Create Room** - Find a game or host your own
4. **Buy Tickets** - Purchase 1-10 tickets
5. **Play** - Mark numbers as they're called
6. **Claim Prizes** - Win Early 5, Lines, or Full House
7. **Get Paid** - Winnings credited to wallet instantly

## 🔧 Configuration

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="tambola_multiplayer"
SECRET_KEY="your-secret-key-min-32-chars"
```

### Frontend (services/api.ts)
```typescript
const API_URL = 'http://YOUR_IP:8000/api';
```

## 🧪 Testing

```bash
# Test backend
cd backend
python server_multiplayer.py

# Test API
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","mobile":"+919999999999","password":"test123"}'

# Test frontend
cd frontend
yarn start
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms/create` - Create room
- `POST /api/rooms/{id}/join` - Join room

### Tickets
- `POST /api/tickets/buy` - Purchase tickets
- `GET /api/tickets/my-tickets/{roomId}` - Get tickets

### Wallet
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/add-money` - Add money
- `GET /api/wallet/transactions` - Get history

### Game
- `POST /api/game/{roomId}/start` - Start game
- `POST /api/game/{roomId}/call-number` - Call number
- `POST /api/game/{roomId}/claim` - Claim prize

See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for details.

## 🔌 Socket.IO Events

### Client → Server
- `authenticate` - Authenticate connection
- `join_room` - Join game room
- `call_number` - Call number (host)
- `claim_prize` - Claim prize
- `chat_message` - Send message

### Server → Client
- `game_started` - Game started
- `number_called` - Number called
- `prize_won` - Prize won
- `player_joined` - Player joined
- `player_left` - Player left

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Authentication system
- [x] Room management
- [x] Ticket system
- [x] Live gameplay
- [x] Prize validation
- [x] Wallet backend

### Phase 2: UI & Payments ⏳
- [ ] Wallet UI screens
- [ ] Profile screen
- [ ] Razorpay integration
- [ ] Transaction history UI

### Phase 3: Polish 📅
- [ ] Push notifications
- [ ] Chat UI
- [ ] Leaderboard
- [ ] Game history
- [ ] Sound effects

### Phase 4: Production 📅
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Load testing
- [ ] Deployment

## 🐛 Known Issues

- Wallet UI not built yet (backend ready)
- Payment gateway not integrated (Razorpay ready)
- No rate limiting (add in production)

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🎉 Credits

Built with ❤️ using:
- FastAPI
- React Native
- Socket.IO
- MongoDB
- Expo

---

## 🚀 Get Started Now!

```bash
# 1. Start backend
cd backend && python server_multiplayer.py

# 2. Start frontend
cd frontend && yarn start

# 3. Play!
```

**See [QUICK_START.md](./QUICK_START.md) for detailed setup.**

---

**Status**: 85% Complete | **Version**: 1.0.0 | **Last Updated**: Feb 6, 2026
