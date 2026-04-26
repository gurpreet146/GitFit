import os
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError

from db import users_collection
from models import TokenResponse, UserCreate, UserLogin, UserResponse

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "replace-this-with-a-strong-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter(tags=["auth"])


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expires_at}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def build_user_response(user_doc: dict) -> UserResponse:
    return UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        weight=user_doc.get("weight"),
        height=user_doc.get("height"),
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    normalized_email = payload.email.lower()
    if users_collection.find_one({"email": normalized_email}):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    user_doc = {
        "name": payload.name.strip(),
        "email": normalized_email,
        "password": hash_password(payload.password),
        "weight": None,
        "height": None,
        "created_at": datetime.now(timezone.utc),
    }

    try:
        result = users_collection.insert_one(user_doc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists") from exc

    created_user = users_collection.find_one({"_id": result.inserted_id})
    return build_user_response(created_user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    normalized_email = payload.email.lower()
    user_doc = users_collection.find_one({"email": normalized_email})
    if not user_doc or not verify_password(payload.password, user_doc["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(str(user_doc["_id"]))
    return TokenResponse(access_token=token)


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    try:
        oid = ObjectId(user_id)
    except Exception as exc:
        raise credentials_exception from exc

    user_doc = users_collection.find_one({"_id": oid})
    if not user_doc:
        raise credentials_exception

    return user_doc
