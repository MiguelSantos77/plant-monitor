from flask import Flask, render_template
from api.routes import api

app = Flask(__name__)
app.register_blueprint(api, url_prefix="/api")

@app.route("/")
def dashboard():
    return render_template("dashboard.html")

if __name__ == "__main__":
    app.run(port=5000, debug= True)
