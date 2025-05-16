async function fetchInfo() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();

        document.getElementById('humidity').textContent = data.humidity;
        document.getElementById('lastWatering').textContent = data.lastWatering;
    } catch (error) {
        console.error("Error:", error);
    }
}

fetchInfo();

setInterval(fetchInfo, 5000);