// =============================================
// SERVICE DE SYNCHRONISATION FIREBASE
// =============================================

/**
 * Service de synchronisation entre localStorage et Firebase
 * Gère la synchronisation bidirectionnelle en temps réel
 */

class SyncService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncEnabled = false;
        this.listeners = new Map();
        this.pendingWrites = [];
        this.lastSync = null;
        
        // Écouter les changements de connexion
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    // =============================================
    // INITIALISATION
    // =============================================

    async initialize() {
        try {
            // Vérifier si Firebase est initialisé
            if (!isFirebaseInitialized()) {
                console.warn('⚠️ Firebase non initialisé. Mode hors ligne uniquement.');
                return false;
            }

            this.syncEnabled = true;
            console.log('✅ Service de synchronisation activé');

            // Synchroniser les données initiales
            await this.initialSync();

            // Activer les listeners en temps réel
            this.setupRealtimeListeners();

            return true;

        } catch (error) {
            console.error('❌ Erreur initialisation sync:', error);
            return false;
        }
    }

    // =============================================
    // SYNCHRONISATION INITIALE
    // =============================================

    async initialSync() {
        console.log('🔄 Synchronisation initiale...');

        try {
            // Récupérer toutes les données depuis Firebase
            const snapshot = await getRef('/').once('value');
            const firebaseData = snapshot.val() || {};

            // Récupérer les données locales
            const localData = this.getLocalData();

            // Décider quelle version garder (la plus récente)
            if (firebaseData.lastModified && localData.lastModified) {
                if (firebaseData.lastModified > localData.lastModified) {
                    // Firebase plus récent → écraser le local
                    this.writeToLocal(firebaseData);
                    console.log('✅ Données Firebase synchronisées vers local');
                } else {
                    // Local plus récent → écraser Firebase
                    await this.writeToFirebase(localData);
                    console.log('✅ Données locales synchronisées vers Firebase');
                }
            } else if (firebaseData.swimmers || firebaseData.teams) {
                // Firebase a des données, local vide
                this.writeToLocal(firebaseData);
                console.log('✅ Données Firebase chargées');
            } else if (localData.swimmers || localData.teams) {
                // Local a des données, Firebase vide
                await this.writeToFirebase(localData);
                console.log('✅ Données locales envoyées à Firebase');
            }

            this.lastSync = Date.now();

        } catch (error) {
            console.error('❌ Erreur sync initiale:', error);
        }
    }

    // =============================================
    // LISTENERS TEMPS RÉEL
    // =============================================

    setupRealtimeListeners() {
        // Listener pour les nageurs
        const swimmersRef = getRef('/swimmers');
        swimmersRef.on('value', (snapshot) => {
            const swimmers = snapshot.val();
            if (swimmers) {
                localStorage.setItem('swimmers', JSON.stringify(swimmers));
                console.log('🔄 Nageurs synchronisés depuis Firebase');
                
                // Notifier l'application du changement
                this.notifyChange('swimmers', swimmers);
            }
        });

        // Listener pour les équipes
        const teamsRef = getRef('/teams');
        teamsRef.on('value', (snapshot) => {
            const teams = snapshot.val();
            if (teams) {
                localStorage.setItem('teams', JSON.stringify(teams));
                console.log('🔄 Équipes synchronisées depuis Firebase');
                
                this.notifyChange('teams', teams);
            }
        });

        // Listener pour les présences
        const attendancesRef = getRef('/attendances');
        attendancesRef.on('value', (snapshot) => {
            const attendances = snapshot.val();
            if (attendances) {
                localStorage.setItem('attendances', JSON.stringify(attendances));
                console.log('🔄 Présences synchronisées depuis Firebase');
                
                this.notifyChange('attendances', attendances);
            }
        });

        console.log('✅ Listeners temps réel activés');
    }

    // =============================================
    // ÉCRITURE VERS FIREBASE
    // =============================================

    async saveSwimmers(swimmers) {
        if (!this.syncEnabled) {
            // Mode hors ligne : sauvegarder uniquement en local
            localStorage.setItem('swimmers', JSON.stringify(swimmers));
            return;
        }

        try {
            // Sauvegarder en local immédiatement
            localStorage.setItem('swimmers', JSON.stringify(swimmers));

            // Sauvegarder sur Firebase
            await getRef('/swimmers').set(swimmers);
            await getRef('/lastModified').set(Date.now());

            console.log('✅ Nageurs sauvegardés sur Firebase');

        } catch (error) {
            console.error('❌ Erreur sauvegarde nageurs:', error);
            // En cas d'erreur, ajouter à la file d'attente
            this.pendingWrites.push({ type: 'swimmers', data: swimmers });
        }
    }

    async saveTeams(teams) {
        if (!this.syncEnabled) {
            localStorage.setItem('teams', JSON.stringify(teams));
            return;
        }

        try {
            localStorage.setItem('teams', JSON.stringify(teams));
            await getRef('/teams').set(teams);
            await getRef('/lastModified').set(Date.now());

            console.log('✅ Équipes sauvegardées sur Firebase');

        } catch (error) {
            console.error('❌ Erreur sauvegarde équipes:', error);
            this.pendingWrites.push({ type: 'teams', data: teams });
        }
    }

    async saveAttendances(attendances) {
        if (!this.syncEnabled) {
            localStorage.setItem('attendances', JSON.stringify(attendances));
            return;
        }

        try {
            localStorage.setItem('attendances', JSON.stringify(attendances));
            await getRef('/attendances').set(attendances);
            await getRef('/lastModified').set(Date.now());

            console.log('✅ Présences sauvegardées sur Firebase');

        } catch (error) {
            console.error('❌ Erreur sauvegarde présences:', error);
            this.pendingWrites.push({ type: 'attendances', data: attendances });
        }
    }

    // =============================================
    // FONCTIONS UTILITAIRES
    // =============================================

    getLocalData() {
        return {
            swimmers: JSON.parse(localStorage.getItem('swimmers') || '[]'),
            teams: JSON.parse(localStorage.getItem('teams') || '[]'),
            attendances: JSON.parse(localStorage.getItem('attendances') || '[]'),
            lastModified: parseInt(localStorage.getItem('lastModified') || '0')
        };
    }

    writeToLocal(data) {
        if (data.swimmers) {
            localStorage.setItem('swimmers', JSON.stringify(data.swimmers));
        }
        if (data.teams) {
            localStorage.setItem('teams', JSON.stringify(data.teams));
        }
        if (data.attendances) {
            localStorage.setItem('attendances', JSON.stringify(data.attendances));
        }
        if (data.lastModified) {
            localStorage.setItem('lastModified', data.lastModified.toString());
        }
    }

    async writeToFirebase(data) {
        const updates = {};
        
        if (data.swimmers && data.swimmers.length > 0) {
            updates['/swimmers'] = data.swimmers;
        }
        if (data.teams && data.teams.length > 0) {
            updates['/teams'] = data.teams;
        }
        if (data.attendances && data.attendances.length > 0) {
            updates['/attendances'] = data.attendances;
        }
        updates['/lastModified'] = Date.now();

        await getRef('/').update(updates);
    }

    // =============================================
    // GESTION CONNEXION
    // =============================================

    handleOnline() {
        console.log('🌐 Connexion rétablie');
        this.isOnline = true;

        // Synchroniser les écritures en attente
        this.syncPendingWrites();
    }

    handleOffline() {
        console.log('📡 Hors ligne - mode local uniquement');
        this.isOnline = false;
    }

    async syncPendingWrites() {
        if (this.pendingWrites.length === 0) return;

        console.log(`🔄 Synchronisation de ${this.pendingWrites.length} écritures en attente...`);

        for (const write of this.pendingWrites) {
            try {
                await getRef(`/${write.type}`).set(write.data);
                console.log(`✅ ${write.type} synchronisé`);
            } catch (error) {
                console.error(`❌ Erreur sync ${write.type}:`, error);
            }
        }

        this.pendingWrites = [];
        await getRef('/lastModified').set(Date.now());
    }

    // =============================================
    // NOTIFICATIONS
    // =============================================

    notifyChange(dataType, data) {
        // Déclencher un événement personnalisé
        const event = new CustomEvent('dataSync', {
            detail: { type: dataType, data: data }
        });
        window.dispatchEvent(event);
    }

    onDataChange(callback) {
        window.addEventListener('dataSync', (e) => {
            callback(e.detail.type, e.detail.data);
        });
    }

    // =============================================
    // STATUT
    // =============================================

    getStatus() {
        return {
            online: this.isOnline,
            syncEnabled: this.syncEnabled,
            lastSync: this.lastSync,
            pendingWrites: this.pendingWrites.length
        };
    }
}

// =============================================
// INSTANCE GLOBALE
// =============================================

const syncService = new SyncService();

// =============================================
// INITIALISATION AUTOMATIQUE
// =============================================

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof initializeFirebase === 'function') {
            initializeFirebase();
            syncService.initialize();
        }
    });
} else {
    // DOM déjà chargé
    if (typeof initializeFirebase === 'function') {
        initializeFirebase();
        syncService.initialize();
    }
}

// =============================================
// INDICATEUR DE STATUT (UI)
// =============================================

function createSyncIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'sync-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
    `;

    const dot = document.createElement('span');
    dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    `;

    const text = document.createElement('span');

    indicator.appendChild(dot);
    indicator.appendChild(text);
    document.body.appendChild(indicator);

    // Mettre à jour le statut
    function updateStatus() {
        const status = syncService.getStatus();
        
        if (status.syncEnabled && status.online) {
            indicator.style.background = '#34a853';
            indicator.style.color = 'white';
            dot.style.background = 'white';
            text.textContent = 'Synchronisé';
        } else if (status.online) {
            indicator.style.background = '#fbbc04';
            indicator.style.color = 'white';
            dot.style.background = 'white';
            text.textContent = 'En ligne';
        } else {
            indicator.style.background = '#ea4335';
            indicator.style.color = 'white';
            dot.style.background = 'white';
            text.textContent = 'Hors ligne';
        }

        if (status.pendingWrites > 0) {
            text.textContent += ` (${status.pendingWrites})`;
        }
    }

    // Mettre à jour toutes les 2 secondes
    setInterval(updateStatus, 2000);
    updateStatus();
}

// Créer l'indicateur quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSyncIndicator);
} else {
    createSyncIndicator();
}
