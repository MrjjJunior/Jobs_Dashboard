with open('backend/routers/profile.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''from fastapi import APIRouter, Header, HTTPException, status
from typing import Optional''',
'''from fastapi import APIRouter, Header, HTTPException, status, Request
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)'''
)

content = content.replace(
'''@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest):''',
'''@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def signup(request: Request, req: SignupRequest):'''
)

content = content.replace(
'''@router.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):''',
'''@router.post("/auth/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, req: LoginRequest):'''
)

with open('backend/routers/profile.py', 'w', encoding='utf-8') as f:
    f.write(content)
