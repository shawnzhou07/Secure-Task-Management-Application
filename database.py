import aiomysql

from models import CREATE_USERS_TABLE, CREATE_TASKS_TABLE

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "f2bh892x",
    "db": "task_management_database",
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