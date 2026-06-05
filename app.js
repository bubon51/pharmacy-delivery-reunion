// Pharmacie fixe (point de départ)
const pharmacy = {
    id: 1,
    name: "Pharmacie de Saint-Suzanne",
    address: "133 avenue du Mahatma Gandhi, 97441 Saint-Suzanne",
    lat: -20.9286,
    lng: 55.6142
};

// Commandes (chargées depuis localStorage)
let orders = [];

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    orders = loadData().orders;
    initMap();
    renderOrdersList();
    setupEventListeners();
});

// Afficher la liste des commandes
function renderOrdersList() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="text-center text-muted py-3">Aucune commande en attente</div>';
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = `card order-card ${order.priority === 1 ? 'urgent' : ''}`;
        orderCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${order.customerName}</h5>
                <p class="card-text">${order.address}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        ${order.status === 'pending' ? 'En attente' :
                          order.status === 'in_progress' ? 'En cours' : 'Livrée'}
                    </small>
                    <div>
                        ${order.status === 'pending' ?
                            `<button class="btn btn-sm btn-outline-primary me-2" onclick="updateOrderStatus('${order.id}', 'in_progress')">
                                <i class="fas fa-play"></i> Démarrer
                             </button>` : ''}
                        ${order.status === 'in_progress' ?
                            `<button class="btn btn-sm btn-outline-success me-2" onclick="updateOrderStatus('${order.id}', 'delivered')">
                                <i class="fas fa-check"></i> Livrée
                             </button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="confirmDeleteOrder('${order.id}', '${order.customerName}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Ajouter une commande
    document.getElementById('addOrderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customerName').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const priority = document.getElementById('priority').checked ? 1 : 0;

        if (!customerName || !address) {
            showError("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        const suggestions = await searchAddress(address);
        let lat, lng;

        if (suggestions.length > 0) {
            lat = suggestions[0].lat;
            lng = suggestions[0].lng;
        } else {
            showError("Adresse non trouvée. Utilisation des coordonnées par défaut pour La Réunion.");
            lat = -20.9286; // Coordonnées de Saint-Suzanne
            lng = 55.6142;
        }

        const newOrder = {
            id: Date.now().toString(),
            customerName,
            address: suggestions.length > 0 ? suggestions[0].address : address,
            lat,
            lng,
            phone: phone || null,
            priority,
            status: 'pending'
        };

        // Ajouter la commande et mettre à jour la liste globale
        orders = addOrder(newOrder);

        document.getElementById('addOrderForm').reset();
        document.getElementById('addressSuggestions').style.display = 'none';
        renderOrdersList();
        updateMap(pharmacy, orders);
    });

    // Recherche d'adresses (autocomplétion)
    document.getElementById('address').addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length < 3) {
            document.getElementById('addressSuggestions').style.display = 'none';
            return;
        }

        const suggestions = await searchAddress(query);
        const suggestionsContainer = document.getElementById('addressSuggestions');

        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = '';
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'list-group-item';
                item.textContent = suggestion.address;
                item.addEventListener('click', () => {
                    document.getElementById('address').value = suggestion.address;
                    suggestionsContainer.style.display = 'none';
                });
                suggestionsContainer.appendChild(item);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Optimiser la tournée
    document.getElementById('optimizeRouteBtn').addEventListener('click', () => {
        const optimizedRoute = optimizeRoute(pharmacy, orders);
        updateMap(pharmacy, optimizedRoute);
        renderRouteSteps(optimizedRoute);
    });

    // Masquer les suggestions lorsque l'on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#address') && !e.target.closest('#addressSuggestions')) {
            document.getElementById('addressSuggestions').style.display = 'none';
        }
    });
}

// Fonction pour supprimer une commande
function confirmDeleteOrder(orderId, customerName) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande de ${customerName} ?`)) {
        orders = deleteOrder(orderId);
        renderOrdersList();
        updateMap(pharmacy, orders);
    }
}

// Optimiser la tournée (algorithme du plus proche voisin)
function optimizeRoute(pharmacy, orders) {
    if (orders.length === 0) return [];

    const remainingOrders = [...orders];
    const optimizedRoute = [];
    let currentLat = pharmacy.lat;
    let currentLng = pharmacy.lng;

    while (remainingOrders.length > 0) {
        let nearestIndex = 0;
        let minDistance = Infinity;

        remainingOrders.forEach((order, index) => {
            const distance = Math.sqrt(
                Math.pow(order.lat - currentLat, 2) +
                Math.pow(order.lng - currentLng, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = index;
            }
        });

        optimizedRoute.push(remainingOrders[nearestIndex]);
        currentLat = remainingOrders[nearestIndex].lat;
        currentLng = remainingOrders[nearestIndex].lng;
        remainingOrders.splice(nearestIndex, 1);
    }

    return optimizedRoute;
}

// Afficher les étapes de l'itinéraire optimisé
function renderRouteSteps(route) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    if (route.length === 0) {
        stepsList.innerHTML = '<div class="text-center text-muted py-2">Aucune tournée optimisée</div>';
        return;
    }

    // Ajouter la pharmacie comme première étape
    const pharmacyStep = document.createElement('div');
    pharmacyStep.className = 'step-item';
    pharmacyStep.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="step-number">1</div>
            <div>
                <strong>${pharmacy.name}</strong><br>
                <small>${pharmacy.address}</small>
            </div>
        </div>
        <button class="btn-waze" onclick="openWaze(${pharmacy.lat}, ${pharmacy.lng})">
            <i class="fas fa-directions"></i> Waze
        </button>
    `;
    stepsList.appendChild(pharmacyStep);

    // Ajouter les commandes
    route.forEach((order, index) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="step-number">${index + 2}</div>
                <div>
                    <strong>${order.customerName}</strong><br>
                    <small>${order.address}</small>
                </div>
            </div>
            <button class="btn-waze" onclick="openWaze(${order.lat}, ${order.lng})">
                <i class="fas fa-directions"></i> Waze
            </button>
        `;
        stepsList.appendChild(stepItem);
    });
}

// Afficher une erreur dans une modal
function showError(message) {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    document.getElementById('errorMessage').textContent = message;
    errorModal.show();
}

// Mettre à jour le statut d'une commande
function updateOrderStatus(orderId, newStatus) {
    orders = updateOrderStatus(orderId, newStatus);
    renderOrdersList();
    updateMap(pharmacy, orders);
}
