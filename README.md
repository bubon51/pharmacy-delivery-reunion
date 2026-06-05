# 🏥 Pharmacy Delivery Réunion

**Application de gestion des livraisons de pharmacie à La Réunion avec optimisation des tournées**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)](https://bubon51.github.io/pharmacy-delivery-reunion/)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📱 **Application Installable (PWA)**

Cette application est une **Progressive Web App (PWA)** qui peut être **installée sur smartphone** comme une application native !

**🔗 URL en ligne :** [https://bubon51.github.io/pharmacy-delivery-reunion/](https://bubon51.github.io/pharmacy-delivery-reunion/)

---

## ✨ **Fonctionnalités**

### 🗺️ **Gestion des commandes**
- ✅ Ajout de commandes avec nom, adresse, téléphone
- ✅ Priorité des commandes (urgente/normale)
- ✅ Statut des commandes (en attente, en cours, livrée)
- ✅ Suppression des commandes

### 📍 **Géolocalisation intelligente**
- ✅ Recherche d'adresses via **Google Maps API** (précis)
- ✅ Fallback sur **OpenStreetMap Nominatim** (gratuit)
- ✅ Autocomplétion des adresses
- ✅ Validation des coordonnées pour La Réunion

### 🎯 **Optimisation des tournées**
- ✅ Algorithme du plus proche voisin
- ✅ Calcul des **routes réelles** via OSRM
- ✅ Estimation de la **distance totale** et **durée**
- ✅ Affichage des statistiques de tournée

### 👥 **Gestion des clients**
- ✅ Autocomplétion par **nom de client**
- ✅ Historique des adresses des clients
- ✅ Sélection rapide des clients existants

### 📱 **Optimisation Mobile**
- ✅ **Design responsive** (mobile-first)
- ✅ Menu hamburger pour la navigation
- ✅ Boutons adaptés aux **doigts**
- ✅ Gestion du **clavier mobile**
- ✅ **Gestes tactiles** sur la carte
- ✅ Bouton flottant pour optimiser la tournée

### 🌐 **Navigation**
- ✅ Ouverture de **Google Maps** avec les coordonnées
- ✅ **Copie automatique** des coordonnées dans le presse-papiers
- ✅ Boutons de navigation intégrés

---

## 🚀 **Installation sur Smartphone**

### **Sur iPhone (iOS)**
1. Ouvrez **Safari** → [https://bubon51.github.io/pharmacy-delivery-reunion/](https://bubon51.github.io/pharmacy-delivery-reunion/)
2. Appuyez sur **⬆️ (Partager)**
3. Faites défiler → **"Sur l'écran d'accueil"**
4. Donnez un nom → **"Ajouter"**
5. ✅ **L'application est installée !**

### **Sur Android**
1. Ouvrez **Chrome** → [https://bubon51.github.io/pharmacy-delivery-reunion/](https://bubon51.github.io/pharmacy-delivery-reunion/)
2. Appuyez sur **⋮ (trois points)**
3. **"Ajouter à l'écran d'accueil"**
4. **Confirmez**
5. ✅ **L'application est installée !**

---

## 🛠️ **Technologies utilisées**

| Technologie | Usage |
|-------------|-------|
| **HTML5** | Structure de la page |
| **CSS3** | Styles et responsive design |
| **JavaScript (ES6+)** | Logique de l'application |
| **Bootstrap 5** | Composants UI |
| **Leaflet** | Carte interactive |
| **OpenStreetMap** | Tuiles de carte |
| **Google Maps API** | Géocodage précis |
| **OSRM** | Calcul des itinéraires |
| **Font Awesome** | Icônes |
| **Service Worker** | Cache et mode hors ligne |
| **Manifest JSON** | Configuration PWA |

---

## 📁 **Structure du projet**

```
pharmacy-delivery-reunion/
├── index.html              # Page principale (PWA + Mobile optimisé)
├── app.js                  # Logique principale des commandes
├── map.js                  # Gestion de la carte Leaflet
├── data.js                 # Données et stockage local
├── style.css               # Styles de base
├── manifest.json           # Configuration PWA
├── service-worker.js       # Cache et mode hors ligne
├── generate_icons.py       # Script pour générer les icônes
├── README.md               # Documentation
├── DEPLOYMENT_GUIDE.md     # Guide de déploiement
├── PWA_INSTRUCTIONS.md     # Instructions PWA
├── .github/
│   └── workflows/
│       └── deploy-pages.yml # Workflow GitHub Actions
└── icons/                  # Icônes de l'application
    ├── icon.svg           # Icône source SVG
    ├── icon-72x72.png     # Icône 72x72
    ├── icon-96x96.png     # Icône 96x96
    ├── icon-128x128.png   # Icône 128x128
    ├── icon-144x144.png   # Icône 144x144
    ├── icon-152x152.png   # Icône 152x152
    ├── icon-192x192.png   # Icône 192x192
    ├── icon-384x384.png   # Icône 384x384
    └── icon-512x512.png   # Icône 512x512
```

---

## 📊 **Coûts**

| Service | Coût pour 500 livraisons/mois |
|---------|-------------------------------|
| **Google Maps API** | **$0.00** (dans les limites gratuites) |
| **GitHub Pages** | **Gratuit** |
| **OSRM** | **Gratuit** (open source) |
| **OpenStreetMap** | **Gratuit** (open source) |

**Total : $0.00/mois** ✅

---

## 🔧 **Configuration requise**

### **Clé API Google Maps**
L'application utilise la clé API : `AIzaSyCB0pbjbeibF0-axu9b3EbOGn8M0U7p0mc`

**Pour la production, il est recommandé de :**
1. Créer une **nouvelle clé API**
2. **Restreindre** la clé à votre domaine : `https://bubon51.github.io/*`
3. **Limiter** aux APIs : Geocoding et Places

---

## 🎯 **Comment utiliser**

### **1. Ajouter une commande**
1. Remplissez le formulaire :
   - Nom du client
   - Adresse (autocomplétion disponible)
   - Téléphone (optionnel)
   - Priorité (urgente ou non)
2. Cliquez sur **"Ajouter"**
3. La commande apparaît dans la liste

### **2. Optimiser une tournée**
1. Ajoutez plusieurs commandes
2. Cliquez sur **"Optimiser la tournée"**
3. L'application calcule l'itinéraire optimal
4. Les statistiques s'affichent : distance, durée, nombre d'arrêts

### **3. Naviguer avec Google Maps**
1. Cliquez sur n'importe quel bouton **"Google Maps"**
2. Les coordonnées sont **automatiquement copiées** dans le presse-papiers
3. Google Maps s'ouvre avec les coordonnées pré-remplies

### **4. Rechercher un client existant**
1. Commencez à taper le **nom du client**
2. Les suggestions apparaissent
3. Cliquez sur une suggestion pour remplir automatiquement tous les champs

---

## 📈 **Statistiques de l'application**

- **Taille totale** : ~170 Ko (compressé)
- **Nombre de fichiers** : 15+
- **Lignes de code** : 1900+
- **Fonctions JavaScript** : 35+
- **Compatibilité** : Tous les navigateurs modernes

---

## 🤝 **Contribuer**

Les contributions sont les bienvenues !

1. **Fork** le projet
2. **Créez** une branche (`git checkout -b feature/ma-fonctionnalite`)
3. **Commitez** vos changements (`git commit -m 'Ajout de ma fonctionnalite'`)
4. **Poussez** vers la branche (`git push origin feature/ma-fonctionnalite`)
5. **Ouvrez** une Pull Request

---

## 📜 **Licence**

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 **Support**

Pour toute question ou problème :
- Vérifiez les **guides** : [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md), [PWA_INSTRUCTIONS.md](PWA_INSTRUCTIONS.md)
- Consultez la **console du navigateur** (F12)
- Ouvrez une **Issue** sur GitHub

---

## 🎉 **Félicitations !**

Votre application **Pharmacy Delivery Réunion** est prête à être utilisée !

🔗 **Accédez-y maintenant :** [https://bubon51.github.io/pharmacy-delivery-reunion/](https://bubon51.github.io/pharmacy-delivery-reunion/)

📱 **Installez-la sur votre smartphone !**

---

**Développé avec ❤️ pour les pharmacies de La Réunion**
