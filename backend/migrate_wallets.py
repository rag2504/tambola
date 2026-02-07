"""
Migration Script: Add ₹500 to all users' wallets
Run this once to give existing users ₹500 initial balance
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from datetime import datetime
import uuid

# Load environment
load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def migrate_wallets():
    """Add ₹500 to all users' wallets"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Starting wallet migration...")
    
    # Get all users
    users = await db.users.find({}).to_list(1000)
    print(f"Found {len(users)} users")
    
    updated_count = 0
    created_count = 0
    
    for user in users:
        user_id = user.get('id')
        
        # Check if wallet exists
        wallet = await db.wallets.find_one({"user_id": user_id})
        
        if not wallet:
            # Create new wallet with ₹500
            wallet_id = str(uuid.uuid4())
            new_wallet = {
                "id": wallet_id,
                "user_id": user_id,
                "balance": 500.0,
                "created_at": datetime.utcnow()
            }
            await db.wallets.insert_one(new_wallet)
            
            # Create transaction
            transaction_id = str(uuid.uuid4())
            await db.transactions.insert_one({
                "id": transaction_id,
                "user_id": user_id,
                "type": "credit",
                "amount": 500.0,
                "description": "Welcome bonus - Initial wallet balance",
                "created_at": datetime.utcnow()
            })
            
            created_count += 1
            print(f"✅ Created wallet for user {user.get('name')} with ₹500")
        else:
            # Update existing wallet - add ₹500 to current balance
            current_balance = wallet.get('balance', 0)
            new_balance = current_balance + 500.0
            
            await db.wallets.update_one(
                {"user_id": user_id},
                {"$set": {"balance": new_balance}}
            )
            
            # Create transaction
            transaction_id = str(uuid.uuid4())
            await db.transactions.insert_one({
                "id": transaction_id,
                "user_id": user_id,
                "type": "credit",
                "amount": 500.0,
                "description": "Welcome bonus - Wallet top-up",
                "created_at": datetime.utcnow()
            })
            
            updated_count += 1
            print(f"✅ Updated wallet for user {user.get('name')}: ₹{current_balance} → ₹{new_balance}")
    
    print(f"\n🎉 Migration complete!")
    print(f"   - Created {created_count} new wallets")
    print(f"   - Updated {updated_count} existing wallets")
    print(f"   - Total users processed: {len(users)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_wallets())
