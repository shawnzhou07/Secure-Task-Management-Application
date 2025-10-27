import aiomysql
import os
from dotenv import load_dotenv
from models import CREATE_USERS_TABLE, CREATE_TASKS_TABLE

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "db": os.getenv("DB_NAME"),
}

pool = None

async def init_db():
    """Initialize database connection pool and create tables"""
    global pool
    
    pool = await aiomysql.create_pool(**DB_CONFIG)
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(CREATE_USERS_TABLE)
            await cursor.execute(CREATE_TASKS_TABLE)
            await conn.commit()
    
    print("✅ Database connected and tables created")

async def close_db():
    """Close database connection pool"""
    global pool

    if pool:
        pool.close()
        await pool.wait_closed()
    
    print("❌ Database closed")

def get_pool():
    """Get the connection pool"""
    return pool