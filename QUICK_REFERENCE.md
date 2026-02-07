# Tambola Game - Quick Reference Card

## 🎯 Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ Ticket Generation | FIXED | Tickets auto-generate when game starts |
| ✅ Auto-Mark Numbers | FIXED | Numbers automatically marked on tickets |
| ✅ Game Completion | FIXED | Auto-ends at 90 numbers with rankings |
| ✅ Sound Toggle | NEW | Mute/unmute number announcements |
| ✅ Pause Game | NEW | Pause/resume gameplay |
| ✅ Winner Rankings | NEW | Automatic ranking calculation |

## 🎮 Controls

### Host Controls
| Button | Action | Shortcut |
|--------|--------|----------|
| 🎯 Call Number | Call next random number | Manual |
| ▶️ Auto Mode | Auto-call every 5 seconds | Auto |
| ⏸️ Pause | Pause the game | Host only |
| ▶️ Resume | Resume the game | Host only |
| 🏁 End Game | End and show rankings | Host only |
| 🔊 Sound | Toggle announcements | All |

### Player Controls
| Button | Action | Available |
|--------|--------|-----------|
| 🎫 View Tickets | See all your tickets | Always |
| ✋ Manual Mark | Tap to mark/unmark | Always |
| 🏆 Claim Prize | Claim completed pattern | When ready |
| 🔊 Sound | Toggle announcements | Always |

## 📊 Game States

```
WAITING → ACTIVE → PAUSED → ACTIVE → COMPLETED
   ↓         ↓        ↓        ↓         ↓
 Join    Numbers   Pause   Resume    Winners
Tickets   Called   Game    Game      Modal
```

## 🎨 Visual Indicators

### Number Board
| Color | Meaning |
|-------|---------|
| ⚪ White | Not called |
| 🔵 Cyan | Called |
| 🟠 Orange | Current (just called) |

### Ticket Grid
| Color | Meaning |
|-------|---------|
| 🟡 Yellow | Number not marked |
| 🔵 Cyan | Number marked |
| 🟠 Orange | Current number |
| ⚪ Empty | No number in cell |

### Status Badges
| Badge | Meaning |
|-------|---------|
| ⏸️ PAUSED | Game is paused |
| ▶️ ACTIVE | Game is running |
| 🏁 ENDED | Game completed |

## 🏆 Prize Types (in order)

1. **Early Five** 🥇 - First 5 numbers marked
2. **Top Line** 🥈 - Complete top row
3. **Middle Line** 🥉 - Complete middle row
4. **Bottom Line** 🏅 - Complete bottom row
5. **Four Corners** 🎯 - All 4 corner numbers
6. **Full House** 👑 - All numbers on ticket

## 🔊 Sound Features

| State | Icon | Behavior |
|-------|------|----------|
| ON | 🔊 | Numbers announced via TTS |
| OFF | 🔇 | Silent mode |

## ⏸️ Pause Behavior

| Action | Effect |
|--------|--------|
| Pause | • Auto-calling stops<br>• Manual calling disabled<br>• "PAUSED" badge shown |
| Resume | • Controls re-enabled<br>• Badge hidden<br>• Game continues |

## 🎯 Socket Events

### Client → Server
```
authenticate(user_id)
join_room(room_id)
start_game(room_id)          [HOST]
call_number(room_id)         [HOST]
pause_game(room_id)          [HOST]
end_game(room_id)            [HOST]
claim_prize(room_id, ticket_id, prize_type)
```

### Server → Client
```
game_started(tickets)        ⭐ NEW
number_called(number, game_complete)
game_paused(is_paused)       ⭐ NEW
game_ended(winners)          ⭐ NEW
prize_won(winner)
```

## 📱 UI Layout

```
┌─────────────────────────────────────┐
│ ← ROOM NAME          🔊 42/90 🎫   │ Header
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐             │
│         │ Current: 42 │             │ Current Number
│         └─────────────┘             │
│         [⏸️ PAUSED]                 │ (if paused)
│                                     │
├─────────────────────────────────────┤
│  [🎯 Call]  [▶️ Auto]               │ Host Controls
│  [⏸️ Pause]  [🏁 End]               │
├─────────────────────────────────────┤
│  Called Numbers Board               │ Number Grid
│  [1][2][3][4][5][6][7][8][9][10]   │
│  ...                                │
├─────────────────────────────────────┤
│  My Ticket #0001        [🏆 Claim]  │ Ticket
│  ┌────┬────┬────┬────┬────┐        │
│  │ 12 │    │ 25 │    │ 42 │        │
│  ├────┼────┼────┼────┼────┤        │
│  │    │ 33 │    │ 56 │    │        │
│  ├────┼────┼────┼────┼────┤        │
│  │ 5  │    │ 61 │    │ 89 │        │
│  └────┴────┴────┴────┴────┘        │
└─────────────────────────────────────┘
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Tickets not showing | Ensure purchased before game start |
| Numbers not marking | Check socket connection |
| Can't call numbers | Check if paused or not host |
| Sound not working | Check device volume & toggle |
| Game won't start | Verify min players & tickets |

## 📝 Quick Commands

### Start a Game
```
1. Create room
2. Wait for players
3. Players buy tickets
4. Click "Start Game"
5. Tickets appear automatically
```

### Call Numbers
```
Manual: Click "Call Number"
Auto: Click "Auto Mode" (5s interval)
```

### Pause Game
```
Click "Pause" → Game pauses
Click "Resume" → Game continues
```

### End Game
```
Automatic: At 90 numbers
Manual: Click "End Game"
Result: Winners modal with rankings
```

## 🎲 Game Statistics

| Metric | Location |
|--------|----------|
| Numbers Called | Header (42/90) |
| Current Number | Big circle display |
| Tickets Owned | Ticket modal |
| Marked Numbers | Ticket grid (cyan) |
| Prize Status | Claim modal |

## 🔐 Permissions

| Action | Host | Player |
|--------|------|--------|
| Start Game | ✅ | ❌ |
| Call Number | ✅ | ❌ |
| Pause/Resume | ✅ | ❌ |
| End Game | ✅ | ❌ |
| View Tickets | ✅ | ✅ |
| Claim Prize | ✅ | ✅ |
| Toggle Sound | ✅ | ✅ |

## 💡 Pro Tips

### For Hosts
- ✅ Use auto-mode for smooth gameplay
- ✅ Pause if you need a break
- ✅ End manually if time runs out
- ✅ Share room code for private games

### For Players
- ✅ Buy tickets before game starts
- ✅ Keep sound on to hear numbers
- ✅ Claim prizes quickly (first wins)
- ✅ Watch for auto-marked numbers

## 🚀 Performance

| Metric | Value |
|--------|-------|
| Socket Latency | < 100ms |
| Auto-mark Speed | Instant |
| TTS Delay | < 500ms |
| UI Update | Real-time |

## 📦 Dependencies

### Backend
- FastAPI
- Socket.IO
- MongoDB
- Python 3.8+

### Frontend
- React Native
- Expo
- Socket.IO Client
- Expo Speech

## 🔄 Update Cycle

```
Number Called → Socket Broadcast → Auto-mark → UI Update
     ↓              ↓                  ↓           ↓
  < 50ms         < 100ms           Instant    < 50ms
```

## 📞 Support

| Issue Type | Action |
|------------|--------|
| Bug | Check console logs |
| Feature | Read documentation |
| Help | See GAME_START_GUIDE.md |
| Technical | See CHANGES_SUMMARY.md |

---

## 🎉 Quick Start (30 seconds)

```bash
# Terminal 1: Backend
cd backend
python server_multiplayer.py

# Terminal 2: Frontend
cd frontend
npm start

# Browser/App
1. Sign up
2. Create room
3. Buy tickets
4. Start game
5. Play!
```

---

**Everything you need on one page! 📄**
