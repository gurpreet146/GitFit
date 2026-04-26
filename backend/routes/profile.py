from fastapi import APIRouter, Depends, HTTPException, status

from auth import build_user_response, get_current_user
from db import users_collection
from models import ProfileUpdate, UserResponse

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    return build_user_response(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(payload: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    updates = payload.model_dump(exclude_unset=True)

    if "email" in updates:
        updates["email"] = updates["email"].lower()
        existing_user = users_collection.find_one({"email": updates["email"]})
        if existing_user and existing_user["_id"] != current_user["_id"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    if "name" in updates:
        updates["name"] = updates["name"].strip()

    if updates:
        users_collection.update_one({"_id": current_user["_id"]}, {"$set": updates})

    refreshed = users_collection.find_one({"_id": current_user["_id"]})
    return build_user_response(refreshed)
