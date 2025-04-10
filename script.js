// Variables globales
let isGeminiLoaded = false;
let geminiApiKey = 'AIzaSyDxUPtVU9naSs865gQo6ydH-tHPVD_zzVw';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation de l'API Gemini
    initGemini();
    
    // Gestion du thème sombre/clair
    initThemeToggle();
    
    // Gestion du changement de langue
    initLanguageToggle();
    
    // Gestion des boutons de service (uniquement sur la page services.html)
    if (document.querySelector('.service-button')) {
        initServiceButtons();
    }
    
    // Initialisation de la consultation virtuelle (uniquement si présent)
    if (document.getElementById('consultation')) {
        initConsultation();
    }
    
    // Initialisation de l'analyse d'image (uniquement si présent)
    if (document.getElementById('image-analysis')) {
        initImageAnalysis();
    }
    
    // Initialisation du formulaire de contact
    initContactForm();
});

// Initialisation de l'API Gemini
function initGemini() {
    // Vérifier si la clé API est définie
    if (!geminiApiKey) {
        console.error('Clé API Gemini non définie');
        showError('Impossible d\'initialiser l\'API Gemini. Clé API manquante.');
        return;
    }
    
    // Marquer l'API comme chargée
    isGeminiLoaded = true;
    console.log('API Gemini initialisée avec succès');
}

// Initialisation du toggle de thème
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Vérifier si le thème sombre est déjà activé
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    // Gestion du clic sur le toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        // Mettre à jour l'icône
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        // Sauvegarder la préférence
        localStorage.setItem('darkMode', isDark);
    });
}

// Initialisation du toggle de langue
function initLanguageToggle() {
    const langFrBtn = document.getElementById('lang-fr');
    const langEnBtn = document.getElementById('lang-en');
    
    // Vérifier si la langue est déjà définie
    const currentLang = localStorage.getItem('language') || 'fr';
    document.documentElement.setAttribute('data-language', currentLang);
    
    // Mettre à jour les boutons actifs
    if (currentLang === 'fr') {
        langFrBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langFrBtn.classList.remove('active');
        langEnBtn.classList.add('active');
    }
    
    // Appliquer la langue actuelle
    applyLanguage(currentLang);
    
    // Gestion du clic sur les boutons de langue
    langFrBtn.addEventListener('click', () => {
        document.documentElement.setAttribute('data-language', 'fr');
        langFrBtn.classList.add('active');
        langEnBtn.classList.remove('active');
        localStorage.setItem('language', 'fr');
        applyLanguage('fr');
    });
    
    langEnBtn.addEventListener('click', () => {
        document.documentElement.setAttribute('data-language', 'en');
        langFrBtn.classList.remove('active');
        langEnBtn.classList.add('active');
        localStorage.setItem('language', 'en');
        applyLanguage('en');
    });
}

// Fonction pour appliquer la langue sélectionnée
function applyLanguage(lang) {
    const currentLang = document.documentElement.getAttribute('data-language');
    
    // Mettre à jour tous les éléments avec des attributs data-lang
    document.querySelectorAll('[data-lang-fr], [data-lang-en]').forEach(element => {
        const langValue = element.getAttribute(`data-lang-${currentLang}`);
        if (langValue) {
            element.textContent = langValue;
        }
    });
    
    // Mettre à jour les placeholders des champs de formulaire
    document.querySelectorAll('[data-lang-fr-placeholder], [data-lang-en-placeholder]').forEach(element => {
        const placeholderValue = element.getAttribute(`data-lang-${currentLang}-placeholder`);
        if (placeholderValue) {
            element.placeholder = placeholderValue;
        }
    });
}

// Initialisation des boutons de service
function initServiceButtons() {
    const serviceButtons = document.querySelectorAll('.service-button');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const service = button.getAttribute('data-service');
            
            switch (service) {
                case 'medecin':
                    document.getElementById('consultation').classList.remove('hidden');
                    break;
                case 'analyse':
                    document.getElementById('image-analysis').classList.remove('hidden');
                    break;
            }
        });
    });
    
    // Gestion des boutons de fermeture
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('section');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

// Initialisation de la consultation virtuelle
function initConsultation() {
    const sendButton = document.getElementById('send-message');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    // Gestion de l'envoi de message
    sendButton.addEventListener('click', async () => {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Ajouter le message de l'utilisateur
        addMessage(message, 'user');
        userInput.value = '';
        
        // Vérifier si l'API Gemini est chargée
        if (!isGeminiLoaded) {
            addMessage('Désolé, le service de consultation n\'est pas disponible pour le moment. Veuillez réessayer plus tard.', 'bot');
            return;
        }
        
        // Afficher un message de chargement
        const loadingMessage = addMessage('En train de réfléchir...', 'bot');
        
        try {
            // Obtenir la langue actuelle
            const currentLang = document.documentElement.getAttribute('data-language') || 'fr';
            
            // Construire le prompt pour Gemini
            let prompt;
            if (currentLang === 'fr') {
                prompt = `Tu es un assistant médical virtuel. Tu dois fournir des informations médicales générales et des conseils préliminaires basés sur les symptômes décrits. 
                N'oublie pas d'inclure un avertissement que tes conseils ne remplacent pas une consultation médicale professionnelle.
                
                Voici la question ou les symptômes décrits par l'utilisateur: "${message}"
                
                Réponds en français de manière concise, professionnelle et empathique.`;
            } else {
                prompt = `You are a virtual medical assistant. You must provide general medical information and preliminary advice based on the described symptoms.
                Don't forget to include a warning that your advice does not replace a medical consultation with a healthcare professional.
                
                Here is the question or symptoms described by the user: "${message}"
                
                Answer in English in a concise, professional, and empathetic manner.`;
            }
            
            // Préparer les données pour l'API Gemini
            const requestData = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };
            
            // Appeler l'API Gemini directement avec fetch
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            // Vérifier si la réponse est OK
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }
            
            // Traiter la réponse
            const data = await response.json();
            
            // Extraire le texte de la réponse
            let responseText = '';
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts && 
                data.candidates[0].content.parts.length > 0) {
                responseText = data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Format de réponse inattendu');
            }
            
            // Remplacer le message de chargement par la réponse
            loadingMessage.querySelector('p').textContent = responseText;
        } catch (error) {
            console.error('Erreur lors de la génération de la réponse:', error);
            
            // Obtenir la langue actuelle pour le message d'erreur
            const currentLang = document.documentElement.getAttribute('data-language') || 'fr';
            const errorMessage = currentLang === 'fr' 
                ? 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer plus tard.'
                : 'Sorry, I couldn\'t process your request. Please try again later.';
                
            loadingMessage.querySelector('p').textContent = errorMessage;
        }
    });
    
    // Gestion de l'envoi avec la touche Entrée
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
}

// Fonction pour ajouter un message dans le chat
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    
    contentDiv.appendChild(paragraph);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Faire défiler vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return contentDiv;
}

// Initialisation de l'analyse d'image
function initImageAnalysis() {
    const uploadArea = document.getElementById('upload-area');
    const imageUpload = document.getElementById('image-upload');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const analyzeButton = document.getElementById('analyze-button');
    const analysisResults = document.getElementById('analysis-results');
    const resultsContent = document.getElementById('results-content');
    
    // Gestion du clic sur la zone de dépôt
    uploadArea.addEventListener('click', () => {
        imageUpload.click();
    });
    
    // Gestion du glisser-déposer
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Gestion de la sélection de fichier
    imageUpload.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageUpload(e.target.files[0]);
        }
    });
    
    // Gestion du clic sur le bouton d'analyse
    analyzeButton.addEventListener('click', async () => {
        // Vérifier si l'API Gemini est chargée
        if (!isGeminiLoaded) {
            const currentLang = document.documentElement.getAttribute('data-language') || 'fr';
            const errorMessage = currentLang === 'fr' 
                ? 'Le service d\'analyse d\'image n\'est pas disponible pour le moment. Veuillez réessayer plus tard.'
                : 'The image analysis service is not available at the moment. Please try again later.';
            
            showError(errorMessage);
            return;
        }
        
        // Obtenir la langue actuelle pour le message de chargement
        const currentLang = document.documentElement.getAttribute('data-language') || 'fr';
        const loadingMessage = currentLang === 'fr' 
            ? 'Analyse de l\'image en cours...'
            : 'Analyzing image...';
        
        // Afficher le modal de chargement
        showLoading(loadingMessage);
        
        try {
            // Convertir l'image en base64
            const base64Image = await getBase64FromImageElement(imagePreview);
            
            // Construire le prompt pour Gemini selon la langue
            let prompt;
            if (currentLang === 'fr') {
                prompt = `Analyse cette image médicale et fournis une description détaillée de ce que tu vois. 
                Si tu identifies des anomalies potentielles, décris-les, mais précise que cette analyse est préliminaire et ne remplace pas un diagnostic médical professionnel.
                
                Organise ta réponse en sections: Description générale, Observations potentielles, et Recommandations.
                
                Réponds en français.`;
            } else {
                prompt = `Analyze this medical image and provide a detailed description of what you see.
                If you identify potential abnormalities, describe them, but specify that this analysis is preliminary and does not replace a professional medical diagnosis.
                
                Organize your response in sections: General Description, Potential Observations, and Recommendations.
                
                Answer in English.`;
            }
            
            // Préparer les données pour l'API Gemini
            const requestData = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { 
                            inline_data: { 
                                mime_type: 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ]
                }]
            };
            
            // Appeler l'API Gemini directement avec fetch
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-vision:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            // Vérifier si la réponse est OK
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }
            
            // Traiter la réponse
            const data = await response.json();
            
            // Extraire le texte de la réponse
            let responseText = '';
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts && 
                data.candidates[0].content.parts.length > 0) {
                responseText = data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Format de réponse inattendu');
            }
            
            // Afficher les résultats
            resultsContent.innerHTML = formatAnalysisResults(responseText);
            analysisResults.classList.remove('hidden');
            
            // Cacher le modal de chargement
            hideLoading();
        } catch (error) {
            console.error('Erreur lors de l\'analyse de l\'image:', error);
            hideLoading();
            
            // Message d'erreur selon la langue
            const errorMessage = currentLang === 'fr' 
                ? 'Une erreur est survenue lors de l\'analyse de l\'image. Veuillez réessayer plus tard.'
                : 'An error occurred while analyzing the image. Please try again later.';
                
            showError(errorMessage);
        }
    });
}

// Fonction pour gérer l'upload d'image
function handleImageUpload(file) {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        // Message d'erreur selon la langue
        const currentLang = document.documentElement.getAttribute('data-language') || 'fr';
        const errorMessage = currentLang === 'fr' 
            ? 'Veuillez sélectionner une image valide.'
            : 'Please select a valid image.';
            
        showError(errorMessage);
        return;
    }
    
    // Afficher l'aperçu de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
        const uploadArea = document.getElementById('upload-area');
        const previewContainer = document.getElementById('preview-container');
        const imagePreview = document.getElementById('image-preview');
        const analysisResults = document.getElementById('analysis-results');
        
        imagePreview.src = e.target.result;
        uploadArea.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        analysisResults.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// Fonction pour convertir une image en base64
function getBase64FromImageElement(imgElement) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0);
        
        // Convertir en base64
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        resolve(base64);
    });
}

// Fonction pour formater les résultats d'analyse
function formatAnalysisResults(text) {
    // Convertir le texte en HTML avec formatage
    return text.replace(/\n/g, '<br>');
}

// Fonction pour afficher un message de chargement
function showLoading(message) {
    const loadingModal = document.getElementById('loading-modal');
    const loadingMessage = document.getElementById('loading-message');
    
    loadingMessage.textContent = message || 'Chargement en cours...';
    loadingModal.classList.add('active');
}

// Fonction pour cacher le message de chargement
function hideLoading() {
    const loadingModal = document.getElementById('loading-modal');
    loadingModal.classList.remove('active');
}

// Fonction pour afficher un message d'erreur
function showError(message) {
    // Créer un élément pour l'erreur
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
    
    // Ajouter l'élément à la page
    document.body.appendChild(errorElement);
    
    // Supprimer l'élément après 5 secondes
    setTimeout(() => {
        errorElement.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(errorElement);
        }, 500);
    }, 5000);
}

// Fonction de validation du formulaire de contact
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const currentLang = document.documentElement.getAttribute('data-language');
    
    // Vérification des champs obligatoires
    if (name === '' || email === '' || subject === '' || message === '') {
        const errorMsg = currentLang === 'fr' ? 
            'Veuillez remplir tous les champs obligatoires.' : 
            'Please fill in all required fields.';
        showError(errorMsg);
        return false;
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const errorMsg = currentLang === 'fr' ? 
            'Veuillez entrer une adresse email valide.' : 
            'Please enter a valid email address.';
        showError(errorMsg);
        return false;
    }
    
    // Afficher un message de confirmation
    const confirmMsg = currentLang === 'fr' ? 
        'Votre message va être envoyé à kakudja0@gmail.com. Continuer ?' : 
        'Your message will be sent to kakudja0@gmail.com. Continue?';
    
    if (!confirm(confirmMsg)) {
        return false;
    }
    
    // Afficher un message de chargement
    const submitBtn = document.querySelector('#contact-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
        (currentLang === 'fr' ? 'Envoi en cours...' : 'Sending...');
    submitBtn.disabled = true;
    
    // Réinitialiser le bouton après 2 secondes (pour l'UX)
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
    
    return true;
}

// Initialisation du formulaire de contact
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
        
        // Validation supplémentaire si nécessaire
        
        // Le formulaire sera soumis normalement si toutes les validations passent
        // FormSubmit.co s'occupera de l'envoi du mail
    });
}
