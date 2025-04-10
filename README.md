# KiorMed - Assistant Médical Virtuel

KiorMed est une application web qui utilise l'intelligence artificielle pour fournir des services de consultation médicale virtuelle, d'analyse d'images médicales et de localisation d'hôpitaux à proximité.

## Fonctionnalités

- **Médecin Virtuel** : Consultez notre assistant médical propulsé par l'IA Gemini pour obtenir des conseils médicaux généraux.
- **Analyse d'Images** : Téléchargez une image médicale pour obtenir une analyse préliminaire grâce à l'IA Gemini.
- **Hôpitaux à Proximité** : Trouvez les hôpitaux et centres médicaux les plus proches de votre position grâce à l'API Google Maps.

## Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript
- **API Gemini** : Pour l'assistant médical virtuel et l'analyse d'images
- **API Google Maps** : Pour la localisation des hôpitaux à proximité

## Configuration

Pour utiliser cette application, vous devez obtenir les clés API suivantes :

1. **Clé API Gemini** : Obtenez une clé API sur [Google AI Studio](https://ai.google.dev/)
2. **Clé API Google Maps** : Obtenez une clé API sur [Google Cloud Platform](https://console.cloud.google.com/)

Une fois que vous avez obtenu vos clés API, remplacez les placeholders dans le fichier `script.js` :

```javascript
// Remplacez VOTRE_CLE_API_GEMINI par votre clé API Gemini
await google.ai.init({
    apiKey: 'VOTRE_CLE_API_GEMINI',
});

// Dans le fichier HTML, remplacez YOUR_GOOGLE_MAPS_API_KEY par votre clé API Google Maps
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

## Installation et Exécution

1. Clonez ce dépôt sur votre machine locale
2. Configurez vos clés API comme indiqué ci-dessus
3. Ouvrez le fichier `index.html` dans votre navigateur web

## Avertissement

Cette application est conçue pour fournir des informations générales et ne remplace pas une consultation médicale professionnelle. En cas d'urgence, contactez immédiatement les services d'urgence.

## Équipe de Développement

- **Dr. Sophie Martin** : Directrice Médicale
- **Thomas Dubois** : Développeur Principal
- **Léa Moreau** : Spécialiste UX/UI

## Licence

© 2025 KiorMed. Tous droits réservés.
