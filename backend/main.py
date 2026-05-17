from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path, override=True)

import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from file_processor import process_file
from ai_extractor import extract_data
from pymongo import MongoClient
from datetime import datetime
import certifi
from pydantic import BaseModel
from auth import (
    get_users_collection, hash_password, verify_password,
    create_access_token, get_current_user
)

app = FastAPI(title="AI Document Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
client = None
db = None
collection = None

def get_db_collection():
    global client, db, collection
    if client is None:
        client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
        db = client.ai_doc_intelligence
        collection = db.documents
    return collection

# --- Auth schemas ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# --- Auth routes ---
@app.post("/api/auth/register")
@app.post("/auth/register")
def register(body: RegisterRequest):
    users = get_users_collection()
    if users.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    users.insert_one({
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
        "created_at": datetime.utcnow().isoformat()
    })
    token = create_access_token({"email": body.email, "name": body.name})
    return {"token": token, "name": body.name, "email": body.email}

@app.post("/api/auth/login")
@app.post("/auth/login")
def login(body: LoginRequest):
    users = get_users_collection()
    user = users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"email": user["email"], "name": user["name"]})
    return {"token": token, "name": user["name"], "email": user["email"]}

# --- Protected routes ---
@app.get("/")
def read_root():
    return {"status": "Backend is running flawlessly. Enterprise mode active."}

@app.get("/api/documents")
@app.get("/documents")
def get_documents(current_user: dict = Depends(get_current_user)):
    docs = []
    col = get_db_collection()
    cursor = col.find({"user_email": current_user["email"]}).sort("created_at", -1)
    for document in cursor:
        document["_id"] = str(document["_id"])
        docs.append(document)
    return docs

@app.post("/api/upload")
@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("Auto-detect"),
    current_user: dict = Depends(get_current_user)
):
    try:
        file_bytes = await file.read()

        try:
            processed_data = process_file(file_bytes, file.filename, file.content_type)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"File Processing Error: {str(e)}")

        try:
            extracted_json = extract_data(processed_data, document_type)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Extraction Error: {str(e)}")

        document_record = {
            "filename": file.filename,
            "document_type_hint": document_type,
            "extracted_data": extracted_json,
            "created_at": datetime.utcnow().isoformat(),
            "user_email": current_user["email"],
            "user_name": current_user["name"]
        }
        col = get_db_collection()
        col.insert_one(document_record)
        document_record["_id"] = str(document_record["_id"])

        return {
            "status": "success",
            "filename": file.filename,
            "extracted_data": extracted_json,
            "record_id": document_record["_id"],
            "created_at": document_record["created_at"]
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/api/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    col = get_db_collection()
    total_docs = col.count_documents({"user_email": current_user["email"]})
    return {
        "total_documents": total_docs,
        "user_email": current_user["email"],
        "user_name": current_user["name"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
