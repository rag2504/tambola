"""
Test script to verify ticket API and database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def test_tickets():
    """Test ticket retrieval"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("TICKET DATABASE TEST")
    print("=" * 60)
    
    # Get all rooms
    rooms = await db.rooms.find({}).to_list(10)
    print(f"\n📦 Found {len(rooms)} rooms")
    
    for room in rooms:
        room_id = room.get('id')
        room_name = room.get('name', 'Unknown')
        print(f"\n🏠 Room: {room_name} (ID: {room_id})")
        
        # Get tickets for this room
        tickets = await db.tickets.find({"room_id": room_id}).to_list(100)
        print(f"   🎫 Tickets: {len(tickets)}")
        
        if tickets:
            for ticket in tickets[:3]:  # Show first 3
                print(f"      - Ticket #{ticket.get('ticket_number')} (User: {ticket.get('user_id')})")
                print(f"        Grid: {len(ticket.get('grid', []))} rows")
                print(f"        Numbers: {len(ticket.get('numbers', []))} numbers")
                print(f"        Marked: {len(ticket.get('marked_numbers', []))} marked")
    
    # Get all users
    users = await db.users.find({}).to_list(10)
    print(f"\n👥 Found {len(users)} users")
    
    for user in users:
        user_id = user.get('id')
        user_name = user.get('name', 'Unknown')
        print(f"\n👤 User: {user_name} (ID: {user_id})")
        
        # Get tickets for this user
        user_tickets = await db.tickets.find({"user_id": user_id}).to_list(100)
        print(f"   🎫 Total tickets: {len(user_tickets)}")
        
        # Group by room
        rooms_dict = {}
        for ticket in user_tickets:
            room_id = ticket.get('room_id')
            if room_id not in rooms_dict:
                rooms_dict[room_id] = []
            rooms_dict[room_id].append(ticket)
        
        for room_id, room_tickets in rooms_dict.items():
            room = await db.rooms.find_one({"id": room_id})
            room_name = room.get('name', 'Unknown') if room else 'Unknown'
            print(f"      Room '{room_name}': {len(room_tickets)} tickets")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_tickets())
