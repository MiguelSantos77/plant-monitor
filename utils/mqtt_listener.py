import json
import paho.mqtt.client as mqtt
from utils.database_manager import DatabaseManager

TOPIC_HUMIDITY = "watering/humidity"
TOPIC_LAST_WATERING = "watering/lastWatering"
TOPIC_TANK = "watering/float"

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with code", rc)
    client.subscribe(TOPIC_HUMIDITY)
    client.subscribe(TOPIC_LAST_WATERING)
    client.subscribe(TOPIC_TANK)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print(f"Message received on topic {msg.topic}: {payload}")
    
    db = DatabaseManager()

    try:
        if msg.topic == TOPIC_HUMIDITY:
            if payload is not None:
                humidity = int(payload)
                db.insert_humidity(humidity)
                print(f"Humidity inserted: {humidity}")
        
        elif msg.topic == TOPIC_LAST_WATERING:
            if payload is not None:
                duration = str(payload)
                db.insert_last_watering(duration)
                print(f"Last watering inserted: {duration}")

        elif msg.topic == TOPIC_TANK:
            if payload == "HAS_WATER":
                db.insert_tank_status(1)
            if payload == "NO_WATER":
                db.insert_tank_status(0)
    except Exception as e:
        print("Error processing message:", e)
    finally:
        db.close()

def start_listener():
    db = DatabaseManager()
    settings = db.get_settings()
    db.close()

    if settings is not None:
        if settings["broker_ip"] is not None:
            client = mqtt.Client()
            client.on_connect = on_connect
            client.on_message = on_message
            client.connect(settings["broker_ip"], int(settings["broker_port"]), 60)
            client.loop_forever()