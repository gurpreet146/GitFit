import os

from pymongo import ASCENDING, DESCENDING, MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://amansinghbro89_db_user:AoLLo3GfiTzU2MQE@cluster0.l9sv9v7.mongodb.net/gitfit?retryWrites=true&w=majority")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "gitfit")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

users_collection = db["users"]
workouts_collection = db["workouts"]

users_collection.create_index([("email", ASCENDING)], unique=True)
workouts_collection.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
