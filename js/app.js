// ============================================
// APPLICATION PRINCIPALE
// ============================================

// Variables globales
window.orders = loadOrders() || [];
window.pendingGPSOrder = null;
window.pendingClosestAddress = null;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser la carte (sera appelée quand Google Maps API sera prête)
    const initApp = () => {
        initMap();
        renderOrders();
        setupEventListeners();
        
        // Initialiser les optimisations mobiles
        if (isMobileDevice()) {
            setupMobileOptimizations();
        }
        
        // Mettre à jour la date de dernière mise à jour
        updateLastUpdatedDate();
    };
    
    // Si Google Maps API est déjà chargée, initialiser maintenant
    if (typeof google !== 'undefined' && google.maps) {
        initApp();
    } else {
        // Sinon, attendre que l'API soit chargée
        const checkGoogleMaps = setInterval(() => {
            if (typeof google !== 'undefined' && google.maps) {
                clearInterval(checkGoogleMaps);
                initApp();
            }
        }, 100);
        
        // Timeout de sécurité après 10 secondes
        setTimeout(() => {
            clearInterval(checkGoogleMaps);
            if (typeof google === 'undefined' || !google.maps) {
                console.error('Google Maps API non chargée après 10 secondes');
                showError('Impossible de charger Google Maps. Vérifiez votre connexion internet.');
            }
        }, 10000);
    }
});

function updateLastUpdatedDate() {
    const dateEl = document.getElementById('lastUpdatedDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleString('fr-FR');
    }
}

// ============================================
// FONCTIONS DE CARTE (délégées à map.js)
// ============================================

// initMap() et updateMap() sont définies dans map.js

// ============================================
// FONCTIONS DE RENDU
// ============================================

function renderOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    container.innerHTML = window.orders.length === 0
        ? '<div class="text-center text-muted py-3">Aucune commande en attente</div>'
        : window.orders.map((order, index) => {
            const escapedName = order.customerName.replace(/'/g, "\\'");
            return `
                <div class="card order-card ${order.priority ? 'urgent' : ''} mb-2">
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
                                <button class="btn btn-sm btn-danger" onclick="confirmDeleteOrder('${order.id}', '${escapedName}')">
                                    <i class="fas fa-trash"></i> Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

async function renderRouteSteps() {
    const container = document.getElementById('stepsList');
    if (!container) return;

    if (window.orders.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-2">Aucune tournée optimisée</div>';
        renderRouteStats(null);
        return;
    }

    // Calculer les stats de la tournée
    const stats = await calculateRouteStats(PHARMACY, window.orders);
    renderRouteStats(stats);

    container.innerHTML = `
        <div class="step-item">
            <div class="d-flex align-items-center">
                <div class="step-number">1</div>
                <div>
                    <strong>${PHARMACY.name}</strong><br>
                    <small>${PHARMACY.address}</small>
                </div>
            </div>
            <button class="btn-google-maps" onclick="openGoogleMaps(${PHARMACY.lat}, ${PHARMACY.lng})">
                <i class="fas fa-directions"></i> Google Maps
            </button>
        </div>
        ${window.orders.map((order, index) => {
            const escapedName = order.customerName.replace(/'/g, "\\'");
            return `
                <div class="step-item">
                    <div class="d-flex align-items-center">
                        <div class="step-number">${index + 2}</div>
                        <div>
                            <strong>${order.customerName}</strong><br>
                            <small>${order.address}</small>
                        </div>
                    </div>
                    <button class="btn-google-maps" onclick="openGoogleMaps(${order.lat}, ${order.lng})">
                        <i class="fas fa-directions"></i> Google Maps
                    </button>
                </div>
            `;
        }).join('')}
    `;
}

function renderRouteStats(stats) {
    const container = document.getElementById('routeStats');
    if (!container) return;

    if (!stats || stats.totalDistance === 0) {
        container.innerHTML = '<div class="text-center text-muted py-2">Aucune tournée en cours</div>';
        return;
    }

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="stat-card">
                <div class="stat-value">${stats.totalDistance} km</div>
                <div class="stat-label"><i class="fas fa-road"></i> Distance totale</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalDuration} min</div>
                <div class="stat-label"><i class="fas fa-clock"></i> Durée estimée</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${window.orders.length}</div>
                <div class="stat-label"><i class="fas fa-map-marker-alt"></i> Arrêts</div>
            </div>
        </div>
    `;
}

// ============================================
// FONCTIONS D'ACTIONS
// ============================================

function addOrderToList(customerName, address, lat, lng, phone, priority) {
    const newOrder = {
        id: Date.now().toString(),
        customerName,
        address,
        lat,
        lng,
        phone: phone || null,
        priority,
        status: 'pending'
    };
    
    window.orders.push(newOrder);
    saveOrders(window.orders);
    renderOrders();
    updateMap();
    renderRouteSteps();
}

function updateOrderStatus(orderId, newStatus) {
    window.orders = window.orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    saveOrders(window.orders);
    renderOrders();
    updateMap();
}

function confirmDeleteOrder(orderId, customerName) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande de ${customerName} ?`)) {
        window.orders = deleteOrder(orderId);
        renderOrders();
        updateMap();
        renderRouteSteps();
    }
}

// ============================================
// FONCTIONS DE NAVIGATION
// ============================================

async function openGoogleMaps(lat, lng) {
    try {
        // Copier les coordonnées dans le presse-papiers
        const coordsText = `${lat}, ${lng}`;
        await navigator.clipboard.writeText(coordsText);
        
        // Ouvrir Google Maps avec les coordonnées
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        
        // Afficher une confirmation
        showError(`Coordonnées copiées: ${coordsText}. Google Maps s'ouvre avec ces coordonnées.`);
    } catch (err) {
        console.error('Impossible de copier dans le presse-papiers:', err);
        // Ouvrir Google Maps quand même
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        showError('Google Maps ouvert. Copiez manuellement les coordonnées si nécessaire.');
    }
}

// ============================================
// FONCTIONS D'OPTIMISATION
// ============================================

async function optimizeRoute() {
    if (window.orders.length === 0) {
        showError("Aucune commande à optimiser.");
        return;
    }

    // Afficher un message de chargement
    showError("Optimisation de la tournée en cours... Veuillez patienter.");

    try {
        // Utiliser l'optimisation avec les routes réelles
        const optimizedRoute = await optimizeRouteWithRealRoutes(PHARMACY, window.orders);
        
        if (optimizedRoute.length > 0) {
            window.orders = optimizedRoute;
            saveOrders(window.orders);
            renderOrders();
            updateMap();
            renderRouteSteps();
            
            // Calculer et afficher les statistiques de la tournée
            const stats = await calculateRouteStats(PHARMACY, window.orders);
            renderRouteStats(stats);
            
            // Afficher une notification
            setTimeout(() => {
                showError(`Tournée optimisée ! Distance: ${stats.totalDistance} km, Durée: ${stats.totalDuration} min`);
            }, 500);
        }
    } catch (error) {
        console.error("Erreur lors de l'optimisation:", error);
        showError("Erreur lors de l'optimisation de la tournée. Utilisation de l'ancienne méthode.");
        
        // Revenir à l'ancienne méthode en cas d'erreur
        const route = [];
        let currentLat = PHARMACY.lat;
        let currentLng = PHARMACY.lng;
        const remaining = [...window.orders];

        while (remaining.length > 0) {
            let nearestIndex = 0;
            let minDistance = Infinity;

            remaining.forEach((order, index) => {
                const distance = Math.sqrt(
                    Math.pow(order.lat - currentLat, 2) +
                    Math.pow(order.lng - currentLng, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIndex = index;
                }
            });

            if (nearestIndex !== -1) {
                route.push(remaining[nearestIndex]);
                currentLat = remaining[nearestIndex].lat;
                currentLng = remaining[nearestIndex].lng;
                remaining.splice(nearestIndex, 1);
            } else {
                route.push(remaining[0]);
                remaining.shift();
            }
        }

        window.orders = route;
        saveOrders(window.orders);
        renderOrders();
        updateMap();
        renderRouteSteps();
    }
}

// ============================================
// FONCTIONS D'AUTOCOMPLÉTION
// ============================================

function showCustomerSuggestions(suggestions) {
    const container = document.getElementById('customerSuggestions');
    if (!container) return;

    if (suggestions.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = suggestions.map(customer => {
        const escapedName = customer.name.replace(/'/g, "\\'");
        const escapedAddress = customer.address.replace(/'/g, "\\'");
        return `
            <div class="list-group-item" onclick="selectCustomer('${escapedName}', '${escapedAddress}', ${customer.lat}, ${customer.lng}, '${customer.phone || ''}')">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${customer.name}</strong>
                        <div class="small text-muted">${customer.address}</div>
                    </div>
                    <i class="fas fa-user-check text-primary"></i>
                </div>
            </div>
        `;
    }).join('');

    container.style.display = 'block';
}

function selectCustomer(name, address, lat, lng, phone) {
    document.getElementById('customerName').value = name;
    document.getElementById('address').value = address;
    document.getElementById('phone').value = phone || '';
    document.getElementById('customerSuggestions').style.display = 'none';
    document.getElementById('addressSuggestions').style.display = 'none';
}

function showAddressSuggestions(suggestions) {
    const container = document.getElementById('addressSuggestions');
    if (!container) return;

    if (suggestions.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = suggestions.map(s => {
        const escapedAddress = s.address.replace(/'/g, "\\'");
        return `
            <div class="list-group-item" onclick="selectAddress('${escapedAddress}', ${s.lat}, ${s.lng})">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${s.address}</span>
                    <small class="text-muted">
                        <i class="fas fa-map-marker-alt"></i> ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}
                    </small>
                </div>
            </div>
        `;
    }).join('');

    container.style.display = 'block';
}

function selectAddress(address, lat, lng) {
    document.getElementById('address').value = address;
    document.getElementById('addressSuggestions').style.display = 'none';
}

// ============================================
// FONCTIONS DE SAISIE MANUELLE GPS
// ============================================

function showManualGPSModal() {
    // Stocker les données du formulaire en attente
    const customerName = document.getElementById('customerName').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const priority = document.getElementById('priority').checked ? 1 : 0;

    if (!customerName) {
        showError("Veuillez indiquer un nom de client.");
        return;
    }

    // Stocker les données en attente
    window.pendingGPSOrder = {
        customerName: customerName,
        address: address,
        phone: phone,
        priority: priority
    };

    // Vider le champ de coordonnées
    document.getElementById('gpsCoordinates').value = '';

    // Fermer la modal actuelle
    const closestModalEl = document.getElementById('closestAddressModal');
    if (closestModalEl) {
        const closestModal = bootstrap.Modal.getInstance(closestModalEl);
        closestModal.hide();
    }

    // Afficher la modal de saisie manuelle
    const manualModalEl = document.getElementById('manualGPSModal');
    if (manualModalEl) {
        const manualModal = new bootstrap.Modal(manualModalEl);
        manualModal.show();
    }
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('gpsCoordinates').value = text;
    } catch (err) {
        console.error('Impossible de lire le presse-papiers:', err);
        showError('Impossible de coller depuis le presse-papiers. Veuillez copier manuellement les coordonnées.');
    }
}

function confirmManualGPS() {
    const coordinatesInput = document.getElementById('gpsCoordinates').value.trim();

    // Parser les coordonnées (format: lat, lng)
    const coordsMatch = coordinatesInput.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    if (!coordsMatch) {
        showError("Format de coordonnées invalide. Utilisez le format: latitude, longitude (ex: -20.9286, 55.6142)");
        return;
    }

    const lat = parseFloat(coordsMatch[1]);
    const lng = parseFloat(coordsMatch[2]);

    // Vérifier que les coordonnées sont dans les limites de La Réunion
    if (lat < -21.4 || lat > -20.8 || lng < 55.2 || lng > 55.9) {
        showError("Les coordonnées ne semblent pas être pour La Réunion. Veuillez vérifier et réessayer.");
        return;
    }

    // Si on a des données en attente, créer la commande
    if (window.pendingGPSOrder) {
        addOrderToList(
            window.pendingGPSOrder.customerName,
            window.pendingGPSOrder.address,
            lat,
            lng,
            window.pendingGPSOrder.phone,
            window.pendingGPSOrder.priority
        );

        // Réinitialiser
        window.pendingGPSOrder = null;
        document.getElementById('addOrderForm').reset();
        document.getElementById('gpsCoordinates').value = '';

        // Fermer la modal
        const modalEl = document.getElementById('manualGPSModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        }
    }
}

// ============================================
// FONCTIONS DE MODAL
// ============================================

function showClosestAddresses(suggestions, originalQuery) {
    const modalEl = document.getElementById('closestAddressModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    const optionsContainer = document.getElementById('closestAddressOptions');

    if (suggestions.length === 0) {
        optionsContainer.innerHTML = '<div class="alert alert-warning">Aucune adresse proche trouvée à La Réunion.</div>';
        modal.show();
        return;
    }

    // Trier les suggestions par distance (la plus proche en premier)
    suggestions.sort((a, b) => {
        const distA = Math.sqrt(
            Math.pow(a.lat - PHARMACY.lat, 2) +
            Math.pow(a.lng - PHARMACY.lng, 2)
        );
        const distB = Math.sqrt(
            Math.pow(b.lat - PHARMACY.lat, 2) +
            Math.pow(b.lng - PHARMACY.lng, 2)
        );
        return distA - distB;
    });

    optionsContainer.innerHTML = suggestions.map((suggestion, index) => {
        const escapedAddress = suggestion.address.replace(/'/g, "\\'");
        return `
            <div class="list-group-item" onclick="selectClosestAddress(${index})">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${suggestion.address}</strong>
                    </div>
                    <i class="fas fa-map-marker-alt text-primary"></i>
                </div>
            </div>
        `;
    }).join('');

    // Stocker les suggestions et la requête originale
    window.pendingClosestAddress = {
        suggestions: suggestions,
        originalQuery: originalQuery
    };

    modal.show();
}

function selectClosestAddress(index) {
    if (!window.pendingClosestAddress || !window.pendingClosestAddress.suggestions[index]) {
        return;
    }

    const selected = window.pendingClosestAddress.suggestions[index];
    document.getElementById('address').value = selected.address;
    document.getElementById('addressSuggestions').style.display = 'none';

    // Ajouter la commande avec les coordonnées de l'adresse sélectionnée
    const customerName = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const priority = document.getElementById('priority').checked ? 1 : 0;

    if (!customerName) {
        showError("Veuillez indiquer un nom de client.");
        return;
    }

    addOrderToList(
        customerName,
        selected.address,
        selected.lat,
        selected.lng,
        phone,
        priority
    );

    document.getElementById('addOrderForm').reset();

    // Fermer la modal
    const modalEl = document.getElementById('closestAddressModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function showError(message) {
    const modalEl = document.getElementById('errorModal');
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    document.getElementById('errorMessage').textContent = message;
    modal.show();
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function setupMobileOptimizations() {
    // Masquer le clavier quand on clique en dehors des champs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('input') && !e.target.closest('textarea')) {
            if (isMobileDevice()) {
                document.activeElement.blur();
            }
        }
    });

    // Feedback visuel sur les boutons
    const buttons = document.querySelectorAll('.btn, .list-group-item, .order-card, .step-item');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = '';
        });
        
        btn.addEventListener('touchcancel', function() {
            this.style.transform = '';
        });
    });
}

// ============================================
// CONFIGURATION DES ÉCOUTEURS
// ============================================

function setupEventListeners() {
    // Formulaire d'ajout de commande
    const addOrderForm = document.getElementById('addOrderForm');
    if (!addOrderForm) return;

    addOrderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customerName').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const priority = document.getElementById('priority').checked ? 1 : 0;

        if (!customerName || !address) {
            showError("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Rechercher l'adresse (utilise Google Maps en priorité)
        const suggestions = await searchAddress(address, GOOGLE_MAPS_API_KEY);

        if (suggestions.length > 0) {
            // Si on a des suggestions, utiliser la première
            addOrderToList(customerName, suggestions[0].address, suggestions[0].lat, suggestions[0].lng, phone, priority);
        } else {
            // Essayer une recherche plus large avec Google Maps
            const googleResult = await searchAddressWithGoogle(address + ', La Réunion', GOOGLE_MAPS_API_KEY);
            if (googleResult.length > 0) {
                addOrderToList(customerName, googleResult[0].address, googleResult[0].lat, googleResult[0].lng, phone, priority);
            } else {
                // Sinon, proposer les adresses proches des commandes existantes
                const closestFromOrders = findClosestOrder(PHARMACY.lat, PHARMACY.lng, window.orders);

                if (closestFromOrders) {
                    showClosestAddresses([closestFromOrders], address);
                    return;
                } else {
                    // Ouvrir automatiquement la modal pour entrer manuellement
                    showManualGPSModal();
                    return;
                }
            }
        }

        addOrderForm.reset();
        document.getElementById('addressSuggestions').style.display = 'none';
    });

    // Autocomplétion des clients
    const customerInput = document.getElementById('customerName');
    if (customerInput) {
        let customerSearchTimeout;
        customerInput.addEventListener('input', (e) => {
            clearTimeout(customerSearchTimeout);
            const query = e.target.value.trim();
            customerSearchTimeout = setTimeout(() => {
                const suggestions = searchCustomers(window.orders, query);
                showCustomerSuggestions(suggestions);
            }, 300);
        });
    }

    // Autocomplétion des adresses
    const addressInput = document.getElementById('address');
    if (!addressInput) return;

    let addressSearchTimeout;
    addressInput.addEventListener('input', async (e) => {
        clearTimeout(addressSearchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            document.getElementById('addressSuggestions').style.display = 'none';
            return;
        }

        addressSearchTimeout = setTimeout(async () => {
            const suggestions = await searchAddress(query, GOOGLE_MAPS_API_KEY);
            showAddressSuggestions(suggestions);
        }, 500);
    });

    // Optimiser la tournée
    const optimizeBtn = document.getElementById('optimizeRouteBtn');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', optimizeRoute);
    }

    // Bouton flottant pour optimiser (mobile)
    const optimizeFloatingBtn = document.getElementById('optimizeFloatingBtn');
    if (optimizeFloatingBtn) {
        optimizeFloatingBtn.addEventListener('click', optimizeRoute);
    }

    // Masquer les suggestions en cliquant ailleurs
    document.addEventListener('click', (e) => {
        const addressSuggestions = document.getElementById('addressSuggestions');
        const customerSuggestions = document.getElementById('customerSuggestions');
        
        if (addressSuggestions && !e.target.closest('#address') && !e.target.closest('#addressSuggestions')) {
            addressSuggestions.style.display = 'none';
        }
        
        if (customerSuggestions && !e.target.closest('#customerName') && !e.target.closest('#customerSuggestions')) {
            customerSuggestions.style.display = 'none';
        }
    });

    // Menu mobile
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Fermer le menu quand on clique sur l'overlay
    const menuOverlay = document.getElementById('menuOverlay');
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('open');
            if (menuOverlay) menuOverlay.classList.remove('active');
            if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    }
}

// ============================================
// FONCTIONS MOBILE
// ============================================

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('menuOverlay');
    const toggleBtn = document.getElementById('menuToggle');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        
        // Changer l'icône du bouton
        if (sidebar.classList.contains('open')) {
            toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
}
