"""
Quick script to manually add a test ticket to a room
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path
import uuid
from datetime import datetime
import sys

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import ticket generation
from server_multiplayer import generate_tambola_ticket

async def add_test_ticket(room_id: str, user_id: str):
    """Add a test ticket to a room for a user"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("ADD TEST TICKET")
    print("=" * 60)
    
    # Verify room exists
    room = await db.rooms.find_one({"id": room_id})
    if not room:
        print(f"❌ Room not found: {room_id}")
        client.close()
        return
    
    print(f"✅ Room found: {room.get('name')}")
    
    # Verify user exists
    user = await db.users.find_one({"id": user_id})
    if not user:
        print(f"❌ User not found: {user_id}")
        client.close()
        return
    
    print(f"✅ User found: {user.get('name')}")
    
    # Check existing tickets
    existing_tickets = await db.tickets.find({
        "room_id": room_id,
        "user_id": user_id
    }).to_list(100)
    
    print(f"📊 User already has {len(existing_tickets)} tickets in this room")
    
    # Generate ticket
    ticket_count = await db.tickets.count_documents({"room_id": room_id})
    ticket_number = ticket_count + 1
    ticket_data = generate_tambola_ticket(ticket_number)
    
    ticket_id = str(uuid.uuid4())
    new_ticket = {
        "id": ticket_id,
        "room_id": room_id,
        "user_id": user_id,
        "ticket_number": ticket_number,
        "grid": ticket_data["grid"],
        "numbers": ticket_data["numbers"],
        "marked_numbers": [],
        "created_at": datetime.utcnow()
    }
    
    # Insert ticket
    await db.tickets.insert_one(new_ticket)
    
    print(f"\n✅ Ticket created successfully!")
    print(f"   Ticket ID: {ticket_id}")
    print(f"   Ticket Number: {ticket_number}")
    print(f"   Numbers: {len(ticket_data['numbers'])} numbers")
    print(f"   Grid: 3x9")
    
    # Show grid
    print(f"\n📋 Ticket Grid:")
    for row_idx, row in enumerate(ticket_data["grid"]):
        row_str = " | ".join([f"{n:2d}" if n else "  " for n in row])
        print(f"   Row {row_idx + 1}: {row_str}")
    
    print("\n" + "=" * 60)
    print("TICKET ADDED SUCCESSFULLY")
    print("=" * 60)
    
    client.close()

async def list_rooms_and_users():
    """List available rooms and users"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("\n📦 Available Rooms:")
    rooms = await db.rooms.find({}).to_list(10)
    for room in rooms:
        print(f"   - {room.get('name')} (ID: {room.get('id')})")
    
    print("\n👥 Available Users:")
    users = await db.users.find({}).to_list(10)
    for user in users:
        print(f"   - {user.get('name')} (ID: {user.get('id')})")
    
    client.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_test_ticket.py <room_id> <user_id>")
        print("\nOr run without arguments to list available rooms and users:")
        asyncio.run(list_rooms_and_users())
    else:
        room_id = sys.argv[1]
        user_id = sys.argv[2]
        asyncio.run(add_test_ticket(room_id, user_id))
