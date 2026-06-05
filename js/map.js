// GOOGLE MAPS INTEGRATION
// ============================================

// Variables globales pour Google Maps
let googleMap;
let googleMarkers = [];
let googlePolyline;
let googleInfoWindows = [];

// Stockage des marqueurs et info windows
const markerStore = new Map();
=======
// ============================================
// GOOGLE MAPS INTEGRATION
// ============================================

// Variables globales pour Google Maps
let googleMap;
let googleMarkers = [];
let googlePolyline;
let googleInfoWindows = [];

// Stockage des marqueurs et info windows
const markerStore = new Map();

// Référence à la variable orders (définie dans app.js)
// Cette variable sera accessible car map.js est chargé après config.js
// et avant app.js, mais les fonctions updateMap() sont appelées depuis app.js
// où orders est défini.GOOGLE MAPS INTEGRATION
// ============================================

// Variables globales pour Google Maps
let googleMap;
let googleMarkers = [];
let googlePolyline;
let googleInfoWindows = [];

// Stockage des marqueurs et info windows
const markerStore = new Map();

// Callback pour l'API Google Maps
function initGoogleMapsAPI() {
    console.log('Google Maps API chargée avec succès');
    // L'initialisation de la carte se fera dans initMap()
}

// ============================================
// FONCTIONS DE CARTE GOOGLE MAPS
// ============================================

function initMap() {
    if (googleMap) return;

    // Créer la carte centrée sur La Réunion
    googleMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -20.8785, lng: 55.4484 },
        zoom: 10,
        minZoom: 8,
        maxZoom: 18,
        gestureHandling: 'greedy',
        fullscreenControl: false,
        mapTypeControl: true,
        streetViewControl: false,
        styles: getMapStyles(),
        restriction: {
            latLngBounds: {
                north: -20.8,
                south: -21.4,
                east: 55.9,
                west: 55.2
            },
            strictBounds: true
        }
    });

    // Limiter la carte à La Réunion
    const reunionBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-21.4, 55.2),
        new google.maps.LatLng(-20.8, 55.9)
    );
    googleMap.fitBounds(reunionBounds);

    // Ajouter le marqueur de la pharmacie
    addPharmacyMarker();

    // Écouter les changements de taille de fenêtre
    window.addEventListener('resize', () => {
        if (googleMap) {
            google.maps.event.trigger(googleMap, 'resize');
        }
    });
}
=======
// ============================================
// GOOGLE MAPS INTEGRATION
// ============================================

// Variables globales pour Google Maps
let googleMap;
let googleMarkers = [];
let googlePolyline;
let googleInfoWindows = [];

// Stockage des marqueurs et info windows
const markerStore = new Map();

// Callback pour l'API Google Maps
function initGoogleMapsAPI() {
    console.log('Google Maps API chargée avec succès');
    // L'initialisation de la carte se fera dans initMap()
}

// ============================================
// FONCTIONS DE CARTE GOOGLE MAPS
// ============================================

function initMap() {
    if (googleMap) return;

    // Créer la carte centrée sur La Réunion
    googleMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: window.PHARMACY.lat, lng: window.PHARMACY.lng },
        zoom: 10,
        minZoom: 8,
        maxZoom: 18,
        gestureHandling: 'greedy',
        fullscreenControl: false,
        mapTypeControl: true,
        streetViewControl: false,
        styles: getMapStyles(),
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
    googleMap.fitBounds(reunionBounds);

    // Ajouter le marqueur de la pharmacie
    addPharmacyMarker();

    // Écouter les changements de taille de fenêtre
    window.addEventListener('resize', () => {
        if (googleMap) {
            google.maps.event.trigger(googleMap, 'resize');
        }
    });
}============================================
// GOOGLE MAPS INTEGRATION
// ============================================

// Variables globales pour Google Maps
let googleMap;
let googleMarkers = [];
let googlePolyline;
let googleInfoWindows = [];

// Stockage des marqueurs et info windows
const markerStore = new Map();

// Callback pour l'API Google Maps
function initGoogleMapsAPI() {
    console.log('Google Maps API chargée avec succès');
    // L'initialisation de la carte se fera dans initMap()
}

// ============================================
// FONCTIONS DE CARTE GOOGLE MAPS
// ============================================

function initMap() {
    if (googleMap) return;

    // Créer la carte centrée sur La Réunion
    googleMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -20.8785, lng: 55.4484 },
        zoom: 10,
        minZoom: 8,
        maxZoom: 18,
        gestureHandling: 'greedy',
        fullscreenControl: false,
        mapTypeControl: true,
        streetViewControl: false,
        styles: getMapStyles(),
        restriction: {
            latLngBounds: {
                north: -20.8,
                south: -21.4,
                east: 55.9,
                west: 55.2
            },
            strictBounds: true
        }
    });

    // Limiter la carte à La Réunion
    const reunionBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-21.4, 55.2),
        new google.maps.LatLng(-20.8, 55.9)
    );
    googleMap.fitBounds(reunionBounds);

    // Ajouter le marqueur de la pharmacie
    addPharmacyMarker();

    // Écouter les changements de taille de fenêtre
    window.addEventListener('resize', () => {
        if (googleMap) {
            google.maps.event.trigger(googleMap, 'resize');
        }
    });
}

function getMapStyles() {
    // Style personnalisé pour une meilleure visibilité
    return [
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                { "color": "#a2daf2" }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry",
            "stylers": [
                { "color": "#f7f1df" }
            ]
        },
        {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [
                { "color": "#d0e3b4" }
            ]
        },
        {
            "featureType": "landscape.natural.terrain",
            "elementType": "geometry",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
                { "color": "#bde6ab" }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "poi.medical",
            "elementType": "geometry",
            "stylers": [
                { "color": "#fbd3da" }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                { "color": "#f8c967" }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
                { "color": "#e9bc62" }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
                { "color": "#fbbf24" }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                { "color": "#f8c967" }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
                { "color": "#a76df6" }
            ]
        }
    ];
}

function addPharmacyMarker() {
    if (!googleMap) return;

    // Icône personnalisée pour la pharmacie
    const pharmacyIcon = {
        url: 'https://cdn-icons-png.flaticon.com/512/1087/1087915.png',
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
    };

    const pharmacyMarker = new google.maps.Marker({
        position: { lat: window.PHARMACY.lat, lng: window.PHARMACY.lng },
        map: googleMap,
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
        pharmacyInfoWindow.open(googleMap, pharmacyMarker);
    });

    googleMarkers.push(pharmacyMarker);
    markerStore.set('pharmacy', { marker: pharmacyMarker, infoWindow: pharmacyInfoWindow });
}

function updateMap() {
    if (!googleMap) {
        console.error("La carte Google Maps n'est pas initialisée.");
        return;
    }

    // Effacer tous les marqueurs sauf la pharmacie
    googleMarkers.slice(1).forEach(marker => {
        if (marker.getMap()) marker.setMap(null);
    });
    googleMarkers = googleMarkers.slice(0, 1); // Garder uniquement le marqueur de la pharmacie

    // Fermer toutes les info windows
    closeAllInfoWindows();

    // Effacer la polyligne si elle existe
    if (googlePolyline && googlePolyline.getMap()) {
        googlePolyline.setMap(null);
    }

    // Ajouter les marqueurs des commandes
    (window.orders || []).forEach((order, index) => {
        const marker = new google.maps.Marker({
            position: { lat: order.lat, lng: order.lng },
            map: googleMap,
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
            infoWindow.open(googleMap, marker);
        });

        googleMarkers.push(marker);
        markerStore.set(`order_${order.id}`, { marker: marker, infoWindow: infoWindow });
    });

    // Dessiner l'itinéraire
    if ((window.orders || []).length > 0) {
        const routePoints = [
            { lat: window.PHARMACY.lat, lng: window.PHARMACY.lng },
            ...(window.orders || []).map(o => ({ lat: o.lat, lng: o.lng }))
        ];

        googlePolyline = new google.maps.Polyline({
            path: routePoints,
            geodesic: true,
            strokeColor: '#0000FF',
            strokeOpacity: 0.7,
            strokeWeight: 5,
            map: googleMap
        });

        // Ajuster la vue pour montrer tous les points
        const bounds = new google.maps.LatLngBounds();
        routePoints.forEach(point => {
            bounds.extend(new google.maps.LatLng(point.lat, point.lng));
        });
        googleMap.fitBounds(bounds, 50);
    } else {
        // Centrer sur la pharmacie
        googleMap.setCenter({ lat: window.PHARMACY.lat, lng: window.PHARMACY.lng });
        googleMap.setZoom(15);
    }
}

function closeAllInfoWindows() {
    markerStore.forEach(({ infoWindow }) => {
        infoWindow.close();
    });
}

// Fonction pour obtenir la carte (compatibilité)
function getMap() {
    return googleMap;
}

// Fonction pour vérifier si la carte est chargée
function isMapLoaded() {
    return !!googleMap && typeof google !== 'undefined' && google.maps;
}
