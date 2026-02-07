# 🚀 Render Deployment Guide

## Current Status

Your backend is deployed on Render at:
**https://tambola-jqjo.onrender.com**

## What I Fixed for Render

### 1. Server Configuration ✅
- Updated to use `PORT` environment variable from Render
- Disabled auto-reload for production
- Proper ASGI app export for uvicorn

### 2. Created Deployment Files ✅
- `render.yaml` - Render service configuration
- `start.sh` - Startup script
- Updated `server_multiplayer.py` for production

### 3. Enhanced Error Handling ✅
- Better ticket API error handling
- Returns empty array instead of 500 errors
- Validates room exists before querying tickets
- Skips malformed tickets gracefully

## Deploy to Render

### Option 1: Auto-Deploy (Recommended)
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix ticket sync and Render deployment"
   git push origin main
   ```

2. **Render will auto-deploy** (if connected to GitHub)
   - Check Render dashboard for deployment status
   - Wait for "Live" status

### Option 2: Manual Deploy
1. Go to Render dashboard
2. Click your service "tambola-backend"
3. Click "Manual Deploy" → "Deploy latest commit"

## Render Configuration

### Build Command:
```bash
pip install -r requirements-multiplayer.txt
```

### Start Command:
```bash
uvicorn server_multiplayer:socket_app --host 0.0.0.0 --port $PORT
```

Or use the start script:
```bash
bash start.sh
```

### Environment Variables:
Make sure these are set in Render dashboard:

1. **MONGO_URL** - Your MongoDB connection string
2. **DB_NAME** - Database name (e.g., `tambola_db`)
3. **JWT_SECRET** - Secret key for JWT tokens
4. **PORT** - Auto-set by Render (don't add manually)

## Verify Deployment

### 1. Check Render Logs
In Render dashboard:
- Go to your service
- Click "Logs" tab
- Look for:
  ```
  INFO: Uvicorn running on http://0.0.0.0:XXXX
  INFO: Socket.IO handlers registered
  INFO: Application startup complete
  ```

### 2. Test API Endpoint
```bash
curl https://tambola-jqjo.onrender.com/api/rooms
```
Should return: `{"detail":"Not authenticated"}` (this is good!)

### 3. Test Socket.IO
Open browser console on your app and check for:
```
✅ Socket connected
✅ Room joined
```

## Fix Database on Render

If tickets still have wrong structure on production database:

### Option 1: Run Fix Script Locally
```bash
# Connect to production MongoDB
cd backend
# Update .env to use production MONGO_URL
python fix_ticket_structure.py
```

### Option 2: Add to Start Script
Uncomment this line in `start.sh`:
```bash
python fix_ticket_structure.py
```

Then redeploy. The fix will run on startup.

## Frontend Configuration

Your frontend is already configured correctly:
```
EXPO_PUBLIC_BACKEND_URL=https://tambola-jqjo.onrender.com
```

## Troubleshooting

### Issue: "Internal Server Error"
**Cause:** Backend not deployed or crashed
**Fix:**
1. Check Render logs for errors
2. Verify environment variables are set
3. Redeploy

### Issue: "Socket not connected"
**Cause:** Socket.IO not working
**Fix:**
1. Verify CORS is set to `*`
2. Check Socket.IO is initialized
3. Ensure `socket_app` is exported

### Issue: "No tickets showing"
**Cause:** Database has old ticket structure
**Fix:**
1. Run `fix_ticket_structure.py` on production DB
2. Or add to start script

### Issue: "Authentication failed"
**Cause:** JWT_SECRET not set or wrong
**Fix:**
1. Set JWT_SECRET in Render environment variables
2. Redeploy

## Post-Deployment Checklist

- [ ] Backend deployed successfully on Render
- [ ] Logs show "Application startup complete"
- [ ] API endpoint responds (even with auth error)
- [ ] Socket.IO initialized
- [ ] Environment variables set
- [ ] Database tickets fixed (run fix script)
- [ ] Frontend connects to Render URL
- [ ] Tickets load in app
- [ ] Socket events work (join room, etc.)

## Quick Deploy Commands

```bash
# 1. Commit changes
git add .
git commit -m "Fix ticket sync for Render"

# 2. Push to GitHub
git push origin main

# 3. Wait for Render to deploy (check dashboard)

# 4. Test
curl https://tambola-jqjo.onrender.com/api/rooms
```

## Files Created/Modified

### New Files:
- `backend/render.yaml` - Render configuration
- `backend/start.sh` - Startup script
- `RENDER_DEPLOYMENT.md` - This guide

### Modified Files:
- `backend/server_multiplayer.py` - Production config, better error handling
- `backend/socket_handlers.py` - Ticket purchase events
- `frontend/app/room/game/[id].tsx` - Enhanced ticket loading

## Next Steps

1. **Deploy to Render** (push to GitHub)
2. **Wait for deployment** (check Render dashboard)
3. **Fix production database** (run fix_ticket_structure.py)
4. **Test in app** (reload and check tickets)

## Support

If deployment fails:
1. Check Render logs
2. Verify all environment variables
3. Test API endpoint manually
4. Check MongoDB connection

---

**Your backend is ready for Render!** Just push to GitHub and it will auto-deploy. 🚀
