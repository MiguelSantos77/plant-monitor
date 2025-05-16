from flask import Blueprint, request, jsonify

api = Blueprint('api', __name__)

@api.route("/info" , methods=["POST"])
def receive_info():
    "ESP will send geral info from here"
    pass
    

@api.route("/info" , methods=["GET"])
def get_info():
    return jsonify({"humidity": 30, "lastWatering":"5/16/2025 20:32:00" })  