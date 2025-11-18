// =============================================
// SYSTÈME D'AUTHENTIFICATION MULTI-UTILISATEURS
// =============================================

// Gestion des onglets
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Retirer active de tous les boutons et contenus
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Ajouter active au bouton cliqué et son contenu
        btn.classList.add('active');
        const tabId = btn.dataset.tab + 'Tab';
        document.getElementById(tabId).classList.add('active');
        
        // Réinitialiser les messages
        hideMessages();
    });
});

// =============================================
// GESTION DES UTILISATEURS
// =============================================

function getUsers() {
    const users = localStorage.getItem('app_users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('app_users', JSON.stringify(users));
}

function generateUsernameSuggestions(fullName) {
    const users = getUsers();
    const existingUsernames = users.map(u => u.username.toLowerCase());
    
    // Nettoyer et diviser le nom
    const nameParts = fullName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Retirer accents
        .replace(/[^a-z\s]/g, "") // Garder seulement lettres et espaces
        .split(/\s+/)
        .filter(part => part.length > 0);
    
    if (nameParts.length === 0) return [];
    
    const suggestions = [];
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Suggestion 1: prenom.nom
    if (nameParts.length >= 2) {
        suggestions.push(`${firstName}.${lastName}`);
    }
    
    // Suggestion 2: prenom_nom
    if (nameParts.length >= 2) {
        suggestions.push(`${firstName}_${lastName}`);
    }
    
    // Suggestion 3: premiere lettre + nom
    if (nameParts.length >= 2) {
        suggestions.push(`${firstName[0]}${lastName}`);
    }
    
    // Suggestion 4: prenom + premiere lettre nom
    if (nameParts.length >= 2) {
        suggestions.push(`${firstName}${lastName[0]}`);
    }
    
    // Suggestion 5: prenom seul
    suggestions.push(firstName);
    
    // Suggestion 6: prenom + nombre aléatoire
    suggestions.push(`${firstName}${Math.floor(Math.random() * 900) + 100}`);
    
    // Filtrer les suggestions déjà utilisées et ajouter des variantes
    const availableSuggestions = [];
    suggestions.forEach(suggestion => {
        if (!existingUsernames.includes(suggestion)) {
            availableSuggestions.push(suggestion);
        } else {
            // Ajouter des variantes avec numéros
            for (let i = 1; i <= 5; i++) {
                const variant = `${suggestion}${i}`;
                if (!existingUsernames.includes(variant)) {
                    availableSuggestions.push(variant);
                    break;
                }
            }
        }
    });
    
    // Retourner les 4 meilleures suggestions
    return availableSuggestions.slice(0, 4);
}

function hashPassword(password) {
    // Simple hash pour démo (en production, utiliser bcrypt côté serveur)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function createUser(name, username, password, role) {
    const users = getUsers();
    
    // Vérifier si l'utilisateur existe déjà
    if (users.some(u => u.username === username)) {
        return { success: false, message: 'Ce nom d\'utilisateur existe déjà.' };
    }
    
    const newUser = {
        id: Date.now().toString(),
        name: name,
        username: username,
        password: hashPassword(password),
        role: role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Compte créé avec succès !', user: newUser };
}

function authenticateUser(username, password) {
    const users = getUsers();
    const user = users.find(u => 
        u.username === username && 
        u.password === hashPassword(password)
    );
    
    if (user) {
        // Enregistrer la session
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role
        }));
        return { success: true, user: user };
    }
    
    return { success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect.' };
}

function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// =============================================
// AFFICHAGE DES MESSAGES
// =============================================

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// =============================================
// FORMULAIRE DE CONNEXION
// =============================================

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessages();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showError('Veuillez remplir tous les champs.');
        return;
    }
    
    const result = authenticateUser(username, password);
    
    if (result.success) {
        showSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showError(result.message);
    }
});

// =============================================
// SUGGESTIONS DE NOM D'UTILISATEUR
// =============================================

document.getElementById('registerName').addEventListener('input', (e) => {
    const fullName = e.target.value.trim();
    const suggestionsDiv = document.getElementById('usernameSuggestions');
    const suggestionsGrid = document.getElementById('suggestionsGrid');
    
    if (fullName.length >= 3) {
        const suggestions = generateUsernameSuggestions(fullName);
        
        if (suggestions.length > 0) {
            suggestionsGrid.innerHTML = '';
            suggestions.forEach(suggestion => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'suggestion-btn';
                btn.innerHTML = `<i class="fas fa-check-circle"></i> ${suggestion}`;
                btn.onclick = () => {
                    document.getElementById('registerUsername').value = suggestion;
                    // Vérifier la disponibilité
                    checkUsernameAvailability(suggestion);
                };
                suggestionsGrid.appendChild(btn);
            });
            suggestionsDiv.classList.add('show');
        } else {
            suggestionsDiv.classList.remove('show');
        }
    } else {
        suggestionsDiv.classList.remove('show');
    }
});

function checkUsernameAvailability(username) {
    const users = getUsers();
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    const usernameInput = document.getElementById('registerUsername');
    
    if (exists) {
        usernameInput.style.borderColor = '#dc3545';
        showError('Ce nom d\'utilisateur est déjà pris.');
    } else {
        usernameInput.style.borderColor = '#28a745';
    }
}

// Vérifier en temps réel la disponibilité du nom d'utilisateur
document.getElementById('registerUsername').addEventListener('input', (e) => {
    const username = e.target.value.trim();
    if (username.length >= 3) {
        checkUsernameAvailability(username);
    } else {
        e.target.style.borderColor = '#e0e0e0';
    }
});

// =============================================
// FORMULAIRE D'INSCRIPTION
// =============================================

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessages();
    
    const name = document.getElementById('registerName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    if (!name || !username || !password) {
        showError('Veuillez remplir tous les champs.');
        return;
    }
    
    if (password.length < 6) {
        showError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }
    
    const result = createUser(name, username, password, role);
    
    if (result.success) {
        showSuccess(result.message + ' Vous pouvez maintenant vous connecter.');
        document.getElementById('registerForm').reset();
        
        // Afficher la liste des utilisateurs
        displayUserList();
        
        // Basculer vers l'onglet connexion après 2 secondes
        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
        }, 2000);
    } else {
        showError(result.message);
    }
});

// =============================================
// AFFICHAGE DE LA LISTE DES UTILISATEURS
// =============================================

function displayUserList() {
    const users = getUsers();
    const userListDiv = document.getElementById('userList');
    
    if (users.length === 0) {
        userListDiv.style.display = 'none';
        return;
    }
    
    userListDiv.style.display = 'block';
    userListDiv.innerHTML = '<h4 style="padding: 10px 15px; margin: 0; background: #f8f9fa; border-bottom: 1px solid #e0e0e0;">Utilisateurs enregistrés</h4>';
    
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
            <div>
                <strong>${user.name}</strong><br>
                <small>@${user.username} • ${user.role}</small>
            </div>
            <button class="delete-user" onclick="deleteUser('${user.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        userListDiv.appendChild(userDiv);
    });
}

function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }
    
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    
    // Supprimer aussi les données de cet utilisateur
    localStorage.removeItem(`swimmers_${userId}`);
    
    showSuccess('Utilisateur supprimé avec succès.');
    displayUserList();
}

// =============================================
// INITIALISATION
// =============================================

// Vérifier si déjà connecté
const currentUser = getCurrentUser();
if (currentUser) {
    // Déjà connecté, rediriger vers l'app
    window.location.href = 'index.html';
}

// Afficher la liste des utilisateurs
displayUserList();

// Créer un utilisateur admin par défaut si aucun utilisateur
const users = getUsers();
if (users.length === 0) {
    createUser('Administrateur', 'admin', 'admin123', 'entraineur');
    displayUserList();
    
    // Afficher un message d'info
    setTimeout(() => {
        showSuccess('Compte admin créé : admin / admin123');
    }, 500);
}
