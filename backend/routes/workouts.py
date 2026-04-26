from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from auth import get_current_user
from db import workouts_collection
from models import ALL_EXERCISES, ProgressPoint, WorkoutCreate, WorkoutResponse
router = APIRouter(prefix="/workouts", tags=["workouts"])


def build_workout_response(workout_doc: dict) -> WorkoutResponse:
    return WorkoutResponse(
        id=str(workout_doc["_id"]),
        exercise_name=workout_doc["exercise_name"],
        muscle_group=workout_doc["muscle_group"],
        sets=workout_doc["sets"],
        reps=workout_doc["reps"],
        weight=workout_doc["weight"],
        date=workout_doc["date"],
    )


@router.post("", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def add_workout(payload: WorkoutCreate, current_user: dict = Depends(get_current_user)):
    workout_doc = {
        "user_id": current_user["_id"],
        "exercise_name": payload.exercise_name,
        "muscle_group": payload.muscle_group,
        "sets": payload.sets,
        "reps": payload.reps,
        "weight": payload.weight,
        "date": datetime.now(timezone.utc),
    }
    result = workouts_collection.insert_one(workout_doc)
    created = workouts_collection.find_one({"_id": result.inserted_id})
    return build_workout_response(created)


@router.get("", response_model=list[WorkoutResponse])
def get_workouts(
    exercise_name: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    query: dict = {"user_id": current_user["_id"]}
    if exercise_name:
        matched_exercise = None
        for exercise in ALL_EXERCISES:
            if exercise.lower() == exercise_name.strip().lower():
                matched_exercise = exercise
                break
        if not matched_exercise:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid exercise_name")
        query["exercise_name"] = matched_exercise

    workout_docs = workouts_collection.find(query).sort("date", -1)
    return [build_workout_response(doc) for doc in workout_docs]


@router.get("/{exercise_name}", response_model=list[ProgressPoint])
def get_progress(exercise_name: str, current_user: dict = Depends(get_current_user)):
    matched_exercise = None
    for exercise in ALL_EXERCISES:
        if exercise.lower() == exercise_name.strip().lower():
            matched_exercise = exercise
            break

    if not matched_exercise:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid exercise_name")

    workout_docs = workouts_collection.find(
        {"user_id": current_user["_id"], "exercise_name": matched_exercise},
        {"date": 1, "weight": 1},
    ).sort("date", 1)

    return [ProgressPoint(date=doc["date"], weight=doc["weight"]) for doc in workout_docs]


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(workout_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid workout id") from exc

    result = workouts_collection.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")

    return None
