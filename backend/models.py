from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

EXERCISE_GROUPS = {
    "Chest": [
        "Bench Press",
        "Incline Bench Press",
        "Decline Bench Press",
        "Chest Fly",
        "Cable Crossover",
        "Push Up",
    ],
    "Back": [
        "Deadlift",
        "Pull Up",
        "Lat Pulldown",
        "Barbell Row",
        "Seated Cable Row",
        "T-Bar Row",
    ],
    "Shoulders": [
        "Overhead Press",
        "Lateral Raise",
        "Front Raise",
        "Rear Delt Fly",
        "Arnold Press",
        "Upright Row",
    ],
    "Legs": [
        "Squat",
        "Leg Press",
        "Lunges",
        "Leg Extension",
        "Leg Curl",
        "Romanian Deadlift",
    ],
    "Arms": [
        "Bicep Curl",
        "Hammer Curl",
        "Tricep Pushdown",
        "Skull Crusher",
        "Close Grip Bench Press",
        "Dips",
    ],
}

ALL_EXERCISES = [exercise for exercises in EXERCISE_GROUPS.values() for exercise in exercises]


def _match_case_insensitive(value: str, choices: list[str]) -> str:
    normalized = value.strip().lower()
    for choice in choices:
        if normalized == choice.lower():
            return choice
    raise ValueError("Invalid value")


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    weight: Optional[float] = None
    height: Optional[float] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    weight: Optional[float] = Field(default=None, ge=0)
    height: Optional[float] = Field(default=None, ge=0)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class WorkoutCreate(BaseModel):
    muscle_group: str
    exercise_name: str
    sets: int = Field(gt=0)
    reps: int = Field(gt=0)
    weight: float = Field(ge=0)

    @field_validator("muscle_group")
    @classmethod
    def validate_muscle_group(cls, value: str) -> str:
        return _match_case_insensitive(value, list(EXERCISE_GROUPS.keys()))

    @field_validator("exercise_name")
    @classmethod
    def validate_exercise_name(cls, value: str) -> str:
        return _match_case_insensitive(value, ALL_EXERCISES)

    @model_validator(mode="after")
    def validate_group_and_exercise(self):
        valid_exercises = EXERCISE_GROUPS.get(self.muscle_group, [])
        if self.exercise_name not in valid_exercises:
            raise ValueError("exercise_name does not belong to muscle_group")
        return self


class WorkoutResponse(BaseModel):
    id: str
    exercise_name: str
    muscle_group: str
    sets: int
    reps: int
    weight: float
    date: datetime

    model_config = ConfigDict(from_attributes=True)


class ProgressPoint(BaseModel):
    date: datetime
    weight: float
