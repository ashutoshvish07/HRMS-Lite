from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hrms_lite")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
        db = client[DATABASE_NAME]
        # Test the connection
        await client.admin.command("ping")
        # Create unique indexes
        await db.employees.create_index("employee_id", unique=True)
        await db.employees.create_index("email", unique=True)
        await db.attendance.create_index(
            [("employee_id", 1), ("date", 1)], unique=True
        )
        logger.info("✅ Connected to MongoDB successfully")
        print("✅ Connected to MongoDB successfully")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        print(f"❌ MongoDB connection failed: {e}")
        # Don't raise — let app start so Render can detect the port
        # APIs will return errors until DB is available


async def close_db():
    global client
    if client:
        client.close()
        print("🔌 Disconnected from MongoDB")


def get_db():
    if db is None:
        raise Exception("Database not connected. Check MONGODB_URL environment variable.")
    return db