"""
Check tickets in Ghhh room
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def check_ghhh():
    """Check Ghhh room tickets"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    room_id = "fb1fbc9f-18ff-4ea3-b86f-0a420e9e7ac9"
    
    print("=" * 60)
    print("GHHH ROOM TICKETS")
    print("=" * 60)
    
    # Get room
    room = await db.rooms.find_one({"id": room_id})
    if room:
        print(f"\nRoom: {room.get('name')}")
        print(f"ID: {room_id}")
        print(f"Status: {room.get('status')}")
    
    # Get tickets
    tickets = await db.tickets.find({"room_id": room_id}).to_list(100)
    print(f"\nTotal tickets: {len(tickets)}")
    
    for ticket in tickets:
        print(f"\n  Ticket #{ticket.get('ticket_number')}")
        print(f"    ID: {ticket.get('id')}")
        print(f"    User: {ticket.get('user_id')}")
        print(f"    Numbers: {len(ticket.get('numbers', []))} numbers")
        print(f"    Grid rows: {len(ticket.get('grid', []))}")
    
    print("\n" + "=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_ghhh())
