"""
Fix ticket structure - grid should be array, not dict
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def fix_ticket_structure():
    """Fix tickets where grid is stored as dict instead of array"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("FIX TICKET STRUCTURE")
    print("=" * 60)
    
    # Get all tickets
    tickets = await db.tickets.find({}).to_list(1000)
    print(f"\n📊 Found {len(tickets)} total tickets")
    
    fixed_count = 0
    
    for ticket in tickets:
        ticket_id = ticket.get('id')
        grid = ticket.get('grid')
        
        # Check if grid is a dict (wrong structure)
        if isinstance(grid, dict):
            print(f"\n🔧 Fixing ticket #{ticket.get('ticket_number')} (ID: {ticket_id})")
            
            # Extract the actual grid array from the dict
            actual_grid = grid.get('grid', [])
            actual_numbers = grid.get('numbers', [])
            
            print(f"   Grid was dict, extracting array")
            print(f"   Found {len(actual_numbers)} numbers")
            
            # Update ticket with correct structure
            await db.tickets.update_one(
                {"id": ticket_id},
                {
                    "$set": {
                        "grid": actual_grid,
                        "numbers": actual_numbers
                    }
                }
            )
            
            fixed_count += 1
        elif isinstance(grid, list):
            # Grid is correct, but check if numbers array exists
            numbers = ticket.get('numbers', [])
            if not numbers or len(numbers) == 0:
                print(f"\n🔧 Adding numbers to ticket #{ticket.get('ticket_number')}")
                
                # Extract numbers from grid
                extracted_numbers = []
                for row in grid:
                    for cell in row:
                        if cell is not None and isinstance(cell, (int, float)):
                            extracted_numbers.append(int(cell))
                
                extracted_numbers = sorted(set(extracted_numbers))
                
                await db.tickets.update_one(
                    {"id": ticket_id},
                    {"$set": {"numbers": extracted_numbers}}
                )
                
                fixed_count += 1
    
    print(f"\n" + "=" * 60)
    print(f"FIXED {fixed_count} TICKETS")
    print("=" * 60)
    
    # Verify fix
    print("\n🔍 Verifying fix...")
    tickets_after = await db.tickets.find({}).to_list(1000)
    
    dict_grids = 0
    zero_numbers = 0
    
    for ticket in tickets_after:
        grid = ticket.get('grid')
        numbers = ticket.get('numbers', [])
        
        if isinstance(grid, dict):
            dict_grids += 1
        
        if not numbers or len(numbers) == 0:
            zero_numbers += 1
    
    if dict_grids == 0 and zero_numbers == 0:
        print("✅ All tickets fixed!")
        print("✅ All grids are arrays")
        print("✅ All tickets have numbers")
    else:
        if dict_grids > 0:
            print(f"⚠️ Still {dict_grids} tickets with dict grids")
        if zero_numbers > 0:
            print(f"⚠️ Still {zero_numbers} tickets with 0 numbers")
    
    # Show sample fixed ticket
    print("\n📋 Sample fixed ticket:")
    sample = await db.tickets.find_one({})
    if sample:
        print(f"   Ticket #{sample.get('ticket_number')}")
        print(f"   Grid type: {type(sample.get('grid'))}")
        print(f"   Grid rows: {len(sample.get('grid', []))}")
        print(f"   Numbers: {len(sample.get('numbers', []))} numbers")
        print(f"   First row: {sample.get('grid', [[]])[0]}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_ticket_structure())
