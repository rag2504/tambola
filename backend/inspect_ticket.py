"""
Inspect a specific ticket to see what's wrong
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path
import json

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def inspect_tickets():
    """Inspect tickets to see structure"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("INSPECT TICKETS")
    print("=" * 60)
    
    # Get first few tickets
    tickets = await db.tickets.find({}).limit(5).to_list(5)
    
    for idx, ticket in enumerate(tickets):
        print(f"\n📋 Ticket #{idx + 1}")
        print(f"   ID: {ticket.get('id')}")
        print(f"   Ticket Number: {ticket.get('ticket_number')}")
        print(f"   User ID: {ticket.get('user_id')}")
        print(f"   Room ID: {ticket.get('room_id')}")
        
        grid = ticket.get('grid', [])
        print(f"\n   Grid Type: {type(grid)}")
        print(f"   Grid Length: {len(grid) if isinstance(grid, list) else 'N/A'}")
        
        if isinstance(grid, dict):
            print(f"   Grid is a DICT (wrong!): {grid}")
        elif isinstance(grid, list):
            print(f"   Grid Rows: {len(grid)}")
            for row_idx, row in enumerate(grid):
                print(f"      Row {row_idx}: {row}")
        
        numbers = ticket.get('numbers', [])
        print(f"\n   Numbers: {numbers}")
        print(f"   Numbers Count: {len(numbers) if isinstance(numbers, list) else 'N/A'}")
        
        marked = ticket.get('marked_numbers', [])
        print(f"   Marked: {marked}")
        
        print("\n   " + "-" * 50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect_tickets())
