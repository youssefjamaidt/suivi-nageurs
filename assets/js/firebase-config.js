// =============================================
// CONFIGURATION FIREBASE
// =============================================

/**
 * Configuration Firebase pour l'application Suivi Nageurs
 * 
 * INSTRUCTIONS :
 * 1. Créer un projet Firebase sur https://console.firebase.google.com/
 * 2. Activer "Realtime Database" dans Build > Realtime Database
 * 3. Copier les identifiants de configuration ci-dessous
 * 4. Configurer les règles de sécurité (voir GUIDE-DEPLOIEMENT-FIREBASE.md)
 */

const firebaseConfig = {
    apiKey: "AIzaSyAH5BeW6C40p_CKnGh5BeqKlJuI4BRnlo4",
    authDomain: "jamaimonitoring-8726c.firebaseapp.com",
    databaseURL: "https://jamaimonitoring-8726c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "jamaimonitoring-8726c",
    storageBucket: "jamaimonitoring-8726c.firebasestorage.app",
    messagingSenderId: "602485815550",
    appId: "1:602485815550:web:4a4f12d73d4383f3944daf"
};

// =============================================
// EXEMPLE DE CONFIGURATION (À REMPLACER)
// =============================================

// const firebaseConfig = {
//     apiKey: "AIzaSyB1234567890abcdefghijklmnopqrs",
//     authDomain: "suivi-nageurs-12345.firebaseapp.com",
//     databaseURL: "https://suivi-nageurs-12345-default-rtdb.firebaseio.com",
//     projectId: "suivi-nageurs-12345",
//     storageBucket: "suivi-nageurs-12345.appspot.com",
//     messagingSenderId: "123456789012",
//     appId: "1:123456789012:web:abcdef1234567890"
// };

// =============================================
// INITIALISATION FIREBASE
// =============================================

let firebaseApp = null;
let database = null;
let isFirebaseReady = false;

function initializeFirebase() {
    try {
        // Vérifier si Firebase SDK est chargé
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK non chargé. Vérifiez les scripts dans le HTML.');
            return false;
        }

        // Vérifier si la configuration est complète
        if (firebaseConfig.apiKey === "VOTRE_API_KEY") {
            console.warn('⚠️ Configuration Firebase non définie. Consultez GUIDE-DEPLOIEMENT-FIREBASE.md');
            return false;
        }

        // Initialiser Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        isFirebaseReady = true;

        console.log('✅ Firebase initialisé avec succès');
        return true;

    } catch (error) {
        console.error('❌ Erreur initialisation Firebase:', error);
        return false;
    }
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

/**
 * Obtenir la référence à la base de données
 */
function getDatabase() {
    if (!isFirebaseReady) {
        console.warn('⚠️ Firebase pas encore initialisé');
        return null;
    }
    return database;
}

/**
 * Vérifier si Firebase est prêt
 */
function isFirebaseInitialized() {
    return isFirebaseReady;
}

/**
 * Obtenir référence à un chemin spécifique
 */
function getRef(path) {
    if (!database) return null;
    return database.ref(path);
}

// =============================================
// EXPORT (si module ES6)
// =============================================

// Si vous utilisez des modules ES6, décommentez :
// export { initializeFirebase, getDatabase, isFirebaseInitialized, getRef };