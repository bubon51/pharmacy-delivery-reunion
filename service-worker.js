// Nom du cache
const CACHE_NAME = 'pharmacy-delivery-v1';

// Fichiers à mettre en cache
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/map.js',
  '/data.js',
  '/style.css',
  '/manifest.json',
  // Leaflet
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  // Bootstrap
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  // Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  // OpenStreetMap tiles (ne peuvent pas être cachés, mais on peut cache les requêtes)
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Tous les fichiers mis en cache');
        return self.skipWaiting(); // Force le nouveau SW à devenir actif
      })
      .catch((error) => {
        console.error('Service Worker: Erreur lors de la mise en cache:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation en cours...');
  
  // Supprimer les anciens caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Activation terminée');
      return self.clients.claim(); // Prend le contrôle des clients immédiatement
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes POST
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Pour les requêtes API (Google Maps, OSRM, Nominatim), ne pas utiliser le cache
  if (event.request.url.includes('maps.googleapis.com') ||
      event.request.url.includes('nominatim.openstreetmap.org') ||
      event.request.url.includes('router.project-osrm.org')) {
    return fetch(event.request);
  }
  
  // Essayer de servir depuis le cache
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si trouvé dans le cache, retourner la réponse
        if (response) {
          console.log('Service Worker: Servi depuis le cache:', event.request.url);
          return response;
        }
        
        // Sinon, faire la requête réseau
        console.log('Service Worker: Requête réseau:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Mettre en cache la nouvelle réponse
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('Service Worker: Mise en cache de:', event.request.url);
              });
            
            return response;
          });
      })
      .catch((error) => {
        console.error('Service Worker: Erreur lors de la récupération:', error);
        // Retourner une réponse de fallback si disponible
        return caches.match('/index.html');
      })
  );
});

// Gestion des messages (pour la synchronisation)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_NEW_DATA') {
    // Mettre à jour le cache avec de nouvelles données
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.add(event.data.url);
      });
  }
});

// Écouter les événements de synchronisation (si l'app revient en ligne)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      // Synchroniser les commandes avec le serveur (à implémenter)
      console.log('Service Worker: Synchronisation des commandes...')
    );
  }
});

// Notifications push (optionnel, nécessite une clé)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  } else {
    clients.openWindow('/');
  }
});

console.log('Service Worker: Chargé et prêt');
