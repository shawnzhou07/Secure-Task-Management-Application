# uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from database import init_db, close_db, get_pool
from schemas import UserCreate, UserResponse
from auth import hash_password
import aiomysql

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

@app.post("/auth/register", status_code=201)
async def register(user: UserCreate):
    pool = get_pool()
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM users WHERE username = %s", (user.username,))
            if await cursor.fetchone():
                raise HTTPException(status_code=409, detail="Username already exists")
            
            hashed = hash_password(user.password)
            
            await cursor.execute(
                "INSERT INTO users (username, hashed_password) VALUES (%s, %s)",
                (user.username, hashed)
            )
            await conn.commit()
            
    return {"message": "User registered successfully"}

@app.get("/")
def read_root():
    return {"message": "Hello World"}