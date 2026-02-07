"""
Run the production database fix automatically
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def fix_production_tickets():
    """Fix tickets in production database"""
    mongo_url = os.environ.get('MONGO_URL', '').strip('"').strip("'")
    db_name = os.environ.get('DB_NAME', 'tambola_db').strip('"').strip("'")
    
    print("=" * 60)
    print("FIX PRODUCTION DATABASE")
    print("=" * 60)
    print(f"\nDatabase: {db_name}")
    print(f"MongoDB: {mongo_url[:50]}...")
    print("\nConnecting...")
    
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await db.command('ping')
        print("✅ Connected to database")
        
        # Get all tickets
        tickets = await db.tickets.find({}).to_list(1000)
        print(f"\n📊 Found {len(tickets)} total tickets")
        
        fixed_count = 0
        
        for ticket in tickets:
            ticket_id = ticket.get('id')
            grid = ticket.get('grid')
            
            # Check if grid is a dict (wrong structure)
            if isinstance(grid, dict):
                print(f"🔧 Fixing ticket #{ticket.get('ticket_number')}")
                
                # Extract the actual grid array from the dict
                actual_grid = grid.get('grid', [])
                actual_numbers = grid.get('numbers', [])
                
                # Update ticket with correct structure
                await db.tickets.update_one(
                    {"id": ticket_id},
                    {
                        "$set": {
                            "grid": actual_grid,
                            "numbers": actual_numbers,
                            "marked_numbers": ticket.get('marked_numbers', [])
                        }
                    }
                )
                
                fixed_count += 1
            elif isinstance(grid, list):
                # Grid is correct, but check if numbers array exists
                numbers = ticket.get('numbers', [])
                if not numbers or len(numbers) == 0:
                    print(f"🔧 Adding numbers to ticket #{ticket.get('ticket_number')}")
                    
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
        
        print(f"\n✅ Fixed {fixed_count} tickets")
        
        # Verify
        print("\n🔍 Verifying...")
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
        else:
            if dict_grids > 0:
                print(f"⚠️ Still {dict_grids} tickets with dict grids")
            if zero_numbers > 0:
                print(f"⚠️ Still {zero_numbers} tickets with 0 numbers")
        
        client.close()
        print("\n" + "=" * 60)
        print("COMPLETE")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("\n⚠️  This will modify your production database!")
    print("Press Ctrl+C to cancel, or Enter to continue...")
    try:
        input()
        asyncio.run(fix_production_tickets())
    except KeyboardInterrupt:
        print("\nCancelled")
