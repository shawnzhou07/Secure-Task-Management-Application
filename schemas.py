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