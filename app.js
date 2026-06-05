let pharmacy = defaultPharmacy;
let orders = defaultOrders;
let optimizedRoute = [];

document.addEventListener('DOMContentLoaded', () => {
    const { pharmacy: savedPharmacy, orders: savedOrders } = loadData();
    pharmacy = savedPharmacy;
    orders = savedOrders;

    initMap(pharmacy);
    renderOrdersList();
    setupEventListeners();
});

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
                            `<button class="btn btn-sm btn-outline-success" onclick="updateOrderStatus('${order.id}', 'delivered')">
                                <i class="fas fa-check"></i> Livrée
                             </button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

function setupEventListeners() {
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
            lat = -20.8785;
            lng = 55.4484;
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

        const { pharmacy: updatedPharmacy, orders: updatedOrders } = addOrder(newOrder);
        pharmacy = updatedPharmacy;
        orders = updatedOrders;

        document.getElementById('addOrderForm').reset();
        document.getElementById('addressSuggestions').style.display = 'none';
        renderOrdersList();
        updateMap(pharmacy, orders);
    });

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

    document.getElementById('optimizeRouteBtn').addEventListener('click', () => {
        optimizedRoute = optimizeRoute(pharmacy, orders);
        updateMap(pharmacy, optimizedRoute);
        renderRouteSteps(optimizedRoute);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#address') && !e.target.closest('#addressSuggestions')) {
            document.getElementById('addressSuggestions').style.display = 'none';
        }
    });
}

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

function renderRouteSteps(route) {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';

    if (route.length === 0) {
        stepsList.innerHTML = '<div class="text-center text-muted py-2">Aucune tournée optimisée</div>';
        return;
    }

    route.forEach((order, index) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="step-number">${index + 1}</div>
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

function showError(message) {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    document.getElementById('errorMessage').textContent = message;
    errorModal.show();
}

function deleteOrder(orderId) {
    const { pharmacy: updatedPharmacy, orders: updatedOrders } = deleteOrder(orderId);
    pharmacy = updatedPharmacy;
    orders = updatedOrders;
    renderOrdersList();
    updateMap(pharmacy, orders);
}

function updateOrderStatus(orderId, newStatus) {
    const { pharmacy: updatedPharmacy, orders: updatedOrders } = updateOrderStatus(orderId, newStatus);
    pharmacy = updatedPharmacy;
    orders = updatedOrders;
    renderOrdersList();
    updateMap(pharmacy, orders);
}