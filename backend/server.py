from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId
import os, uuid, time, hashlib, jwt, bcrypt
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

# --- Config & Database ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
db = client[os.environ.get('DB_NAME', 'awadhut_db')]
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-12345')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# --- Utilities ---
def fix_id(doc):
    if doc:
        doc["id"] = str(doc.get("_id") if "id" not in doc else doc["id"])
        if "_id" in doc: del doc["_id"]
    return doc

def hash_pw(pw): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
def verify_pw(pw, hashed): return bcrypt.checkpw(pw.encode(), hashed.encode())

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds: raise HTTPException(401, "Login required")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except: raise HTTPException(401, "Invalid or expired token")

async def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(creds)
    if user.get("role") != "admin": raise HTTPException(403, "Admin access required")
    return user

# --- Models ---
class UserRegister(BaseModel):
    name: str; email: str; password: str

class ReviewCreate(BaseModel):
    name: str; rating: int; comment: str; eventType: Optional[str] = "General"

class EventUpdate(BaseModel):
    title: str; description: str = ""; eventDate: str; eventTime: str = ""
    venue: str = "Awadhut Banquets"; image: str = ""; price: Optional[float] = 0
    capacity: Optional[int] = 0; isActive: bool = True

# --- Auth Routes ---
@api_router.post("/auth/register")
async def register(data: UserRegister):
    if await db.users.find_one({"email": data.email}): raise HTTPException(400, "Email exists")
    user = {**data.model_dump(), "id": str(uuid.uuid4()), "password": hash_pw(data.password), "role": "user"}
    await db.users.insert_one(user)
    return {"message": "Success"}

@api_router.post("/auth/login")
async def login(data: dict):
    user = await db.users.find_one({"email": data.get('email')})
    if not user or not verify_pw(data.get('password'), user["password"]): raise HTTPException(401, "Invalid")
    token = jwt.encode({"email": user["email"], "role": user.get("role", "user"), "name": user["name"], "exp": time.time() + 604800}, JWT_SECRET)
    return {"token": token, "role": user.get("role", "user"), "name": user["name"]}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user # This fixes the 404 /auth/me error

# --- Package Routes (Fixed Featured Filter) ---
@api_router.get("/packages")
async def get_packages(featured: Optional[bool] = None):
    q = {"isFeatured": True} if featured else {}
    docs = await db.packages.find(q).to_list(100)
    return [fix_id(d) for d in docs]

# --- Gallery Routes (Fixed 404) ---
@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None):
    q = {"category": {"$regex": f"^{category}$", "$options": "i"}} if category and category.lower() != "all" else {}
    docs = await db.gallery.find(q).to_list(100)
    return [fix_id(d) for d in docs]

# --- Review Routes ---
@api_router.get("/reviews")
async def get_reviews(approved: Optional[bool] = None):
    q = {"approved": approved} if approved is not None else {}
    return [fix_id(d) for d in await db.reviews.find(q).to_list(100)]

@api_router.get("/reviews/my")
async def get_my_reviews(user=Depends(get_current_user)):
    return [fix_id(d) for d in await db.reviews.find({"name": user["name"]}).to_list(100)]

@api_router.post("/reviews")
async def post_review(data: ReviewCreate):
    doc = {**data.model_dump(), "id": str(uuid.uuid4()), "approved": False, "createdAt": datetime.now(timezone.utc).isoformat()}
    await db.reviews.insert_one(doc)
    return {"message": "Success"}

# --- Event Routes ---
@api_router.get("/events")
async def get_events():
    return [fix_id(d) for d in await db.events.find({}).to_list(100)]

@api_router.put("/events/{id}")
async def update_event(id: str, data: EventUpdate, admin=Depends(get_current_admin)):
    await db.events.update_one({"id": id}, {"$set": data.model_dump()})
    return {"message": "Updated"}

@api_router.delete("/events/{id}")
async def delete_event(id: str, admin=Depends(get_current_admin)):
    await db.events.delete_one({"id": id})
    return {"message": "Deleted"}

# --- Utility / Seed ---
@api_router.get("/seed")
async def seed():
    # This recreates your admin user
    await db.users.update_one(
        {"email": "chaitanyabanquetsmh24@gmail.com"}, 
        {"$set": {"name": "Soham", "password": hash_pw("Soham@123123"), "role": "admin"}}, 
        upsert=True
    )
    return {"message": "Admin user seeded"}

@api_router.get("/dashboard/stats")
async def get_stats(admin=Depends(get_current_admin)):
    return {
        "totalPackages": await db.packages.count_documents({}),
        "totalEvents": await db.events.count_documents({}),
        "pendingReviews": await db.reviews.count_documents({"approved": False})
    }

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)