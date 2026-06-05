let map;
let markers = [];
let polyline;

function initMap(pharmacyLocation) {
    map = L.map('map').setView([pharmacyLocation.lat, pharmacyLocation.lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const pharmacyMarker = L.marker([pharmacyLocation.lat, pharmacyLocation.lng])
        .addTo(map)
        .bindPopup(`<b>${pharmacyLocation.name || 'Pharmacie'}</b><br>${pharmacyLocation.address}`);
    markers.push(pharmacyMarker);
}

function updateMap(pharmacyLocation, orders) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const pharmacyMarker = L.marker([pharmacyLocation.lat, pharmacyLocation.lng])
        .addTo(map)
        .bindPopup(`<b>${pharmacyLocation.name || 'Pharmacie'}</b><br>${pharmacyLocation.address}`);
    markers.push(pharmacyMarker);

    orders.forEach((order, index) => {
        const marker = L.marker([order.lat, order.lng])
            .addTo(map)
            .bindPopup(`
                <b>${index + 1}. ${order.customerName}</b><br>
                ${order.address}<br>
                <button onclick="openWaze(${order.lat}, ${order.lng})" class="btn-waze">
                    <i class="fas fa-directions"></i> Naviguer avec Waze
                </button>
            `);
        markers.push(marker);
    });

    if (orders.length > 0) {
        if (polyline) map.removeLayer(polyline);
        const routePoints = [
            [pharmacyLocation.lat, pharmacyLocation.lng],
            ...orders.map(order => [order.lat, order.lng])
        ];
        polyline = L.polyline(routePoints, { color: 'blue', weight: 5 }).addTo(map);
        map.fitBounds(routePoints);
    }
}

function openWaze(lat, lng) {
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
}