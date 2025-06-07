from flask import Flask, render_template
from api.routes import api
from utils.mqtt_listener import start_listener
import threading

app = Flask(__name__)
app.register_blueprint(api, url_prefix="/api")

@app.route("/")
def dashboard():
    return render_template("dashboard.html")

@app.route("/settings")
def settings():
    return  render_template("settings.html")

if __name__ == "__main__":

    t = threading.Thread(target=start_listener)
    t.daemon = True
    t.start()

    app.run(port=5000, debug= True)
