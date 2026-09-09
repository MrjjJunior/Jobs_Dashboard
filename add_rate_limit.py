with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''app = FastAPI(
    title="Jobs Dashboard API",
    description="Python FastAPI backend for Job Application & Career Dashboard",
    version="1.0.0",
    lifespan=lifespan
)'''

new_content = '''from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Jobs Dashboard API",
    description="Python FastAPI backend for Job Application & Career Dashboard",
    version="1.0.0",
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)'''

content = content.replace(target, new_content)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
