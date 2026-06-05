// ============================================
// GÉOCODAGE (GOOGLE MAPS + NOMINATIM)
// ============================================

// Rechercher une adresse via Google Maps Geocoding API
async function searchAddressWithGoogle(query, apiKey) {
    if (!query || query.length < 3) return [];

    try {
        // Ajouter "La Réunion" à la requête pour restreindre la recherche
        const fullQuery = query + ', La Réunion';
        const encodedQuery = encodeURIComponent(fullQuery);
        
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            // Retourner les résultats avec formatage
            return data.results.map(result => ({
                address: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                place_id: result.place_id
            }));
        }
        return [];
    } catch (error) {
        console.error("Erreur Google Geocoding:", error);
        return [];
    }
}

// Rechercher une adresse via Nominatim (OpenStreetMap)
async function searchAddressWithNominatim(query) {
    if (!query || query.length < 3) return [];

    try {
        // Utiliser Nominatim avec des paramètres pour restreindre à La Réunion
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&bounded=1&viewbox=-21.4,-55.9,-20.8,-55.2&limit=5`
        );

        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const data = await response.json();

        // Filtrer les résultats pour ne garder que ceux à La Réunion
        return data
            .filter(item => {
                // Vérifier que les coordonnées sont dans les limites de La Réunion
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                return lat >= -21.4 && lat <= -20.8 && lng >= 55.2 && lng <= 55.9;
            })
            .map(item => ({
                address: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon)
            }));
    } catch (error) {
        console.error("Erreur Nominatim:", error);
        return [];
    }
}

// Rechercher une adresse (utilise Google Maps en priorité, fallback sur Nominatim)
async function searchAddress(query, apiKey) {
    if (!query || query.length < 3) {
        return [];
    }

    // Essayer d'abord avec Google Maps avec "La Réunion" ajouté (plus précis pour notre cas)
    const googleResultsWithReunion = await searchAddressWithGoogle(query + ', La Réunion', apiKey);
    if (googleResultsWithReunion.length > 0) {
        return googleResultsWithReunion;
    }

    // Si pas trouvé avec La Réunion, essayer avec l'adresse exacte
    const googleResultsExact = await searchAddressWithGoogle(query, apiKey);
    if (googleResultsExact.length > 0) {
        // Vérifier que les coordonnées sont bien à La Réunion
        const reunionResults = googleResultsExact.filter(result => {
            return result.lat >= -21.4 && result.lat <= -20.8 && 
                   result.lng >= 55.2 && result.lng <= 55.9;
        });
        if (reunionResults.length > 0) {
            return reunionResults;
        }
        // Si l'adresse est trouvée mais pas à La Réunion, retourner quand même
        // (l'utilisateur pourra confirmer ou corriger)
        return googleResultsExact;
    }

    // Fallback sur Nominatim si Google ne retourne rien
    const nominatimResults = await searchAddressWithNominatim(query);
    if (nominatimResults.length > 0) {
        return nominatimResults;
    }

    return [];
}

// Rechercher une adresse directement sur Google Maps sans restriction géographique
// Utilisé comme dernier recours pour trouver n'importe quelle adresse
async function searchAddressDirectGoogle(query, apiKey) {
    if (!query || query.length < 3) return [];

    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            return data.results.map(result => ({
                address: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                place_id: result.place_id
            }));
        }
        return [];
    } catch (error) {
        console.error("Erreur Google Geocoding (recherche directe):", error);
        return [];
    }
}

// Obtenir les coordonnées d'une adresse spécifique
async function getCoordinatesFromGoogle(address, apiKey) {
    const results = await searchAddressWithGoogle(address, apiKey);
    if (results.length > 0) {
        return {
            lat: results[0].lat,
            lng: results[0].lng,
            address: results[0].address
        };
    }
    return null;
}
