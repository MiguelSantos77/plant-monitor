async function fetchInfo() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();

        document.getElementById('humidity').textContent = data.humidity;
        animateWaterDrop(data.humidity)
        document.getElementById('lastWatering').textContent = data.lastWatering;
    } catch (error) {
        console.error("Error:", error);
    }
}

function animateWaterDrop(percent) {
    const rect = document.getElementById('waterLevel');
    percent = Math.max(0, Math.min(100, percent));

    const maxHeigth = 150; 
    const waterLevel = maxHeigth * (percent / 100);

    rect.setAttribute('y', maxHeigth - waterLevel);
    rect.setAttribute('height', waterLevel);
}

fetchInfo();

setInterval(fetchInfo, 5000);