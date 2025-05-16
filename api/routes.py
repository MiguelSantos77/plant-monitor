from flask import Blueprint, request, jsonify
from utils.database_manager import DatabaseManager
api = Blueprint('api', __name__)

@api.route("/info" , methods=["POST"])
def receive_info():
    "ESP will send geral info from here"
    db = DatabaseManager("database.db")

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400
    humidity = data.get("humidity")
    lastWatering = data.get("lastWatering")

    db.insert_info(humidity, lastWatering)
    db.close()
    return jsonify({"status": "received"}), 200
    

@api.route("/info" , methods=["GET"])
def get_info():
    db = DatabaseManager("database.db")
    info = db.get_latest_info()
    db.close()

    return jsonify(dict(info))  