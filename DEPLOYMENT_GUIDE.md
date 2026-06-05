# 🚀 Guide de déploiement sur GitHub Pages

## ✅ Votre application est prête pour le déploiement !

Suivez ces étapes pour **déployer votre application sur GitHub Pages** et la rendre accessible en ligne.

---

## 📋 **Étape 1 : Activer GitHub Pages**

### **Méthode 1 : Via l'interface web (recommandé)**

1. **Rendez-vous sur votre dépôt GitHub** :
   ```
   https://github.com/bubon51/pharmacy-delivery-reunion
   ```

2. **Cliquez sur** :
   - **"Settings"** (Paramètres) → onglet en haut à droite

3. **Dans le menu de gauche**, cliquez sur :
   - **"Pages"** (sous "Code and automation")

4. **Configurer la source** :
   - **Branch** : Sélectionnez `main`
   - **Folder** : Sélectionnez `/ (root)`
   - **Build and deployment** : Sélectionnez `GitHub Actions`

5. **Cliquez sur** : **"Save"**

6. **Attendez 2-5 minutes** pour que le déploiement se termine

---

### **Méthode 2 : Via GitHub Actions (déjà configuré)**

Un workflow GitHub Actions a été créé pour vous :
- **Fichier** : `.github/workflows/deploy-pages.yml`
- **Déclenchement** : À chaque push sur `main`

**Pour l'activer :**
1. Allez dans **Actions** → **Deploy to GitHub Pages**
2. Cliquez sur **"Run workflow"**
3. Sélectionnez la branche `main`
4. Cliquez sur **"Run workflow"**

---

## 🌐 **Étape 2 : Accéder à votre application**

Une fois le déploiement terminé :

1. **Retournez dans** : Settings → Pages
2. **Votre application sera accessible à** :
   ```
   https://bubon51.github.io/pharmacy-delivery-reunion/
   ```

3. **Ouvrez ce lien dans votre navigateur**

---

## 📱 **Étape 3 : Installer sur smartphone**

### **Sur iPhone (iOS) :**
1. Ouvrez **Safari** → Allez sur :
   ```
   https://bubon51.github.io/pharmacy-delivery-reunion/
   ```
2. Appuyez sur **⬆️ (Partager)**
3. Faites défiler → **"Sur l'écran d'accueil"**
4. Donnez un nom → **"Ajouter"**
5. ✅ **L'application est installée !**

### **Sur Android :**
1. Ouvrez **Chrome** → Allez sur :
   ```
   https://bubon51.github.io/pharmacy-delivery-reunion/
   ```
2. Appuyez sur **⋮ (trois points)**
3. **"Ajouter à l'écran d'accueil"**
4. **Confirmez**
5. ✅ **L'application est installée !**

---

## 🔧 **Étape 4 : Vérifier que tout fonctionne**

### **1. Vérifier le déploiement**
- Allez dans **Settings → Pages**
- Vérifiez que le statut est **"Deployed"** (Déployé)
- Le lien doit être vert

### **2. Tester l'application**
- Ouvrez le lien dans votre navigateur
- Vérifiez que :
  - ✅ La carte s'affiche
  - ✅ Le menu fonctionne
  - ✅ Vous pouvez ajouter des commandes
  - ✅ L'optimisation de tournée fonctionne
  - ✅ Le bouton "Installer" apparaît

### **3. Tester la PWA**
- Dans **Chrome DevTools** (F12) :
  - Onglet **Application**
  - **Service Workers** → Vérifiez que `/service-worker.js` est enregistré
  - **Manifest** → Vérifiez que le manifest est chargé
  - **Lighthouse** → Faites un audit PWA

---

## ⚠️ **Problèmes courants et solutions**

### **1. Le déploiement ne se lance pas**
- **Solution** : Vérifiez que GitHub Actions est activé
- Allez dans **Actions** → Vérifiez que le workflow s'est exécuté

### **2. L'application ne s'affiche pas**
- **Solution** : Vérifiez que `index.html` est dans la racine
- Attendez 5-10 minutes après le déploiement

### **3. Les icônes ne s'affichent pas**
- **Solution** : Vérifiez que les fichiers PNG sont dans `icons/`
- Vérifiez les chemins dans `manifest.json`

### **4. Le Service Worker ne s'enregistre pas**
- **Solution** : GitHub Pages utilise HTTPS, donc ça devrait fonctionner
- Vérifiez dans Chrome DevTools → Application → Service Workers

### **5. L'API Google Maps ne fonctionne pas**
- **Solution** : Votre clé API est publique dans le code
- **Recommandation** : Créez une clé API restreinte à votre domaine
- **Pour l'instant** : La clé `AIzaSyCB0pbjbeibF0-axu9b3EbOGn8M0U7p0mc` fonctionne

---

## 💡 **Conseils pour la production**

### **1. Protéger votre clé API Google Maps**
Votre clé API est actuellement dans le code source. Pour la production :

**Option 1 : Utiliser un backend** (recommandé)
- Créez un serveur simple (Node.js, Python, PHP)
- Le serveur fait les requêtes Google Maps
- L'application appelle votre serveur

**Option 2 : Restreindre la clé API**
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Identifiants**
3. Cliquez sur votre clé API
4. **Restrictions d'application** :
   - Sélectionnez : **Sites web HTTP**
   - Ajoutez : `https://bubon51.github.io/*`
5. **Restrictions d'API** :
   - Sélectionnez uniquement : **Geocoding API** et **Places API**
6. **Enregistrez**

### **2. Personnaliser le nom et les icônes**
Éditez `manifest.json` pour :
- Changer le nom de l'application
- Changer la description
- Changer les couleurs
- Ajouter des captures d'écran

### **3. Ajouter un domaine personnalisé** (optionnel)
1. Achetez un nom de domaine (ex: `pharmacy-delivery-reunion.com`)
2. Dans **Settings → Pages** :
   - Ajoutez votre domaine dans **Custom domain**
3. Configurez le DNS de votre domaine

---

## 📊 **Vérification finale**

Une fois déployé, vérifiez que :

- [ ] L'application s'ouvre à : `https://bubon51.github.io/pharmacy-delivery-reunion/`
- [ ] La carte OpenStreetMap s'affiche
- [ ] Vous pouvez ajouter des commandes
- [ ] L'optimisation de tournée fonctionne
- [ ] Le bouton "Installer" apparaît
- [ ] L'application peut être installée sur smartphone
- [ ] Les coordonnées GPS sont récupérées via Google Maps
- [ ] L'autocomplétion des clients fonctionne

---

## 🎉 **Félicitations !**

Votre application **Pharmacy Delivery Réunion** est maintenant :

✅ **Déployée sur GitHub Pages**  
✅ **Accessible en ligne**  
✅ **Installable sur smartphone**  
✅ **Optimisée pour mobile**  
✅ **Avec Google Maps intégré**  
✅ **Avec cache pour un chargement rapide**  

**URL finale :** `https://bubon51.github.io/pharmacy-delivery-reunion/`

---

## 📞 **Support**

Si vous avez des problèmes :
1. Vérifiez la console du navigateur (F12 → Console)
2. Vérifiez les logs GitHub Actions
3. Vérifiez que tous les fichiers sont poussés sur GitHub
4. Contactez-moi pour de l'aide supplémentaire

**Bon déploiement !** 🚀
