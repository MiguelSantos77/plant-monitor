document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    document.getElementById("mode").addEventListener("change", renderInputs);
});

function loadSettings() {
    fetch("/api/settings")
        .then(res => res.json())
        .then(data => {s
            document.getElementById("broker_ip").value = data.broker_ip || "";
            document.getElementById("broker_port").value = data.broker_port || "";
            document.getElementById("min_sensor").value = data.min_sensor || 280;
            document.getElementById("max_sensor").value = data.max_sensor || 655;
            document.getElementById("mode").value = data.mode || "manual";
            setTimeout(() => fillModeFields(data), 100);
        })
        .catch(error => console.error("Error loading settings:", error));
}

function renderInputs() {
    const mode = document.getElementById("mode").value;
    const container = document.getElementById("modeInputs");
    container.innerHTML = ""; 

    if (mode === "manual") {
        container.innerHTML = `
            <label>Watering Duration (in milliseconds)</label>
            <input id="duration" type="number" class="form-control" placeholder="Ex: 2000">
        `;
    }

    if (mode === "auto") {
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <label>Minimum Humidity (%)</label>
                    <input id="min_humidity" type="number" class="form-control" placeholder="Ex: 40">
                </div>
                <div class="col-md-6">
                    <label>Maximum Humidity (%)</label>
                    <input id="max_humidity" type="number" class="form-control" placeholder="Ex: 70">
                </div>
            </div>
            <div class="form-check mt-3">
                <input class="form-check-input" type="checkbox" id="heat_alert_checkbox">
                <label class="form-check-label" for="heat_alert_checkbox">Do not allow watering on hot days?</label>
            </div>
            <div id="temp_max_container" class="mt-2" style="display: none;">
                <label>Maximum allowed temperature (°C)</label>
                <input id="max_temperature" type="number" class="form-control" placeholder="Ex: 30">
                
                <label>Latitude</label>
                <input id="latitude" type="text" class="form-control" placeholder="Ex: 38.7169">
                
                <label>Longitude</label>
                <input id="longitude" type="text" class="form-control" placeholder="Ex: -9.1399"> 
            </div>
        `;

        document.getElementById("heat_alert_checkbox").addEventListener("change", () => {
            const checked = document.getElementById("heat_alert_checkbox").checked;
            document.getElementById("temp_max_container").style.display = checked ? "block" : "none";
        });
    }

    if (mode === "schedule") {
        container.innerHTML = `
            <div class="col-md-6">
                <label>Minimum Humidity (%) <small class="text-muted">(only waters below this value)</small></label>
                <input id="min_humidity" type="number" class="form-control" placeholder="Ex: 40">
            </div>

            <label>Watering Duration (in milliseconds)</label>
            <input id="duration" type="number" class="form-control" placeholder="Ex: 2000">

            <label class="mt-3">ESP Timezone</label>
            <select id="tz_select" class="form-select">
                <option value="WET0WEST,M3.5.0/1,M10.5.0/2">Europe/Lisbon</option>
                <option value="CET-1CEST,M3.5.0/2,M10.5.0/3">Europe/Madrid</option>
                <option value="GMT0BST,M3.5.0/1,M10.5.0/2">Europe/London</option>
                <option value="CET-1CEST,M3.5.0/2,M10.5.0/3">Europe/Berlin</option>
                <option value="EST5EDT,M3.2.0/2,M11.1.0/2">America/New_York</option>
                <option value="BRT3BRST,M10.3.0/0,M2.3.0/0">America/Sao_Paulo</option>
                <option value="UTC0">UTC</option>
            </select>

            <label class="mt-3">Watering Times</label>
            <div id="schedule_container">
                <div class="input-group mb-2">
                    <input type="time" class="form-control schedule-time">
                    <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">-</button>
                </div>
            </div>
            <button type="button" class="btn btn-outline-primary mb-3" id="add_schedule_btn">+</button>

            <div class="form-check mt-3">
                <input class="form-check-input" type="checkbox" id="heat_alert_checkbox">
                <label class="form-check-label" for="heat_alert_checkbox">Do not allow watering on hot days?</label>
            </div>
            <div id="temp_max_container" class="mt-2" style="display: none;">
                <label>Maximum allowed temperature (°C)</label>
                <input id="max_temperature" type="number" class="form-control" placeholder="Ex: 30">

                <label>Latitude</label>
                <input id="latitude" type="text" class="form-control" placeholder="Ex: 38.7169">
                
                <label>Longitude</label>
                <input id="longitude" type="text" class="form-control" placeholder="Ex: -9.1399">
            </div>
        `;

        document.getElementById("add_schedule_btn").addEventListener("click", () => addScheduleTime());

        document.getElementById("heat_alert_checkbox").addEventListener("change", () => {
            const checked = document.getElementById("heat_alert_checkbox").checked;
            document.getElementById("temp_max_container").style.display = checked ? "block" : "none";
            document.getElementById("latitude").style.display = checked ? "block" : "none";
            document.getElementById("longitude").style.display = checked ? "block" : "none";
        });
    }
}

/**
 * Adds a new time input field for scheduled watering.
 * @param {string} value - The initial time value (e.g., "10:30").
 */
function addScheduleTime(value = "") {
    const container = document.getElementById("schedule_container");
    const div = document.createElement("div");
    div.className = "input-group mb-2";
    div.innerHTML = `
        <input type="time" class="form-control schedule-time" value="${value}" step="60">
        <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">-</button>
    `;
    container.appendChild(div);
}

/**
 * Fills the dynamically rendered input fields with existing settings data.
 * @param {Object} data - The settings data object from the API.
 */
function fillModeFields(data) {
    const mode = document.getElementById("mode").value;

    if (mode === "manual") {
        document.getElementById("duration").value = data.duration || "";
    }

    if (mode === "auto") {
        const heatAlertCheckbox = document.getElementById("heat_alert_checkbox");
        heatAlertCheckbox.checked = data.temperatura_maxima !== undefined;
        document.getElementById("min_humidity").value = data.min_humidity || "";
        document.getElementById("max_humidity").value = data.max_humidity || "";

        if (heatAlertCheckbox.checked) {
            document.getElementById("temp_max_container").style.display = "block";
            document.getElementById("max_temperature").value = data.temperatura_maxima || ""; 
            document.getElementById("latitude").value = data.latitude || "";
            document.getElementById("longitude").value = data.longitude || "";
        }
    }

    if (mode === "schedule") { 
        document.getElementById("min_humidity").value = data.min_humidity || "";
        document.getElementById("duration").value = data.duration || "";
        document.getElementById("tz_select").value = data.timezone || "WET0WEST,M3.5.0/1,M10.5.0/2";

        const scheduleList = (data.schedule_times || "").split(",").filter(Boolean);
        document.getElementById("schedule_container").innerHTML = "";
        scheduleList.forEach(t => addScheduleTime(t));

        const heatAlertCheckbox = document.getElementById("heat_alert_checkbox");
        heatAlertCheckbox.checked = data.temperatura_maxima !== undefined; 
        if (heatAlertCheckbox.checked) {
            document.getElementById("temp_max_container").style.display = "block";
            document.getElementById("max_temperature").value = data.temperatura_maxima || "";
            
            document.getElementById("latitude").value = data.latitude || "";
            document.getElementById("longitude").value = data.longitude || "";
        }
    }
}

/**
 * Displays a success alert message.
 */
function showSuccessAlert() {
    const alertPlaceholder = document.getElementById('alert-placeholder');
    alertPlaceholder.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            Settings saved successfully!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(document.querySelector('.alert'));
        if (alert) alert.close();
    }, 3000);
}

/**
 * Gathers data from the form fields and sends it to the API to save settings.
 */
function saveSettings() {
    const mode = document.getElementById("mode").value;

    const data = {
        broker_ip: document.getElementById("broker_ip").value,
        broker_port: document.getElementById("broker_port").value,
        min_sensor: document.getElementById("min_sensor").value,
        max_sensor: document.getElementById("max_sensor").value,
        mode
    };

    if (mode === "manual") {
        data.duration = document.getElementById("duration").value;
    }

    if (mode === "auto") {
        data.min_humidity = document.getElementById("min_humidity").value;
        data.max_humidity = document.getElementById("max_humidity").value;

        const heatAlertCheckbox = document.getElementById("heat_alert_checkbox");
        if (heatAlertCheckbox.checked) {
            data.max_temperature = parseFloat(document.getElementById("max_temperature").value);
            data.latitude = document.getElementById("latitude").value;
            data.longitude = document.getElementById("longitude").value;
        }
    }

    if (mode === "schedule") { 
        data.min_humidity = document.getElementById("min_humidity").value;
        data.duration = document.getElementById("duration").value;

        // Collect all scheduled times
        const times = Array.from(document.querySelectorAll(".schedule-time"))
            .map(input => {
                const [hour, minute] = input.value.split(":");
                return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            })
            .filter(t => t);

        data.timezone = document.getElementById("tz_select").value;
        data.schedule_times = times.join(",");

        const heatAlertCheckbox = document.getElementById("heat_alert_checkbox");
        if (heatAlertCheckbox.checked) {
            data.max_temperature = parseFloat(document.getElementById("max_temperature").value);
            data.latitude = document.getElementById("latitude").value;
            data.longitude = document.getElementById("longitude").value;
        }
    }

    fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => {
            console.log("Settings saved:", res);
            showSuccessAlert();
        })
        .catch(error => console.error("Error saving settings:", error));
}
