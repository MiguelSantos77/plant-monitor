async function fetchHumidity() {
    try {
        const response = await fetch('/api/humidity/history');
        if (!response.ok) throw new Error('Error fetching humidity');
        const data = await response.json();

        document.getElementById('humidity').textContent = data.humidity;
        animateWaterDrop(data.humidity);
    } catch (error) {
        console.error("Humidity error:", error);
    }
}

async function fetchLastWatering() {
    try {
        const response = await fetch('/api/watering/history'); 
        if (!response.ok) throw new Error('Error fetching last watering');
        const data = await response.json();
        document.getElementById('lastWateringTime').textContent = data.createdAt; 
    } catch (error) {
        console.error("Last watering error:", error);
    }
}

async function fetchTankStatus() {
    try {
        const response = await fetch('/api/tank');
        if (!response.ok) throw new Error('Error fetching tank status'); 
        const data = await response.json();
        if(data.estado == 1){ 
            document.getElementById('tankStatus').textContent = "Has Water";
        }
        else {
            document.getElementById('tankStatus').textContent = "Empty"; 
        }
    } catch (error) {
        console.error("Tank status error:", error);
    }
}

async function fetchSettings() {
    try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Error fetching settings');
        const data = await response.json();

        if(data.mode == "manual"){
            const waterPlantBtn = document.getElementById("waterPlantBtn"); 
            waterPlantBtn.style.display = "block";
        }
    } catch (error) {
        console.error("Settings error:", error); 
    }
}

async function waterPlant() { 
    const data = {"duration": 5000};
    fetch("/api/mode/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(res => {
        // Handle response if needed
    });
}

function animateWaterDrop(rawValue) {
    const rect = document.getElementById('waterLevel');
    const maxHeight = 150;
    const waterLevel = maxHeight * (rawValue / 100);

    rect.setAttribute('y', maxHeight - waterLevel);
    rect.setAttribute('height', waterLevel);
}

async function fetchInfo() {
    await Promise.all([
        fetchHumidity(),
        fetchLastWatering(),
        fetchTankStatus(),
        updateCharts()
    ]);
}

let humidityChart;

async function fetchChartData(endpoint, labelKey, valueKey) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Error fetching ${endpoint}`);
        const json = await response.json();
        const data = json.data;

        const seen = new Set();
        const uniqueData = data.filter(entry => {
            if (seen.has(entry.createdAt)) return false;
            seen.add(entry.createdAt);
            return true;
        });

        uniqueData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const labels = uniqueData.map(d => new Date(d.createdAt).toLocaleTimeString());
        const values = uniqueData.map(d => d[valueKey]);

        return { labels, values };
    } catch (error) {
        console.error(`Error loading data from ${endpoint}:`, error);
        return { labels: [], values: [] };
    }
}

async function updateCharts() {
    // Humidity Chart
    const humidityData = await fetchChartData('/api/humidity/history', 'createdAt', 'humidity');
    if (!humidityChart) {
        const ctx = document.getElementById('humidityChart').getContext('2d');
        humidityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: humidityData.labels,
                datasets: [{
                    label: 'Humidity (%)',
                    data: humidityData.values,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true },
                    x: { title: { display: true, text: 'Time' } }
                }
            }
        });
    } else {
        humidityChart.data.labels = humidityData.labels;
        humidityChart.data.datasets[0].data = humidityData.values;
        humidityChart.update();
    }
}

fetchInfo();
setInterval(fetchInfo, 5000);
fetchSettings();