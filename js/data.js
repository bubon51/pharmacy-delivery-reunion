// ============================================
// GESTION DES DONNÉES
// ============================================

// Charger les commandes depuis localStorage
function loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
}

// Sauvegarder les commandes dans localStorage
function saveOrders(orders) {
    try {
        localStorage.setItem('orders', JSON.stringify(orders));
        return true;
    } catch (e) {
        console.error("Erreur lors de la sauvegarde des commandes :", e);
        return false;
    }
}

// Ajouter une nouvelle commande
function addOrder(order) {
    const orders = loadOrders();
    orders.push(order);
    saveOrders(orders);
    return orders;
}

// Supprimer une commande
function deleteOrder(orderId) {
    const orders = loadOrders();
    const updatedOrders = orders.filter(order => order.id !== orderId);
    saveOrders(updatedOrders);
    return updatedOrders;
}

// Mettre à jour le statut d'une commande
function updateOrderStatus(orderId, newStatus) {
    const orders = loadOrders();
    const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    saveOrders(updatedOrders);
    return updatedOrders;
}

// Récupérer tous les clients uniques
function getAllCustomers(orders) {
    const customerMap = new Map();
    
    orders.forEach(order => {
        if (!customerMap.has(order.customerName.toLowerCase())) {
            customerMap.set(order.customerName.toLowerCase(), {
                name: order.customerName,
                address: order.address,
                lat: order.lat,
                lng: order.lng,
                phone: order.phone
            });
        }
    });
    
    return Array.from(customerMap.values());
}

// Rechercher des clients par nom
function searchCustomers(orders, query) {
    if (!query || query.length < 2) return [];
    
    const allCustomers = getAllCustomers(orders);
    const lowerQuery = query.toLowerCase();
    
    return allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(lowerQuery)
    );
}

// Trouver la commande la plus proche
function findClosestOrder(targetLat, targetLng, orders) {
    if (orders.length === 0) return null;
    
    let closest = null;
    let minDistance = Infinity;
    
    orders.forEach(order => {
        const distance = Math.sqrt(
            Math.pow(order.lat - targetLat, 2) +
            Math.pow(order.lng - targetLng, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            closest = order;
        }
    });
    
    return closest;
}
