// ============================================
// ROUTAGE (GOOGLE MAPS DIRECTIONS + OSRM FALLBACK)
// ============================================

// Calculer la distance et la durée entre deux points via Google Maps Directions API
async function getRouteDistanceWithGoogle(lat1, lng1, lat2, lng2, apiKey) {
    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lng1}&destination=${lat2},${lng2}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            return {
                distance: route.legs[0].distance.value, // en mètres
                duration: route.legs[0].duration.value // en secondes
            };
        }
        return null;
    } catch (error) {
        console.error("Erreur Google Maps Directions:", error);
        return null;
    }
}

// Calculer la distance et la durée entre deux points via OSRM (fallback)
async function getRouteDistanceWithOSRM(lat1, lng1, lat2, lng2) {
    try {
        // Utiliser l'API OSRM (demo server)
        const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            return {
                distance: data.routes[0].distance, // en mètres
                duration: data.routes[0].duration // en secondes
            };
        }
        return null;
    } catch (error) {
        console.error("Erreur OSRM:", error);
        return null;
    }
}

// Calculer la distance et la durée entre deux points
// Priorité: Google Maps Directions > OSRM > calcul à vol d'oiseau
async function getRouteDistance(lat1, lng1, lat2, lng2, apiKey) {
    // Essayer d'abord avec Google Maps Directions (plus précis pour La Réunion)
    const googleResult = await getRouteDistanceWithGoogle(lat1, lng1, lat2, lng2, apiKey);
    if (googleResult) {
        return googleResult;
    }
    
    // Fallback sur OSRM
    const osrmResult = await getRouteDistanceWithOSRM(lat1, lng1, lat2, lng2);
    if (osrmResult) {
        return osrmResult;
    }
    
    // Fallback final: estimation basée sur la distance à vol d'oiseau
    // Note: Ce calcul est moins précis mais garantit que l'application fonctionne toujours
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const distance = Math.sqrt(dx * dx + dy * dy) * 111320; // ~111km par degré
    return { distance, duration: distance / 13.89 }; // ~50km/h estimation
}

// Calculer la matrice de distances entre plusieurs points
async function calculateDistanceMatrix(points, apiKey) {
    const matrix = [];
    
    for (let i = 0; i < points.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < points.length; j++) {
            if (i === j) {
                matrix[i][j] = { distance: 0, duration: 0 };
            } else {
                const result = await getRouteDistance(
                    points[i].lat, points[i].lng,
                    points[j].lat, points[j].lng,
                    apiKey
                );
                matrix[i][j] = result || { distance: 0, duration: 0 };
            }
        }
    }
    
    return matrix;
}

// Optimiser la tournée en tenant compte des routes réelles
async function optimizeRouteWithRealRoutes(pharmacy, orders, apiKey) {
    if (orders.length === 0) return [];
    
    // Créer la liste des points (pharmacie + commandes)
    const allPoints = [
        { id: 'pharmacy', lat: pharmacy.lat, lng: pharmacy.lng, isPharmacy: true },
        ...orders.map(order => ({ 
            id: order.id, 
            lat: order.lat, 
            lng: order.lng, 
            isPharmacy: false,
            order: order
        }))
    ];
    
    // Calculer la matrice de distances
    const distanceMatrix = await calculateDistanceMatrix(allPoints, apiKey);
    
    // Algorithme du plus proche voisin avec distances réelles
    const optimizedRoute = [];
    let currentIndex = 0; // Commencer par la pharmacie
    const visited = new Set();
    visited.add(0); // Marquer la pharmacie comme visitée
    
    while (visited.size < allPoints.length) {
        let nearestIndex = -1;
        let minDistance = Infinity;
        
        for (let j = 0; j < allPoints.length; j++) {
            if (!visited.has(j)) {
                const dist = distanceMatrix[currentIndex][j].distance;
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestIndex = j;
                }
            }
        }
        
        if (nearestIndex !== -1) {
            optimizedRoute.push(allPoints[nearestIndex]);
            visited.add(nearestIndex);
            currentIndex = nearestIndex;
        }
    }
    
    // Retourner uniquement les commandes (sans la pharmacie) dans l'ordre optimisé
    return optimizedRoute
        .filter(point => !point.isPharmacy)
        .map(point => point.order);
}

// Calculer la distance totale et la durée de la tournée
async function calculateRouteStats(pharmacy, route, apiKey) {
    if (route.length === 0) {
        return { totalDistance: 0, totalDuration: 0, steps: [] };
    }
    
    const allPoints = [
        { lat: pharmacy.lat, lng: pharmacy.lng, name: pharmacy.name },
        ...route.map(order => ({ lat: order.lat, lng: order.lng, name: order.customerName }))
    ];
    
    let totalDistance = 0;
    let totalDuration = 0;
    const steps = [];
    
    for (let i = 0; i < allPoints.length - 1; i++) {
        const result = await getRouteDistance(
            allPoints[i].lat, allPoints[i].lng,
            allPoints[i + 1].lat, allPoints[i + 1].lng,
            apiKey
        );
        
        const distance = result ? result.distance : 0;
        const duration = result ? result.duration : 0;
        
        totalDistance += distance;
        totalDuration += duration;
        
        steps.push({
            from: allPoints[i].name,
            to: allPoints[i + 1].name,
            distance: distance,
            duration: duration
        });
    }
    
    return {
        totalDistance: Math.round(totalDistance / 1000 * 10) / 10, // en km
        totalDuration: Math.round(totalDuration / 60), // en minutes
        steps: steps
    };
}

// Trouver la commande la plus proche d'un point donné
function findClosestOrder(lat, lng, orders) {
    if (orders.length === 0) return null;
    
    let closest = null;
    let minDistance = Infinity;
    
    orders.forEach(order => {
        const dx = order.lng - lng;
        const dy = order.lat - lat;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
            minDistance = distance;
            closest = order;
        }
    });
    
    return closest;
}
