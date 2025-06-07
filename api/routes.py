from flask import Blueprint, request, jsonify
from utils.database_manager import DatabaseManager
import paho.mqtt.publish as publish
import json

api = Blueprint('api', __name__)

@api.route("/humidity", methods=["POST"])
def receive_humidity():
    data = request.get_json()
    if not data or "humidity" not in data:
        return jsonify({"error": "Invalid JSON or 'humidity' missing"}), 400

    humidity = data["humidity"]
    db = DatabaseManager()
    db.insert_humidity(humidity)
    db.close()
    return jsonify({"status": "Humidity received"}), 200

@api.route("/last_watering", methods=["POST"])
def receive_last_watering():
    data = request.get_json()
    if not data or "duration" not in data:
        return jsonify({"error": "Invalid JSON or 'duration' missing"}), 400

    duration = data["duration"]
    db = DatabaseManager()
    db.insert_last_watering(duration)
    db.close()
    return jsonify({"status": "Last watering received"}), 200

@api.route("/humidity", methods=["GET"])
def get_humidity():
    db = DatabaseManager()
    info = db.get_latest_humidity()
    db.close()
    if info:
        return jsonify({"id": info["id"], "humidity": info["humidity"], "createdAt": info["createdAt"]}), 200
    else:
        return jsonify({"error": "No humidity data found"}), 404

@api.route("/last_watering", methods=["GET"])
def get_last_watering():
    db = DatabaseManager()
    info = db.get_latest_last_watering()
    db.close()
    if info:
        return jsonify({"id": info["id"], "duration": info["duration"], "createdAt": info["createdAt"]}), 200
    else:
        return jsonify({"error": "No last watering data found"}), 404

@api.route("/tank", methods=["GET"])
def get_tank_status():
    db = DatabaseManager()
    info = db.get_latest_tank_status()
    db.close()
    if info:
        return jsonify({"id": info["id"], "estado": info["state"], "createdAt": info["createdAt"]}), 200
    else:
        return jsonify({"error": "No tank status data found"}), 404

@api.route("/humidity/history", methods=["GET"])
def get_all_humidity_history():
    db = DatabaseManager()
    info = db.get_all_humidity()
    db.close()
    if info:
        return jsonify({"data": [dict(row) for row in info]})
    else:
        return jsonify({}), 404

@api.route("/watering/history", methods=["GET"])
def get_all_watering_history():
    db = DatabaseManager()
    info = db.get_all_last_watering()
    db.close()
    if info:
        return jsonify({"data": [dict(row) for row in info]})
    else:
        return jsonify({}), 404

@api.route("/tank/history", methods=["GET"])
def get_all_tank_history():
    db = DatabaseManager()
    info = db.get_all_tank_status()
    db.close()
    if info:
        return jsonify({"data": [dict(row) for row in info]})
    else:
        return jsonify({}), 404

@api.route("/settings", methods=["GET"])
def get_settings():
    db = DatabaseManager()
    settings = db.get_settings()
    db.close()
    if settings:
        return jsonify(settings), 200
    else:
        return jsonify({"error": "Settings not found"}), 404

@api.route("/settings", methods=["POST"])
def update_settings():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    int_fields = ["broker_port", "duration", "min_sensor", "max_sensor", "min_humidity", "max_humidity"]
    for field in int_fields:
        if field in data:
            try:
                data[field] = int(data[field])
            except ValueError:
                return jsonify({"error": f"Invalid field: {field}"}), 400
    
    if "max_temperature" in data:
        try:
            data["max_temperature"] = float(data["max_temperature"])
        except ValueError:
            return jsonify({"error": "Invalid field: max_temperature"}), 400

    db = DatabaseManager()
    try:
        db.update_settings(data)
        db.close()

        payload_data = dict(data)

        payload_data.pop("broker_ip", None)
        payload_data.pop("broker_port", None)

        payload = json.dumps(payload_data, separators=(",", ":"))

        publish.single(
            topic="esp/settings",
            payload=payload,
            hostname=data["broker_ip"],
            port=data["broker_port"]
        )
        print(f"Sent: {data}")
        return jsonify({"status": "Settings updated"}), 200
    except Exception as e:
        db.close()
        print(e)
        return jsonify({"error": str(e)}), 500

@api.route("/mode/manual", methods=["POST"])
def manual_mode():
    print("Sending manual watering command")
    data = request.get_json()

    db = DatabaseManager()
    settings = db.get_settings()
    db.close()

    mqtt_payload = {
        "mode": "Manual",
        "command": "turnOnPump"
    }
    publish.single(
        topic="esp/commands",
        payload= json.dumps(mqtt_payload),
        hostname=settings['broker_ip'],
        port=int( settings['broker_port'])
    )

    return jsonify({"status": "Manual watering initiated"}), 200
