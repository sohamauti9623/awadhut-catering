from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import uuid
import time
import jwt
import bcrypt
import cloudinary.utils
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

# --- Config & Database ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ.get("MONGO_URL"))
db = client[os.environ.get("DB_NAME", "awadhut_db")]
JWT_SECRET = os.environ.get("JWT_SECRET", "fallback-secret-12345")

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# --- Utilities ---
def fix_id(doc: Optional[dict]):
    if not doc:
        return doc
    if "id" not in doc:
        doc["id"] = str(doc.get("_id"))
    else:
        doc["id"] = str(doc["id"])
    doc.pop("_id", None)
    return doc


def hash_pw(pw: str):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_pw(pw: str, hashed: str):
    return bcrypt.checkpw(pw.encode(), hashed.encode())


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(401, "Login required")
    try:
        return jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


async def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(creds)
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user


# --- Models ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str


class ReviewCreate(BaseModel):
    name: Optional[str] = ""
    rating: int
    comment: str
    eventType: Optional[str] = "General"


class EventUpdate(BaseModel):
    title: str
    description: str = ""
    eventDate: str
    eventTime: str = ""
    venue: str = "Awadhut Banquets"
    image: str = ""
    price: Optional[float] = None
    capacity: Optional[int] = None
    isActive: bool = True


class PackagePayload(BaseModel):
    name: str
    category: str
    price: float
    guestCount: int
    description: str = ""
    isFeatured: bool = False
    image: str = ""
    includes: List[str] = []
    extras: List[str] = []
    notes: str = ""


class BookingPayload(BaseModel):
    name: str
    email: str
    phone: str
    eventType: str
    eventDate: str
    guests: int
    packageId: Optional[str] = None
    message: Optional[str] = ""


class ContactPayload(BaseModel):
    name: str
    email: Optional[str] = ""
    phone: str
    subject: Optional[str] = ""
    message: str


class GalleryPayload(BaseModel):
    title: str
    category: str
    imageUrl: str
    description: Optional[str] = ""


# --- Auth Routes ---
@api_router.post("/auth/register", status_code=201)
async def register(data: UserRegister):
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "Email exists")
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "password": hash_pw(data.password),
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = jwt.encode(
        {
            "email": user_doc["email"],
            "role": "user",
            "name": user_doc["name"],
            "exp": time.time() + 604800,
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    return {"message": "Success", "token": token, "role": "user", "name": user_doc["name"]}


@api_router.post("/auth/login")
async def login(data: dict):
    user = await db.users.find_one({"email": data.get("email")})
    if not user or not verify_pw(data.get("password", ""), user["password"]):
        raise HTTPException(401, "Invalid")
    token = jwt.encode(
        {
            "email": user["email"],
            "role": user.get("role", "user"),
            "name": user.get("name", "User"),
            "exp": time.time() + 604800,
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    return {"token": token, "role": user.get("role", "user"), "name": user.get("name", "User")}


@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user


# --- Package Routes ---
@api_router.get("/packages")
async def get_packages(featured: Optional[bool] = None, category: Optional[str] = None):
    query = {}
    if featured is True:
        query["isFeatured"] = True
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    docs = await db.packages.find(query).to_list(200)
    return [fix_id(d) for d in docs]


@api_router.get("/packages/{id}")
async def get_package(id: str):
    doc = await db.packages.find_one({"id": id})
    if not doc:
        raise HTTPException(404, "Package not found")
    return fix_id(doc)


@api_router.post("/packages", status_code=201)
async def create_package(data: PackagePayload, admin=Depends(get_current_admin)):
    doc = {**data.model_dump(), "id": str(uuid.uuid4()), "createdAt": datetime.now(timezone.utc).isoformat()}
    await db.packages.insert_one(doc)
    return fix_id(doc)


@api_router.put("/packages/{id}")
async def update_package(id: str, data: dict, admin=Depends(get_current_admin)):
    result = await db.packages.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(404, "Package not found")
    return {"message": "Updated"}


@api_router.delete("/packages/{id}")
async def delete_package(id: str, admin=Depends(get_current_admin)):
    result = await db.packages.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Package not found")
    return {"message": "Deleted"}


# --- Services / Listings ---
@api_router.get("/listings")
async def get_listings():
    docs = await db.listings.find({}).to_list(100)
    return [fix_id(d) for d in docs]


# --- Gallery Routes ---
@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None):
    query = {"category": {"$regex": f"^{category}$", "$options": "i"}} if category and category.lower() != "all" else {}
    docs = await db.gallery.find(query).to_list(500)
    return [fix_id(d) for d in docs]


@api_router.post("/gallery", status_code=201)
async def create_gallery(data: GalleryPayload, admin=Depends(get_current_admin)):
    doc = {**data.model_dump(), "id": str(uuid.uuid4()), "createdAt": datetime.now(timezone.utc).isoformat()}
    await db.gallery.insert_one(doc)
    return fix_id(doc)


@api_router.delete("/gallery/{id}")
async def delete_gallery(id: str, admin=Depends(get_current_admin)):
    result = await db.gallery.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Gallery item not found")
    return {"message": "Deleted"}


# --- Review Routes ---
@api_router.get("/reviews")
async def get_reviews(approved: Optional[bool] = None):
    query = {"approved": approved} if approved is not None else {}
    docs = await db.reviews.find(query).to_list(200)
    return [fix_id(d) for d in docs]


@api_router.get("/reviews/my")
async def get_my_reviews(user=Depends(get_current_user)):
    docs = await db.reviews.find({"userEmail": user.get("email")}).to_list(200)
    return [fix_id(d) for d in docs]


@api_router.post("/reviews", status_code=201)
async def post_review(data: ReviewCreate, user=Depends(get_current_user)):
    doc = {
        **data.model_dump(),
        "id": str(uuid.uuid4()),
        "name": data.name or user.get("name", "Anonymous"),
        "userEmail": user.get("email"),
        "approved": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.reviews.insert_one(doc)
    return fix_id(doc)


@api_router.put("/reviews/{id}/approve")
async def approve_review(id: str, admin=Depends(get_current_admin)):
    result = await db.reviews.update_one({"id": id}, {"$set": {"approved": True}})
    if result.matched_count == 0:
        raise HTTPException(404, "Review not found")
    return {"message": "Approved"}


@api_router.delete("/reviews/{id}")
async def delete_review(id: str, admin=Depends(get_current_admin)):
    result = await db.reviews.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Review not found")
    return {"message": "Deleted"}


# --- Event Routes ---
@api_router.get("/events")
async def get_events(active_only: Optional[bool] = False):
    query = {"isActive": True} if active_only else {}
    docs = await db.events.find(query).to_list(200)
    return [fix_id(d) for d in docs]


@api_router.get("/events/{id}")
async def get_event(id: str):
    doc = await db.events.find_one({"id": id})
    if not doc:
        raise HTTPException(404, "Event not found")
    return fix_id(doc)


@api_router.post("/events", status_code=201)
async def create_event(data: EventUpdate, admin=Depends(get_current_admin)):
    doc = {**data.model_dump(), "id": str(uuid.uuid4()), "createdAt": datetime.now(timezone.utc).isoformat()}
    await db.events.insert_one(doc)
    return fix_id(doc)


@api_router.put("/events/{id}")
async def update_event(id: str, data: EventUpdate, admin=Depends(get_current_admin)):
    result = await db.events.update_one({"id": id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(404, "Event not found")
    return {"message": "Updated"}


@api_router.delete("/events/{id}")
async def delete_event(id: str, admin=Depends(get_current_admin)):
    result = await db.events.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Event not found")
    return {"message": "Deleted"}


# --- Booking & Contact ---
@api_router.post("/bookings", status_code=201)
async def create_booking(data: BookingPayload):
    doc = {
        **data.model_dump(),
        "id": str(uuid.uuid4()),
        "status": "pending",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one(doc)
    return fix_id(doc)


@api_router.get("/bookings")
async def get_bookings(admin=Depends(get_current_admin)):
    docs = await db.bookings.find({}).sort("createdAt", -1).to_list(500)
    return [fix_id(d) for d in docs]


@api_router.put("/bookings/{id}/status")
async def update_booking_status(id: str, status: str = Query(...), admin=Depends(get_current_admin)):
    result = await db.bookings.update_one({"id": id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(404, "Booking not found")
    return {"message": "Updated"}


@api_router.delete("/bookings/{id}")
async def delete_booking(id: str, admin=Depends(get_current_admin)):
    result = await db.bookings.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Booking not found")
    return {"message": "Deleted"}


@api_router.post("/contact")
async def create_contact(data: ContactPayload):
    doc = {**data.model_dump(), "id": str(uuid.uuid4()), "createdAt": datetime.now(timezone.utc).isoformat()}
    await db.contacts.insert_one(doc)
    return {"message": "Submitted"}


@api_router.get("/contacts")
async def get_contacts(admin=Depends(get_current_admin)):
    docs = await db.contacts.find({}).sort("createdAt", -1).to_list(500)
    return [fix_id(d) for d in docs]


# --- Cloudinary Signature ---
@api_router.get("/cloudinary/signature")
async def cloudinary_signature(folder: str, admin=Depends(get_current_admin)):
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    api_key = os.environ.get("CLOUDINARY_API_KEY")
    api_secret = os.environ.get("CLOUDINARY_API_SECRET")

    if not cloud_name or not api_key or not api_secret:
        raise HTTPException(500, "Cloudinary is not configured")

    ts = int(time.time())
    params = {"folder": folder, "timestamp": ts}
    signature = cloudinary.utils.api_sign_request(params, api_secret)
    return {
        "cloud_name": cloud_name,
        "api_key": api_key,
        "timestamp": ts,
        "folder": folder,
        "signature": signature,
    }


# --- Utility / Seed ---
@api_router.get("/seed")
async def seed():
    await db.users.update_one(
        {"email": "chaitanyabanquetsmh24@gmail.com"},
        {
            "$set": {
                "id": "admin-awadhut",
                "name": "Soham",
                "password": hash_pw("Soham@123123"),
                "role": "admin",
            }
        },
        upsert=True,
    )
    return {"message": "Admin user seeded"}


@api_router.get("/dashboard/stats")
async def get_stats(admin=Depends(get_current_admin)):
    return {
        "totalBookings": await db.bookings.count_documents({}),
        "pendingBookings": await db.bookings.count_documents({"status": "pending"}),
        "confirmedBookings": await db.bookings.count_documents({"status": "confirmed"}),
        "totalPackages": await db.packages.count_documents({}),
        "totalEvents": await db.events.count_documents({}),
        "totalReviews": await db.reviews.count_documents({}),
        "pendingReviews": await db.reviews.count_documents({"approved": False}),
        "totalGallery": await db.gallery.count_documents({}),
        "totalMessages": await db.contacts.count_documents({}),
    }


@api_router.get("")
async def health():
    return {"status": "ok"}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
