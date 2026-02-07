"""
Fix existing tickets that have 0 numbers
This happens when tickets were created with old code that didn't store the numbers array
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def fix_tickets():
    """Fix all tickets with missing numbers array"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("FIX EXISTING TICKETS")
    print("=" * 60)
    
    # Get all tickets
    tickets = await db.tickets.find({}).to_list(1000)
    print(f"\n📊 Found {len(tickets)} total tickets")
    
    fixed_count = 0
    
    for ticket in tickets:
        ticket_id = ticket.get('id')
        grid = ticket.get('grid', [])
        numbers = ticket.get('numbers', [])
        
        # Check if numbers array is empty or missing
        if not numbers or len(numbers) == 0:
            print(f"\n🔧 Fixing ticket #{ticket.get('ticket_number')} (ID: {ticket_id})")
            
            # Extract numbers from grid
            extracted_numbers = []
            for row in grid:
                for cell in row:
                    if cell is not None and isinstance(cell, (int, float)):
                        extracted_numbers.append(int(cell))
            
            # Sort numbers
            extracted_numbers = sorted(set(extracted_numbers))
            
            print(f"   Found {len(extracted_numbers)} numbers in grid")
            print(f"   Numbers: {extracted_numbers[:10]}..." if len(extracted_numbers) > 10 else f"   Numbers: {extracted_numbers}")
            
            # Update ticket
            await db.tickets.update_one(
                {"id": ticket_id},
                {"$set": {"numbers": extracted_numbers}}
            )
            
            fixed_count += 1
        else:
            print(f"✅ Ticket #{ticket.get('ticket_number')} already has {len(numbers)} numbers")
    
    print(f"\n" + "=" * 60)
    print(f"FIXED {fixed_count} TICKETS")
    print("=" * 60)
    
    # Verify fix
    print("\n🔍 Verifying fix...")
    tickets_after = await db.tickets.find({}).to_list(1000)
    
    zero_numbers = 0
    for ticket in tickets_after:
        numbers = ticket.get('numbers', [])
        if not numbers or len(numbers) == 0:
            zero_numbers += 1
    
    if zero_numbers == 0:
        print("✅ All tickets now have numbers!")
    else:
        print(f"⚠️ Still {zero_numbers} tickets with 0 numbers")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_tickets())
