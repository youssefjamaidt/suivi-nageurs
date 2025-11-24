// ====================================
// CONFIGURATION FIREBASE
// ====================================
// Ce fichier initialise Firebase dans l'application
// À personnaliser avec vos clés API Firebase

// Configuration Firebase (à remplacer avec vos propres clés)
const firebaseConfig = {
    apiKey: "AIzaSyCrpyrlingOVhRX9lomieycdyofh8KdMMc", // À remplacer
    authDomain: "suivi-nageurs-30365192-63432.firebaseapp.com", // À remplacer
    projectId: "suivi-nageurs-30365192-63432", // À remplacer
    storageBucket: "suivi-nageurs-30365192-63432.firebasestorage.app", // À remplacer
    messagingSenderId: "112600155414", // À remplacer
    appId: "1:112600155414:web:1a1a12b4eb9d4faa273c37" // À remplacer
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Services Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Configuration Firestore (mode hors-ligne)
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistence: Plusieurs onglets ouverts');
        } else if (err.code == 'unimplemented') {
            console.warn('Persistence: Navigateur non supporté');
        }
    });

// ====================================
// FONCTIONS UTILITAIRES
// ====================================

// Obtenir l'utilisateur actuellement connecté
function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
}

// Vérifier si l'utilisateur est connecté
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Obtenir les données utilisateur depuis Firestore
async function getUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('Erreur getUserData:', error);
        return null;
    }
}

// Vérifier le rôle de l'utilisateur
async function checkUserRole(requiredRole) {
    const user = await requireAuth();
    if (!user) return false;
    
    const userData = await getUserData(user.uid);
    if (!userData) {
        console.error('Données utilisateur introuvables');
        return false;
    }
    
    if (userData.role !== requiredRole) {
        console.error(`Accès refusé: rôle requis ${requiredRole}, rôle actuel ${userData.role}`);
        // Rediriger selon le rôle
        redirectByRole(userData.role);
        return false;
    }
    
    return true;
}

// Rediriger selon le rôle utilisateur
function redirectByRole(role) {
    const redirections = {
        'admin': 'admin.html',
        'coach': 'index.html',
        'nageur': 'nageur.html'
    };
    
    const targetPage = redirections[role];
    if (targetPage && !window.location.pathname.includes(targetPage)) {
        window.location.href = targetPage;
    }
}

// Déconnexion
async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    }
}

// Formater timestamp Firestore en date lisible
function formatFirestoreDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    // Si c'est un objet Firestore Timestamp
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Si c'est un timestamp JavaScript
    if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    return 'Date invalide';
}

// Afficher message de chargement
function showLoader(message = 'Chargement...') {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        loader.style.display = 'flex';
    }
}

// Masquer message de chargement
function hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Afficher notification toast
function showToast(message, type = 'info') {
    // Créer élément toast s'il n'existe pas
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Créer toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    toast.textContent = message;
    
    // Ajouter animation CSS
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    toastContainer.appendChild(toast);
    
    // Auto-remove après 4 secondes
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ====================================
// EXPORT (si modules ES6)
// ====================================
// Si vous utilisez des modules ES6, décommentez:
// export { auth, db, getCurrentUser, requireAuth, getUserData, checkUserRole, logout };

console.log('🔥 Firebase configuré et prêt !');

// ====================================
// DONNÉES UTILISATEUR PAR DÉFAUT
// ====================================
// À utiliser pour créer des utilisateurs par défaut dans Firestore

const defaultUserData = {
    email: "admin@suivi-nageurs.com",
    firstName: "Admin",
    lastName: "Système",
    role: "admin",
    status: "active",
    club: "Mon Club",
    phone: "0600000000",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
};
