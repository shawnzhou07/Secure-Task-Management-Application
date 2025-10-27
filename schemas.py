from pydantic import BaseModel, Field
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=20, pattern="^[a-zA-Z0-9]+$")
    password: str = Field(min_length=8, pattern="^\\S+$")

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    status: str = Field(default="to_do", pattern="^(to_do|in_progress|done)$")
    priority: str = Field(default="low", pattern="^(low|medium|high)$")

class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    status: str
    priority: str