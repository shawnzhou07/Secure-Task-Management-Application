# uvicorn main:app --reload

from fastapi import FastAPI, HTTPException, Depends
from contextlib import asynccontextmanager
from database import init_db, close_db, get_pool
from schemas import UserCreate, UserResponse, TaskCreate, TaskResponse
from auth import hash_password, verify_password, create_access_token, get_current_user
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

@app.post("/auth/login")
async def login(user: UserCreate):
    pool = get_pool()
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT user_id, username, hashed_password, created_at FROM users WHERE username = %s", (user.username,))
            result = await cursor.fetchone()
            
            if not result:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            user_id, username, hashed_password, created_at = result
            
            if not verify_password(user.password, hashed_password):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            token = create_access_token({"sub": username, "user_id": user_id})
            
            return {"access_token": token, "token_type": "bearer"}

@app.post("/tasks", status_code=201, response_model=TaskResponse)
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    pool = get_pool()
    user_id = current_user["user_id"]
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO tasks (user_id, title, status, priority) VALUES (%s, %s, %s, %s)",
                (user_id, task.title, task.status, task.priority)
            )
            await conn.commit()
            task_id = cursor.lastrowid
            
    return TaskResponse(id=task_id, user_id=user_id, title=task.title, status=task.status, priority=task.priority)

@app.get("/tasks", response_model=list[TaskResponse])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    pool = get_pool()
    user_id = current_user["user_id"]
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT id, user_id, title, status, priority FROM tasks WHERE user_id = %s", (user_id,))
            rows = await cursor.fetchall()
            
    return [TaskResponse(id=row[0], user_id=row[1], title=row[2], status=row[3], priority=row[4]) for row in rows]

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, current_user: dict = Depends(get_current_user)):
    pool = get_pool()
    user_id = current_user["user_id"]
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT id, user_id, title, status, priority FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
            row = await cursor.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Task not found")
                
    return TaskResponse(id=row[0], user_id=row[1], title=row[2], status=row[3], priority=row[4])

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task: TaskCreate, current_user: dict = Depends(get_current_user)):
    pool = get_pool()
    user_id = current_user["user_id"]
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT id FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Task not found")
            
            await cursor.execute(
                "UPDATE tasks SET title = %s, status = %s, priority = %s WHERE id = %s",
                (task.title, task.status, task.priority, task_id)
            )
            await conn.commit()
            
    return TaskResponse(id=task_id, user_id=user_id, title=task.title, status=task.status, priority=task.priority)

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, current_user: dict = Depends(get_current_user)):
    pool = get_pool()
    user_id = current_user["user_id"]
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT id FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Task not found")
            
            await cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
            await conn.commit()
            
    return {"message": "Task deleted successfully"}

@app.get("/")
def read_root():
    return {"message": "Hello World"}