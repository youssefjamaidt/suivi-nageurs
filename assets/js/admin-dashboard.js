// ====================================
// ADMIN DASHBOARD - GESTION SYSTÈME
// ====================================

let currentAdmin = null;
let currentEditingUser = null;

// ====================================
// INITIALISATION
// ====================================

// Vérifier l'authentification au chargement
async function checkAuth() {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        const userData = await getUserData(user.uid);
        
        if (!userData) {
            console.error('Données utilisateur introuvables');
            await auth.signOut();
            window.location.href = 'login.html';
            return;
        }
        
        // Vérifier que c'est un admin
        if (userData.role !== 'admin') {
            console.warn('Accès refusé: rôle non-admin');
            redirectByRole(userData.role);
            return;
        }
        
        currentAdmin = userData;
        
        // Afficher le nom de l'admin
        document.getElementById('admin-name').textContent = 
            `${userData.firstName} ${userData.lastName}`;
        
        // Masquer loader et afficher interface
        document.getElementById('auth-loader').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        
        // Charger les données initiales
        await loadDashboardStats();
        await loadRegistrationRequests();
        
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        window.location.href = 'login.html';
    }
}

// ====================================
// NAVIGATION
// ====================================

function showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Désactiver tous les nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Activer la section et le nav item
    document.getElementById(`${sectionName}-section`).classList.add('active');
    event.target.classList.add('active');
    
    // Charger les données de la section
    switch(sectionName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'requests':
            loadRegistrationRequests();
            break;
        case 'users':
            loadAllUsers();
            break;
        case 'logs':
            loadLogs();
            break;
    }
}

// ====================================
// DASHBOARD - STATISTIQUES
// ====================================

async function loadDashboardStats() {
    try {
        // Récupérer tous les utilisateurs
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculer les stats
        const totalUsers = users.length;
        const coaches = users.filter(u => u.role === 'coach').length;
        const swimmers = users.filter(u => u.role === 'nageur').length;
        const pending = users.filter(u => u.status === 'pending').length;
        
        // Afficher les stats
        document.getElementById('stat-total-users').textContent = totalUsers;
        document.getElementById('stat-coaches').textContent = coaches;
        document.getElementById('stat-swimmers').textContent = swimmers;
        document.getElementById('stat-pending').textContent = pending;
        
        // Afficher activité récente (derniers utilisateurs créés)
        const recentUsers = users
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            })
            .slice(0, 5);
        
        displayRecentActivity(recentUsers);
        
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

function displayRecentActivity(users) {
    const container = document.getElementById('recent-activity');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <p>Aucune activité récente</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Email</th>
                    <th>Date Inscription</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td><strong>${user.firstName} ${user.lastName}</strong></td>
                        <td><span class="badge ${user.role}">${getRoleLabel(user.role)}</span></td>
                        <td>${user.email}</td>
                        <td>${formatFirestoreDate(user.createdAt)}</td>
                        <td><span class="badge ${user.status}">${getStatusLabel(user.status)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// ====================================
// DEMANDES D'INSCRIPTION
// ====================================

async function loadRegistrationRequests() {
    try {
        showToast('Chargement des demandes...', 'info');
        
        // Récupérer les demandes en attente (sans orderBy pour éviter l'index composite)
        const pendingUsersSnapshot = await db.collection('users')
            .where('status', '==', 'pending')
            .get();
        
        // Trier manuellement par date
        const requests = pendingUsersSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });
        
        displayRegistrationRequests(requests);
        
    } catch (error) {
        console.error('Erreur chargement demandes:', error);
        showToast('Erreur chargement des demandes', 'error');
    }
}

function displayRegistrationRequests(requests) {
    const container = document.getElementById('requests-table');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">✅</div>
                <p>Aucune demande en attente</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Nom Complet</th>
                    <th>Email</th>
                    <th>Club</th>
                    <th>Téléphone</th>
                    <th>Date Demande</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(request => `
                    <tr>
                        <td><strong>${request.firstName} ${request.lastName}</strong></td>
                        <td>${request.email}</td>
                        <td>${request.club || 'N/A'}</td>
                        <td>${request.phone || 'N/A'}</td>
                        <td>${formatFirestoreDate(request.createdAt)}</td>
                        <td>
                            <button class="action-btn btn-approve" onclick="approveRequest('${request.id}')">
                                ✓ Approuver
                            </button>
                            <button class="action-btn btn-reject" onclick="rejectRequest('${request.id}')">
                                ✗ Refuser
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function approveRequest(userId) {
    if (!confirm('Voulez-vous approuver cette demande ?')) return;
    
    try {
        showToast('Approbation en cours...', 'info');
        
        // Mettre à jour le statut
        await db.collection('users').doc(userId).update({
            status: 'active',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: currentAdmin.firstName + ' ' + currentAdmin.lastName
        });
        
        // TODO: Envoyer email de validation au coach
        
        showToast('Demande approuvée avec succès !', 'success');
        
        // Recharger les demandes
        await loadRegistrationRequests();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Erreur approbation:', error);
        showToast('Erreur lors de l\'approbation', 'error');
    }
}

async function rejectRequest(userId) {
    const reason = prompt('Raison du refus (optionnel):');
    
    if (!confirm('Voulez-vous vraiment refuser cette demande ?')) return;
    
    try {
        showToast('Refus en cours...', 'info');
        
        // Récupérer les données de l'utilisateur avant suppression
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        // Supprimer de Firestore
        await db.collection('users').doc(userId).delete();
        
        // Supprimer de Firebase Auth
        // Note: Nécessite Cloud Function côté serveur pour supprimer l'auth
        // Pour l'instant on marque juste comme rejected dans Firestore
        
        // TODO: Envoyer email de refus
        
        showToast('Demande refusée', 'success');
        
        // Recharger les demandes
        await loadRegistrationRequests();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Erreur refus:', error);
        showToast('Erreur lors du refus', 'error');
    }
}

// ====================================
// GESTION UTILISATEURS
// ====================================

async function loadAllUsers() {
    try {
        showToast('Chargement des utilisateurs...', 'info');
        
        // Récupérer tous les utilisateurs (sans orderBy pour éviter l'index)
        const usersSnapshot = await db.collection('users').get();
        
        // Trier manuellement par date
        const users = usersSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });
        
        displayAllUsers(users);
        
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        showToast('Erreur chargement des utilisateurs', 'error');
    }
}

function displayAllUsers(users) {
    const container = document.getElementById('users-table');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">👥</div>
                <p>Aucun utilisateur</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Nom Complet</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Club</th>
                    <th>Dernière Connexion</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td><strong>${user.firstName} ${user.lastName}</strong></td>
                        <td>${user.email}</td>
                        <td><span class="badge ${user.role}">${getRoleLabel(user.role)}</span></td>
                        <td><span class="badge ${user.status}">${getStatusLabel(user.status)}</span></td>
                        <td>${user.club || 'N/A'}</td>
                        <td>${user.lastLogin ? formatFirestoreDate(user.lastLogin) : 'Jamais'}</td>
                        <td>
                            <button class="action-btn btn-edit" onclick="editUser('${user.id}')">
                                ✏️ Modifier
                            </button>
                            ${user.status === 'active' ? 
                                `<button class="action-btn btn-disable" onclick="toggleUserStatus('${user.id}', 'disabled')">
                                    🔒 Désactiver
                                </button>` :
                                `<button class="action-btn btn-approve" onclick="toggleUserStatus('${user.id}', 'active')">
                                    🔓 Activer
                                </button>`
                            }
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function editUser(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        currentEditingUser = { id: userId, ...userData };
        
        const modalBody = document.getElementById('edit-user-form');
        modalBody.innerHTML = `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Rôle</label>
                <select id="edit-role" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="admin" ${userData.role === 'admin' ? 'selected' : ''}>Administrateur</option>
                    <option value="coach" ${userData.role === 'coach' ? 'selected' : ''}>Entraîneur</option>
                    <option value="nageur" ${userData.role === 'nageur' ? 'selected' : ''}>Nageur</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Statut</label>
                <select id="edit-status" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="active" ${userData.status === 'active' ? 'selected' : ''}>Actif</option>
                    <option value="pending" ${userData.status === 'pending' ? 'selected' : ''}>En attente</option>
                    <option value="disabled" ${userData.status === 'disabled' ? 'selected' : ''}>Désactivé</option>
                </select>
            </div>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${userData.email}</p>
                <p style="margin: 5px 0;"><strong>Club:</strong> ${userData.club || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${userData.phone || 'N/A'}</p>
            </div>
        `;
        
        openModal('edit-user-modal');
        
    } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
        showToast('Erreur chargement utilisateur', 'error');
    }
}

async function saveUserChanges() {
    if (!currentEditingUser) return;
    
    try {
        const newRole = document.getElementById('edit-role').value;
        const newStatus = document.getElementById('edit-status').value;
        
        showToast('Sauvegarde en cours...', 'info');
        
        await db.collection('users').doc(currentEditingUser.id).update({
            role: newRole,
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentAdmin.firstName + ' ' + currentAdmin.lastName
        });
        
        showToast('Modifications sauvegardées !', 'success');
        
        closeModal('edit-user-modal');
        await loadAllUsers();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        showToast('Erreur lors de la sauvegarde', 'error');
    }
}

async function toggleUserStatus(userId, newStatus) {
    const action = newStatus === 'disabled' ? 'désactiver' : 'activer';
    
    if (!confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) return;
    
    try {
        showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} en cours...`, 'info');
        
        await db.collection('users').doc(userId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast(`Utilisateur ${action} avec succès !`, 'success');
        
        await loadAllUsers();
        await loadDashboardStats();
        
    } catch (error) {
        console.error('Erreur modification statut:', error);
        showToast('Erreur lors de la modification', 'error');
    }
}

// ====================================
// LOGS D'ACTIVITÉ
// ====================================

async function loadLogs() {
    // TODO: Implémenter système de logs
    // Pour l'instant, affichage placeholder
    document.getElementById('logs-table').innerHTML = `
        <div class="empty-state">
            <div class="icon">📋</div>
            <p>Système de logs en développement</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">
                Les logs incluront : connexions, modifications, actions admin, etc.
            </p>
        </div>
    `;
}

// ====================================
// MODALS
// ====================================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// ====================================
// UTILITAIRES
// ====================================

function getRoleLabel(role) {
    const labels = {
        'admin': 'Admin',
        'coach': 'Entraîneur',
        'nageur': 'Nageur'
    };
    return labels[role] || role;
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Actif',
        'pending': 'En attente',
        'disabled': 'Désactivé'
    };
    return labels[status] || status;
}

async function handleLogout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        try {
            await logout();
        } catch (error) {
            console.error('Erreur déconnexion:', error);
            alert('Erreur lors de la déconnexion');
        }
    }
}

// ====================================
// INITIALISATION AU CHARGEMENT
// ====================================

// Vérifier l'authentification au chargement de la page
checkAuth();
