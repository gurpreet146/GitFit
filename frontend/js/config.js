const API_BASE_URL = "http://localhost:8000";

const EXERCISE_GROUPS = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
    "Chest Fly",
    "Cable Crossover",
    "Push Up",
  ],
  Back: [
    "Deadlift",
    "Pull Up",
    "Lat Pulldown",
    "Barbell Row",
    "Seated Cable Row",
    "T-Bar Row",
  ],
  Shoulders: [
    "Overhead Press",
    "Lateral Raise",
    "Front Raise",
    "Rear Delt Fly",
    "Arnold Press",
    "Upright Row",
  ],
  Legs: [
    "Squat",
    "Leg Press",
    "Lunges",
    "Leg Extension",
    "Leg Curl",
    "Romanian Deadlift",
  ],
  Arms: [
    "Bicep Curl",
    "Hammer Curl",
    "Tricep Pushdown",
    "Skull Crusher",
    "Close Grip Bench Press",
    "Dips",
  ],
};

const ALL_EXERCISES = Object.values(EXERCISE_GROUPS).flat();
