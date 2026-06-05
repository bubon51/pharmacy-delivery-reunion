// ============================================
// CARTE - Support Google Maps et Leaflet (fallback)
// ============================================

// Variables globales pour la carte
let map;
let markers = [];
let polyline;
let mapType = 'google'; // 'google' ou 'leaflet'

// Stockage des marqueurs et info windows (pour Google Maps)
const markerStore = new Map();

// ============================================
// DÉTECTION DE LA CARTE DISPONIBLE
// ============================================

function detectMapProvider() {
    // Essayer Google Maps en premier
    if (typeof google !== 'undefined' && google.maps) {
        console.log('✓ Google Maps API est disponible');
        return 'google';
    }
    
    // Sinon, essayer Leaflet
    if (typeof L !== 'undefined') {
        console.log('✓ Leaflet est disponible (fallback)');
        return 'leaflet';
    }
    
    console.error('✗ Aucune bibliothèque de carte disponible !');
    return null;
}

// ============================================
// INITIALISATION DE LA CARTE
// ============================================

function initMap() {
    if (map) return;
    
    mapType = detectMapProvider();
    
    if (mapType === 'google') {
        initGoogleMap();
    } else if (mapType === 'leaflet') {
        initLeafletMap();
    } else {
        console.error('Impossible d\'initialiser la carte : aucune bibliothèque disponible');
        showError('Impossible de charger la carte. Vérifiez votre connexion internet ou la configuration de l\'API Google Maps.');
    }
}

function initGoogleMap() {
    console.log('Initialisation de Google Maps...');
    
    try {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: window.PHARMACY.lat, lng: window.PHARMACY.lng },
            zoom: 10,
            minZoom: 8,
            maxZoom: 18,
            gestureHandling: 'greedy',
            fullscreenControl: false,
            mapTypeControl: true,
            streetViewControl: false,
            restriction: {
                latLngBounds: {
                    north: window.REUNION_BOUNDS[1][0],
                    south: window.REUNION_BOUNDS[0][0],
                    east: window.REUNION_BOUNDS[1][1],
                    west: window.REUNION_BOUNDS[0][1]
                },
                strictBounds: true
            }
        });

        // Limiter la carte à La Réunion
        const reunionBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(window.REUNION_BOUNDS[0][0], window.REUNION_BOUNDS[0][1]),
            new google.maps.LatLng(window.REUNION_BOUNDS[1][0], window.REUNION_BOUNDS[1][1])
        );
        map.fitBounds(reunionBounds);

        // Ajouter le marqueur de la pharmacie
        addPharmacyMarker();

        // Écouter les changements de taille de fenêtre
        window.addEventListener('resize', () => {
            if (map) {
                google.maps.event.trigger(map, 'resize');
            }
        });
        
        console.log('✓ Google Maps initialisée avec succès');
    } catch (error) {
        console.error('✗ Erreur lors de l\'initialisation de Google Maps:', error);
        // Essayer Leaflet en fallback
        mapType = 'leaflet';
        initLeafletMap();
    }
}

function initLeafletMap() {
    console.log('Initialisation de Leaflet (fallback)...');
    
    try {
        // Correction pour les icônes Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
        });

        map = L.map('map', {
            maxBounds: window.REUNION_BOUNDS,
            maxBoundsViscosity: 1.0,
            gestureHandling: true,
            tap: true,
            touchZoom: true
        }).setView([window.PHARMACY.lat, window.PHARMACY.lng], 10);

        // Ajouter les tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);

        // Ajouter le marqueur de la pharmacie
        addPharmacyMarker();

        // Écouter les changements de taille de fenêtre
        window.addEventListener('resize', () => {
            if (map) {
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            }
        });
        
        console.log('✓ Leaflet initialisée avec succès (fallback)');
    } catch (error) {
        console.error('✗ Erreur lors de l\'initialisation de Leaflet:', error);
        showError('Impossible de charger la carte. Aucune bibliothèque de carte disponible.');
    }
}

// ============================================
// MARQUEURS
// ============================================

function addPharmacyMarker() {
    if (!map) return;
    
    if (mapType === 'google') {
        addPharmacyMarkerGoogle();
    } else if (mapType === 'leaflet') {
        addPharmacyMarkerLeaflet();
    }
}

function addPharmacyMarkerGoogle() {
    // Icône personnalisée pour la pharmacie
    const pharmacyIcon = {
        url: 'https://cdn-icons-png.flaticon.com/512/1087/1087915.png',
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
    };

    const pharmacyMarker = new google.maps.Marker({
        position: { lat: window.PHARMACY.lat, lng: window.PHARMACY.lng },
        map: map,
        icon: pharmacyIcon,
        title: window.PHARMACY.name,
        zIndex: 1000
    });

    const pharmacyInfoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 10px;">
            <b>${window.PHARMACY.name}</b><br>
            ${window.PHARMACY.address}<br>
            <button onclick="openGoogleMaps(${window.PHARMACY.lat}, ${window.PHARMACY.lng})" 
                    style="margin-top: 10px; padding: 5px 10px; background: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-directions"></i> Naviguer
            </button>
        </div>`
    });

    pharmacyMarker.addListener('click', () => {
        closeAllInfoWindows();
        pharmacyInfoWindow.open(map, pharmacyMarker);
    });

    markers.push(pharmacyMarker);
    markerStore.set('pharmacy', { marker: pharmacyMarker, infoWindow: pharmacyInfoWindow });
}

function addPharmacyMarkerLeaflet() {
    // Icône personnalisée pour la pharmacie
    const pharmacyIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1087/1087915.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const pharmacyMarker = L.marker([window.PHARMACY.lat, window.PHARMACY.lng], { icon: pharmacyIcon })
        .addTo(map)
        .bindPopup(`<b>${window.PHARMACY.name}</b><br>${window.PHARMACY.address}`);

    markers.push(pharmacyMarker);
}

// ============================================
// MISE À JOUR DE LA CARTE
// ============================================

function updateMap() {
    if (!map) {
        console.error("La carte n'est pas initialisée.");
        return;
    }

    if (mapType === 'google') {
        updateGoogleMap();
    } else if (mapType === 'leaflet') {
        updateLeafletMap();
    }
}

function updateGoogleMap() {
    // Effacer tous les marqueurs sauf la pharmacie
    markers.slice(1).forEach(marker => {
        if (marker.getMap) marker.setMap(null);
    });
    markers = markers.slice(0, 1); // Garder uniquement le marqueur de la pharmacie

    // Fermer toutes les info windows
    closeAllInfoWindows();

    // Effacer la polyligne si elle existe
    if (polyline && polyline.getMap) {
        polyline.setMap(null);
    }

    // Ajouter les marqueurs des commandes
    (window.orders || []).forEach((order, index) => {
        const marker = new google.maps.Marker({
            position: { lat: order.lat, lng: order.lng },
            map: map,
            title: `${index + 1}. ${order.customerName}`,
            zIndex: index + 2
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; min-width: 200px;">
                    <b>${index + 1}. ${order.customerName}</b><br>
                    ${order.address}<br>
                    <button onclick="openGoogleMaps(${order.lat}, ${order.lng})" 
                            style="margin-top: 10px; padding: 5px 10px; background: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-directions"></i> Naviguer
                    </button>
                </div>
            `
        });

        marker.addListener('click', () => {
            closeAllInfoWindows();
            infoWindow.open(map, marker);
        });

        markers.push(marker);
        markerStore.set(`order_${order.id}`, { marker: marker, infoWindow: infoWindow });
    });

    // Dessiner l'itinéraire
    if ((window.orders || []).length > 0) {
        const routePoints = [
            { lat: window.PHARMACY.lat, lng: window.PHARMACY.lng },
            ...(window.orders || []).map(o => ({ lat: o.lat, lng: o.lng }))
        ];

        polyline = new google.maps.Polyline({
            path: routePoints,
            geodesic: true,
            strokeColor: '#0000FF',
            strokeOpacity: 0.7,
            strokeWeight: 5,
            map: map
        });

        // Ajuster la vue pour montrer tous les points
        const bounds = new google.maps.LatLngBounds();
        routePoints.forEach(point => {
            bounds.extend(new google.maps.LatLng(point.lat, point.lng));
        });
        map.fitBounds(bounds, 50);
    } else {
        // Centrer sur la pharmacie
        map.setCenter({ lat: window.PHARMACY.lat, lng: window.PHARMACY.lng });
        map.setZoom(15);
    }
}

function updateLeafletMap() {
    // Effacer tous les marqueurs sauf la pharmacie
    markers.slice(1).forEach(marker => {
        if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    markers = markers.slice(0, 1); // Garder uniquement le marqueur de la pharmacie

    // Ajouter les marqueurs des commandes
    (window.orders || []).forEach((order, index) => {
        const marker = L.marker([order.lat, order.lng])
            .addTo(map)
            .bindPopup(`
                <b>${index + 1}. ${order.customerName}</b><br>
                ${order.address}<br>
                <button onclick="openGoogleMaps(${order.lat}, ${order.lng})" class="btn-google-maps mt-2">
                    <i class="fas fa-directions"></i> Naviguer
                </button>
            `);
        markers.push(marker);
    });

    // Dessiner l'itinéraire
    if ((window.orders || []).length > 0) {
        if (polyline && map.hasLayer(polyline)) map.removeLayer(polyline);

        const routePoints = [
            [window.PHARMACY.lat, window.PHARMACY.lng],
            ...(window.orders || []).map(o => [o.lat, o.lng])
        ];

        polyline = L.polyline(routePoints, {
            color: 'blue',
            weight: 5,
            opacity: 0.7
        }).addTo(map);

        map.fitBounds(routePoints);
    } else {
        map.setView([window.PHARMACY.lat, window.PHARMACY.lng], 15);
    }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function closeAllInfoWindows() {
    if (mapType === 'google') {
        markerStore.forEach(({ infoWindow }) => {
            infoWindow.close();
        });
    }
}

// Fonction pour obtenir la carte (compatibilité)
function getMap() {
    return map;
}

// Fonction pour vérifier si la carte est chargée
function isMapLoaded() {
    return !!map;
}
