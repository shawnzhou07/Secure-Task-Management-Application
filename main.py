# uvicorn main:app --reload

from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import init_db, close_db, get_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("1. Starting up...")
    await init_db()
    print("2. Ready!")
    
    yield

    print("3. Shutting down...")
    await close_db()
    print("4. Goodbye!")

app = FastAPI(lifespan=lifespan)

@app.post("/create-user")
async def create_user():
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO users (username, hashed_password) VALUES (%s, %s)",
                ("lebronnnnn", "fakehash123")
            )
            await conn.commit()
    return {"message": "User registration success"}

@app.get("/")
def read_root():
    return {"message": "Hello World"}