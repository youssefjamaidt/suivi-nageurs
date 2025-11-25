// Gestion des nageurs par les coaches
const db = firebase.firestore();

// État global
let currentCoach = null;
let swimmers = [];
let generatedPassword = '';

// Charger les nageurs du coach
async function loadSwimmers() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        // Récupérer les données du coach
        const coachDoc = await db.collection('users').doc(user.uid).get();
        currentCoach = { uid: user.uid, ...coachDoc.data() };

        // Récupérer les nageurs gérés par ce coach
        const swimmersSnapshot = await db.collection('users')
            .where('role', '==', 'nageur')
            .where('coachId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        swimmers = swimmersSnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));

        displaySwimmers();

    } catch (error) {
        console.error('Erreur chargement nageurs:', error);
        showError('Erreur lors du chargement des nageurs');
    }
}

// Afficher la liste des nageurs
function displaySwimmers() {
    const container = document.getElementById('swimmers-container');

    if (swimmers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏊</div>
                <p>Aucun nageur pour le moment</p>
                <p style="color: #999; font-size: 0.9rem;">Cliquez sur "Ajouter un Nageur" pour commencer</p>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <table class="swimmers-table">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Niveau</th>
                    <th>Date de naissance</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    swimmers.forEach(swimmer => {
        const statusClass = `status-${swimmer.status}`;
        const statusText = {
            'active': 'Actif',
            'pending': 'En attente',
            'disabled': 'Désactivé'
        }[swimmer.status] || swimmer.status;

        const birthdate = swimmer.birthdate 
            ? new Date(swimmer.birthdate).toLocaleDateString('fr-FR')
            : 'Non renseignée';

        const level = swimmer.level || 'Non défini';

        tableHTML += `
            <tr>
                <td><strong>${swimmer.firstName} ${swimmer.lastName}</strong></td>
                <td>${swimmer.email}</td>
                <td>${level}</td>
                <td>${birthdate}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="editSwimmer('${swimmer.uid}')" title="Modifier">
                        ✏️
                    </button>
                    <button class="action-btn btn-reset-password" onclick="resetSwimmerPassword('${swimmer.uid}')" title="Réinitialiser mot de passe">
                        🔑
                    </button>
                    ${swimmer.status === 'active' 
                        ? `<button class="action-btn btn-disable" onclick="toggleSwimmerStatus('${swimmer.uid}', 'disabled')" title="Désactiver">❌</button>`
                        : `<button class="action-btn btn-enable" onclick="toggleSwimmerStatus('${swimmer.uid}', 'active')" title="Activer">✅</button>`
                    }
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// Générer un mot de passe sécurisé
function generateSecurePassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%&*';
    
    // Garantir au moins un caractère de chaque type
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Compléter avec des caractères aléatoires
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Ouvrir le modal de création
function openCreateSwimmerModal() {
    document.getElementById('create-swimmer-modal').style.display = 'block';
    document.getElementById('create-swimmer-form').reset();
}

// Fermer le modal de création
function closeCreateSwimmerModal() {
    document.getElementById('create-swimmer-modal').style.display = 'none';
}

// Créer un nageur
async function createSwimmer(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Création en cours...';
    submitBtn.disabled = true;

    try {
        const firstName = document.getElementById('swimmer-firstName').value.trim();
        const lastName = document.getElementById('swimmer-lastName').value.trim();
        const email = document.getElementById('swimmer-email').value.trim().toLowerCase();
        const birthdate = document.getElementById('swimmer-birthdate').value;
        const level = document.getElementById('swimmer-level').value;

        // Vérifier si l'email existe déjà
        const existingUser = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (!existingUser.empty) {
            alert('⚠️ Un utilisateur avec cet email existe déjà.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Générer un mot de passe sécurisé
        generatedPassword = generateSecurePassword();

        // Créer le compte Firebase Auth
        // Note: Ceci nécessite des privilèges admin, on va utiliser Cloud Functions
        // Pour l'instant, on va créer juste le document Firestore avec status='pending_activation'
        // et le nageur devra activer son compte via email

        // Alternative : Créer directement avec un mot de passe temporaire
        // On va utiliser une approche avec Cloud Function ou créer directement

        // Créer le document dans Firestore
        const swimmerData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: 'nageur',
            status: 'active', // Actif immédiatement car créé par le coach
            coachId: currentCoach.uid,
            coachName: `${currentCoach.firstName} ${currentCoach.lastName}`,
            club: currentCoach.club || '',
            birthdate: birthdate || null,
            level: level,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentCoach.uid,
            tempPassword: generatedPassword // Stocké temporairement pour création Auth
        };

        // Ajouter à Firestore
        const swimmerRef = await db.collection('users').add(swimmerData);

        // Créer le compte Firebase Auth via Cloud Function
        // Pour l'instant, on affiche juste le mot de passe
        // Le nageur devra s'inscrire avec ce mot de passe

        alert('✅ Nageur créé avec succès !');

        // Afficher le modal avec le mot de passe
        document.getElementById('temp-password').textContent = generatedPassword;
        closeCreateSwimmerModal();
        document.getElementById('password-modal').style.display = 'block';

        // Recharger la liste
        await loadSwimmers();

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

    } catch (error) {
        console.error('Erreur création nageur:', error);
        alert('❌ Erreur lors de la création du nageur : ' + error.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Fermer le modal de mot de passe
function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    generatedPassword = '';
}

// Copier le mot de passe
function copyPassword() {
    const password = document.getElementById('temp-password').textContent;
    navigator.clipboard.writeText(password).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copié !';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        alert('Erreur lors de la copie');
    });
}

// Modifier un nageur
function editSwimmer(uid) {
    const swimmer = swimmers.find(s => s.uid === uid);
    if (!swimmer) return;

    // TODO: Implémenter le modal d'édition
    alert('Fonctionnalité d\'édition à venir');
}

// Réinitialiser le mot de passe d'un nageur
async function resetSwimmerPassword(uid) {
    const swimmer = swimmers.find(s => s.uid === uid);
    if (!swimmer) return;

    if (!confirm(`Réinitialiser le mot de passe de ${swimmer.firstName} ${swimmer.lastName} ?`)) {
        return;
    }

    try {
        // Générer un nouveau mot de passe
        const newPassword = generateSecurePassword();

        // Mettre à jour dans Firestore
        await db.collection('users').doc(uid).update({
            tempPassword: newPassword,
            passwordResetAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Afficher le nouveau mot de passe
        generatedPassword = newPassword;
        document.getElementById('temp-password').textContent = newPassword;
        document.getElementById('password-modal').style.display = 'block';

        alert('✅ Nouveau mot de passe généré !');

    } catch (error) {
        console.error('Erreur réinitialisation mot de passe:', error);
        alert('❌ Erreur lors de la réinitialisation du mot de passe');
    }
}

// Activer/Désactiver un nageur
async function toggleSwimmerStatus(uid, newStatus) {
    const swimmer = swimmers.find(s => s.uid === uid);
    if (!swimmer) return;

    const action = newStatus === 'active' ? 'activer' : 'désactiver';
    if (!confirm(`Voulez-vous ${action} ${swimmer.firstName} ${swimmer.lastName} ?`)) {
        return;
    }

    try {
        await db.collection('users').doc(uid).update({
            status: newStatus,
            statusUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert(`✅ Nageur ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`);
        await loadSwimmers();

    } catch (error) {
        console.error('Erreur changement statut:', error);
        alert('❌ Erreur lors du changement de statut');
    }
}

// Afficher une erreur
function showError(message) {
    alert('❌ ' + message);
}

// Fermer les modals en cliquant en dehors
window.onclick = function(event) {
    const createModal = document.getElementById('create-swimmer-modal');
    const passwordModal = document.getElementById('password-modal');
    
    if (event.target === createModal) {
        closeCreateSwimmerModal();
    }
    if (event.target === passwordModal) {
        closePasswordModal();
    }
}
