// Adresse de la pharmacie (point de départ fixe : Saint-Suzanne)
const defaultPharmacy = {
    id: 1,
    name: "Pharmacie de Saint-Suzanne",
    address: "133 avenue du Mahatma Gandhi, 97441 Saint-Suzanne",
    lat: -20.9286,  // Coordonnées GPS pour Saint-Suzanne
    lng: 55.6142
};

// Commandes par défaut (exemples pour La Réunion)
const defaultOrders = [
    {
        id: Date.now().toString(),
        customerName: "M. Martin",
        address: "12 Rue de Paris, 97400 Saint-Denis",
        lat: -20.8785,
        lng: 55.4484,
        phone: "+262 692 123 456",
        priority: 0,
        status: "pending"
    },
    {
        id: (Date.now() + 1).toString(),
        customerName: "Mme Dupont",
        address: "45 Rue du Général de Gaulle, 97490 Sainte-Clotilde",
        lat: -20.8954,
        lng: 55.4592,
        phone: "+262 692 654 321",
        priority: 1,
        status: "pending"
    },
    {
        id: (Date.now() + 2).toString(),
        customerName: "Dr. Bernard",
        address: "78 Boulevard de la République, 97400 Saint-Denis",
        lat: -20.8806,
        lng: 55.4521,
        phone: "+262 692 987 654",
        priority: 0,
        status: "pending"
    }
];

// Charger les données depuis le localStorage
function loadData() {
    const savedOrders = localStorage.getItem('orders');
    return {
        pharmacy: defaultPharmacy, // Toujours utiliser la pharmacie par défaut
        orders: savedOrders ? JSON.parse(savedOrders) : defaultOrders
    };
}

// Sauvegarder les données dans le localStorage (ne sauvegarde que les commandes)
function saveData(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Ajouter une nouvelle commande
function addOrder(order) {
    const { orders } = loadData();
    orders.push(order);
    saveData(orders);
    return { pharmacy: defaultPharmacy, orders };
}

// Supprimer une commande
function deleteOrder(orderId) {
    const { orders } = loadData();
    const updatedOrders = orders.filter(order => order.id !== orderId);
    saveData(updatedOrders);
    return { pharmacy: defaultPharmacy, orders: updatedOrders };
}

// Mettre à jour le statut d'une commande
function updateOrderStatus(orderId, newStatus) {
    const { orders } = loadData();
    const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    saveData(updatedOrders);
    return { pharmacy: defaultPharmacy, orders: updatedOrders };
}

// Rechercher une adresse via Nominatim (OpenStreetMap)
async function searchAddress(query) {
    if (!query || query.length < 3) return [];

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},La Réunion&limit=5`
        );
        const data = await response.json();
        return data.map(item => ({
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        }));
    } catch (error) {
        console.error("Erreur lors de la recherche d'adresses :", error);
        return [];
    }
}

// Trouver l'adresse la plus proche
function findClosestAddress(targetLat, targetLng, addresses) {
    if (!addresses || addresses.length === 0) return null;

    return addresses.reduce((closest, address) => {
        const closestDistance = Math.sqrt(
            Math.pow(closest.lat - targetLat, 2) +
            Math.pow(closest.lng - targetLng, 2)
        );
        const currentDistance = Math.sqrt(
            Math.pow(address.lat - targetLat, 2) +
            Math.pow(address.lng - targetLng, 2)
        );
        return currentDistance < closestDistance ? address : closest;
    }, addresses[0]);
}
