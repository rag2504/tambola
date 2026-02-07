#!/bin/bash
# Start script for Render deployment

echo "Starting Tambola Backend Server..."
echo "PORT: $PORT"
echo "Environment: Production"

# Run database migrations/fixes if needed
# python fix_ticket_structure.py

# Start the server
uvicorn server_multiplayer:socket_app --host 0.0.0.0 --port ${PORT:-8001} --workers 1
