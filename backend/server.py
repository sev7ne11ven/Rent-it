# server.py
import re
import json
import os
import requests
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# --- Security and Authentication Imports ---
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# -------------------------------
# CONFIG & ENVIRONMENT
# -------------------------------
load_dotenv()

# --- JWT Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key_for_dev_only") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Increased token lifetime

# --- GEMINI API SETUP ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- DATABASE SETUP ---
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "rentit_db"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
items_collection = db["rentit_items"]
reviews_collection = db["reviews"]
users_collection = db["users"] # Users collection
rentals_collection = db["rentals"]  # Rental tracking

# -------------------------------
# FASTAPI SETUP
# -------------------------------
app = FastAPI(title="Rent-It Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# MODELS
# -------------------------------
class ItemCreate(BaseModel):
    name: str
    description: str
    category: str
    price_per_day: float
    security_deposit: float = 0.0  # Added security deposit field
    quantity: int
    image: Optional[str] = None
    # Note: owner_id will be set automatically from the token

class ReviewCreate(BaseModel):
    comment: str
    rating: int
    # Note: name will be set automatically from the token

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    email: Optional[str] = None

class RentRequest(BaseModel):
    item_id: str
    days: int

class ChatRequest(BaseModel):
    query: str

# Updated Rental models with security deposit
class RentalReceipt(BaseModel):
    item_id: str
    item_name: str
    user_email: str
    rental_days: int
    rental_cost: float
    security_deposit: float
    total_amount: float
    rental_date: str
    return_date: str
    status: str = "active"
    deposit_refunded: bool = False

class RentalRequest(BaseModel):
    item_id: str
    days: int
    user_email: str

# -------------------------------
# SECURITY & AUTHENTICATION UTILS
# -------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = users_collection.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    return user

# -------------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------------
@app.post("/register")
def register_user(user: UserCreate):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    user_data = {"email": user.email, "password": hashed_password}
    users_collection.insert_one(user_data)
    return {"msg": "User registered successfully"}

@app.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create token with role information
    access_token = create_access_token(
        data={
            "sub": user["email"], 
            "role": "admin" if user["email"] == "admin@rentit.com" else "user"
        }, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# -------------------------------
# PROTECTED API ENDPOINTS
# -------------------------------
@app.post("/add_item")
def add_item(item: ItemCreate, current_user: dict = Depends(get_current_user)):
    new_item = item.dict()
    new_item["owner_id"] = current_user["email"]
    new_item["rented_count"] = 0
    result = items_collection.insert_one(new_item)
    return {"msg": "Item added", "id": str(result.inserted_id)}

@app.post("/add_review")
def add_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review_data = review.dict()
    review_data["name"] = current_user["email"]
    result = reviews_collection.insert_one(review_data)
    if result.inserted_id:
        return {"msg": "Review added successfully", "id": str(result.inserted_id)}
    else:
        raise HTTPException(status_code=500, detail="Failed to add review")

@app.delete("/items/{item_id}")
def delete_item(item_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    item_to_delete = items_collection.find_one({"_id": obj_id})
    if not item_to_delete:
        raise HTTPException(status_code=404, detail="Item not found")

    if item_to_delete.get("owner_id") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")

    result = items_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 1:
        return {"msg": "Item deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete item")

# -------------------------------
# PUBLIC API ENDPOINTS
# -------------------------------
def serialize_doc(doc):
    """Helper function to convert ObjectId to string and remove it."""
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    # Also delete password hash if it's a user document
    if "password" in doc:
        del doc["password"]
    return doc

@app.get("/")
async def root():
    return {"message": "Rent-It Backend API", "gemini_configured": bool(GEMINI_API_KEY)}

@app.get("/items")
def get_items():
    items = [serialize_doc(item) for item in items_collection.find()]
    return items

@app.get("/reviews")
def get_reviews():
    reviews = [serialize_doc(review) for review in reviews_collection.find().sort("_id", -1)]
    return reviews

# UPDATED: Enhanced rental system with security deposit
@app.post("/rent_item")
def rent_item(req: RentRequest, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(req.item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    item = items_collection.find_one({"_id": obj_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item["quantity"] <= 0:
        raise HTTPException(status_code=400, detail="Item out of stock")

    # Calculate rental details with security deposit
    rental_date = datetime.now()
    return_date = rental_date + timedelta(days=req.days)
    rental_cost = item["price_per_day"] * req.days
    security_deposit = item.get("security_deposit", 0.0)
    total_amount = rental_cost + security_deposit

    # Create rental record with security deposit
    rental_data = {
        "item_id": req.item_id,
        "item_name": item["name"],
        "user_email": current_user["email"],
        "rental_days": req.days,
        "rental_cost": rental_cost,
        "security_deposit": security_deposit,
        "total_amount": total_amount,
        "deposit_refunded": False,
        "rental_date": rental_date.isoformat(),
        "return_date": return_date.isoformat(),
        "status": "active"
    }
    
    # Update item quantity and create rental record
    items_collection.update_one(
        {"_id": obj_id},
        {"$inc": {"quantity": -1, "rented_count": 1}}
    )
    
    rental_result = rentals_collection.insert_one(rental_data)
    
    return {
        "msg": f"You rented {item['name']} for {req.days} days",
        "rental_cost": rental_cost,
        "security_deposit": security_deposit,
        "total_amount": total_amount,
        "rental_id": str(rental_result.inserted_id),
        "return_date": return_date.strftime("%Y-%m-%d"),
        "item_name": item["name"]
    }

@app.get("/rental_receipt/{rental_id}")
def get_rental_receipt(rental_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(rental_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid rental ID")
    
    rental = rentals_collection.find_one({"_id": obj_id})
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    # Check if user owns this rental
    if rental["user_email"] != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this receipt")
    
    return serialize_doc(rental)

@app.get("/user_rentals")
def get_user_rentals(current_user: dict = Depends(get_current_user)):
    rentals = list(rentals_collection.find({"user_email": current_user["email"]}).sort("rental_date", -1))
    return [serialize_doc(rental) for rental in rentals]

@app.get("/recommendations")
def get_recommendations():
    popular_items = list(items_collection.find({"quantity": {"$gt": 0}})
                                         .sort("rented_count", -1)
                                         .limit(5))
    recs = [serialize_doc(item) for item in popular_items]
    return {"items": recs}

# -------------------------------
# ADMIN ENDPOINTS
# -------------------------------
@app.get("/admin/rentals")
def get_all_rentals(current_user: dict = Depends(get_current_user)):
    # Simple admin check
    if current_user["email"] != "admin@rentit.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rentals = list(rentals_collection.find().sort("rental_date", -1))
    return [serialize_doc(rental) for rental in rentals]

@app.get("/admin/items")
def get_all_items_admin(current_user: dict = Depends(get_current_user)):
    if current_user["email"] != "admin@rentit.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    items = list(items_collection.find())
    return [serialize_doc(item) for item in items]

@app.post("/admin/update_quantity")
def update_item_quantity(item_id: str, new_quantity: int, current_user: dict = Depends(get_current_user)):
    if current_user["email"] != "admin@rentit.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    result = items_collection.update_one(
        {"_id": obj_id},
        {"$set": {"quantity": new_quantity}}
    )
    
    if result.modified_count == 1:
        return {"msg": "Item quantity updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Item not found")

# Add endpoint to refund security deposit (for admin)
@app.post("/admin/refund_deposit/{rental_id}")
def refund_security_deposit(rental_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["email"] != "admin@rentit.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        obj_id = ObjectId(rental_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid rental ID")
    
    rental = rentals_collection.find_one({"_id": obj_id})
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    # Update rental record to mark deposit as refunded
    result = rentals_collection.update_one(
        {"_id": obj_id},
        {"$set": {"deposit_refunded": True, "status": "completed"}}
    )
    
    if result.modified_count == 1:
        return {"msg": f"Security deposit of {rental['security_deposit']} refunded successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to refund deposit")

# -------------------------------
# CHATBOT ENDPOINT & UTILS - IMPROVED
# -------------------------------
def search_items(query):
    regex = re.compile(query, re.IGNORECASE)
    results = items_collection.find({
        "$or": [
            {"name": regex}, 
            {"description": regex}, 
            {"category": regex}
        ],
        "quantity": {"$gt": 0}
    }).limit(5)
    return list(results)

def load_website_knowledge():
    knowledge_file_path = "knowledge_base.txt"
    try:
        with open(knowledge_file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return "Knowledge base not found."

async def query_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return "Chatbot is not configured. Missing API key."
    model_name = "gemini-2.5-flash-preview-05-20"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,  # Reduced for more consistent responses
            "topK": 40,
            "topP": 0.8,
            "maxOutputTokens": 1024
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]
    }
    try:
        response = requests.post(api_url, headers={"Content-Type": "application/json"}, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0] and "parts" in candidates[0]["content"]:
            parts = candidates[0]["content"]["parts"]
            if parts and "text" in parts[0]:
                return parts[0]["text"].strip()
        return "I'm sorry, I couldn't generate a response. Please try again."
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Gemini API: {e}")
        return "I'm having trouble connecting to the AI service. Please try again later."

@app.post("/chatbot")
async def chatbot(chat: ChatRequest):
    query = chat.query.lower().strip()
    
    # Enhanced context extraction
    relevant_items = search_items(query)
    website_knowledge = load_website_knowledge()
    
    # Build better context message
    if relevant_items:
        items_context = "\n".join([
            f"- {item['name']} ({item['price_per_day']}/day, Available: {item['quantity']}, Category: {item['category']}) - {item['description'][:100]}..."
            for item in relevant_items
        ])
        context_message = f"## CURRENTLY AVAILABLE ITEMS MATCHING YOUR QUERY:\n{items_context}"
    else:
        context_message = "## CURRENTLY AVAILABLE ITEMS:\nNo specific items found matching your query, but you can browse all categories."
    
    # Enhanced prompt with better context understanding
    prompt = f"""
# ROLE & CONTEXT
You are "Rent-It Bot", the official AI assistant for Rent-It rental platform. 
You have access to company policies and current inventory.

# COMPANY KNOWLEDGE BASE
{website_knowledge}

# CURRENT INVENTORY STATUS
{context_message}

# USER'S QUESTION: "{query}"

# RESPONSE GUIDELINES:
1. FIRST, check if the user is asking about specific products, rental processes, policies, or general information.
2. If asking about products/availability, use the inventory data above to provide accurate, current information.
3. If asking about rental processes, policies, pricing, or company information, use the knowledge base.
4. If the information is not available in either source, politely say: "I'm sorry, I don't have that specific information in my knowledge base. For detailed assistance, please email support@rent-it.com or check our website for the latest updates."
5. Be helpful, conversational, and provide clear information.
6. If relevant, suggest browsing categories or contacting support for complex issues.
7. Keep responses concise but informative.

# YOUR RESPONSE:
"""
    
    ai_response = await query_gemini(prompt)
    return {"response": ai_response}

# -------------------------------
# MIGRATION (RUNS ON STARTUP)
# -------------------------------
def migrate_json_to_mongo():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), 'data', 'productData1.json')
        if not os.path.exists(json_file_path):
            print(f"JSON file not found at {json_file_path}. Skipping migration.")
            return
        with open(json_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for p in data:
            item_data = {
                "name": p.get("name"),
                "description": p.get("description"),
                "category": "car" if "seater" in p.get("type", "").lower() else ("bike" if "wheeler" in p.get("type", "").lower() else "appliance"),
                "price_per_day": p.get("pricePerDay", 0),
                "security_deposit": p.get("pricePerDay", 0) * 2,  # Default to 2x daily rate as deposit
                "quantity": 5,
                "rented_count": 0,
                "owner_id": "admin",
                "colors": p.get("availableColors", []),
                "reviews": p.get("reviews", []),
                "image": p.get("image", "")
            }
            # Use update_one with upsert to avoid duplicates on restart
            items_collection.update_one({"name": item_data["name"]}, {"$set": item_data}, upsert=True)
        print("ProductData1.json synced into MongoDB")
    except Exception as e:
        print(f"Error during JSON migration: {e}")

# Run migration on startup
migrate_json_to_mongo()
print(f"Total items in DB: {items_collection.count_documents({})}")