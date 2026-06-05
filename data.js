const defaultPharmacy = {
    id: 1,
    name: "Pharmacie Centrale",
    address: "12 Rue de Paris, 97400 Saint-Denis",
    lat: -20.8785,
    lng: 55.4484
};

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

function loadData() {
    const savedPharmacy = localStorage.getItem('pharmacy');
    const savedOrders = localStorage.getItem('orders');
    return {
        pharmacy: savedPharmacy ? JSON.parse(savedPharmacy) : defaultPharmacy,
        orders: savedOrders ? JSON.parse(savedOrders) : defaultOrders
    };
}

function saveData(pharmacy, orders) {
    localStorage.setItem('pharmacy', JSON.stringify(pharmacy));
    localStorage.setItem('orders', JSON.stringify(orders));
}

function addOrder(order) {
    const { pharmacy, orders } = loadData();
    orders.push(order);
    saveData(pharmacy, orders);
    return { pharmacy, orders };
}

function deleteOrder(orderId) {
    const { pharmacy, orders } = loadData();
    const updatedOrders = orders.filter(order => order.id !== orderId);
    saveData(pharmacy, updatedOrders);
    return { pharmacy, orders: updatedOrders };
}

function updateOrderStatus(orderId, newStatus) {
    const { pharmacy, orders } = loadData();
    const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    saveData(pharmacy, updatedOrders);
    return { pharmacy, orders: updatedOrders };
}

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