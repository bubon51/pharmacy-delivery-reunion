let map;
let markers = [];
let polyline;

function initMap() {
    // Centrer sur Saint-Suzanne (pharmacie)
    const pharmacyLocation = { lat: -20.9286, lng: 55.6142 };
    map = L.map('map').setView([pharmacyLocation.lat, pharmacyLocation.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Ajouter un marqueur pour la pharmacie
    const pharmacyMarker = L.marker([pharmacyLocation.lat, pharmacyLocation.lng])
        .addTo(map)
        .bindPopup(`<b>Pharmacie de Saint-Suzanne</b><br>133 avenue du Mahatma Gandhi, 97441 Saint-Suzanne`);
    markers.push(pharmacyMarker);
}

function updateMap(pharmacy, orders) {
    // Effacer les marqueurs existants (sauf la pharmacie)
    markers.slice(1).forEach(marker => map.removeLayer(marker));
    markers = markers.slice(0, 1); // Garder uniquement le marqueur de la pharmacie

    // Ajouter des marqueurs pour chaque commande
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

    // Dessiner l'itinéraire optimisé
    if (orders.length > 0) {
        if (polyline) map.removeLayer(polyline);

        const routePoints = [
            [pharmacy.lat, pharmacy.lng], // Toujours commencer par la pharmacie
            ...orders.map(order => [order.lat, order.lng])
        ];

        polyline = L.polyline(routePoints, { color: 'blue', weight: 5 }).addTo(map);
        map.fitBounds(routePoints);
    } else {
        // Si aucune commande, recentrer sur la pharmacie
        map.setView([pharmacy.lat, pharmacy.lng], 13);
    }
}

function openWaze(lat, lng) {
    window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
}
