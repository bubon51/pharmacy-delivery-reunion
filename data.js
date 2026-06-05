// Adresse de la pharmacie (point de départ fixe : Saint-Suzanne)
const defaultPharmacy = {
    id: 1,
    name: "Pharmacie de Saint-Suzanne",
    address: "133 avenue du Mahatma Gandhi, 97441 Saint-Suzanne",
    lat: -20.9286,
    lng: 55.6142
};

// Commandes par défaut (exemples pour La Réunion)
const defaultOrders = [];

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
    return orders; // Retourne la liste complète des commandes
}

// Supprimer une commande
function deleteOrder(orderId) {
    const { orders } = loadData();
    const updatedOrders = orders.filter(order => order.id !== orderId);
    saveData(updatedOrders);
    return updatedOrders;
}

// Mettre à jour le statut d'une commande
function updateOrderStatus(orderId, newStatus) {
    const { orders } = loadData();
    const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    saveData(updatedOrders);
    return updatedOrders;
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
