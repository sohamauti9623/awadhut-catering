from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import time
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Auth Helpers ───
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(data: dict) -> str:
    payload = {**data, "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated. Please login to submit a review.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Pydantic Models ───
class AdminLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class PackageCreate(BaseModel):
    name: str
    category: str
    price: float
    guestCount: int
    includes: List[str] = []
    extras: List[str] = []
    notes: str = ""
    isFeatured: bool = False
    image: str = ""

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    guestCount: Optional[int] = None
    includes: Optional[List[str]] = None
    extras: Optional[List[str]] = None
    notes: Optional[str] = None
    isFeatured: Optional[bool] = None
    image: Optional[str] = None

class GalleryCreate(BaseModel):
    title: str
    category: str
    imageUrl: str
    description: str = ""

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str
    eventType: str = ""

class BookingCreate(BaseModel):
    name: str
    email: str
    phone: str
    eventType: str
    eventDate: str
    guests: int
    packageId: Optional[str] = None
    message: str = ""

class ListingCreate(BaseModel):
    title: str
    description: str
    type: str
    images: List[str] = []
    features: List[str] = []

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    subject: str = ""
    message: str

# ─── Auth Routes ───
@api_router.post("/auth/login")
async def login(data: AdminLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"email": user["email"], "role": user["role"], "name": user["name"], "userId": user["id"]})
    return {"token": token, "name": user["name"], "email": user["email"], "role": user["role"]}

@api_router.post("/auth/register", status_code=201)
async def register_user(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(doc)
    token = create_token({"email": doc["email"], "role": "user", "name": doc["name"], "userId": doc["id"]})
    return {"token": token, "name": doc["name"], "email": doc["email"], "role": "user"}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {"email": user["email"], "name": user["name"], "role": user["role"]}

# ─── Packages Routes ───
@api_router.get("/packages")
async def get_packages(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["isFeatured"] = featured
    packages = await db.packages.find(query, {"_id": 0}).to_list(100)
    return packages

@api_router.get("/packages/{package_id}")
async def get_package(package_id: str):
    pkg = await db.packages.find_one({"id": package_id}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    return pkg

@api_router.post("/packages", status_code=201)
async def create_package(data: PackageCreate, admin=Depends(get_current_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.packages.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/packages/{package_id}")
async def update_package(package_id: str, data: PackageUpdate, admin=Depends(get_current_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.packages.update_one({"id": package_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    pkg = await db.packages.find_one({"id": package_id}, {"_id": 0})
    return pkg

@api_router.delete("/packages/{package_id}")
async def delete_package(package_id: str, admin=Depends(get_current_admin)):
    result = await db.packages.delete_one({"id": package_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"message": "Package deleted"}

# ─── Gallery Routes ───
@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    items = await db.gallery.find(query, {"_id": 0}).to_list(100)
    return items

@api_router.post("/gallery", status_code=201)
async def create_gallery(data: GalleryCreate, admin=Depends(get_current_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/gallery/{item_id}")
async def delete_gallery(item_id: str, admin=Depends(get_current_admin)):
    result = await db.gallery.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"message": "Gallery item deleted"}

# ─── Reviews Routes ───
@api_router.get("/reviews")
async def get_reviews(approved: Optional[bool] = None):
    query = {}
    if approved is not None:
        query["approved"] = approved
    reviews = await db.reviews.find(query, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return reviews

@api_router.post("/reviews", status_code=201)
async def create_review(data: ReviewCreate, user=Depends(get_current_user)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["name"] = user["name"]
    doc["userId"] = user.get("userId", "")
    doc["approved"] = False
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/reviews/my")
async def get_my_reviews(user=Depends(get_current_user)):
    reviews = await db.reviews.find({"userId": user.get("userId", "")}, {"_id": 0}).sort("createdAt", -1).to_list(50)
    return reviews

@api_router.put("/reviews/{review_id}/approve")
async def approve_review(review_id: str, admin=Depends(get_current_admin)):
    result = await db.reviews.update_one({"id": review_id}, {"$set": {"approved": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review approved"}

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, admin=Depends(get_current_admin)):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

# ─── Bookings Routes ───
@api_router.get("/bookings")
async def get_bookings(admin=Depends(get_current_admin)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return bookings

@api_router.post("/bookings", status_code=201)
async def create_booking(data: BookingCreate):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pending"
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str = Query(...), admin=Depends(get_current_admin)):
    if status not in ["pending", "confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": f"Booking status updated to {status}"}

@api_router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str, admin=Depends(get_current_admin)):
    result = await db.bookings.delete_one({"id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted"}

# ─── Listings/Services Routes ───
@api_router.get("/listings")
async def get_listings(type: Optional[str] = None):
    query = {}
    if type:
        query["type"] = type
    listings = await db.listings.find(query, {"_id": 0}).to_list(50)
    return listings

@api_router.post("/listings")
async def create_listing(data: ListingCreate, admin=Depends(get_current_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.listings.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/listings/{listing_id}")
async def update_listing(listing_id: str, data: ListingCreate, admin=Depends(get_current_admin)):
    update_data = data.model_dump()
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.listings.update_one({"id": listing_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    return listing

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, admin=Depends(get_current_admin)):
    result = await db.listings.delete_one({"id": listing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted"}

# ─── Contact Form ───
@api_router.post("/contact")
async def submit_contact(data: ContactCreate):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    doc["read"] = False
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Message sent successfully", "id": doc["id"]}

@api_router.get("/contacts")
async def get_contacts(admin=Depends(get_current_admin)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return contacts

# ─── Dashboard Stats ───
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(admin=Depends(get_current_admin)):
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    total_packages = await db.packages.count_documents({})
    total_reviews = await db.reviews.count_documents({})
    pending_reviews = await db.reviews.count_documents({"approved": False})
    total_gallery = await db.gallery.count_documents({})
    total_contacts = await db.contacts.count_documents({})
    
    # Basic revenue from confirmed bookings
    bookings = await db.bookings.find({"status": {"$in": ["confirmed", "completed"]}}, {"_id": 0, "packageId": 1}).to_list(500)
    package_ids = [b["packageId"] for b in bookings if b.get("packageId")]
    revenue = 0
    if package_ids:
        packages = await db.packages.find({"id": {"$in": package_ids}}, {"_id": 0, "price": 1}).to_list(500)
        revenue = sum(p.get("price", 0) for p in packages)

    return {
        "totalBookings": total_bookings,
        "pendingBookings": pending_bookings,
        "confirmedBookings": confirmed_bookings,
        "totalPackages": total_packages,
        "totalReviews": total_reviews,
        "pendingReviews": pending_reviews,
        "totalGallery": total_gallery,
        "totalContacts": total_contacts,
        "estimatedRevenue": revenue
    }

# ─── Cloudinary Signature ───
@api_router.get("/cloudinary/signature")
async def get_cloudinary_signature(folder: str = "awadhut-gallery", admin=Depends(get_current_admin)):
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    api_secret = os.environ.get("CLOUDINARY_API_SECRET")
    api_key = os.environ.get("CLOUDINARY_API_KEY")
    
    if not all([cloud_name, api_key, api_secret]):
        raise HTTPException(status_code=500, detail="Cloudinary not configured. Please add CLOUDINARY credentials to .env")
    
    import cloudinary.utils
    timestamp = int(time.time())
    params = {"timestamp": timestamp, "folder": folder}
    signature = cloudinary.utils.api_sign_request(params, api_secret)
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": cloud_name,
        "api_key": api_key,
        "folder": folder
    }

# ─── Seed Data ───
@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing = await db.packages.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded", "packages": existing}
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@awadhut.com"})
    if not admin_exists:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": "admin@awadhut.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
    
    # Seed packages
    packages = [
        {"id": str(uuid.uuid4()), "name": "Royal Wedding Package", "category": "wedding", "price": 250000, "guestCount": 300, "includes": ["Banquet Hall", "Stage Decoration", "Sound System", "Valet Parking", "Bridal Room"], "extras": ["Photography", "Mehendi Artist", "DJ Night"], "notes": "Perfect for grand wedding celebrations", "isFeatured": True, "image": "https://images.unsplash.com/photo-1763553113391-a659bee36e06?w=800", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Elegant Wedding Package", "category": "wedding", "price": 150000, "guestCount": 200, "includes": ["Banquet Hall", "Basic Decoration", "Sound System", "Parking"], "extras": ["Photography", "Flower Arrangement"], "notes": "Elegant and affordable wedding celebration", "isFeatured": True, "image": "https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Simple Wedding Package", "category": "wedding", "price": 80000, "guestCount": 100, "includes": ["Hall Booking", "Basic Setup", "Parking"], "extras": ["Decoration Add-on", "Catering"], "notes": "For intimate wedding gatherings", "isFeatured": False, "image": "", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Premium Veg Thali", "category": "food", "price": 800, "guestCount": 1, "includes": ["4 Sabzi", "Dal Makhani", "Paneer Dish", "Rice", "Roti", "Salad", "Dessert", "Papad", "Drinks"], "extras": ["Ice Cream Counter", "Live Chaat Station"], "notes": "Price per plate. Minimum 100 guests.", "isFeatured": True, "image": "https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?w=800", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Grand Buffet Package", "category": "food", "price": 1200, "guestCount": 1, "includes": ["6 Sabzi", "2 Dal Varieties", "Paneer & Mushroom", "Biryani", "Roti & Naan", "3 Desserts", "Drinks", "Live Counters"], "extras": ["Non-Veg Options", "Special Sweet Counter"], "notes": "Price per plate. Minimum 150 guests.", "isFeatured": True, "image": "https://images.pexels.com/photos/5039342/pexels-photo-5039342.jpeg?w=800", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Basic Catering Package", "category": "food", "price": 500, "guestCount": 1, "includes": ["3 Sabzi", "Dal", "Rice", "Roti", "Salad", "Sweet"], "extras": ["Papad", "Extra Sweet"], "notes": "Price per plate. Minimum 50 guests.", "isFeatured": False, "image": "", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Corporate Conference Package", "category": "corporate", "price": 50000, "guestCount": 50, "includes": ["Conference Hall", "Projector & Screen", "Wi-Fi", "Tea/Coffee Breaks", "Notepads & Pens"], "extras": ["Lunch Buffet", "Backdrop Banner"], "notes": "Ideal for business meetings and seminars", "isFeatured": True, "image": "https://images.pexels.com/photos/4940642/pexels-photo-4940642.jpeg?w=800", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Corporate Gala Package", "category": "corporate", "price": 120000, "guestCount": 150, "includes": ["Banquet Hall", "Stage Setup", "Sound & Lighting", "Dinner Buffet", "Welcome Drinks"], "extras": ["DJ", "Awards Ceremony Setup"], "notes": "Perfect for annual events and award nights", "isFeatured": False, "image": "https://images.unsplash.com/photo-1762765684810-b734486c5eda?w=800", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Birthday Bash Package", "category": "corporate", "price": 35000, "guestCount": 50, "includes": ["Party Hall", "Decoration", "Sound System", "Cake Table Setup"], "extras": ["Theme Decoration", "Games & Activities", "Photography"], "notes": "For birthday celebrations and small parties", "isFeatured": False, "image": "", "createdAt": datetime.now(timezone.utc).isoformat()},
    ]
    await db.packages.insert_many(packages)
    
    # Seed gallery
    gallery_items = [
        {"id": str(uuid.uuid4()), "title": "Royal Wedding Setup", "category": "Wedding", "imageUrl": "https://images.unsplash.com/photo-1763553113391-a659bee36e06?w=800", "description": "Grand wedding reception with floral decorations", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Elegant Banquet Hall", "category": "Wedding", "imageUrl": "https://images.pexels.com/photos/36028895/pexels-photo-36028895.jpeg?w=800", "description": "Luxurious banquet hall with chandeliers", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Premium Catering Setup", "category": "Food", "imageUrl": "https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?w=800", "description": "Elegant buffet with silver chafing dishes", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Gourmet Dishes", "category": "Food", "imageUrl": "https://images.pexels.com/photos/5039342/pexels-photo-5039342.jpeg?w=800", "description": "Delicious gourmet food presentation", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Wedding Mandap Decoration", "category": "Decoration", "imageUrl": "https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800", "description": "Beautiful wedding mandap with flowers", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Festive Decorations", "category": "Decoration", "imageUrl": "https://images.pexels.com/photos/36581291/pexels-photo-36581291.jpeg?w=800", "description": "Vibrant Indian ceremony decorations", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Corporate Event Setup", "category": "Events", "imageUrl": "https://images.unsplash.com/photo-1762765684810-b734486c5eda?w=800", "description": "Professional corporate event arrangement", "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Conference Hall", "category": "Events", "imageUrl": "https://images.pexels.com/photos/4940642/pexels-photo-4940642.jpeg?w=800", "description": "Modern conference and meeting space", "createdAt": datetime.now(timezone.utc).isoformat()},
    ]
    await db.gallery.insert_many(gallery_items)
    
    # Seed reviews (pre-approved)
    reviews = [
        {"id": str(uuid.uuid4()), "name": "Priya Sharma", "rating": 5, "comment": "Absolutely wonderful experience! The wedding decoration was breathtaking and the food was delicious. Awadhut Banquets made our special day truly memorable.", "eventType": "Wedding", "approved": True, "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Rajesh Patil", "rating": 5, "comment": "Best banquet hall in Latur! The staff was very professional and helpful. The catering was top-notch. Highly recommended for any event.", "eventType": "Wedding", "approved": True, "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Sneha Deshmukh", "rating": 4, "comment": "Great venue for our corporate event. Everything was well organized and the food quality was excellent. Will definitely book again.", "eventType": "Corporate", "approved": True, "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Amit Jadhav", "rating": 5, "comment": "The decoration team did an amazing job for my daughter's birthday party. The hall was perfectly set up and everyone loved the food.", "eventType": "Birthday", "approved": True, "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Meena Kulkarni", "rating": 4, "comment": "Very spacious hall with excellent facilities. The catering service provided authentic Maharashtrian cuisine that all our guests loved.", "eventType": "Wedding", "approved": True, "createdAt": datetime.now(timezone.utc).isoformat()},
    ]
    await db.reviews.insert_many(reviews)

    # Seed listings/services
    listings = [
        {"id": str(uuid.uuid4()), "title": "Premium Banquet Hall", "description": "Our grand banquet hall accommodates up to 500 guests with luxurious interiors, state-of-the-art sound system, and beautiful ambient lighting. Perfect for weddings, receptions, and grand celebrations.", "type": "banquet", "images": ["https://images.pexels.com/photos/36028895/pexels-photo-36028895.jpeg?w=800"], "features": ["500+ Guest Capacity", "Central Air Conditioning", "Premium Sound System", "Valet Parking", "Bridal Room", "Generator Backup"], "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Catering Excellence", "description": "From traditional Maharashtrian thalis to multi-cuisine buffets, our experienced chefs prepare mouth-watering dishes using the freshest ingredients. We specialize in both vegetarian and non-vegetarian menus.", "type": "catering", "images": ["https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?w=800"], "features": ["Multi-Cuisine Menu", "Live Cooking Stations", "Customizable Menus", "Experienced Chefs", "Hygiene Certified", "Minimum 50 Guests"], "createdAt": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "title": "Wedding & Event Decoration", "description": "Transform your event into a magical experience with our expert decoration team. From floral mandaps to themed setups, we bring your vision to life with attention to every detail.", "type": "decoration", "images": ["https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800"], "features": ["Custom Theme Design", "Floral Arrangements", "Stage & Mandap Setup", "Lighting Design", "Entrance Decoration", "Photo Booth Setup"], "createdAt": datetime.now(timezone.utc).isoformat()},
    ]
    await db.listings.insert_many(listings)
    
    return {"message": "Seed data created successfully", "packages": len(packages), "gallery": len(gallery_items), "reviews": len(reviews), "listings": len(listings)}

# ─── Health Check ───
@api_router.get("/")
async def root():
    return {"message": "Awadhut Banquets & Catering API", "status": "running"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
