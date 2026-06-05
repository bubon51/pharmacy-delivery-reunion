// ============================================
// CONFIGURATION GLOBALE
// ============================================

// Configuration de la pharmacie (point de départ)
const PHARMACY = {
    id: 1,
    name: "Pharmacie de Saint-Suzanne",
    address: "133 avenue du Mahatma Gandhi, 97441 Saint-Suzanne",
    lat: -20.932179057032947,
    lng: 55.64139511027464
};

// Limites géographiques de La Réunion
const REUNION_BOUNDS = [
    [-21.4, 55.2],  // Sud-Ouest
    [-20.8, 55.9]   // Nord-Est
];

// Clé API Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyCB0pbjbeibF0-axu9b3EbOGn8M0U7p0mc';

// Configuration de la carte
const MAP_CONFIG = {
    defaultZoom: 10,
    maxZoom: 18,
    minZoom: 8,
    gestureHandling: true,
    tap: true,
    touchZoom: true
};

// Export pour les autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PHARMACY,
        REUNION_BOUNDS,
        GOOGLE_MAPS_API_KEY,
        MAP_CONFIG
    };
}
