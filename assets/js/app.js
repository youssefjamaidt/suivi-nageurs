
// =============================================
// DONNÉES ET ÉTAT DE L'APPLICATION
// =============================================
let swimmers = [];
let currentSwimmerId = null;
let currentDataType = null;

// ===== CACHE SYSTEM POUR PERFORMANCES =====
const Cache = {
    _data: {},
    _timestamps: {},
    TTL: 5000, // 5 secondes
    
    get(key) {
        const now = Date.now();
        if (this._data[key] && (now - this._timestamps[key]) < this.TTL) {
            return this._data[key];
        }
        return null;
    },
    
    set(key, value) {
        this._data[key] = value;
        this._timestamps[key] = Date.now();
    },
    
    clear() {
        this._data = {};
        this._timestamps = {};
    }
};

// ===== CHART REGISTRY POUR CLEANUP =====
const ChartRegistry = {
    charts: {},
    
    register(id, chart) {
        if (this.charts[id]) {
            this.charts[id].destroy();
        }
        this.charts[id] = chart;
    },
    
    destroy(id) {
        if (this.charts[id]) {
            this.charts[id].destroy();
            delete this.charts[id];
        }
    },
    
    destroyAll() {
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
    }
};

// ===== DEBOUNCE UTILITY =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================
// FONCTION UTILITAIRE - NOTIFICATIONS
// =============================================
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#34a853' : type === 'error' ? '#ea4335' : '#1a73e8'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Fonction pour créer un nageur de test avec données complètes
function createTestSwimmer() {
    // GENERATION DE 30 JOURS DE DONNEES COMPLETES
    const today = new Date();
    const dates = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    // PHASE 1: COLLECTE - Génération des données brutes avec variation réaliste
    const wellbeingData = dates.map((date, i) => {
        const cycle = Math.sin(i / 7 * Math.PI); // Cycle hebdomadaire
        return {
            date: date,
            sleep: Math.max(1, Math.min(10, Math.round(7 + cycle * 2 + (Math.random() - 0.5)))),
            fatigue: Math.max(1, Math.min(10, Math.round(4 - cycle * 2 + (Math.random() - 0.5)))),
            pain: Math.max(0, Math.min(10, Math.round(1 + (Math.random() * 2)))),
            stress: Math.max(1, Math.min(10, Math.round(3 + cycle + (Math.random() - 0.5))))
        };
    });
    
    const trainingData = dates.map((date, i) => {
        const isRest = i % 7 === 6; // Dimanche = repos
        const volume = isRest ? 0 : Math.round(70 + Math.random() * 30);
        const volumeMeters = isRest ? 0 : Math.round(3500 + Math.random() * 1500);
        const rpe = isRest ? 0 : Math.round(6 + Math.random() * 3);
        return {
            date: date,
            volume: volume,
            volumeMeters: volumeMeters,
            rpe: rpe,
            load: volume * rpe
        };
    });
    
    // PHASE 2: ANALYSE - Tests de performance toutes les semaines
    const performanceData = dates.filter((_, i) => i % 7 === 0 || i === dates.length - 1).map((date, i) => ({
        date: date,
        vma: parseFloat((13.5 + i * 0.15 + (Math.random() - 0.5) * 0.3).toFixed(1)),
        shoulderStrength: parseFloat((2.5 + i * 0.2 + (Math.random() - 0.5) * 0.2).toFixed(1)),
        chestStrength: parseFloat((1.8 + i * 0.15 + (Math.random() - 0.5) * 0.15).toFixed(1)),
        legStrength: parseFloat((3.2 + i * 0.18 + (Math.random() - 0.5) * 0.2).toFixed(1))
    }));
    
    // PHASE 3: TRAITEMENT - Suivi médical avec événements variés
    const medicalData = dates.map((date, i) => {
        const hasIllness = i === 10 || i === 22; // 2 périodes de maladie
        const hasInjury = i >= 15 && i <= 17; // 3 jours de blessure
        return {
            date: date,
            availability: hasIllness || hasInjury ? (hasInjury ? 1 : 2) : 3,
            illnesses: hasIllness ? 1 : 0,
            injuries: hasInjury ? 1 : 0,
            otherIssues: 0
        };
    });
    
    // PHASE 4: RETOUR PERSONNALISE - Compétitions avec progression
    const raceData = [
        {
            date: dates[7],
            event: "Meeting Regional - Semaine 1",
            races: [
                { style: "Crawl", distance: "50m", time: "26:45" },
                { style: "Crawl", distance: "100m", time: "58:30" },
                { style: "Dos", distance: "50m", time: "29:80" },
                { style: "Dos", distance: "100m", time: "01:05:20" }
            ]
        },
        {
            date: dates[14],
            event: "Meeting Interclubs - Semaine 2",
            races: [
                { style: "Crawl", distance: "50m", time: "26:20" },
                { style: "Dos", distance: "100m", time: "01:04:85" },
                { style: "Papillon", distance: "50m", time: "31:50" },
                { style: "Brasse", distance: "100m", time: "01:18:40" }
            ]
        },
        {
            date: dates[21],
            event: "Championnat Departemental - Semaine 3",
            races: [
                { style: "Crawl", distance: "100m", time: "57:80" },
                { style: "Dos", distance: "100m", time: "01:04:50" },
                { style: "Papillon", distance: "50m", time: "31:20" },
                { style: "4 Nages", distance: "200m", time: "02:28:90" }
            ]
        },
        {
            date: dates[28],
            event: "Competition Nationale - Semaine 4",
            races: [
                { style: "Crawl", distance: "50m", time: "25:95" },
                { style: "Crawl", distance: "200m", time: "02:08:75" },
                { style: "Dos", distance: "100m", time: "01:04:20" },
                { style: "Papillon", distance: "100m", time: "01:10:30" }
            ]
        }
    ];
    
    // Sessions d'entraînement détaillées (20 jours sur 30)
    const sessionData = dates.filter((_, i) => i % 7 !== 6 && i < 20).map((date, i) => {
        const sessions = [
            {
                warmUp: {content: '400m mixte (100 crawl, 100 dos, 100 brasse, 100 jambes)', volumeMeters: 400, duration: 12},
                mainSet: {content: '8x100m crawl @ 1:30 - Allure seuil', volumeMeters: 800, duration: 16},
                coolDown: {content: '200m crawl souple', volumeMeters: 200, duration: 6}
            },
            {
                warmUp: {content: '600m progressif (4x150m)', volumeMeters: 600, duration: 15},
                mainSet: {content: '10x200m @ 3:00 - Endurance critique', volumeMeters: 2000, duration: 45},
                coolDown: {content: '300m (100 dos, 100 brasse, 100 crawl)', volumeMeters: 300, duration: 8}
            },
            {
                warmUp: {content: '500m technique (25m educatifs, 25m nage)', volumeMeters: 500, duration: 14},
                mainSet: {content: '6x50m sprint @ 1:15 + 4x100m tempo @ 1:45', volumeMeters: 700, duration: 18},
                coolDown: {content: '400m recup active', volumeMeters: 400, duration: 10}
            },
            {
                warmUp: {content: '800m aerobie (200 crawl, 200 dos, 200 brasse, 200 mixte)', volumeMeters: 800, duration: 18},
                mainSet: {content: '12x100m (50 technique, 50 sprint) @ 2:00', volumeMeters: 1200, duration: 28},
                coolDown: {content: '200m dos souple', volumeMeters: 200, duration: 5}
            },
            {
                warmUp: {content: '500m nage libre', volumeMeters: 500, duration: 13},
                mainSet: {content: '5x400m @ 6:00 - Allure competition', volumeMeters: 2000, duration: 50},
                coolDown: {content: '300m crawl leger', volumeMeters: 300, duration: 8}
            }
        ];
        return { date: date, ...sessions[i % sessions.length] };
    });
    
    // Donnees techniques avec progression
    const technicalData = {
        crawl: {
            dates: [dates[3], dates[10], dates[17], dates[24]],
            bodyPosition: [7, 8, 8, 9],
            armMovement: [7, 7, 8, 8],
            legKick: [6, 7, 7, 8],
            breathing: [8, 8, 9, 9],
            coordination: [7, 7, 8, 9]
        },
        backstroke: {
            dates: [dates[5], dates[12], dates[19], dates[26]],
            bodyPosition: [6, 7, 8, 8],
            armMovement: [7, 8, 8, 9],
            legKick: [7, 7, 8, 8],
            breathing: [8, 9, 9, 9],
            coordination: [6, 7, 8, 8]
        },
        butterfly: {
            dates: [dates[7], dates[14], dates[21], dates[28]],
            bodyPosition: [5, 6, 7, 7],
            armMovement: [6, 7, 7, 8],
            legKick: [6, 6, 7, 7],
            breathing: [6, 7, 7, 8],
            coordination: [5, 6, 7, 7]
        },
        breaststroke: {
            dates: [dates[4], dates[11], dates[18], dates[25]],
            bodyPosition: [6, 7, 7, 8],
            armMovement: [7, 7, 8, 8],
            legKick: [7, 8, 8, 9],
            breathing: [8, 8, 9, 9],
            coordination: [6, 7, 7, 8]
        },
        startsAndTurns: {
            dates: [dates[6], dates[13], dates[20], dates[27]],
            reactionTime: [7, 8, 8, 9],
            diveDistance: [6, 7, 8, 8],
            underwaterPhase: [7, 7, 8, 9],
            turnSpeed: [7, 8, 8, 9],
            pushOffPower: [6, 7, 8, 8]
        }
    };
    
    // Presence sur 30 jours avec variete realiste
    const attendanceRecords = [];
    dates.forEach((date, i) => {
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Samedi/Dimanche
        
        if (!isWeekend) {
            // Seance du matin
            if (i === 10 || i === 22) {
                // Jours de maladie
                attendanceRecords.push({
                    date: date,
                    status: 'absent',
                    session: 'Matin',
                    reason: 'Maladie',
                    justified: 'yes'
                });
            } else if (i === 15 || i === 16) {
                // Jours de blessure
                attendanceRecords.push({
                    date: date,
                    status: 'absent',
                    session: 'Matin',
                    reason: 'Blessure',
                    justified: 'yes'
                });
            } else if (i % 8 === 3) {
                // Retard occasionnel
                attendanceRecords.push({
                    date: date,
                    status: 'late',
                    session: 'Matin',
                    lateMinutes: 5 + Math.floor(Math.random() * 15)
                });
            } else {
                attendanceRecords.push({
                    date: date,
                    status: 'present',
                    session: 'Matin'
                });
            }
            
            // Seance de l'apres-midi (3 fois par semaine)
            if (i % 2 === 0) {
                if (i === 10 || i === 22 || i === 15 || i === 16) {
                    attendanceRecords.push({
                        date: date,
                        status: 'absent',
                        session: 'Apres-midi',
                        reason: i === 10 || i === 22 ? 'Maladie' : 'Blessure',
                        justified: 'yes'
                    });
                } else {
                    attendanceRecords.push({
                        date: date,
                        status: 'present',
                        session: 'Apres-midi'
                    });
                }
            }
        }
    });
    
    // CREATION DU NAGEUR AVEC TOUTES LES DONNEES
    const testSwimmer = {
        id: Date.now().toString(),
        name: "Alex Dupont (TEST)",
        age: 22,
        specialty: "Dos & Papillon",
        
        // ===== NOUVELLE STRUCTURE (arrays d'objets) =====
        wellbeingData: wellbeingData,
        trainingData: trainingData,
        performanceData: performanceData,
        medicalData: medicalData,
        raceData: raceData,
        sessionData: sessionData,
        
        // ===== ANCIENNE STRUCTURE (pour compatibilite) =====
        // ===== ANCIENNE STRUCTURE (pour compatibilite) =====
        wellbeing: {
            sleep: wellbeingData.map(d => d.sleep),
            fatigue: wellbeingData.map(d => d.fatigue),
            pain: wellbeingData.map(d => d.pain),
            stress: wellbeingData.map(d => d.stress),
            dates: wellbeingData.map(d => d.date)
        },
        training: {
            volume: trainingData.map(d => d.volume),
            volumeMeters: trainingData.map(d => d.volumeMeters),
            rpe: trainingData.map(d => d.rpe),
            charge: trainingData.map(d => d.load),
            dates: trainingData.map(d => d.date)
        },
        performance: {
            vma: performanceData.map(d => d.vma),
            shoulderStrength: performanceData.map(d => d.shoulderStrength),
            chestStrength: performanceData.map(d => d.chestStrength),
            legStrength: performanceData.map(d => d.legStrength),
            dates: performanceData.map(d => d.date)
        },
        medical: {
            availability: medicalData.map(d => d.availability),
            illnesses: medicalData.map(d => d.illnesses),
            injuries: medicalData.map(d => d.injuries),
            otherIssues: medicalData.map(d => d.otherIssues),
            dates: medicalData.map(d => d.date)
        },
        racePerformances: {
            event: raceData.map(r => r.event),
            races: raceData.map(r => r.races),
            dates: raceData.map(r => r.date)
        },
        technical: technicalData,
        attendance: {
            records: attendanceRecords
        }
    };
    
    swimmers.push(testSwimmer);
    updateAthleteSelector();
    saveToLocalStorage();
    
    // Message détaillé expliquant la logique de génération
    const statsMessage = [
        '✅ NAGEUR TEST CREE AVEC SUCCES !',
        '',
        '📋 LOGIQUE DE GENERATION DES DONNEES:',
        '',
        '1️⃣ COLLECTE (30 jours):',
        '   • ' + wellbeingData.length + ' saisies bien-etre (sommeil, fatigue, douleur, stress)',
        '   • ' + trainingData.filter(d => d.volume > 0).length + ' seances entrainement (volume, RPE, charge)',
        '   • ' + sessionData.length + ' sessions detaillees (echauffement, serie, retour calme)',
        '',
        '2️⃣ ANALYSE (tests reguliers):',
        '   • ' + performanceData.length + ' evaluations performance (VMA, force)',
        '   • ' + raceData.length + ' competitions avec progression des temps',
        '   • Evaluation technique sur 4 nages + virages/plongeons',
        '',
        '3️⃣ TRAITEMENT (suivi medical):',
        '   • 30 jours de disponibilite medicale',
        '   • 2 periodes de maladie simulees',
        '   • 1 periode de blessure simulee',
        '',
        '4️⃣ RETOUR PERSONNALISE (visualisation):',
        '   • ' + attendanceRecords.length + ' presences enregistrees',
        '   • Graphiques evolution sur tous les indicateurs',
        '   • Alertes et recommandations automatiques',
        '',
        '🎯 Selectionnez "Alex Dupont (TEST)" pour explorer !'
    ].join('\n');
    
    alert(statsMessage);
    return testSwimmer;
}

// =============================================
// PERSISTANCE DES DONNÉES - localStorage
// =============================================
function saveToLocalStorage() {
    try {
        Cache.clear(); // Invalider cache
        const swimmersData = JSON.stringify(swimmers);
        const dataSize = new Blob([swimmersData]).size;
        
        // Vérifier la taille (5MB = limite approximative)
        if (dataSize > 4.5 * 1024 * 1024) {
            console.warn('⚠️ Données volumineuses:', (dataSize / 1024 / 1024).toFixed(2), 'MB');
            alert('⚠️ Attention: Vos données deviennent volumineuses. Pensez à exporter et archiver.');
        }
        
        localStorage.setItem('swimmers', swimmersData);
        localStorage.setItem('currentSwimmerId', currentSwimmerId);
        console.log('✅ Données sauvegardées:', swimmers.length, 'nageur(s),', (dataSize / 1024).toFixed(2), 'KB');
        return true;
    } catch (e) {
        console.error('❌ Erreur lors de la sauvegarde:', e);
        if (e.name === 'QuotaExceededError') {
            alert('❌ STOCKAGE PLEIN !\n\nVotre navigateur n\'a plus d\'espace de stockage.\n\n' +
                  'Actions recommandées:\n' +
                  '1. Exportez vos données (bouton Export)\n' +
                  '2. Supprimez d\'anciennes données\n' +
                  '3. Videz le cache du navigateur');
        } else {
            alert('❌ Erreur: Impossible de sauvegarder les données\n\n' + e.message);
        }
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        // Vérifier cache d'abord
        const cached = Cache.get('swimmers');
        if (cached) {
            swimmers = cached;
            console.log('⚡ Données chargées depuis cache:', swimmers.length, 'nageur(s)');
            
            const savedCurrentId = localStorage.getItem('currentSwimmerId');
            if (savedCurrentId && savedCurrentId !== 'null') {
                currentSwimmerId = savedCurrentId;
            }
            return;
        }
        
        const savedSwimmers = localStorage.getItem('swimmers');
        const savedCurrentId = localStorage.getItem('currentSwimmerId');
        
        if (savedSwimmers) {
            swimmers = JSON.parse(savedSwimmers);
            Cache.set('swimmers', swimmers); // Mise en cache
            console.log('✅ Données chargées:', swimmers.length, 'nageur(s)');
        }
        
        if (savedCurrentId && savedCurrentId !== 'null') {
            currentSwimmerId = savedCurrentId;
        }
    } catch (e) {
        console.error('Erreur lors du chargement:', e);
    }
}

function exportData() {
    const dataStr = JSON.stringify(swimmers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suivi-nageurs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Données exportées avec succès!');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                swimmers = importedData;
                saveToLocalStorage();
                updateAthleteSelector();
                updateDashboard();
                alert(`${swimmers.length} nageur(s) importé(s) avec succès!`);
            } else {
                alert('Format de fichier invalide');
            }
        } catch (err) {
            alert('Erreur lors de l\'importation: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// =============================================
// ÉLÉMENTS DOM (déclarés globalement, initialisés dans DOMContentLoaded)
// =============================================
let dashboardContent;
let athleteSelector;
let addSwimmerBtn;
let resetDataBtn;
let addSwimmerModal;
let dataEntryModal;
let dataEntryForm;
let dataEntryTitle;

// =============================================
// INITIALISATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les éléments DOM
    dashboardContent = document.getElementById('dashboardContent');
    athleteSelector = document.getElementById('athleteSelector'); // Ancien sélecteur (fallback)
    addSwimmerBtn = document.getElementById('addSwimmerBtn');
    resetDataBtn = document.getElementById('resetDataBtn');
    addSwimmerModal = document.getElementById('addSwimmerModal');
    dataEntryModal = document.getElementById('dataEntryModal');
    dataEntryForm = document.getElementById('dataEntryForm');
    dataEntryTitle = document.getElementById('dataEntryTitle');
    
    // Charger les données et initialiser l'interface
    loadFromLocalStorage();
    loadTheme();
    initializeEventListeners();
    updateAthleteSelector(); // Fonctionne avec le nouveau design
    updateDashboard();
    updateActionButtons();
    updateQuickInfo();
    
    // Synchronisation automatique entre onglets/pages
    window.addEventListener('storage', function(e) {
        if (e.key === 'swimmers') {
            console.log('🔄 Synchronisation: Nageurs modifiés depuis Équipe');
            loadFromLocalStorage();
            updateAthleteSelector();
            updateDashboard();
            updateQuickInfo();
            if (typeof showNotification === 'function') {
                showNotification('info', 'Données actualisées automatiquement');
            }
        }
        if (e.key === 'teams') {
            console.log('🔄 Synchronisation: Équipes modifiées');
            loadFromLocalStorage();
            updateAthleteSelector();
        }
    });

    // Actualiser au focus de la page
    window.addEventListener('focus', function() {
        const lastSwimmers = localStorage.getItem('swimmers');
        const currentData = JSON.stringify(swimmers);
        if (lastSwimmers !== currentData) {
            console.log('🔄 Rafraîchissement: Retour sur la page dashboard');
            loadFromLocalStorage();
            updateAthleteSelector();
            updateDashboard();
            updateQuickInfo();
        }
    });
    
    // Effet scroll pour le sélecteur sticky
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const stickySelector = document.querySelector('.sticky-selector');
        if (stickySelector) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 50) {
                stickySelector.classList.add('scrolled');
            } else {
                stickySelector.classList.remove('scrolled');
            }
            lastScrollTop = scrollTop;
        }
    });
});

function updateActionButtons() {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const compareBtn = document.getElementById('compareSwimmersBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    
    if (exportPdfBtn) {
        exportPdfBtn.style.display = currentSwimmerId ? 'inline-block' : 'none';
    }
    
    if (compareBtn) {
        compareBtn.style.display = swimmers.length >= 2 ? 'inline-block' : 'none';
    }
    
    if (viewHistoryBtn) {
        viewHistoryBtn.style.display = currentSwimmerId ? 'inline-block' : 'none';
    }
}

// Afficher/cacher les infos rapides du nageur
function updateQuickInfo() {
    const quickInfo = document.getElementById('quickSwimmerInfo');
    if (!quickInfo) return;
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        if (swimmer) {
            quickInfo.style.display = 'block';
            document.getElementById('quickAge').textContent = swimmer.age;
            document.getElementById('quickSpecialty').textContent = getSpecialtyName(swimmer.specialty);
            
            // Compter les données
            let dataCount = 0;
            if (swimmer.wellbeingData) dataCount += swimmer.wellbeingData.length;
            if (swimmer.trainingData) dataCount += swimmer.trainingData.length;
            if (swimmer.performanceData) dataCount += swimmer.performanceData.length;
            document.getElementById('quickDataCount').textContent = dataCount;
            
            // Dernière performance
            if (swimmer.raceData && swimmer.raceData.length > 0) {
                const lastRace = swimmer.raceData[swimmer.raceData.length - 1];
                document.getElementById('quickLastPerf').textContent = `${lastRace.time} (${lastRace.distance}m)`;
            } else {
                document.getElementById('quickLastPerf').textContent = 'Aucune';
            }
        }
    } else {
        quickInfo.style.display = 'none';
    }
}

function getSpecialtyName(specialty) {
    const names = {
        'crawl': 'Crawl',
        'brasse': 'Brasse',
        'dos': 'Dos',
        'papillon': 'Papillon',
        '4nages': '4 Nages'
    };
    return names[specialty] || specialty;
}

// Afficher une section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
}

// =============================================
// GESTION DES ÉVÉNEMENTS
// =============================================
// =============================================
// FONCTION TOGGLE POUR SECTIONS ACCORDÉON
// =============================================

// Nouvelle fonction pour ouvrir une section en modal
function openSectionModal(sectionId) {
    // Fermer toute section modale ouverte
    closeSectionModal();
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    if (!content) return;
    
    // Créer le modal
    const modal = document.createElement('div');
    modal.className = 'section-modal';
    modal.id = `${sectionId}-modal`;
    
    // Obtenir le titre et le style du header
    const header = section.querySelector('.section-header');
    const headerStyle = window.getComputedStyle(header).background;
    const title = header.querySelector('h2').cloneNode(true);
    const subtitle = header.querySelector('p')?.textContent || '';
    
    // Obtenir le titre propre sans éléments inutiles
    const titleIcon = title.querySelector('span:first-child')?.textContent || '';
    const titleText = title.querySelector('span:last-child')?.textContent || title.textContent;
    
    modal.innerHTML = `
        <div class="section-modal-content">
            <div class="section-modal-header" style="background: ${headerStyle};">
                <h2>
                    <span style="font-size: 2.5rem;">${titleIcon}</span>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <span>${titleText}</span>
                        ${subtitle ? `<span style="font-size: 0.9rem; opacity: 0.9; font-weight: normal;">${subtitle}</span>` : ''}
                    </div>
                </h2>
                <button class="section-close-btn" onclick="closeSectionModal()" title="Fermer (Echap)">
                    ✕
                </button>
            </div>
            <div class="section-modal-body">
                ${content.innerHTML}
            </div>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(modal);
    
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';
    
    // Activer le modal avec un délai pour l'animation
    setTimeout(() => {
        modal.classList.add('active');
        // Réinitialiser les graphiques si présents
        setTimeout(() => {
            reinitializeChartsInModal(modal);
        }, 600);
    }, 50);
    
    // Fermer avec Escape
    document.addEventListener('keydown', handleModalEscape);
}

// Fonction pour réinitialiser les graphiques Chart.js dans le modal
function reinitializeChartsInModal(modal) {
    const canvases = modal.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const chartId = canvas.id;
        if (chartId && typeof Chart !== 'undefined') {
            // Détruire le graphique existant s'il existe
            Chart.getChart(chartId)?.destroy();
            
            // Réinitialiser selon le type de graphique
            switch(chartId) {
                case 'wellbeingChart':
                    setupWellbeingChart();
                    break;
                case 'performanceChart':
                    setupPerformanceChart();
                    break;
                case 'medicalChart':
                    setupMedicalChart();
                    break;
                case 'raceChart':
                    setupRaceChart();
                    break;
                case 'technicalChart':
                    setupTechnicalChart();
                    break;
                case 'attendanceChart':
                    setupAttendanceChart();
                    break;
                case 'sessionsChart':
                    setupSessionsChart();
                    break;
                case 'globalChart':
                    setupGlobalChart();
                    break;
            }
        }
    });
}

// Fonction pour fermer la section modale
function closeSectionModal() {
    const modal = document.querySelector('.section-modal.active');
    if (!modal) return;
    
    modal.classList.remove('active');
    
    setTimeout(() => {
        // Détruire les graphiques avant de supprimer le modal
        const canvases = modal.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            const chartId = canvas.id;
            if (chartId && typeof Chart !== 'undefined') {
                Chart.getChart(chartId)?.destroy();
            }
        });
        
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleModalEscape);
    }, 400);
}

// Gestionnaire pour fermer avec Escape
function handleModalEscape(e) {
    if (e.key === 'Escape') {
        closeSectionModal();
    }
}

// Ancienne fonction toggleSection transformée en openSectionModal
function toggleSection(sectionId) {
    openSectionModal(sectionId);
}

function initializeEventListeners() {
    // Navigation mobile
    document.querySelector('.nav-toggle').addEventListener('click', function() {
        document.querySelector('nav').classList.toggle('active');
    });

    // Navigation entre sections
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
            
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            if (window.innerWidth <= 768) {
                document.querySelector('nav').classList.remove('active');
            }
            
            updateDashboard();
        });
    });

    // Gestion des modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.getElementById('cancelAddBtn').addEventListener('click', closeAllModals);
    document.getElementById('cancelDataBtn').addEventListener('click', closeAllModals);

    // Ajout de nageur
    addSwimmerBtn.addEventListener('click', () => {
        addSwimmerModal.style.display = 'flex';
    });

    // Bouton pour créer un nageur de test
    document.getElementById('createTestSwimmerBtn').addEventListener('click', () => {
        if (confirm('Créer un nageur de test avec des données complètes pour démonstration ?')) {
            createTestSwimmer();
        }
    });

    document.getElementById('confirmAddBtn').addEventListener('click', confirmAddSwimmer);

    // Sauvegarde des données
    document.getElementById('saveDataBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveData();
    });

    // Sélection d'athlète (ancien sélecteur - fallback)
    if (athleteSelector) {
        athleteSelector.addEventListener('change', function() {
            currentSwimmerId = this.value === 'all' ? null : this.value;
            console.log('🔍 Nageur sélectionné:', currentSwimmerId);
            console.log('🔍 Liste des nageurs:', swimmers);
            updateDashboard();
            updateActionButtons();
            updateQuickInfo();
        });
    }

    // Réinitialisation
    resetDataBtn.addEventListener('click', resetData);
    
    // Export des données
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    
    // Import des données
    document.getElementById('importDataFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            importData(file);
            e.target.value = ''; // Reset input
        }
    });
    
    // Bouton actualiser
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            updateDashboard();
            updateQuickInfo();
            showNotification('success', 'Dashboard actualisé');
        });
    }
    
    // Export PDF
    document.getElementById('exportPdfBtn').addEventListener('click', generatePdfReport);
    
    // Comparaison multi-nageurs
    document.getElementById('compareSwimmersBtn').addEventListener('click', openCompareModal);
    document.getElementById('closeCompareBtn').addEventListener('click', closeAllModals);
    document.getElementById('generateComparisonBtn').addEventListener('click', generateComparison);
    
    // Mode sombre
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    // Gestion des onglets
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab')) {
            const tabId = e.target.getAttribute('data-tab');
            switchTab(tabId);
        }
        
        // Boutons de saisie de données
        if (e.target.classList.contains('data-entry-btn')) {
            const dataType = e.target.getAttribute('data-type');
            openDataEntryModal(dataType);
        }
        
        // Bouton édition nageur
        if (e.target.classList.contains('edit-swimmer-btn')) {
            const swimmerId = e.target.getAttribute('data-swimmer-id');
            openEditSwimmerModal(swimmerId);
        }
    });
    
    // Édition de nageur
    document.getElementById('confirmEditBtn').addEventListener('click', saveSwimmerEdit);
    document.getElementById('cancelEditBtn').addEventListener('click', closeAllModals);
    document.getElementById('deleteSwimmerBtn').addEventListener('click', deleteSwimmer);
    
    // Historique des données
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', openDataHistoryModal);
    }
    document.getElementById('closeHistoryBtn').addEventListener('click', closeAllModals);
    document.getElementById('applyFiltersBtn').addEventListener('click', applyDataFilters);
    
    // Gestion des sessions d'entraînement
    const addSessionBtn = document.getElementById('addSessionBtn');
    if (addSessionBtn) {
        addSessionBtn.addEventListener('click', openSessionEntry);
    }
    document.getElementById('cancelSessionBtn').addEventListener('click', closeAllModals);
    document.getElementById('saveSessionBtn').addEventListener('click', saveSession);
    
    // Auto-calculate session totals on input change
    const sessionInputs = [
        'warmUpVolume', 'warmUpDuration', 'mainSetVolume', 
        'mainSetDuration', 'coolDownVolume', 'coolDownDuration'
    ];
    sessionInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateSessionTotals);
        }
    });
    
    // ========================================
    // BOUTON FLOTTANT SAISIE DE DONNÉES
    // ========================================
    const floatingBtn = document.getElementById('floatingDataBtn');
    const dataPanel = document.getElementById('dataEntryPanel');
    const overlay = document.getElementById('dataEntryOverlay');
    const closePanel = document.getElementById('closeDataPanel');
    
    if (floatingBtn && dataPanel && overlay) {
        // Ouvrir le panel
        floatingBtn.addEventListener('click', () => {
            dataPanel.classList.add('open');
            overlay.classList.add('active');
            showDataEntry();
        });
        
        // Fermer le panel
        closePanel.addEventListener('click', () => {
            dataPanel.classList.remove('open');
            overlay.classList.remove('active');
        });
        
        overlay.addEventListener('click', () => {
            dataPanel.classList.remove('open');
            overlay.classList.remove('active');
        });
        
        // Drag sur mobile uniquement
        if (window.innerWidth <= 768) {
            let isDragging = false;
            let currentX, currentY, initialX, initialY;
            let xOffset = 0, yOffset = 0;
            
            floatingBtn.addEventListener('touchstart', (e) => {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
                isDragging = true;
                floatingBtn.classList.add('dragging');
            });
            
            floatingBtn.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    
                    // Limites de l'écran
                    const maxX = window.innerWidth - floatingBtn.offsetWidth;
                    const maxY = window.innerHeight - floatingBtn.offsetHeight;
                    
                    currentX = Math.max(0, Math.min(currentX, maxX));
                    currentY = Math.max(0, Math.min(currentY, maxY));
                    
                    floatingBtn.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
            });
            
            floatingBtn.addEventListener('touchend', () => {
                isDragging = false;
                floatingBtn.classList.remove('dragging');
            });
        }
    }
}

// Fonction helper pour ouvrir les modals depuis la liste
function openDataEntryModal(type) {
    // Fermer le panel
    const dataPanel = document.getElementById('dataEntryPanel');
    const overlay = document.getElementById('dataEntryOverlay');
    if (dataPanel && overlay) {
        dataPanel.classList.remove('open');
        overlay.classList.remove('active');
    }
    
    // Ouvrir le modal correspondant
    currentDataEntryType = type;
    const dataEntryModal = document.getElementById('dataEntryModal');
    dataEntryModal.style.display = 'flex';
    openFormForType(type);
}

// =============================================
// FONCTIONS PRINCIPALES - COLLECTE
// =============================================

// Ajouter un nouveau nageur
function confirmAddSwimmer() {
    const name = document.getElementById('swimmerName').value;
    const age = document.getElementById('swimmerAge').value;
    const gender = document.getElementById('swimmerGender').value;
    const specialty = document.getElementById('swimmerSpecialty').value;

    if (name && age && gender && specialty) {
        addNewSwimmer(name, age, gender, specialty);
        closeAllModals();
        document.getElementById('addSwimmerForm').reset();
    } else {
        alert('Veuillez remplir tous les champs');
    }
}

function addNewSwimmer(name, age, gender, specialty) {
    const newSwimmer = {
        id: 'swimmer-' + Date.now(),
        name: name,
        age: parseInt(age),
        gender: gender,
        specialty: specialty,
        joinDate: new Date().toISOString().split('T')[0],
        teams: [], // Liste des équipes auxquelles appartient le nageur
        
        // ===== NOUVELLE STRUCTURE (arrays d'objets) =====
        wellbeingData: [],    // [{date, sleep, fatigue, pain, stress}, ...]
        trainingData: [],     // [{date, volume, volumeMeters, rpe, load}, ...]
        performanceData: [],  // [{date, vma, shoulderStrength, chestStrength, legStrength}, ...]
        medicalData: [],      // [{date, availability, illnesses, injuries, otherIssues}, ...]
        raceData: [],         // [{date, event, races: [{style, distance, time}, ...]}, ...]
        sessionData: [],      // [{date, warmUp: {content, volumeMeters, duration}, mainSet: {}, coolDown: {}}, ...]
        
        // ===== ANCIENNE STRUCTURE (pour compatibilité) =====
        // Données de bien-être
        wellbeing: {
            sleep: [],
            fatigue: [],
            pain: [],
            stress: [],
            dates: []
        },
        
        // Données d'entraînement
        training: {
            volume: [],
            volumeMeters: [],
            rpe: [],
            charge: [],
            dates: []
        },
        
        // Données de performance
        performance: {
            vma: [],
            shoulderStrength: [],
            chestStrength: [],
            legStrength: [],
            dates: []
        },
        
        // Données médicales
        medical: {
            availability: [],
            illnesses: [],
            injuries: [],
            otherIssues: [],
            dates: []
        },
        
        // Performances de course
        racePerformances: {
            event: [],           // Nom de l'événement
            races: [],           // Tableau d'objets {style: "Crawl", distance: "50m", time: "26:50"}
            dates: []
        },
        
        // Suivi technique
        technical: {
            crawl: {
                // Position du corps et équilibre
                alignementCorporel: [],
                rotationEpaules: [],
                stabiliteHanches: [],
                flottaison: [],
                // Mouvement des bras
                entreeDansEau: [],
                phaseTraction: [],
                phasePoussee: [],
                retourAerien: [],
                longueurMouvement: [],
                // Battement de jambes
                amplitudeBattement: [],
                frequenceBattement: [],
                flexibiliteChevilles: [],
                coordinationBras: [],
                // Respiration et coordination
                techniqueRespiration: [],
                timingRespiration: [],
                rythmeNage: [],
                coordinationGlobale: [],
                // Métriques
                coupsParLongueur: [],
                tempsGlisse: [],
                frequenceNage: [],
                distanceParCycle: [],
                // Observations
                pointsForts: [],
                pointsAmeliorer: [],
                exercicesRecommandes: [],
                dates: []
            },
            breaststroke: {
                // Position du corps
                alignementHorizontal: [],
                positionTete: [],
                stabiliteTronc: [],
                // Mouvement des bras
                mouvementEcartement: [],
                mouvementTraction: [],
                mouvementRetour: [],
                synchronisationBrasRespiration: [],
                // Mouvement des jambes
                positionGenoux: [],
                mouvementCiseaux: [],
                flexionChevilles: [],
                puissancePropulsion: [],
                // Coordination et timing
                coordinationBrasJambes: [],
                timingRespiration: [],
                phaseGlisse: [],
                fluiditeMouvement: [],
                // Métriques
                tempsGlisseApres: [],
                amplitudeMouvementJambes: [],
                mouvementsParLongueur: [],
                // Observations
                pointsForts: [],
                pointsAmeliorer: [],
                exercicesRecommandes: [],
                dates: []
            },
            backstroke: {
                // Position du corps
                flottaisonHorizontale: [],
                positionHanches: [],
                stabiliteTete: [],
                alignmentGeneral: [],
                // Mouvement des bras
                entreeDansEau: [],
                phaseSousMarine: [],
                retourAerien: [],
                continuiteMouvement: [],
                // Battement de jambes
                amplitudeBattement: [],
                surfacePieds: [],
                frequenceBattement: [],
                coordinationBras: [],
                // Respiration et orientation
                regulariteRespiratoire: [],
                orientationLigne: [],
                consciencePosition: [],
                // Virages
                approcheMur: [],
                rotation: [],
                impulsion: [],
                couleeApresVirage: [],
                // Métriques
                coupsParLongueur: [],
                distanceCoulee: [],
                stabiliteLigne: [],
                // Observations
                pointsForts: [],
                pointsAmeliorer: [],
                exercicesRecommandes: [],
                dates: []
            },
            butterfly: {
                // Mouvement corporel
                mouvementOndulatoire: [],
                coordinationTeteBuste: [],
                fluiditeOndulation: [],
                amplitudeMouvement: [],
                // Mouvement des bras
                entreeDansEau: [],
                phaseTraction: [],
                phasePoussee: [],
                retourAerien: [],
                // Battement dauphin
                amplitudeBattement: [],
                coordinationBras: [],
                puissanceBattement: [],
                synchronisation: [],
                // Respiration
                timingRespiration: [],
                hauteurTete: [],
                retourRapide: [],
                // Coordination globale
                uniteMouvement: [],
                rythme: [],
                energieDepensee: [],
                // Métriques
                mouvementsParLongueur: [],
                tempsEntreRespirations: [],
                distanceParCycle: [],
                // Observations
                pointsForts: [],
                pointsAmeliorer: [],
                exercicesRecommandes: [],
                dates: []
            },
            medley: {
                // Général
                transitionsNages: [],
                rythmeGlobal: [],
                energieManagement: [],
                strategieCourse: [],
                // Papillon (départ)
                techniquePapillon: [],
                conservationEnergie: [],
                // Dos (2ème nage)
                techniqueDos: [],
                transitionPapillonDos: [],
                // Brasse (3ème nage)
                techniqueBrasse: [],
                transitionDosBrasse: [],
                // Crawl (4ème nage)
                techniqueCrawl: [],
                transitionBrasseCrawl: [],
                finCourse: [],
                // Virages spécifiques
                viragePapillonDos: [],
                virageDosBrasse: [],
                virageBrasseCrawl: [],
                // Observations
                pointsFortsParNage: [],
                transitionsAmeliorer: [],
                strategieRecommandee: [],
                repartitionEffort: [],
                dates: []
            },
            startsAndTurns: {
                // Départs plongeons
                positionDepart: [],
                impulsion: [],
                trajectoire: [],
                entreeDansEau: [],
                // Coulées initiales
                profondeur: [],
                distance: [],
                positionCorps: [],
                battementUnderwater: [],
                // Virages crawl/dos
                approcheMurCrawl: [],
                rotationCrawl: [],
                appuiPiedsCrawl: [],
                impulsionCrawl: [],
                couleeApresVirageCrawl: [],
                // Virages brasse/papillon
                approcheMurBrasse: [],
                toucherSimultane: [],
                rotationBrasse: [],
                impulsionBrasse: [],
                // Arrivées
                approcheMurArrivee: [],
                toucherFinal: [],
                vitesseMaintenue: [],
                // Observations
                pointsFortsTechniques: [],
                tempsReaction: [],
                efficaciteCoulees: [],
                exercicesAmelioration: [],
                dates: []
            }
        },
        
        // Suivi de présence
        attendance: {
            records: []  // {date, status, session, lateMinutes?, reason?, justified?}
        }
    };

    swimmers.push(newSwimmer);
    saveToLocalStorage();
    updateAthleteSelector();
    updateDashboard();
    
    currentSwimmerId = newSwimmer.id;
    athleteSelector.value = newSwimmer.id;
    
    alert(`Nageur ${name} ajouté avec succès !`);
    showNotification('success', `Nageur ${name} ajouté avec succès!`);
}

// Ouvrir le modal de saisie de données
function openDataEntryModal(dataType) {
    if (!dataEntryModal || !dataEntryForm || !dataEntryTitle) {
        console.error('Les éléments du modal ne sont pas encore chargés');
        return;
    }
    
    if (!currentSwimmerId) {
        alert('Veuillez sélectionner un nageur d\'abord');
        return;
    }

    currentDataType = dataType;
    dataEntryTitle.textContent = getDataEntryTitle(dataType);
    dataEntryForm.innerHTML = generateDataEntryForm(dataType);
    dataEntryModal.style.display = 'flex';
    
    // Initialize multi-page wellbeing form
    if (dataType === 'wellbeing') {
        setTimeout(() => {
            initializeWellbeingForm();
        }, 50);
    }
    
    // Réinitialiser le compteur de nages si c'est une course
    if (dataType === 'race') {
        raceEntryCount = 0;
        const container = document.getElementById('raceEntriesContainer');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    // ✅ NOUVEAU - Réinitialiser pour les sessions
    if (dataType === 'session') {
        mainSetCount = 0;
        const sessionContainer = document.getElementById('sessionPartsContainer');
        if (sessionContainer) {
            sessionContainer.innerHTML = '';
        }
        // Réactiver tous les boutons
        setTimeout(() => {
            const btnWarmup = document.getElementById('btnAddWarmup');
            const btnMainset = document.getElementById('btnAddMainset');
            const btnCooldown = document.getElementById('btnAddCooldown');
            if (btnWarmup) { btnWarmup.disabled = false; btnWarmup.style.opacity = '1'; }
            if (btnMainset) { btnMainset.disabled = false; btnMainset.style.opacity = '1'; }
            if (btnCooldown) { btnCooldown.disabled = false; btnCooldown.style.opacity = '1'; }
        }, 100);
    }
}

function getDataEntryTitle(dataType) {
    const titles = {
        'wellbeing': 'Saisie du Bien-être',
        'performance': 'Saisie des Performances',
        'medical': 'Saisie de Présence, Disponibilité et Médicale',
        'race': 'Saisie des Performances de Course',
        'technical': 'Saisie du Suivi Technique',
        'attendance': 'Saisie de la Présence',
        'session': 'Saisie de Session d\'Entraînement'
    };
    return titles[dataType] || 'Saisie des Données';
}

function generateDataEntryForm(dataType) {
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return '';

    const today = new Date().toISOString().split('T')[0];
    
    switch(dataType) {
        case 'wellbeing':
            return `
                <div class="form-group">
                    <label for="entryDate">Date</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                
                <!-- Progress Indicator -->
                <div class="wellbeing-progress" style="text-align: center; margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">Étape <span id="currentPageNum">1</span> sur 3</div>
                    <div style="font-weight: bold; font-size: 1.1rem;" id="currentPageTitle">Évaluation Subjective</div>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                        <div class="page-indicator active" data-page="1"></div>
                        <div class="page-indicator" data-page="2"></div>
                        <div class="page-indicator" data-page="3"></div>
                    </div>
                </div>
                
                <!-- Page Container -->
                <div id="wellbeingPageContainer" style="min-height: 350px;">
                    <!-- Pages will be rendered here -->
                </div>
                
                <!-- Navigation Buttons -->
                <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: space-between;">
                    <button type="button" id="prevWellbeingPage" class="btn btn-secondary" style="flex: 1; display: none;">
                        ← Précédent
                    </button>
                    <button type="button" id="nextWellbeingPage" class="btn btn-primary" style="flex: 1;">
                        Suivant →
                    </button>
                </div>
            `;
            
        case 'performance':
            return `
                <div class="form-group">
                    <label for="entryDate">Date</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                
                <div style="margin-bottom: 20px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                    <strong>📊 Tests Physiques</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">Évaluation des capacités physiques</p>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="vma">🏃 VMA (km/h)</label>
                        <input type="number" id="vma" class="form-control" min="0" step="0.1" placeholder="Ex: 14.5" required>
                        <small style="color: #666;">Vitesse Maximale Aérobie</small>
                    </div>
                    <div class="form-group">
                        <label for="legStrength">🦵 Saut Vertical (cm)</label>
                        <input type="number" id="legStrength" class="form-control" min="0" step="1" placeholder="Ex: 45" required>
                        <small style="color: #666;">Hauteur du saut en cm</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="shoulderStrength">💪 Pompes (nombre/min)</label>
                        <input type="number" id="shoulderStrength" class="form-control" min="0" step="1" placeholder="Ex: 35" required>
                        <small style="color: #666;">Pompes réalisées en 1 minute</small>
                    </div>
                    <div class="form-group">
                        <label for="coreStrength">⏱️ Gainage (secondes)</label>
                        <input type="number" id="coreStrength" class="form-control" min="0" step="1" placeholder="Ex: 90" required>
                        <small style="color: #666;">Temps maximal de gainage</small>
                    </div>
                </div>
            `;
            
        case 'medical':
            return `
                <div class="form-group">
                    <label for="entryDate">Date</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                
                <!-- Type de suivi -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="font-weight: bold; margin-bottom: 10px; display: block;">📅 Type de suivi</label>
                    <div style="display: flex; gap: 15px;">
                        <label class="radio-option" style="flex: 1;">
                            <input type="radio" name="trackingType" value="daily" checked onchange="toggleTrackingSections()">
                            <span>📄 Suivi Quotidien (2 min)</span>
                        </label>
                        <label class="radio-option" style="flex: 1;">
                            <input type="radio" name="trackingType" value="weekly" onchange="toggleTrackingSections()">
                            <span>📊 Suivi Hebdomadaire</span>
                        </label>
                    </div>
                </div>
                
                <!-- SUIVI QUOTIDIEN -->
                <div id="dailyTracking" style="display: block;">
                    <div style="margin-bottom: 20px; padding: 12px; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); border-radius: 8px; color: white;">
                        <strong>🏋️‍♂️ Suivi Quotidien</strong>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">À remplir avant l'entraînement</p>
                    </div>
                    
                    <!-- Disponibilité -->
                    <div class="form-group">
                        <label>📅 Disponibilité pour l'entraînement</label>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <label class="radio-option">
                                <input type="radio" name="availability" value="present" checked>
                                <span>✅ Présent</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="availability" value="absent">
                                <span>❌ Absent</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Motif absence -->
                    <div id="absenceReasonDiv" class="form-group" style="display: none;">
                        <label for="absenceReason">Motif de l'absence</label>
                        <select id="absenceReason" class="form-control">
                            <option value="">-- Sélectionner --</option>
                            <option value="maladie">🤒 Maladie</option>
                            <option value="blessure">🩹 Blessure</option>
                            <option value="cours">📚 Cours / Études</option>
                            <option value="familial">🏠 Raison familiale</option>
                            <option value="autre">📝 Autre</option>
                        </select>
                    </div>
                    
                    <!-- État de forme -->
                    <div class="form-group">
                        <label>💪 État de Forme du Jour (1-5)</label>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
                            <label class="radio-option" style="min-width: 100px;">
                                <input type="radio" name="dailyCondition" value="1">
                                <span>1 - 😫 Très fatigué</span>
                            </label>
                            <label class="radio-option" style="min-width: 100px;">
                                <input type="radio" name="dailyCondition" value="2">
                                <span>2 - 😔 Fatigué</span>
                            </label>
                            <label class="radio-option" style="min-width: 100px;">
                                <input type="radio" name="dailyCondition" value="3" checked>
                                <span>3 - 😐 Normal</span>
                            </label>
                            <label class="radio-option" style="min-width: 100px;">
                                <input type="radio" name="dailyCondition" value="4">
                                <span>4 - 🙂 Bon</span>
                            </label>
                            <label class="radio-option" style="min-width: 100px;">
                                <input type="radio" name="dailyCondition" value="5">
                                <span>5 - 😄 Excellent</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Douleurs -->
                    <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
                        <label style="font-weight: bold; color: #e65100; margin-bottom: 10px; display: block;">🩹 Douleurs / Gênes (Optionnel)</label>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="painZone">Zone concernée</label>
                                <select id="painZone" class="form-control">
                                    <option value="">Aucune douleur</option>
                                    <option value="epaule">🦾 Épaule</option>
                                    <option value="dos">🦴 Dos</option>
                                    <option value="genou">🦵 Genou</option>
                                    <option value="cheville">🦶 Cheville</option>
                                    <option value="coude">💪 Coude</option>
                                    <option value="hanche">🦼 Hanche</option>
                                    <option value="autre">📍 Autre zone</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="painIntensity">Intensité (1-10)</label>
                                <input type="number" id="painIntensity" class="form-control" min="0" max="10" value="0" placeholder="0 = Aucune">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- SUIVI HEBDOMADAIRE -->
                <div id="weeklyTracking" style="display: none;">
                    <div style="margin-bottom: 20px; padding: 12px; background: linear-gradient(135deg, #5e35b1 0%, #4527a0 100%); border-radius: 8px; color: white;">
                        <strong>📈 Suivi Hebdomadaire</strong>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">À remplir dimanche soir ou lundi matin</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="weeklySleep">🛌 Qualité du Sommeil (moyenne de la semaine)</label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <input type="range" id="weeklySleep" class="wellbeing-slider" min="1" max="5" value="3" style="flex: 1;">
                            <span id="weeklySleepValue" class="slider-value">3</span>
                        </div>
                        <small style="color: #666; display: block; margin-top: 5px;">1 = Très mauvais | 5 = Excellent</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="weeklyStress">📚 Niveau de Stress / Charge mentale</label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <input type="range" id="weeklyStress" class="wellbeing-slider" min="1" max="5" value="3" style="flex: 1;">
                            <span id="weeklyStressValue" class="slider-value">3</span>
                        </div>
                        <small style="color: #666; display: block; margin-top: 5px;">1 = Très faible | 5 = Très élevé</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="weeklyMotivation">🎯 Motivation pour l'entraînement</label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <input type="range" id="weeklyMotivation" class="wellbeing-slider" min="1" max="5" value="3" style="flex: 1;">
                            <span id="weeklyMotivationValue" class="slider-value">3</span>
                        </div>
                        <small style="color: #666; display: block; margin-top: 5px;">1 = Très faible | 5 = Très forte</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="weeklyComment">📝 Commentaire Libre</label>
                        <textarea id="weeklyComment" class="form-control" rows="4" placeholder="Stress scolaire, problème personnel, satisfaction, objectifs..." style="resize: vertical;"></textarea>
                    </div>
                </div>
                
                <script>
                    // Initialiser les sliders hebdomadaires
                    ['weeklySleep', 'weeklyStress', 'weeklyMotivation'].forEach(id => {
                        const slider = document.getElementById(id);
                        const display = document.getElementById(id + 'Value');
                        if (slider && display) {
                            slider.addEventListener('input', function() {
                                display.textContent = this.value;
                            });
                        }
                    });
                    
                    // Gérer l'affichage du motif d'absence
                    document.querySelectorAll('input[name="availability"]').forEach(radio => {
                        radio.addEventListener('change', function() {
                            const absenceDiv = document.getElementById('absenceReasonDiv');
                            if (this.value === 'absent') {
                                absenceDiv.style.display = 'block';
                            } else {
                                absenceDiv.style.display = 'none';
                            }
                        });
                    });
                    
                    // Fonction pour basculer entre quotidien et hebdomadaire
                    window.toggleTrackingSections = function() {
                        const trackingType = document.querySelector('input[name="trackingType"]:checked').value;
                        const dailyDiv = document.getElementById('dailyTracking');
                        const weeklyDiv = document.getElementById('weeklyTracking');
                        
                        if (trackingType === 'daily') {
                            dailyDiv.style.display = 'block';
                            weeklyDiv.style.display = 'none';
                        } else {
                            dailyDiv.style.display = 'none';
                            weeklyDiv.style.display = 'block';
                        }
                    };
                </script>
            `;
            
        case 'race':
            return `
                <div class="form-group">
                    <label for="entryDate">Date de la course</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                <div class="form-group">
                    <label for="eventName">Événement / Compétition</label>
                    <input type="text" id="eventName" class="form-control" placeholder="Ex: Piscine Adarissa 29-01-20" required>
                </div>
                
                <div style="margin: 20px 0;">
                    <button type="button" class="btn btn-secondary" onclick="addRaceEntry()" style="width: 100%;">
                        ➕ Ajouter une nage
                    </button>
                </div>
                
                <div id="raceEntriesContainer" style="max-height: 400px; overflow-y: auto;">
                    <!-- Les entrées de nage seront ajoutées ici -->
                </div>
                
                <div class="alert" style="background: #e8f0fe; border-left: 5px solid var(--primary-color); padding: 10px; margin-top: 15px; border-radius: 4px;">
                    <small><strong>💡 Format du temps :</strong></small><br>
                    <small>• 50m, 100m, 200m : <strong>SS:MS</strong> (ex: 26:50 pour 26s 50 centièmes)</small><br>
                    <small>• 400m, 800m, 1500m : <strong>MM:SS:MS</strong> (ex: 10:45:35)</small>
                </div>
            `;
            
        case 'technical':
            return `
                <div class="form-group">
                    <label for="entryDate">📅 Date de l'évaluation</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                
                <div class="alert" style="background: #e3f2fd; border-left: 4px solid #00bcd4; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <strong>📋 Instructions:</strong> Évaluez chaque critère technique sur une échelle de 0 à 10.
                    <br><small>0 = À améliorer | 5 = Moyen | 8 = Bon | 10 = Excellent</small>
                </div>
                
                <!-- CRAWL -->
                <div style="margin-bottom: 30px; border: 2px solid #2196f3; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #2196f315 0%, #2196f305 100%); padding: 15px; border-bottom: 2px solid #2196f3;">
                        <h4 style="margin: 0; color: #2196f3;">🏊 Crawl</h4>
                    </div>
                    <div style="padding: 20px; display: grid; gap: 15px;">
                        <div class="form-group">
                            <label for="tech_crawl_position">Position du corps (0-10)</label>
                            <input type="number" id="tech_crawl_position" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_crawl_respiration">Respiration (0-10)</label>
                            <input type="number" id="tech_crawl_respiration" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_crawl_battements">Battements de jambes (0-10)</label>
                            <input type="number" id="tech_crawl_battements" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_crawl_bras">Mouvement des bras (0-10)</label>
                            <input type="number" id="tech_crawl_bras" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_crawl_virage">Virages (0-10)</label>
                            <input type="number" id="tech_crawl_virage" class="form-control" min="0" max="10" value="5" required>
                        </div>
                    </div>
                </div>
                
                <!-- DOS -->
                <div style="margin-bottom: 30px; border: 2px solid #9c27b0; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #9c27b015 0%, #9c27b005 100%); padding: 15px; border-bottom: 2px solid #9c27b0;">
                        <h4 style="margin: 0; color: #9c27b0;">🔙 Dos</h4>
                    </div>
                    <div style="padding: 20px; display: grid; gap: 15px;">
                        <div class="form-group">
                            <label for="tech_dos_position">Position du corps (0-10)</label>
                            <input type="number" id="tech_dos_position" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_dos_respiration">Respiration (0-10)</label>
                            <input type="number" id="tech_dos_respiration" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_dos_battements">Battements de jambes (0-10)</label>
                            <input type="number" id="tech_dos_battements" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_dos_bras">Mouvement des bras (0-10)</label>
                            <input type="number" id="tech_dos_bras" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_dos_virage">Virages (0-10)</label>
                            <input type="number" id="tech_dos_virage" class="form-control" min="0" max="10" value="5" required>
                        </div>
                    </div>
                </div>
                
                <!-- BRASSE -->
                <div style="margin-bottom: 30px; border: 2px solid #4caf50; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%); padding: 15px; border-bottom: 2px solid #4caf50;">
                        <h4 style="margin: 0; color: #4caf50;">💪 Brasse</h4>
                    </div>
                    <div style="padding: 20px; display: grid; gap: 15px;">
                        <div class="form-group">
                            <label for="tech_brasse_position">Position du corps (0-10)</label>
                            <input type="number" id="tech_brasse_position" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_brasse_respiration">Respiration (0-10)</label>
                            <input type="number" id="tech_brasse_respiration" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_brasse_battements">Battements de jambes (0-10)</label>
                            <input type="number" id="tech_brasse_battements" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_brasse_bras">Mouvement des bras (0-10)</label>
                            <input type="number" id="tech_brasse_bras" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_brasse_virage">Virages (0-10)</label>
                            <input type="number" id="tech_brasse_virage" class="form-control" min="0" max="10" value="5" required>
                        </div>
                    </div>
                </div>
                
                <!-- PAPILLON -->
                <div style="margin-bottom: 30px; border: 2px solid #ff9800; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #ff980015 0%, #ff980005 100%); padding: 15px; border-bottom: 2px solid #ff9800;">
                        <h4 style="margin: 0; color: #ff9800;">🦋 Papillon</h4>
                    </div>
                    <div style="padding: 20px; display: grid; gap: 15px;">
                        <div class="form-group">
                            <label for="tech_papillon_position">Position du corps (0-10)</label>
                            <input type="number" id="tech_papillon_position" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_papillon_respiration">Respiration (0-10)</label>
                            <input type="number" id="tech_papillon_respiration" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_papillon_battements">Battements de jambes (0-10)</label>
                            <input type="number" id="tech_papillon_battements" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_papillon_bras">Mouvement des bras (0-10)</label>
                            <input type="number" id="tech_papillon_bras" class="form-control" min="0" max="10" value="5" required>
                        </div>
                        <div class="form-group">
                            <label for="tech_papillon_virage">Virages (0-10)</label>
                            <input type="number" id="tech_papillon_virage" class="form-control" min="0" max="10" value="5" required>
                        </div>
                    </div>
                </div>
            `;
            
        case 'attendance':
            return `
                <div class="form-group">
                    <label for="entryDate">Date</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sessionType">Séance</label>
                        <select id="sessionType" class="form-control" required>
                            <option value="Matin">Matin</option>
                            <option value="Après-midi">Après-midi</option>
                            <option value="Soir">Soir</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="attendanceStatus">Statut</label>
                        <select id="attendanceStatus" class="form-control" onchange="updateAttendanceFields()" required>
                            <option value="present">Présent</option>
                            <option value="late">Retard</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                </div>
                <div id="attendanceExtraFields">
                    <!-- Les champs supplémentaires apparaîtront ici -->
                </div>
            `;
            
        case 'session':
            return `
                <div class="form-group">
                    <label for="entryDate">📅 Date de la séance</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                
                <!-- INFO: Système de saisie dynamique -->
                <div class="alert" style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <strong>💡 Mode de saisie:</strong> Cliquez sur chaque bouton pour ajouter les parties de votre séance.
                    <br><small>Le RPE moyen sera calculé automatiquement.</small>
                </div>

                <!-- Conteneur pour les parties saisies -->
                <div id="sessionPartsContainer" style="margin-bottom: 20px;"></div>
                
                <!-- Boutons d'ajout de parties -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <button type="button" class="btn btn-success" onclick="addSessionPart('warmup')" 
                            id="btnAddWarmup" style="padding: 15px; font-size: 1.1rem;">
                        🔥 Ajouter Échauffement
                    </button>
                    <button type="button" class="btn btn-primary" onclick="addSessionPart('mainset')" 
                            id="btnAddMainset" style="padding: 15px; font-size: 1.1rem;">
                        💪 Ajouter Partie Corps
                    </button>
                    <button type="button" class="btn btn-warning" onclick="addSessionPart('cooldown')" 
                            id="btnAddCooldown" style="padding: 15px; font-size: 1.1rem;">
                        🧘 Ajouter Retour Calme
                    </button>
                </div>

                <!-- Récapitulatif automatique -->
                <div class="card" style="background: #f5f5f5; border: 2px solid #2196f3;">
                    <div class="card-body" style="padding: 20px;">
                        <h4 style="margin: 0 0 15px 0; color: #2196f3;">📊 Récapitulatif Séance</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                <div style="font-size: 0.85rem; color: #666;">Volume Total</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: #2196f3;">
                                    <span id="totalVolume">0</span> m
                                </div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                <div style="font-size: 0.85rem; color: #666;">Durée Totale</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: #4caf50;">
                                    <span id="totalDuration">0</span> min
                                </div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                <div style="font-size: 0.85rem; color: #666;">Intensité</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: #ff9800;">
                                    <span id="avgIntensity">0</span> m/min
                                </div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                <div style="font-size: 0.85rem; color: #666;">RPE Moyen</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: #9c27b0;">
                                    <span id="avgRPE">-</span> /10
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Stockage temporaire des parties -->
                <input type="hidden" id="sessionPartsData" value="[]">
            `;
            
        default:
            return '<p>Type de données non reconnu</p>';
    }
}

// Calculer automatiquement le score de bien-être
// Multi-page wellbeing form state
let currentWellbeingPage = 1;
const totalWellbeingPages = 3;

// Render specific page of wellbeing form
window.renderWellbeingPage = function(pageNum) {
    const container = document.getElementById('wellbeingPageContainer');
    if (!container) return;
    
    let html = '';
    
    if (pageNum === 1) {
        // Page 1: Subjective Evaluation (1-10 scales)
        html = `
            <div class="wellbeing-page" data-page="1">
                <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
                    <small style="color: #666;"><strong>📊 Évaluez sur une échelle de 1 (très mauvais) à 10 (excellent)</strong></small>
                </div>
                
                <div class="form-group">
                    <label for="sleepQuality">Qualité du sommeil</label>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <input type="range" id="sleepQuality" class="wellbeing-slider" min="1" max="10" value="5" style="flex: 1;">
                        <span id="sleepQualityValue" class="slider-value">5</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="energyLevel">Niveau d'énergie</label>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <input type="range" id="energyLevel" class="wellbeing-slider" min="1" max="10" value="5" style="flex: 1;">
                        <span id="energyLevelValue" class="slider-value">5</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="motivation">Motivation</label>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <input type="range" id="motivation" class="wellbeing-slider" min="1" max="10" value="5" style="flex: 1;">
                        <span id="motivationValue" class="slider-value">5</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="stressLevel">Stress perçu</label>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <input type="range" id="stressLevel" class="wellbeing-slider" min="1" max="10" value="5" style="flex: 1;">
                        <span id="stressLevelValue" class="slider-value">5</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="muscleRecovery">Récupération musculaire</label>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <input type="range" id="muscleRecovery" class="wellbeing-slider" min="1" max="10" value="5" style="flex: 1;">
                        <span id="muscleRecoveryValue" class="slider-value">5</span>
                    </div>
                </div>
            </div>
        `;
    } else if (pageNum === 2) {
        // Page 2: Quantitative Data
        html = `
            <div class="wellbeing-page" data-page="2">
                <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
                    <small style="color: #666;"><strong>📈 Données quantitatives du matin</strong></small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="sleepHours">Heures de sommeil</label>
                        <input type="number" id="sleepHours" class="form-control" min="0" max="24" step="0.5" placeholder="Ex: 8.5" required>
                    </div>
                    <div class="form-group">
                        <label for="bodyWeight">Poids corporel (kg)</label>
                        <input type="number" id="bodyWeight" class="form-control" min="0" step="0.1" placeholder="Ex: 70.5" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Réveils nocturnes</label>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <label class="radio-option">
                            <input type="radio" name="nightAwakenings" value="0" checked>
                            <span>Aucun</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="nightAwakenings" value="1-2">
                            <span>1-2 fois</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="nightAwakenings" value="3+">
                            <span>3+ fois</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Qualité du réveil</label>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <label class="radio-option">
                            <input type="radio" name="wakeQuality" value="1">
                            <span>😴 Très difficile</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wakeQuality" value="2">
                            <span>😪 Difficile</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wakeQuality" value="3" checked>
                            <span>😐 Moyen</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wakeQuality" value="4">
                            <span>🙂 Bon</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="wakeQuality" value="5">
                            <span>😊 Excellent</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    } else if (pageNum === 3) {
        // Page 3: Specific Symptoms
        html = `
            <div class="wellbeing-page" data-page="3">
                <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
                    <small style="color: #666;"><strong>🩺 Symptômes spécifiques</strong></small>
                </div>
                
                <div class="form-group">
                    <label>Douleurs musculaires</label>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <label class="radio-option">
                            <input type="radio" name="musclePain" value="0" checked>
                            <span>Aucune</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="musclePain" value="1">
                            <span>Légère</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="musclePain" value="2">
                            <span>Modérée</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="musclePain" value="3">
                            <span>Intense</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="painLocation">Localisation de la douleur (si applicable)</label>
                    <input type="text" id="painLocation" class="form-control" placeholder="Ex: Épaules, cuisses, bas du dos...">
                </div>
                
                <div class="form-group">
                    <label>Fatigue générale</label>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <label class="radio-option">
                            <input type="radio" name="generalFatigue" value="low" checked>
                            <span>Faible</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="generalFatigue" value="medium">
                            <span>Moyenne</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="generalFatigue" value="high">
                            <span>Élevée</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Appétit</label>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <label class="radio-option">
                            <input type="radio" name="appetite" value="low">
                            <span>Faible</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="appetite" value="normal" checked>
                            <span>Normal</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="appetite" value="high">
                            <span>Élevé</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Attach slider event listeners for page 1
    if (pageNum === 1) {
        ['sleepQuality', 'energyLevel', 'motivation', 'stressLevel', 'muscleRecovery'].forEach(id => {
            const slider = document.getElementById(id);
            const display = document.getElementById(id + 'Value');
            if (slider && display) {
                slider.addEventListener('input', function() {
                    display.textContent = this.value;
                });
            }
        });
    }
    
    // Update progress indicator
    updateWellbeingProgress(pageNum);
};

// Update progress indicator
function updateWellbeingProgress(pageNum) {
    const pageNumEl = document.getElementById('currentPageNum');
    const pageTitleEl = document.getElementById('currentPageTitle');
    const indicators = document.querySelectorAll('.page-indicator');
    
    if (pageNumEl) pageNumEl.textContent = pageNum;
    
    const titles = ['Évaluation Subjective', 'Données Quantitatives', 'Symptômes Spécifiques'];
    if (pageTitleEl) pageTitleEl.textContent = titles[pageNum - 1] || '';
    
    indicators.forEach(ind => {
        const page = parseInt(ind.getAttribute('data-page'));
        if (page === pageNum) {
            ind.classList.add('active');
        } else if (page < pageNum) {
            ind.classList.add('completed');
            ind.classList.remove('active');
        } else {
            ind.classList.remove('active', 'completed');
        }
    });
    
    // Update button visibility
    const prevBtn = document.getElementById('prevWellbeingPage');
    const nextBtn = document.getElementById('nextWellbeingPage');
    
    if (prevBtn) {
        prevBtn.style.display = pageNum === 1 ? 'none' : 'block';
    }
    
    if (nextBtn) {
        if (pageNum === totalWellbeingPages) {
            nextBtn.textContent = 'Enregistrer ✓';
            nextBtn.classList.remove('btn-primary');
            nextBtn.classList.add('btn-success');
        } else {
            nextBtn.textContent = 'Suivant →';
            nextBtn.classList.remove('btn-success');
            nextBtn.classList.add('btn-primary');
        }
    }
}

// Navigate to next page
window.nextWellbeingPage = function() {
    if (!validateWellbeingPage(currentWellbeingPage)) {
        return;
    }
    
    if (currentWellbeingPage < totalWellbeingPages) {
        currentWellbeingPage++;
        renderWellbeingPage(currentWellbeingPage);
    } else {
        // Last page - submit form
        saveDataEntry();
    }
};

// Navigate to previous page
window.prevWellbeingPage = function() {
    if (currentWellbeingPage > 1) {
        currentWellbeingPage--;
        renderWellbeingPage(currentWellbeingPage);
    }
};

// Validate current page
function validateWellbeingPage(pageNum) {
    if (pageNum === 1) {
        // Page 1: All sliders have default values, always valid
        return true;
    } else if (pageNum === 2) {
        // Page 2: Check sleep hours and body weight
        const sleepHours = document.getElementById('sleepHours')?.value;
        const bodyWeight = document.getElementById('bodyWeight')?.value;
        
        if (!sleepHours || parseFloat(sleepHours) <= 0) {
            alert('Veuillez saisir les heures de sommeil.');
            return false;
        }
        if (!bodyWeight || parseFloat(bodyWeight) <= 0) {
            alert('Veuillez saisir le poids corporel.');
            return false;
        }
        return true;
    } else if (pageNum === 3) {
        // Page 3: All fields have defaults or are optional
        return true;
    }
    return true;
}

// Initialize wellbeing form when modal opens
window.initializeWellbeingForm = function() {
    currentWellbeingPage = 1;
    renderWellbeingPage(1);
    
    // Attach navigation button handlers
    const nextBtn = document.getElementById('nextWellbeingPage');
    const prevBtn = document.getElementById('prevWellbeingPage');
    
    if (nextBtn) {
        nextBtn.onclick = nextWellbeingPage;
    }
    if (prevBtn) {
        prevBtn.onclick = prevWellbeingPage;
    }
};

// Legacy function - kept for compatibility
window.calculateWellbeingScore = function() {
    // Not used in new multi-page form
};

// Mettre à jour les champs techniques selon la catégorie
window.updateTechnicalFields = function() {
    const category = document.getElementById('technicalCategory').value;
    const container = document.getElementById('technicalFieldsContainer');
    
    if (!category) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="alert" style="background: #e8f0fe; border-left: 5px solid var(--primary-color); padding: 10px; margin: 15px 0; border-radius: 4px;">';
    html += '<small><strong>📊 Échelle de notation : 1 (Très faible) à 10 (Excellent)</strong></small>';
    html += '</div>';
    
    const createField = (id, label, required = true) => {
        return `
            <div class="form-group">
                <label for="tech_${id}">${label} (1-10)</label>
                <input type="number" id="tech_${id}" class="form-control" min="1" max="10" step="1" value="5" ${required ? 'required' : ''}>
            </div>
        `;
    };
    
    const createTextArea = (id, label) => {
        return `
            <div class="form-group">
                <label for="tech_${id}">${label}</label>
                <textarea id="tech_${id}" class="form-control" rows="3" placeholder="Saisir vos observations..."></textarea>
            </div>
        `;
    };
    
    const createMetricField = (id, label, unit) => {
        return `
            <div class="form-group">
                <label for="tech_${id}">${label}</label>
                <input type="number" id="tech_${id}" class="form-control" step="0.1" placeholder="${unit}">
            </div>
        `;
    };
    
    if (category === 'crawl') {
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Position du Corps et Équilibre</h4>';
        html += createField('alignementCorporel', 'Alignement corporel');
        html += createField('rotationEpaules', 'Rotation des épaules');
        html += createField('stabiliteHanches', 'Stabilité des hanches');
        html += createField('flottaison', 'Flottaison');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Mouvement des Bras</h4>';
        html += createField('entreeDansEau', 'Entrée dans l\'eau');
        html += createField('phaseTraction', 'Phase de traction');
        html += createField('phasePoussee', 'Phase de poussée');
        html += createField('retourAerien', 'Retour aérien');
        html += createField('longueurMouvement', 'Longueur du mouvement');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Battement de Jambes</h4>';
        html += createField('amplitudeBattement', 'Amplitude du battement');
        html += createField('frequenceBattement', 'Fréquence du battement');
        html += createField('flexibiliteChevilles', 'Flexibilité des chevilles');
        html += createField('coordinationBras', 'Coordination avec les bras');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Respiration et Coordination</h4>';
        html += createField('techniqueRespiration', 'Technique de respiration');
        html += createField('timingRespiration', 'Timing de la respiration');
        html += createField('rythmeNage', 'Rythme de nage');
        html += createField('coordinationGlobale', 'Coordination globale');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Métriques de Performance</h4>';
        html += createMetricField('coupsParLongueur', 'Nombre de coups par longueur', 'coups');
        html += createMetricField('tempsGlisse', 'Temps de glisse', 'secondes');
        html += createMetricField('frequenceNage', 'Fréquence de nage', 'cycles/min');
        html += createMetricField('distanceParCycle', 'Distance par cycle', 'mètres');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Observations</h4>';
        html += createTextArea('pointsForts', 'Points forts');
        html += createTextArea('pointsAmeliorer', 'Points à améliorer');
        html += createTextArea('exercicesRecommandes', 'Exercices recommandés');
    }
    else if (category === 'breaststroke') {
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Position du Corps</h4>';
        html += createField('alignementHorizontal', 'Alignement horizontal');
        html += createField('positionTete', 'Position de la tête');
        html += createField('stabiliteTronc', 'Stabilité du tronc');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Mouvement des Bras</h4>';
        html += createField('mouvementEcartement', 'Mouvement d\'écartement');
        html += createField('mouvementTraction', 'Mouvement de traction');
        html += createField('mouvementRetour', 'Mouvement de retour');
        html += createField('synchronisationBrasRespiration', 'Synchronisation bras-respiration');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Mouvement des Jambes</h4>';
        html += createField('positionGenoux', 'Position des genoux');
        html += createField('mouvementCiseaux', 'Mouvement de ciseaux');
        html += createField('flexionChevilles', 'Flexion des chevilles');
        html += createField('puissancePropulsion', 'Puissance de propulsion');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Coordination et Timing</h4>';
        html += createField('coordinationBrasJambes', 'Coordination bras-jambes');
        html += createField('timingRespiration', 'Timing de la respiration');
        html += createField('phaseGlisse', 'Phase de glisse');
        html += createField('fluiditeMouvement', 'Fluidité du mouvement');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Métriques Spécifiques</h4>';
        html += createMetricField('tempsGlisseApres', 'Temps de glisse après traction', 'secondes');
        html += createMetricField('amplitudeMouvementJambes', 'Amplitude du mouvement de jambes', 'cm');
        html += createMetricField('mouvementsParLongueur', 'Nombre de mouvements par longueur', 'mouvements');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Observations</h4>';
        html += createTextArea('pointsForts', 'Points forts');
        html += createTextArea('pointsAmeliorer', 'Points à améliorer');
        html += createTextArea('exercicesRecommandes', 'Exercices recommandés');
    }
    else if (category === 'backstroke') {
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Position du Corps</h4>';
        html += createField('flottaisonHorizontale', 'Flottaison horizontale');
        html += createField('positionHanches', 'Position des hanches');
        html += createField('stabiliteTete', 'Stabilité de la tête');
        html += createField('alignmentGeneral', 'Alignment général');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Mouvement des Bras</h4>';
        html += createField('entreeDansEau', 'Entrée dans l\'eau');
        html += createField('phaseSousMarine', 'Phase sous-marine');
        html += createField('retourAerien', 'Retour aérien');
        html += createField('continuiteMouvement', 'Continuité du mouvement');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Battement de Jambes</h4>';
        html += createField('amplitudeBattement', 'Amplitude du battement');
        html += createField('surfacePieds', 'Surface des pieds');
        html += createField('frequenceBattement', 'Fréquence du battement');
        html += createField('coordinationBras', 'Coordination avec les bras');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Respiration et Orientation</h4>';
        html += createField('regulariteRespiratoire', 'Régularité respiratoire');
        html += createField('orientationLigne', 'Orientation dans la ligne');
        html += createField('consciencePosition', 'Conscience de la position');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Virages</h4>';
        html += createField('approcheMur', 'Approche du mur');
        html += createField('rotation', 'Rotation');
        html += createField('impulsion', 'Impulsion');
        html += createField('couleeApresVirage', 'Coulée après virage');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Métriques</h4>';
        html += createMetricField('coupsParLongueur', 'Nombre de coups par longueur', 'coups');
        html += createMetricField('distanceCoulee', 'Distance parcourue en coulée', 'mètres');
        html += createMetricField('stabiliteLigne', 'Stabilité dans la ligne', '1-10');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Observations</h4>';
        html += createTextArea('pointsForts', 'Points forts');
        html += createTextArea('pointsAmeliorer', 'Points à améliorer');
        html += createTextArea('exercicesRecommandes', 'Exercices recommandés');
    }
    else if (category === 'butterfly') {
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Mouvement Corporel</h4>';
        html += createField('mouvementOndulatoire', 'Mouvement ondulatoire');
        html += createField('coordinationTeteBuste', 'Coordination tête-buste');
        html += createField('fluiditeOndulation', 'Fluidité de l\'ondulation');
        html += createField('amplitudeMouvement', 'Amplitude du mouvement');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Mouvement des Bras</h4>';
        html += createField('entreeDansEau', 'Entrée dans l\'eau');
        html += createField('phaseTraction', 'Phase de traction');
        html += createField('phasePoussee', 'Phase de poussée');
        html += createField('retourAerien', 'Retour aérien');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Battement Dauphin</h4>';
        html += createField('amplitudeBattement', 'Amplitude du battement');
        html += createField('coordinationBras', 'Coordination avec les bras');
        html += createField('puissanceBattement', 'Puissance du battement');
        html += createField('synchronisation', 'Synchronisation');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Respiration</h4>';
        html += createField('timingRespiration', 'Timing de la respiration');
        html += createField('hauteurTete', 'Hauteur de la tête');
        html += createField('retourRapide', 'Retour rapide');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Coordination Globale</h4>';
        html += createField('uniteMouvement', 'Unité du mouvement');
        html += createField('rythme', 'Rythme');
        html += createField('energieDepensee', 'Énergie dépensée');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Métriques</h4>';
        html += createMetricField('mouvementsParLongueur', 'Nombre de mouvements par longueur', 'mouvements');
        html += createMetricField('tempsEntreRespirations', 'Temps entre les respirations', 'secondes');
        html += createMetricField('distanceParCycle', 'Distance par cycle', 'mètres');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Observations</h4>';
        html += createTextArea('pointsForts', 'Points forts');
        html += createTextArea('pointsAmeliorer', 'Points à améliorer');
        html += createTextArea('exercicesRecommandes', 'Exercices recommandés');
    }
    else if (category === 'medley') {
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Général</h4>';
        html += createField('transitionsNages', 'Transitions entre nages');
        html += createField('rythmeGlobal', 'Rythme global');
        html += createField('energieManagement', 'Énergie management');
        html += createField('strategieCourse', 'Stratégie de course');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Papillon (Départ)</h4>';
        html += createField('techniquePapillon', 'Technique papillon');
        html += createField('conservationEnergie', 'Conservation d\'énergie');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Dos (2ème Nage)</h4>';
        html += createField('techniqueDos', 'Technique dos');
        html += createField('transitionPapillonDos', 'Transition papillon→dos');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Brasse (3ème Nage)</h4>';
        html += createField('techniqueBrasse', 'Technique brasse');
        html += createField('transitionDosBrasse', 'Transition dos→brasse');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Crawl (4ème Nage)</h4>';
        html += createField('techniqueCrawl', 'Technique crawl');
        html += createField('transitionBrasseCrawl', 'Transition brasse→crawl');
        html += createField('finCourse', 'Fin de course');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Virages Spécifiques</h4>';
        html += createField('viragePapillonDos', 'Virage papillon→dos');
        html += createField('virageDosBrasse', 'Virage dos→brasse');
        html += createField('virageBrasseCrawl', 'Virage brasse→crawl');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Observations Globales</h4>';
        html += createTextArea('pointsFortsParNage', 'Points forts par nage');
        html += createTextArea('transitionsAmeliorer', 'Transitions à améliorer');
        html += createTextArea('strategieRecommandee', 'Stratégie recommandée');
        html += createTextArea('repartitionEffort', 'Répartition d\'effort');
    }
    else if (category === 'startsAndTurns') {
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Départs Plongeons</h4>';
        html += createField('positionDepart', 'Position de départ');
        html += createField('impulsion', 'Impulsion');
        html += createField('trajectoire', 'Trajectoire');
        html += createField('entreeDansEau', 'Entrée dans l\'eau');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Coulées Initiales</h4>';
        html += createField('profondeur', 'Profondeur');
        html += createField('distance', 'Distance');
        html += createField('positionCorps', 'Position du corps');
        html += createField('battementUnderwater', 'Battement underwater');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Virages Crawl/Dos</h4>';
        html += createField('approcheMurCrawl', 'Approche du mur');
        html += createField('rotationCrawl', 'Rotation');
        html += createField('appuiPiedsCrawl', 'Appui des pieds');
        html += createField('impulsionCrawl', 'Impulsion');
        html += createField('couleeApresVirageCrawl', 'Coulée après virage');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Virages Brasse/Papillon</h4>';
        html += createField('approcheMurBrasse', 'Approche du mur');
        html += createField('toucherSimultane', 'Toucher simultané');
        html += createField('rotationBrasse', 'Rotation');
        html += createField('impulsionBrasse', 'Impulsion');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Arrivées</h4>';
        html += createField('approcheMurArrivee', 'Approche du mur');
        html += createField('toucherFinal', 'Toucher final');
        html += createField('vitesseMaintenue', 'Vitesse maintenue');
        
        html += '<h4 style="color: var(--primary-color); margin-top: 20px;">Observations Spécifiques</h4>';
        html += createTextArea('pointsFortsTechniques', 'Points forts techniques');
        html += createTextArea('tempsReaction', 'Temps de réaction');
        html += createTextArea('efficaciteCoulees', 'Efficacité des coulées');
        html += createTextArea('exercicesAmelioration', 'Exercices d\'amélioration');
    }
    
    container.innerHTML = html;
};

// Calculer totaux session en temps réel
window.updateSessionTotals = function() {
    // Récupérer toutes les parties de session dynamiques
    const sessionParts = document.querySelectorAll('.session-part');
    
    let totalVolume = 0;
    let totalDuration = 0;
    let totalRPE = 0;
    let rpeCount = 0;
    
    // Parcourir toutes les parties et calculer les totaux
    sessionParts.forEach(part => {
        const partId = part.id.replace('part_', '');
        
        const volumeInput = document.getElementById(`volume_${partId}`);
        const durationInput = document.getElementById(`duration_${partId}`);
        const rpeInput = document.getElementById(`rpe_${partId}`);
        
        if (volumeInput && durationInput && rpeInput) {
            const volume = parseInt(volumeInput.value || 0);
            const duration = parseInt(durationInput.value || 0);
            const rpe = parseInt(rpeInput.value || 0);
            
            // Ajouter aux totaux
            totalVolume += volume;
            totalDuration += duration;
            
            // Compter RPE seulement si valide
            if (rpe > 0) {
                totalRPE += rpe;
                rpeCount++;
            }
        }
    });
    
    // Calculer les moyennes
    const avgIntensity = totalDuration > 0 ? (totalVolume / totalDuration).toFixed(1) : 0;
    const avgRPE = rpeCount > 0 ? (totalRPE / rpeCount).toFixed(1) : 0;
    
    // Mettre à jour l'affichage
    const totalVolumeEl = document.getElementById('totalVolume');
    const totalDurationEl = document.getElementById('totalDuration');
    const avgIntensityEl = document.getElementById('avgIntensity');
    const avgRPEEl = document.getElementById('avgRPE');
    
    if (totalVolumeEl) totalVolumeEl.textContent = totalVolume.toLocaleString();
    if (totalDurationEl) totalDurationEl.textContent = totalDuration;
    if (avgIntensityEl) avgIntensityEl.textContent = avgIntensity;
    if (avgRPEEl) avgRPEEl.textContent = avgRPE || '-';
};

// Mettre à jour les champs de présence selon le statut
window.updateAttendanceFields = function() {
    const status = document.getElementById('attendanceStatus').value;
    const container = document.getElementById('attendanceExtraFields');
    
    if (status === 'present') {
        container.innerHTML = '';
    } else if (status === 'late') {
        container.innerHTML = `
            <div class="form-group">
                <label for="lateMinutes">Minutes de retard</label>
                <input type="number" id="lateMinutes" class="form-control" min="1" placeholder="Ex: 15" required>
            </div>
            <div class="form-group">
                <label for="lateReason">Raison (optionnel)</label>
                <input type="text" id="lateReason" class="form-control" placeholder="Ex: Transport">
            </div>
        `;
    } else if (status === 'absent') {
        container.innerHTML = `
            <div class="form-group">
                <label for="absentReason">Raison de l'absence</label>
                <input type="text" id="absentReason" class="form-control" placeholder="Ex: Maladie" required>
            </div>
            <div class="form-group">
                <label for="absentJustified">Absence justifiée ?</label>
                <select id="absentJustified" class="form-control" required>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                </select>
            </div>
        `;
    }
};

// Sauvegarder les données saisies
function saveData() {
    if (!currentSwimmerId || !currentDataType) return;
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    const date = document.getElementById('entryDate').value;
    
    switch(currentDataType) {
        case 'wellbeing':
            // New comprehensive structure with 13 fields across 3 pages
            if (!swimmer.wellbeingData) {
                swimmer.wellbeingData = [];
            }
            
            // Page 1: Subjective evaluation (1-10 scales)
            const sleepQuality = parseInt(document.getElementById('sleepQuality')?.value) || 5;
            const energyLevel = parseInt(document.getElementById('energyLevel')?.value) || 5;
            const motivation = parseInt(document.getElementById('motivation')?.value) || 5;
            const stressLevel = parseInt(document.getElementById('stressLevel')?.value) || 5;
            const muscleRecovery = parseInt(document.getElementById('muscleRecovery')?.value) || 5;
            
            // Page 2: Quantitative data
            const sleepHours = parseFloat(document.getElementById('sleepHours')?.value) || 0;
            const bodyWeight = parseFloat(document.getElementById('bodyWeight')?.value) || 0;
            const nightAwakenings = document.querySelector('input[name="nightAwakenings"]:checked')?.value || '0';
            const wakeQuality = parseInt(document.querySelector('input[name="wakeQuality"]:checked')?.value) || 3;
            
            // Page 3: Specific symptoms
            const musclePain = parseInt(document.querySelector('input[name="musclePain"]:checked')?.value) || 0;
            const painLocation = document.getElementById('painLocation')?.value || '';
            const generalFatigue = document.querySelector('input[name="generalFatigue"]:checked')?.value || 'low';
            const appetite = document.querySelector('input[name="appetite"]:checked')?.value || 'normal';
            
            // Calculate overall wellbeing score (average of 5 subjective metrics)
            const score = ((sleepQuality + energyLevel + motivation + (11 - stressLevel) + muscleRecovery) / 5).toFixed(2);
            
            swimmer.wellbeingData.push({
                date: date,
                // Subjective metrics (1-10)
                sleepQuality: sleepQuality,
                energyLevel: energyLevel,
                motivation: motivation,
                stressLevel: stressLevel,
                muscleRecovery: muscleRecovery,
                // Quantitative data
                sleepHours: sleepHours,
                nightAwakenings: nightAwakenings,
                wakeQuality: wakeQuality,
                bodyWeight: bodyWeight,
                // Symptoms
                musclePain: musclePain,
                painLocation: painLocation,
                generalFatigue: generalFatigue,
                appetite: appetite,
                // Overall score
                score: parseFloat(score),
                // Legacy fields for backward compatibility
                sleep: sleepQuality,
                fatigue: 11 - energyLevel,  // Inverted for compatibility
                pain: musclePain * 2,  // Scale to 0-6
                stress: stressLevel
            });
            break;
            
        case 'performance':
            // Nouvelle structure : performanceData = [{date, vma, legStrength (saut), shoulderStrength (pompes), coreStrength (gainage)}, ...]
            if (!swimmer.performanceData) {
                swimmer.performanceData = [];
            }
            swimmer.performanceData.push({
                date: date,
                vma: parseFloat(document.getElementById('vma').value),
                legStrength: parseFloat(document.getElementById('legStrength').value), // Saut vertical en cm
                shoulderStrength: parseFloat(document.getElementById('shoulderStrength').value), // Pompes par minute
                coreStrength: parseFloat(document.getElementById('coreStrength').value) // Gainage en secondes
            });
            break;
            
        case 'medical':
            // Structure : medicalData = [{date, type, ...daily/weekly fields}, ...]
            if (!swimmer.medicalData) {
                swimmer.medicalData = [];
            }
            
            const trackingType = document.querySelector('input[name="trackingType"]:checked').value;
            const medicalEntry = {
                date: date,
                type: trackingType
            };
            
            if (trackingType === 'daily') {
                // Suivi quotidien
                medicalEntry.availability = document.querySelector('input[name="availability"]:checked').value;
                medicalEntry.absenceReason = document.getElementById('absenceReason')?.value || '';
                medicalEntry.dailyCondition = parseInt(document.querySelector('input[name="dailyCondition"]:checked').value);
                medicalEntry.painZone = document.getElementById('painZone').value;
                medicalEntry.painIntensity = parseInt(document.getElementById('painIntensity').value) || 0;
            } else {
                // Suivi hebdomadaire
                medicalEntry.weeklySleep = parseInt(document.getElementById('weeklySleep').value);
                medicalEntry.weeklyStress = parseInt(document.getElementById('weeklyStress').value);
                medicalEntry.weeklyMotivation = parseInt(document.getElementById('weeklyMotivation').value);
                medicalEntry.weeklyComment = document.getElementById('weeklyComment').value || '';
            }
            
            swimmer.medicalData.push(medicalEntry);
            break;
            
        case 'race':
            const eventName = document.getElementById('eventName').value;
            
            if (!eventName) {
                alert('Veuillez saisir le nom de l\'événement');
                return;
            }
            
            // Initialiser raceData si nécessaire (nouvelle structure)
            if (!swimmer.raceData) {
                swimmer.raceData = [];
            }
            
            // Récupérer toutes les nages ajoutées
            const raceEntries = [];
            const container = document.getElementById('raceEntriesContainer');
            const entries = container.querySelectorAll('.race-entry');
            
            entries.forEach(entry => {
                const select = entry.querySelector('select');
                const input = entry.querySelector('input[type="text"]');
                
                if (select && input && select.value && input.value) {
                    const [style, distance] = select.value.split('|');
                    raceEntries.push({
                        style: style,
                        distance: distance,
                        time: input.value
                    });
                }
            });
            
            if (raceEntries.length === 0) {
                alert('Veuillez ajouter au moins une nage avec son temps');
                return;
            }
            
            // Nouvelle structure : raceData = [{date, event, races: [...]}]
            swimmer.raceData.push({
                date: date,
                event: eventName,
                races: raceEntries
            });
            break;
            
        case 'technical':
            // Initialiser technicalData si nécessaire
            if (!swimmer.technicalData) {
                swimmer.technicalData = [];
            }
            
            // Créer un nouvel objet d'évaluation technique
            const technicalEntry = {
                date: date,
                crawl: {
                    position: parseInt(document.getElementById('tech_crawl_position')?.value) || 0,
                    respiration: parseInt(document.getElementById('tech_crawl_respiration')?.value) || 0,
                    battements: parseInt(document.getElementById('tech_crawl_battements')?.value) || 0,
                    bras: parseInt(document.getElementById('tech_crawl_bras')?.value) || 0,
                    virage: parseInt(document.getElementById('tech_crawl_virage')?.value) || 0
                },
                dos: {
                    position: parseInt(document.getElementById('tech_dos_position')?.value) || 0,
                    respiration: parseInt(document.getElementById('tech_dos_respiration')?.value) || 0,
                    battements: parseInt(document.getElementById('tech_dos_battements')?.value) || 0,
                    bras: parseInt(document.getElementById('tech_dos_bras')?.value) || 0,
                    virage: parseInt(document.getElementById('tech_dos_virage')?.value) || 0
                },
                brasse: {
                    position: parseInt(document.getElementById('tech_brasse_position')?.value) || 0,
                    respiration: parseInt(document.getElementById('tech_brasse_respiration')?.value) || 0,
                    battements: parseInt(document.getElementById('tech_brasse_battements')?.value) || 0,
                    bras: parseInt(document.getElementById('tech_brasse_bras')?.value) || 0,
                    virage: parseInt(document.getElementById('tech_brasse_virage')?.value) || 0
                },
                papillon: {
                    position: parseInt(document.getElementById('tech_papillon_position')?.value) || 0,
                    respiration: parseInt(document.getElementById('tech_papillon_respiration')?.value) || 0,
                    battements: parseInt(document.getElementById('tech_papillon_battements')?.value) || 0,
                    bras: parseInt(document.getElementById('tech_papillon_bras')?.value) || 0,
                    virage: parseInt(document.getElementById('tech_papillon_virage')?.value) || 0
                }
            };
            
            swimmer.technicalData.push(technicalEntry);
            break;
            
        case 'attendance':
            const session = document.getElementById('sessionType').value;
            const status = document.getElementById('attendanceStatus').value;
            
            const attendanceRecord = {
                date: date,
                session: session,
                status: status
            };
            
            if (status === 'late') {
                attendanceRecord.lateMinutes = parseInt(document.getElementById('lateMinutes').value);
                const reason = document.getElementById('lateReason').value;
                if (reason) attendanceRecord.reason = reason;
            } else if (status === 'absent') {
                attendanceRecord.reason = document.getElementById('absentReason').value;
                attendanceRecord.justified = document.getElementById('absentJustified').value;
            }
            
            swimmer.attendance.records.push(attendanceRecord);
            break;
            
        case 'session':
            // ✅ NOUVEAU SYSTÈME: Récupérer toutes les parties dynamiques
            const parts = document.querySelectorAll('.session-part');
            if (parts.length === 0) {
                alert('⚠️ Veuillez ajouter au moins une partie à la séance');
                return;
            }
            
            // Initialiser sessionData si nécessaire
            if (!swimmer.sessionData) {
                swimmer.sessionData = [];
            }
            
            // Collecter toutes les parties
            const sessionParts = [];
            let totalVolume = 0;
            let totalDuration = 0;
            let totalRPE = 0;
            let rpeCount = 0;
            
            let warmUpData = null;
            const mainSetParts = [];
            let coolDownData = null;
            
            parts.forEach(part => {
                const partId = part.id.replace('part_', '');
                const partType = part.dataset.type;
                const content = document.getElementById(`content_${partId}`).value.trim();
                const volume = parseInt(document.getElementById(`volume_${partId}`).value);
                const duration = parseInt(document.getElementById(`duration_${partId}`).value);
                const rpe = parseInt(document.getElementById(`rpe_${partId}`).value);
                
                // Validation
                if (!content || isNaN(volume) || isNaN(duration) || isNaN(rpe)) {
                    alert('⚠️ Veuillez remplir tous les champs de chaque partie');
                    return;
                }
                
                const partData = {
                    content: content,
                    volumeMeters: volume,
                    duration: duration,
                    rpe: rpe
                };
                
                totalVolume += volume;
                totalDuration += duration;
                totalRPE += rpe;
                rpeCount++;
                
                // Organiser par type
                if (partType === 'warmup') {
                    warmUpData = partData;
                } else if (partType === 'mainset') {
                    mainSetParts.push(partData);
                } else if (partType === 'cooldown') {
                    coolDownData = partData;
                }
            });
            
            // Validation structure minimale
            if (!warmUpData) {
                alert('⚠️ L\'échauffement est obligatoire');
                return;
            }
            if (mainSetParts.length === 0) {
                alert('⚠️ Au moins une partie du corps de séance est obligatoire');
                return;
            }
            if (!coolDownData) {
                alert('⚠️ Le retour au calme est obligatoire');
                return;
            }
            
            // ✅ CALCULER INDICATEURS AUTOMATIQUEMENT
            const avgIntensity = totalDuration > 0 ? (totalVolume / totalDuration).toFixed(1) : 0;
            const avgRPE = rpeCount > 0 ? (totalRPE / rpeCount).toFixed(1) : 0;
            
            // Calculer pourcentages de répartition
            const warmUpPercent = totalVolume > 0 ? ((warmUpData.volumeMeters / totalVolume) * 100).toFixed(1) : 0;
            const mainSetTotalVolume = mainSetParts.reduce((sum, p) => sum + p.volumeMeters, 0);
            const mainSetPercent = totalVolume > 0 ? ((mainSetTotalVolume / totalVolume) * 100).toFixed(1) : 0;
            const coolDownPercent = totalVolume > 0 ? ((coolDownData.volumeMeters / totalVolume) * 100).toFixed(1) : 0;
            
            // ✅ CALCULER CHARGE D'ENTRAÎNEMENT (Volume × RPE)
            const trainingLoad = totalVolume * parseFloat(avgRPE);
            
            // Créer objet session avec données + indicateurs
            const sessionRecord = {
                date: date,
                warmUp: warmUpData,
                mainSet: mainSetParts.length === 1 ? mainSetParts[0] : { parts: mainSetParts },
                coolDown: coolDownData,
                // ✅ INDICATEURS CALCULÉS AUTOMATIQUEMENT
                indicators: {
                    totalVolume: totalVolume,
                    totalDuration: totalDuration,
                    avgIntensity: parseFloat(avgIntensity),
                    avgRPE: parseFloat(avgRPE),
                    trainingLoad: Math.round(trainingLoad),
                    warmUpPercent: parseFloat(warmUpPercent),
                    mainSetPercent: parseFloat(mainSetPercent),
                    coolDownPercent: parseFloat(coolDownPercent),
                    volumePerMinute: parseFloat(avgIntensity),
                    mainSetPartsCount: mainSetParts.length
                }
            };
            
            // Vérifier si session existe déjà pour cette date
            const existingIndex = swimmer.sessionData.findIndex(s => s.date === date);
            if (existingIndex >= 0) {
                if (confirm('Une session existe déjà pour cette date. Voulez-vous la remplacer ?')) {
                    swimmer.sessionData[existingIndex] = sessionRecord;
                } else {
                    return;
                }
            } else {
                swimmer.sessionData.push(sessionRecord);
            }
            break;
    }
    
    saveToLocalStorage();
    closeAllModals();
    updateDashboard();
    showNotification('success', 'Données enregistrées avec succès!');
}

// =============================================
// GESTION DES SESSIONS D'ENTRAÎNEMENT
// =============================================

function openSessionEntry() {
    if (!currentSwimmerId) {
        alert('Veuillez sélectionner un nageur');
        return;
    }
    
    const modal = document.getElementById('sessionEntryModal');
    const form = document.getElementById('sessionEntryForm');
    form.reset();
    
    // Set date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;
    
    // Reset totals
    updateSessionTotals();
    
    modal.style.display = 'flex';
}

// Compteurs pour les parties multiples
let mainSetCount = 0;

// ✅ Ajouter une partie de séance dynamiquement
function addSessionPart(type) {
    const container = document.getElementById('sessionPartsContainer');
    const partsData = JSON.parse(document.getElementById('sessionPartsData').value || '[]');
    
    // Vérifications
    if (type === 'warmup' && partsData.some(p => p.type === 'warmup')) {
        alert('⚠️ L\'échauffement a déjà été ajouté');
        return;
    }
    if (type === 'cooldown' && partsData.some(p => p.type === 'cooldown')) {
        alert('⚠️ Le retour au calme a déjà été ajouté');
        return;
    }
    if (type === 'mainset' && partsData.filter(p => p.type === 'mainset').length >= 2) {
        alert('⚠️ Maximum 2 parties pour le corps de séance');
        return;
    }
    
    const partId = Date.now();
    let bgColor, headerColor, icon, title;
    
    if (type === 'warmup') {
        bgColor = '#e8f5e9';
        headerColor = '#4caf50';
        icon = '🔥';
        title = 'Échauffement';
    } else if (type === 'mainset') {
        mainSetCount++;
        bgColor = '#e3f2fd';
        headerColor = '#2196f3';
        icon = '💪';
        title = `Corps de Séance - Partie ${mainSetCount}`;
    } else {
        bgColor = '#fff3e0';
        headerColor = '#ff9800';
        icon = '🧘';
        title = 'Retour au Calme';
    }
    
    const partHtml = `
        <div class="card session-part" id="part_${partId}" data-type="${type}" style="margin-bottom: 15px; background: ${bgColor}; border-left: 5px solid ${headerColor};">
            <div class="card-header" style="background: ${headerColor}; color: white; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                <h5 style="margin: 0;">${icon} ${title}</h5>
                <button type="button" class="btn btn-sm" onclick="removeSessionPart(${partId}, '${type}')" 
                        style="background: rgba(255,255,255,0.3); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    ✕ Supprimer
                </button>
            </div>
            <div class="card-body" style="padding: 15px;">
                <div class="form-group">
                    <label>📝 Contenu de la partie</label>
                    <textarea id="content_${partId}" class="form-control" rows="3" 
                              placeholder="Ex: 8x100m crawl @ 1:30" required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1; margin-right: 10px;">
                        <label>🏊 Volume (mètres)</label>
                        <input type="number" id="volume_${partId}" class="form-control" 
                               min="0" step="50" placeholder="800" required oninput="updateSessionTotals()">
                    </div>
                    <div class="form-group" style="flex: 1; margin-right: 10px;">
                        <label>⏱️ Durée (minutes)</label>
                        <input type="number" id="duration_${partId}" class="form-control" 
                               min="0" step="1" placeholder="20" required oninput="updateSessionTotals()">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>💯 RPE (1-10)</label>
                        <input type="number" id="rpe_${partId}" class="form-control" 
                               min="1" max="10" step="1" placeholder="6" required oninput="updateSessionTotals()">
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                    <strong>RPE:</strong> 1-2=Très facile, 3-4=Facile, 5-6=Modéré, 7-8=Difficile, 9-10=Très difficile
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', partHtml);
    
    // Désactiver le bouton si limite atteinte
    if (type === 'warmup') {
        document.getElementById('btnAddWarmup').disabled = true;
        document.getElementById('btnAddWarmup').style.opacity = '0.5';
    }
    if (type === 'cooldown') {
        document.getElementById('btnAddCooldown').disabled = true;
        document.getElementById('btnAddCooldown').style.opacity = '0.5';
    }
    if (type === 'mainset' && partsData.filter(p => p.type === 'mainset').length + 1 >= 2) {
        document.getElementById('btnAddMainset').disabled = true;
        document.getElementById('btnAddMainset').style.opacity = '0.5';
    }
    
    updateSessionTotals();
}

// ✅ Supprimer une partie de séance
function removeSessionPart(partId, type) {
    const element = document.getElementById(`part_${partId}`);
    if (element) {
        element.remove();
        
        // Réactiver le bouton
        if (type === 'warmup') {
            document.getElementById('btnAddWarmup').disabled = false;
            document.getElementById('btnAddWarmup').style.opacity = '1';
        }
        if (type === 'cooldown') {
            document.getElementById('btnAddCooldown').disabled = false;
            document.getElementById('btnAddCooldown').style.opacity = '1';
        }
        if (type === 'mainset') {
            mainSetCount--;
            document.getElementById('btnAddMainset').disabled = false;
            document.getElementById('btnAddMainset').style.opacity = '1';
            // Renommer les parties restantes
            const mainParts = document.querySelectorAll('[data-type="mainset"]');
            mainParts.forEach((part, index) => {
                const header = part.querySelector('h5');
                header.textContent = `💪 Corps de Séance - Partie ${index + 1}`;
            });
        }
        
        updateSessionTotals();
    }
}

// ✅ Mettre à jour les totaux en temps réel
function updateSessionTotals() {
    const parts = document.querySelectorAll('.session-part');
    let totalVolume = 0;
    let totalDuration = 0;
    let totalRPE = 0;
    let rpeCount = 0;
    
    parts.forEach(part => {
        const partId = part.id.replace('part_', '');
        const volume = parseInt(document.getElementById(`volume_${partId}`)?.value || 0);
        const duration = parseInt(document.getElementById(`duration_${partId}`)?.value || 0);
        const rpe = parseInt(document.getElementById(`rpe_${partId}`)?.value || 0);
        
        totalVolume += volume;
        totalDuration += duration;
        if (rpe > 0) {
            totalRPE += rpe;
            rpeCount++;
        }
    });
    
    const avgIntensity = totalDuration > 0 ? (totalVolume / totalDuration).toFixed(1) : 0;
    const avgRPE = rpeCount > 0 ? (totalRPE / rpeCount).toFixed(1) : '-';
    
    document.getElementById('totalVolume').textContent = totalVolume.toLocaleString();
    document.getElementById('totalDuration').textContent = totalDuration;
    document.getElementById('avgIntensity').textContent = avgIntensity;
    document.getElementById('avgRPE').textContent = avgRPE;
}

function saveSession() {
    if (!currentSwimmerId) return;
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    // Get form values
    const date = document.getElementById('sessionDate').value;
    const warmUpContent = document.getElementById('warmUpContent').value.trim();
    const warmUpVolume = parseInt(document.getElementById('warmUpVolume').value);
    const warmUpDuration = parseInt(document.getElementById('warmUpDuration').value);
    
    const mainSetContent = document.getElementById('mainSetContent').value.trim();
    const mainSetVolume = parseInt(document.getElementById('mainSetVolume').value);
    const mainSetDuration = parseInt(document.getElementById('mainSetDuration').value);
    
    const coolDownContent = document.getElementById('coolDownContent').value.trim();
    const coolDownVolume = parseInt(document.getElementById('coolDownVolume').value);
    const coolDownDuration = parseInt(document.getElementById('coolDownDuration').value);
    
    // Validate
    if (!date || !warmUpContent || !mainSetContent || !coolDownContent) {
        alert('Veuillez remplir tous les champs requis');
        return;
    }
    
    if (isNaN(warmUpVolume) || isNaN(warmUpDuration) || isNaN(mainSetVolume) || 
        isNaN(mainSetDuration) || isNaN(coolDownVolume) || isNaN(coolDownDuration)) {
        alert('Veuillez saisir des valeurs numériques valides pour les volumes et durées');
        return;
    }
    
    // Initialize sessionData if not exists
    if (!swimmer.sessionData) {
        swimmer.sessionData = [];
    }
    
    // Check if session already exists for this date
    const existingIndex = swimmer.sessionData.findIndex(s => s.date === date);
    
    const sessionRecord = {
        date: date,
        warmUp: {
            content: warmUpContent,
            volumeMeters: warmUpVolume,
            duration: warmUpDuration
        },
        mainSet: {
            content: mainSetContent,
            volumeMeters: mainSetVolume,
            duration: mainSetDuration
        },
        coolDown: {
            content: coolDownContent,
            volumeMeters: coolDownVolume,
            duration: coolDownDuration
        }
    };
    
    if (existingIndex >= 0) {
        // Update existing session
        if (confirm('Une session existe déjà pour cette date. Voulez-vous la remplacer ?')) {
            swimmer.sessionData[existingIndex] = sessionRecord;
        } else {
            return;
        }
    } else {
        // Add new session
        swimmer.sessionData.push(sessionRecord);
    }
    
    saveToLocalStorage();
    closeAllModals();
    showSessions();
    showNotification('success', 'Session enregistrée avec succès!');
}

function deleteSession(date) {
    if (!currentSwimmerId) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
        return;
    }
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer || !swimmer.sessionData) return;
    
    swimmer.sessionData = swimmer.sessionData.filter(s => s.date !== date);
    saveToLocalStorage();
    showSessions();
    showNotification('success', 'Session supprimée avec succès!');
}

// =============================================
// GESTION DES PERFORMANCES DE COURSE
// =============================================

let raceEntryCount = 0;

window.addRaceEntry = function() {
    raceEntryCount++;
    const container = document.getElementById('raceEntriesContainer');
    
    const entryDiv = document.createElement('div');
    entryDiv.className = 'race-entry';
    entryDiv.style.cssText = 'background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid var(--primary-color);';
    entryDiv.id = `race-entry-${raceEntryCount}`;
    
    entryDiv.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: flex-end;">
            <div style="flex: 1;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Nage</label>
                <select class="form-control" onchange="updateTimeFormat(${raceEntryCount})">
                    <option value="">Sélectionner...</option>
                    <optgroup label="50 mètres">
                        <option value="Crawl|50m">Crawl 50m</option>
                        <option value="Dos|50m">Dos 50m</option>
                        <option value="Brasse|50m">Brasse 50m</option>
                        <option value="Papillon|50m">Papillon 50m</option>
                    </optgroup>
                    <optgroup label="100 mètres">
                        <option value="Crawl|100m">Crawl 100m</option>
                        <option value="Dos|100m">Dos 100m</option>
                        <option value="Brasse|100m">Brasse 100m</option>
                        <option value="Papillon|100m">Papillon 100m</option>
                    </optgroup>
                    <optgroup label="200 mètres">
                        <option value="Crawl|200m">Crawl 200m</option>
                        <option value="Dos|200m">Dos 200m</option>
                        <option value="Brasse|200m">Brasse 200m</option>
                        <option value="Papillon|200m">Papillon 200m</option>
                    </optgroup>
                    <optgroup label="400 mètres">
                        <option value="Crawl|400m">Crawl 400m</option>
                        <option value="4 Nages|400m">4 Nages 400m</option>
                    </optgroup>
                    <optgroup label="Longue distance">
                        <option value="Crawl|800m">Crawl 800m</option>
                        <option value="Crawl|1500m">Crawl 1500m</option>
                    </optgroup>
                </select>
            </div>
            <div style="flex: 1;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Temps</label>
                <input type="text" class="form-control" placeholder="SS:MS" id="time-input-${raceEntryCount}">
            </div>
            <button type="button" class="btn btn-outline" onclick="removeRaceEntry(${raceEntryCount})" 
                    style="padding: 8px 12px; background: #dc3545; color: white; border: none;">
                ❌
            </button>
        </div>
    `;
    
    container.appendChild(entryDiv);
}

window.updateTimeFormat = function(entryId) {
    const entry = document.getElementById(`race-entry-${entryId}`);
    const select = entry.querySelector('select');
    const input = document.getElementById(`time-input-${entryId}`);
    
    const value = select.value;
    if (!value) return;
    
    const distance = value.split('|')[1];
    
    // Format selon la distance
    if (distance === '50m' || distance === '100m' || distance === '200m') {
        input.placeholder = 'SS:MS (ex: 26:50)';
        input.pattern = '[0-9]{2}:[0-9]{2}';
    } else {
        input.placeholder = 'MM:SS:MS (ex: 10:45:35)';
        input.pattern = '[0-9]{2}:[0-9]{2}:[0-9]{2}';
    }
}

window.removeRaceEntry = function(entryId) {
    const entry = document.getElementById(`race-entry-${entryId}`);
    if (entry) {
        entry.remove();
    }
}

// =============================================
// FONCTIONS PRINCIPALES - ANALYSE
// =============================================

// Analyser les données d'un nageur
function analyzeSwimmerData(swimmer) {
    const analysis = {
        wellbeing: analyzeWellbeing(swimmer.wellbeing),
        performance: analyzePerformance(swimmer.performance),
        medical: analyzeMedical(swimmer.medical),
        race: analyzeRacePerformances(swimmer.racePerformances || {dates: []}),
        technical: analyzeTechnical(swimmer.technical || {}),
        attendance: analyzeAttendance(swimmer.attendance || {records: []}),
        sessions: analyzeSessions(swimmer.sessionData || []),
        recommendations: []
    };
    
    // Générer des recommandations basées sur l'analyse
    analysis.recommendations = generateRecommendations(analysis, swimmer);
    
    return analysis;
}

function analyzeWellbeing(wellbeing) {
    if (wellbeing.dates.length === 0) return { status: 'no_data', message: 'Aucune donnée de bien-être' };
    
    const lastIndex = wellbeing.dates.length - 1;
    const recentSleep = wellbeing.sleep[lastIndex];
    const recentFatigue = wellbeing.fatigue[lastIndex];
    const recentPain = wellbeing.pain[lastIndex];
    const recentStress = wellbeing.stress[lastIndex];
    
    const avgSleep = wellbeing.sleep.reduce((a, b) => a + b, 0) / wellbeing.sleep.length;
    const avgFatigue = wellbeing.fatigue.reduce((a, b) => a + b, 0) / wellbeing.fatigue.length;
    const avgPain = wellbeing.pain.reduce((a, b) => a + b, 0) / wellbeing.pain.length;
    const avgStress = wellbeing.stress.reduce((a, b) => a + b, 0) / wellbeing.stress.length;
    
    let status = 'good';
    if (recentSleep < 2 || recentFatigue > 4 || recentPain > 3 || recentStress > 4) {
        status = 'poor';
    } else if (recentSleep < 3 || recentFatigue > 3 || recentPain > 2 || recentStress > 3) {
        status = 'warning';
    }
    
    return {
        status,
        recent: { sleep: recentSleep, fatigue: recentFatigue, pain: recentPain, stress: recentStress },
        averages: { sleep: avgSleep, fatigue: avgFatigue, pain: avgPain, stress: avgStress },
        trend: calculateTrend(wellbeing.sleep)
    };
}

function analyzePerformance(performance) {
    if (performance.dates.length === 0) return { status: 'no_data', message: 'Aucune donnée de performance' };
    
    const lastIndex = performance.dates.length - 1;
    const recentVMA = performance.vma[lastIndex];
    const recentShoulder = performance.shoulderStrength[lastIndex];
    const recentChest = performance.chestStrength[lastIndex];
    const recentLegs = performance.legStrength[lastIndex];
    
    // Évaluer les performances
    let vmaStatus = 'good';
    if (recentVMA < 1800) vmaStatus = 'poor';
    else if (recentVMA < 2200) vmaStatus = 'warning';
    
    let shoulderStatus = 'good';
    if (recentShoulder < 15) shoulderStatus = 'poor';
    else if (recentShoulder < 20) shoulderStatus = 'warning';
    
    let status = 'good';
    if (vmaStatus === 'poor' || shoulderStatus === 'poor') status = 'poor';
    else if (vmaStatus === 'warning' || shoulderStatus === 'warning') status = 'warning';
    
    return {
        status,
        recent: { vma: recentVMA, shoulder: recentShoulder, chest: recentChest, legs: recentLegs },
        trends: {
            vma: calculateTrend(performance.vma),
            shoulder: calculateTrend(performance.shoulderStrength),
            chest: calculateTrend(performance.chestStrength),
            legs: calculateTrend(performance.legStrength)
        }
    };
}

function analyzeMedical(medical) {
    if (medical.dates.length === 0) return { status: 'no_data', message: 'Aucune donnée de présence, disponibilité et médicale' };
    
    const lastIndex = medical.dates.length - 1;
    const recentAvailability = medical.availability[lastIndex];
    const recentIllnesses = medical.illnesses[lastIndex];
    const recentInjuries = medical.injuries[lastIndex];
    const recentOther = medical.otherIssues[lastIndex];
    
    let status = 'good';
    if (recentAvailability === 0 || recentInjuries > 0) {
        status = 'poor';
    } else if (recentAvailability < 2 || recentIllnesses > 0) {
        status = 'warning';
    }
    
    return {
        status,
        recent: {
            availability: recentAvailability,
            illnesses: recentIllnesses,
            injuries: recentInjuries,
            other: recentOther
        }
    };
}

function analyzeRacePerformances(race) {
    if (!race.dates || race.dates.length === 0) {
        return { 
            status: 'no_data', 
            message: 'Aucune performance de course',
            recommendations: ['Commencer à enregistrer les performances de course pour suivre la progression']
        };
    }
    
    const lastIndex = race.dates.length - 1;
    const lastEvent = race.event[lastIndex];
    const lastRaces = race.races && race.races[lastIndex] ? race.races[lastIndex] : [];
    
    // Organiser les données par style et distance pour l'analyse
    const performancesByStyle = {};
    const allPersonalBests = [];
    const improvements = [];
    const regressions = [];
    
    // Analyser chaque nage dans l'historique
    race.races.forEach((raceArray, raceIndex) => {
        raceArray.forEach(swim => {
            const key = `${swim.style}-${swim.distance}`;
            
            if (!performancesByStyle[key]) {
                performancesByStyle[key] = {
                    style: swim.style,
                    distance: swim.distance,
                    times: [],
                    dates: []
                };
            }
            
            performancesByStyle[key].times.push(convertTimeToSeconds(swim.time));
            performancesByStyle[key].dates.push(race.dates[raceIndex]);
        });
    });
    
    // Analyser les progressions pour chaque combinaison style-distance
    Object.keys(performancesByStyle).forEach(key => {
        const perf = performancesByStyle[key];
        
        if (perf.times.length >= 2) {
            const bestTime = Math.min(...perf.times);
            const lastTime = perf.times[perf.times.length - 1];
            const previousTime = perf.times[perf.times.length - 2];
            
            const isPersonalBest = lastTime === bestTime;
            const improvement = previousTime > lastTime ? ((previousTime - lastTime) / previousTime * 100) : 0;
            const regression = lastTime > previousTime ? ((lastTime - previousTime) / previousTime * 100) : 0;
            
            perf.bestTime = bestTime;
            perf.lastTime = lastTime;
            perf.isPersonalBest = isPersonalBest;
            perf.improvement = improvement;
            perf.regression = regression;
            perf.trend = calculateTrend(perf.times);
            
            if (isPersonalBest) {
                allPersonalBests.push(`${perf.style} ${perf.distance}: ${formatSecondsToTime(bestTime)}`);
            }
            
            if (improvement > 0.5) {
                improvements.push({
                    desc: `${perf.style} ${perf.distance}`,
                    value: improvement.toFixed(2)
                });
            }
            
            if (regression > 2) {
                regressions.push({
                    desc: `${perf.style} ${perf.distance}`,
                    value: regression.toFixed(2)
                });
            }
        }
    });
    
    // Déterminer le statut global
    let status = 'good';
    if (allPersonalBests.length > 0) {
        status = 'excellent';
    } else if (regressions.length > improvements.length && regressions.length > 2) {
        status = 'poor';
    } else if (regressions.length > 0) {
        status = 'warning';
    }
    
    // Générer des recommandations personnalisées
    const recommendations = generateRaceRecommendations(
        performancesByStyle, 
        allPersonalBests, 
        improvements, 
        regressions,
        race.dates.length
    );
    
    return {
        status,
        lastEvent: lastEvent,
        lastDate: race.dates[lastIndex],
        lastRaces: lastRaces,
        performancesByStyle: performancesByStyle,
        personalBests: allPersonalBests,
        improvements: improvements,
        regressions: regressions,
        totalRaces: race.dates.length,
        recommendations: recommendations
    };
}

function generateRaceRecommendations(performances, personalBests, improvements, regressions, totalRaces) {
    const recommendations = [];
    
    // Recommandations basées sur les records personnels
    if (personalBests.length > 0) {
        recommendations.push(`🏆 Félicitations ! ${personalBests.length} record(s) personnel(s) battu(s): ${personalBests.join(', ')}`);
    }
    
    // Recommandations basées sur les améliorations
    if (improvements.length > 0) {
        const bestImprovement = improvements.reduce((max, imp) => 
            parseFloat(imp.value) > parseFloat(max.value) ? imp : max
        );
        recommendations.push(`📈 Excellente progression sur ${bestImprovement.desc} (+${bestImprovement.value}%). Continuez sur cette lancée !`);
    }
    
    // Recommandations basées sur les régressions
    if (regressions.length > 0) {
        const worstRegression = regressions.reduce((max, reg) => 
            parseFloat(reg.value) > parseFloat(max.value) ? reg : max
        );
        recommendations.push(`⚠️ Baisse de performance détectée sur ${worstRegression.desc} (-${worstRegression.value}%). Analyse technique recommandée.`);
    }
    
    // Analyser les styles de nage
    const styleStats = {};
    Object.keys(performances).forEach(key => {
        const perf = performances[key];
        if (!styleStats[perf.style]) {
            styleStats[perf.style] = { count: 0, avgTrend: 0 };
        }
        styleStats[perf.style].count++;
        styleStats[perf.style].avgTrend += perf.trend || 0;
    });
    
    // Identifier le style le plus/moins travaillé
    const styleEntries = Object.entries(styleStats);
    if (styleEntries.length > 1) {
        const mostPracticed = styleEntries.reduce((max, entry) => 
            entry[1].count > max[1].count ? entry : max
        );
        const leastPracticed = styleEntries.reduce((min, entry) => 
            entry[1].count < min[1].count ? entry : min
        );
        
        if (leastPracticed[1].count < mostPracticed[1].count / 2) {
            recommendations.push(`💡 Style ${leastPracticed[0]} moins pratiqué. Envisager d'équilibrer l'entraînement entre les styles.`);
        }
    }
    
    // Recommandations basées sur le nombre de courses
    if (totalRaces < 3) {
        recommendations.push(`📊 Seulement ${totalRaces} course(s) enregistrée(s). Plus de données permettront une analyse plus précise.`);
    } else if (totalRaces >= 10) {
        recommendations.push(`✅ Excellent suivi avec ${totalRaces} courses enregistrées. Continuez ce suivi régulier !`);
    }
    
    // Analyse des distances
    const distances50m = Object.keys(performances).filter(k => performances[k].distance === '50m').length;
    const distances100m = Object.keys(performances).filter(k => performances[k].distance === '100m').length;
    const distances200m = Object.keys(performances).filter(k => performances[k].distance === '200m').length;
    const longDistance = Object.keys(performances).filter(k => 
        performances[k].distance === '400m' || performances[k].distance === '800m' || performances[k].distance === '1500m'
    ).length;
    
    if (longDistance === 0 && totalRaces > 5) {
        recommendations.push(`🏊 Aucune longue distance enregistrée. Envisager d'ajouter des courses 400m/800m/1500m pour évaluer l'endurance.`);
    }
    
    if (distances50m > distances100m * 2 && distances100m > 0) {
        recommendations.push(`⚡ Focus important sur sprint 50m. Bon équilibre vitesse-endurance, mais attention à ne pas négliger les distances moyennes.`);
    }
    
    // Recommandations techniques
    const crawlPerfs = Object.keys(performances).filter(k => performances[k].style === 'Crawl');
    const otherStyles = Object.keys(performances).length - crawlPerfs.length;
    
    if (crawlPerfs.length > 0 && otherStyles === 0) {
        recommendations.push(`🏊‍♂️ Uniquement du Crawl enregistré. Penser à diversifier avec Dos, Brasse et Papillon pour un développement complet.`);
    }
    
    return recommendations;
}

// =============================================
// FONCTIONS PRINCIPALES - GÉNÉRATION DE RETOURS
// =============================================

function generateRecommendations(analysis, swimmer) {
    const recommendations = [];
    
    // Recommandations basées sur le bien-être
    if (analysis.wellbeing.status !== 'no_data') {
        if (analysis.wellbeing.status === 'poor') {
            if (analysis.wellbeing.recent.sleep < 2) {
                recommendations.push("Priorité: Améliorer la qualité du sommeil. Consulter un spécialiste si nécessaire.");
            }
            if (analysis.wellbeing.recent.fatigue > 4) {
                recommendations.push("Fatigue élevée détectée. Réduire temporairement la charge d'entraînement.");
            }
            if (analysis.wellbeing.recent.pain > 3) {
                recommendations.push("Douleur significative signalée. Consultation médicale recommandée.");
            }
        }
        
        if (analysis.wellbeing.trend < -0.1) {
            recommendations.push("Tendance à la baisse du bien-être global. Surveiller attentivement.");
        }
    }
    
    // Recommandations basées sur l'entraînement
    if (analysis.training.status !== 'no_data') {
        if (analysis.training.monotony > 2.0) {
            recommendations.push("Monotonie d'entraînement élevée. Varier les stimuli d'entraînement.");
        }
        
        if (analysis.training.recent.rpe > 8 && analysis.training.recent.volume > 120) {
            recommendations.push("Charge d'entraînement très élevée. Surveiller les signes de surentraînement.");
        }
        
        if (analysis.training.trend > 0.2) {
            recommendations.push("Charge d'entraînement en augmentation rapide. Assurer une récupération adéquate.");
        }
    }
    
    // Recommandations basées sur les performances
    if (analysis.performance.status !== 'no_data') {
        if (analysis.performance.trends.vma < -0.05) {
            recommendations.push("VMA en diminution. Revoir la programmation des exercices aérobies.");
        }
        
        if (analysis.performance.recent.shoulder < 15) {
            recommendations.push("Force d'épaule insuffisante. Intégrer des exercices de renforcement spécifique.");
        }
    }
    
    // Recommandations basées sur la présence, disponibilité et statut médical
    if (analysis.medical.status !== 'no_data') {
        if (analysis.medical.recent.availability === 0) {
            recommendations.push("Nageur indisponible. Mettre en place un plan de réathlétisation.");
        }
        
        if (analysis.medical.recent.injuries > 0) {
            recommendations.push("Blessure active détectée. Suivre le protocole de réhabilitation.");
        }
    }
    
    // Recommandations basées sur les performances de course
    if (analysis.race && analysis.race.status !== 'no_data' && analysis.race.recommendations) {
        analysis.race.recommendations.forEach(rec => {
            recommendations.push(rec);
        });
    }
    
    // ✅ NOUVEAU - Recommandations basées sur les sessions
    if (analysis.sessions && analysis.sessions.status !== 'no_data' && analysis.sessions.recommendations) {
        analysis.sessions.recommendations.forEach(rec => {
            recommendations.push(rec);
        });
    }
    
    // Recommandations générales si peu de données
    const totalDataPoints = 
        (analysis.wellbeing.status === 'no_data' ? 0 : 1) +
        (analysis.training.status === 'no_data' ? 0 : 1) +
        (analysis.performance.status === 'no_data' ? 0 : 1) +
        (analysis.medical.status === 'no_data' ? 0 : 1) +
        (analysis.race && analysis.race.status !== 'no_data' ? 1 : 0) +
        (analysis.sessions && analysis.sessions.status !== 'no_data' ? 1 : 0);
        
    if (totalDataPoints < 2) {
        recommendations.push("Données insuffisantes pour une analyse complète. Saisir davantage de données.");
    }
    
    return recommendations.length > 0 ? recommendations : ["Aucune recommandation spécifique. Poursuivre le programme actuel."];
}

function generatePersonalizedFeedback(swimmer, analysis) {
    let feedback = `<div class="feedback-box">
        <div class="feedback-title">Retour Personnalisé pour ${swimmer.name}</div>
        <div class="feedback-content">`;
    
    // Résumé général
    const overallStatus = getOverallStatus(analysis);
    feedback += `<p><strong>Statut général:</strong> ${overallStatus.message}</p>`;
    
    // Détails par domaine
    feedback += "<h4>Détails par domaine:</h4><ul>";
    
    if (analysis.wellbeing.status !== 'no_data') {
        const wellbeingStatus = getStatusMessage(analysis.wellbeing.status, 'bien-être');
        feedback += `<li>Bien-être: ${wellbeingStatus}</li>`;
    }
    
    if (analysis.training.status !== 'no_data') {
        const trainingStatus = getStatusMessage(analysis.training.status, 'entraînement');
        feedback += `<li>Entraînement: ${trainingStatus}</li>`;
    }
    
    if (analysis.performance.status !== 'no_data') {
        const performanceStatus = getStatusMessage(analysis.performance.status, 'performance');
        feedback += `<li>Performance: ${performanceStatus}</li>`;
    }
    
    if (analysis.medical.status !== 'no_data') {
        const medicalStatus = getStatusMessage(analysis.medical.status, 'présence, disponibilité et médical');
        feedback += `<li>Médical: ${medicalStatus}</li>`;
    }
    
    if (analysis.race && analysis.race.status !== 'no_data') {
        const raceStatus = getStatusMessage(analysis.race.status, 'performances de course');
        feedback += `<li>Performances de Course: ${raceStatus}</li>`;
        
        // Ajouter détails spécifiques sur les courses
        if (analysis.race.personalBests && analysis.race.personalBests.length > 0) {
            feedback += `<li style="color: green; font-weight: bold;">🏆 Records personnels battus: ${analysis.race.personalBests.length}</li>`;
        }
        
        if (analysis.race.improvements && analysis.race.improvements.length > 0) {
            feedback += `<li style="color: green;">📈 Améliorations constatées sur ${analysis.race.improvements.length} épreuve(s)</li>`;
        }
        
        if (analysis.race.regressions && analysis.race.regressions.length > 0) {
            feedback += `<li style="color: orange;">⚠️ Attention: ${analysis.race.regressions.length} régression(s) détectée(s)</li>`;
        }
    }
    
    feedback += "</ul>";
    
    // Recommandations
    feedback += `<h4>Recommandations:</h4><ol>`;
    analysis.recommendations.forEach(rec => {
        feedback += `<li>${rec}</li>`;
    });
    feedback += "</ol>";
    
    feedback += `</div></div>`;
    return feedback;
}

function getOverallStatus(analysis) {
    const statuses = [];
    if (analysis.wellbeing.status !== 'no_data') statuses.push(analysis.wellbeing.status);
    if (analysis.training.status !== 'no_data') statuses.push(analysis.training.status);
    if (analysis.performance.status !== 'no_data') statuses.push(analysis.performance.status);
    if (analysis.medical.status !== 'no_data') statuses.push(analysis.medical.status);
    
    if (statuses.length === 0) {
        return { status: 'no_data', message: 'Données insuffisantes' };
    }
    
    if (statuses.includes('poor')) {
        return { status: 'poor', message: 'Attention nécessaire - problèmes détectés' };
    } else if (statuses.includes('warning')) {
        return { status: 'warning', message: 'Surveillance recommandée' };
    } else {
        return { status: 'good', message: 'Situation favorable' };
    }
}

function getStatusMessage(status, domain) {
    const messages = {
        'excellent': `🏆 ${domain} excellente ! Records battus`,
        'good': `✅ ${domain} dans les normes`,
        'warning': `⚠️ ${domain} nécessite une attention`,
        'poor': `❌ ${domain} problématique`,
        'no_data': `📊 Données ${domain} manquantes`
    };
    return messages[status] || `État ${domain} indéterminé`;
}

// =============================================
// FONCTIONS D'AFFICHAGE
// =============================================

function updateDashboard() {
    const activeSection = document.querySelector('nav a.active').getAttribute('href').substring(1);
    
    switch(activeSection) {
        case 'dashboard':
            // ✅ APERÇU COMPLET: Fusion de Dashboard + Sessions + Analyse + Retours
            showCompleteDashboard();
            break;
        case 'saisie':
            showDataEntry();
            break;
        default:
            showCompleteDashboard();
    }
}

// =============================================
// FONCTIONS UTILITAIRES POUR DASHBOARD AMÉLIORÉ
// =============================================

// Calculer la tendance (pourcentage de changement)
function calculateTrend(current, previous) {
    if (!previous || previous === 0) return { value: 0, direction: 'stable' };
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(change).toFixed(1),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        raw: change
    };
}

// Obtenir les dernières valeurs pour calcul de tendance
function getRecentValues(dataArray, field, count = 7) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
    return dataArray.slice(-count).map(item => parseFloat(item[field]) || 0).filter(v => v > 0);
}

// Calculer moyenne des 7 derniers jours
function calculateWeekAverage(swimmer, dataType, field) {
    const data = swimmer[dataType] || [];
    if (!Array.isArray(data) || data.length === 0) return 0;
    
    const values = getRecentValues(data, field, 7);
    if (values.length === 0) return 0;
    
    return (values.reduce((a, b) => a + b, 0) / values.length);
}

// Générer icône de tendance
function getTrendIcon(trend) {
    if (trend.direction === 'up') return `<span style="color: #28a745;">↗ +${trend.value}%</span>`;
    if (trend.direction === 'down') return `<span style="color: #dc3545;">↘ -${trend.value}%</span>`;
    return `<span style="color: #6c757d;">→ ${trend.value}%</span>`;
}

// Générer alertes intelligentes pour un nageur
function generateSwimmerAlerts(swimmer) {
    const alerts = [];
    
    // Vérifier bien-être
    if (swimmer.wellbeingData && swimmer.wellbeingData.length >= 3) {
        const recent = swimmer.wellbeingData.slice(-3);
        const avgRecent = recent.reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / 3;
        
        if (avgRecent < 2.5) {
            alerts.push({
                type: 'danger',
                icon: '🔴',
                category: 'wellbeing',
                message: `Bien-être critique (${avgRecent.toFixed(1)}/5)`,
                recommendation: 'Réduire la charge d\'entraînement et consulter'
            });
        } else if (avgRecent < 3.0) {
            alerts.push({
                type: 'warning',
                icon: '⚠️',
                category: 'wellbeing',
                message: `Bien-être en baisse (${avgRecent.toFixed(1)}/5)`,
                recommendation: 'Surveiller et adapter la charge'
            });
        } else if (avgRecent >= 4.5) {
            alerts.push({
                type: 'success',
                icon: '✅',
                category: 'wellbeing',
                message: `Excellent bien-être (${avgRecent.toFixed(1)}/5)`,
                recommendation: 'Continuer sur cette lancée!'
            });
        }
    }
    
    // Vérifier charge d'entraînement
    if (swimmer.trainingData && swimmer.trainingData.length >= 7) {
        const weekLoad = swimmer.trainingData.slice(-7).reduce((sum, d) => sum + (d.load || 0), 0);
        const avgWeekLoad = weekLoad / 7;
        
        if (avgWeekLoad > 750) {
            alerts.push({
                type: 'warning',
                icon: '⚡',
                category: 'training',
                message: `Charge élevée cette semaine (${avgWeekLoad.toFixed(0)})`,
                recommendation: 'Attention au risque de surmenage'
            });
        }
    }
    
    // Vérifier progression VMA
    if (swimmer.performanceData && swimmer.performanceData.length >= 2) {
        const recent = swimmer.performanceData.slice(-2);
        if (recent.length === 2 && recent[0].vma && recent[1].vma) {
            const progress = recent[1].vma - recent[0].vma;
            if (progress >= 0.5) {
                alerts.push({
                    type: 'success',
                    icon: '📈',
                    category: 'performance',
                    message: `Excellente progression VMA (+${progress.toFixed(1)} km/h)`,
                    recommendation: 'Objectif en bonne voie!'
                });
            }
        }
    }
    
    // Vérifier assiduité
    if (swimmer.attendance && swimmer.attendance.records) {
        const total = swimmer.attendance.records.length;
        const present = swimmer.attendance.records.filter(r => r.status === 'present').length;
        const rate = total > 0 ? (present / total) * 100 : 0;
        
        if (rate < 80) {
            alerts.push({
                type: 'warning',
                icon: '📅',
                category: 'attendance',
                message: `Assiduité à améliorer (${rate.toFixed(0)}%)`,
                recommendation: 'Discuter des raisons des absences'
            });
        } else if (rate >= 95) {
            alerts.push({
                type: 'success',
                icon: '🎯',
                category: 'attendance',
                message: `Excellente assiduité (${rate.toFixed(0)}%)`,
                recommendation: 'Félicitations pour la régularité!'
            });
        }
    }
    
    return alerts;
}

// Générer activité récente
function generateRecentActivity(swimmer) {
    const activities = [];
    
    // Entraînements récents
    if (swimmer.trainingData && swimmer.trainingData.length > 0) {
        const recent = swimmer.trainingData.slice(-3);
        recent.reverse().forEach(t => {
            activities.push({
                date: t.date,
                icon: '🏊',
                type: 'training',
                description: `Entraînement: ${t.volumeMeters || t.volume}m en ${t.volume}min (RPE: ${t.rpe})`
            });
        });
    }
    
    // Tests de performance récents
    if (swimmer.performanceData && swimmer.performanceData.length > 0) {
        const recent = swimmer.performanceData.slice(-2);
        recent.reverse().forEach(p => {
            activities.push({
                date: p.date,
                icon: '💪',
                type: 'performance',
                description: `Test VMA: ${p.vma} km/h`
            });
        });
    }
    
    // Compétitions récentes
    if (swimmer.raceData && swimmer.raceData.length > 0) {
        const recent = swimmer.raceData.slice(-2);
        recent.reverse().forEach(r => {
            const firstRace = r.races && r.races[0];
            if (firstRace) {
                activities.push({
                    date: r.date,
                    icon: '🏆',
                    type: 'race',
                    description: `Compétition: ${firstRace.distance} ${firstRace.style} en ${firstRace.time}`
                });
            }
        });
    }
    
    // Trier par date (plus récent en premier)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return activities.slice(0, 5);
}

// =============================================
// FONCTIONS PHASE 2 - GRAPHIQUES ET OBJECTIFS
// =============================================

// Générer graphiques de progression 30 jours
function generateProgressionCharts(swimmer) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Extraire données des 30 derniers jours
    function getLast30Days(dataArray, dateField = 'date') {
        if (!Array.isArray(dataArray)) return [];
        return dataArray.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= thirtyDaysAgo && itemDate <= now;
        }).sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));
    }
    
    // Calculer moyenne sur une période
    function calculateAverage(data, field) {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0);
        return (sum / data.length).toFixed(1);
    }
    
    // Données des 30 derniers jours
    const wellbeingData30 = getLast30Days(swimmer.wellbeingData || []);
    const trainingData30 = getLast30Days(swimmer.trainingData || []);
    const performanceData30 = getLast30Days(swimmer.performanceData || []);
    const medicalData30 = getLast30Days(swimmer.medicalData || []);
    
    // Calculer scores moyens pour bien-être
    const wellbeingScores = wellbeingData30.map(d => ({
        date: d.date,
        score: ((d.sleep + d.fatigue + d.pain + d.stress) / 4).toFixed(1)
    }));
    
    // Préparer données pour mini-charts
    const charts = [
        {
            id: 'mini-wellbeing',
            title: 'Bien-être',
            icon: '😊',
            color: '#28a745',
            avg: calculateAverage(wellbeingScores, 'score'),
            unit: '/5',
            data: wellbeingScores,
            yField: 'score',
            maxY: 5
        },
        {
            id: 'mini-load',
            title: 'Charge',
            icon: '💪',
            color: '#fd7e14',
            avg: calculateAverage(trainingData30, 'load'),
            unit: '',
            data: trainingData30,
            yField: 'load',
            maxY: null
        },
        {
            id: 'mini-availability',
            title: 'Disponibilité',
            icon: '🏃',
            color: '#17a2b8',
            avg: calculateAverage(medicalData30, 'availability'),
            unit: '%',
            data: medicalData30,
            yField: 'availability',
            maxY: 100
        },
        {
            id: 'mini-vma',
            title: 'VMA',
            icon: '🚀',
            color: '#6f42c1',
            avg: calculateAverage(performanceData30, 'vma'),
            unit: ' km/h',
            data: performanceData30,
            yField: 'vma',
            maxY: null
        }
    ];
    
    let html = `
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-chart-line"></i> Progression sur 30 jours</h3>
            </div>
            <div class="card-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">`;
    
    charts.forEach(chart => {
        const canvasId = `canvas-${chart.id}`;
        html += `
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; border-left: 4px solid ${chart.color};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;">${chart.icon}</span>
                            <div style="text-align: right;">
                                <div style="font-size: 0.9rem; color: #666;">${chart.title}</div>
                                <div style="font-size: 1.4rem; font-weight: bold; color: ${chart.color};">${chart.avg}${chart.unit}</div>
                            </div>
                        </div>
                        <canvas id="${canvasId}" style="max-height: 80px;"></canvas>
                    </div>`;
    });
    
    html += `
                </div>
            </div>
        </div>`;
    
    // Initialiser les graphiques après insertion dans le DOM
    setTimeout(() => {
        charts.forEach(chart => {
            const canvas = document.getElementById(`canvas-${chart.id}`);
            if (canvas && chart.data.length > 0) {
                const ctx = canvas.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: chart.data.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                        datasets: [{
                            data: chart.data.map(d => parseFloat(d[chart.yField]) || 0),
                            borderColor: chart.color,
                            backgroundColor: chart.color + '20',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `${context.parsed.y}${chart.unit}`
                                }
                            }
                        },
                        scales: {
                            x: { display: false },
                            y: {
                                display: false,
                                beginAtZero: true,
                                max: chart.maxY
                            }
                        }
                    }
                });
            }
        });
    }, 100);
    
    return html;
}

// Générer section objectifs
function generateObjectivesSection(swimmer) {
    // Récupérer objectifs du nageur (structure: {id, title, target, current, deadline, category})
    const objectives = swimmer.objectives || [
        {
            id: 1,
            title: 'Améliorer VMA',
            target: 16.0,
            current: swimmer.performanceData && swimmer.performanceData.length > 0 
                ? swimmer.performanceData[swimmer.performanceData.length - 1].vma 
                : 14.5,
            deadline: '2025-12-31',
            category: 'performance',
            unit: 'km/h'
        },
        {
            id: 2,
            title: 'Assiduité 95%',
            target: 95,
            current: calculateAttendanceRate(swimmer),
            deadline: '2025-12-31',
            category: 'attendance',
            unit: '%'
        },
        {
            id: 3,
            title: 'Maintenir bien-être',
            target: 4.5,
            current: swimmer.wellbeingData && swimmer.wellbeingData.length > 0
                ? ((swimmer.wellbeingData[swimmer.wellbeingData.length - 1].sleep + 
                    swimmer.wellbeingData[swimmer.wellbeingData.length - 1].fatigue + 
                    swimmer.wellbeingData[swimmer.wellbeingData.length - 1].pain + 
                    swimmer.wellbeingData[swimmer.wellbeingData.length - 1].stress) / 4)
                : 3.8,
            deadline: '2025-12-31',
            category: 'wellbeing',
            unit: '/5'
        }
    ];
    
    // Fonction pour calculer assiduité
    function calculateAttendanceRate(swimmer) {
        if (!swimmer.attendance || !swimmer.attendance.records) return 0;
        const records = swimmer.attendance.records;
        if (records.length === 0) return 0;
        const present = records.filter(r => r.status === 'present').length;
        return ((present / records.length) * 100).toFixed(1);
    }
    
    let html = `
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-bullseye"></i> Objectifs & Suivi</h3>
            </div>
            <div class="card-content">`;
    
    objectives.forEach(obj => {
        const progress = Math.min(100, (obj.current / obj.target) * 100);
        const daysLeft = Math.ceil((new Date(obj.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const statusColor = progress >= 100 ? '#28a745' : progress >= 75 ? '#17a2b8' : progress >= 50 ? '#ffc107' : '#dc3545';
        const statusIcon = progress >= 100 ? '✅' : progress >= 75 ? '🎯' : progress >= 50 ? '⚠️' : '🔴';
        
        html += `
                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <span style="font-size: 1.2rem;">${statusIcon}</span>
                            <strong style="margin-left: 8px; font-size: 1.1rem;">${obj.title}</strong>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.3rem; font-weight: bold; color: ${statusColor};">
                                ${obj.current}${obj.unit} / ${obj.target}${obj.unit}
                            </div>
                            <div style="font-size: 0.85rem; color: #666;">
                                ${daysLeft > 0 ? `${daysLeft} jours restants` : 'Échéance dépassée'}
                            </div>
                        </div>
                    </div>
                    <div style="background: #e9ecef; border-radius: 10px; height: 20px; overflow: hidden; position: relative;">
                        <div style="background: linear-gradient(90deg, ${statusColor}, ${statusColor}dd); height: 100%; width: ${progress}%; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 0.75rem; font-weight: bold; color: white; position: absolute; left: 50%; transform: translateX(-50%);">
                                ${progress.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>`;
    });
    
    html += `
            </div>
        </div>`;
    
    return html;
}

// Générer comparaison avec l'équipe
function generateTeamComparison(swimmer) {
    // Calculer moyennes du nageur
    const swimmerStats = {
        wellbeing: calculateWeekAverage(swimmer, 'wellbeingData', 'sleep'), // Approximation
        load: calculateWeekAverage(swimmer, 'trainingData', 'load'),
        vma: swimmer.performanceData && swimmer.performanceData.length > 0
            ? swimmer.performanceData[swimmer.performanceData.length - 1].vma
            : 0,
        availability: swimmer.medicalData && swimmer.medicalData.length > 0
            ? swimmer.medicalData[swimmer.medicalData.length - 1].availability
            : 0,
        attendance: 0
    };
    
    // Calculer assiduité
    if (swimmer.attendance && swimmer.attendance.records) {
        const records = swimmer.attendance.records;
        if (records.length > 0) {
            const present = records.filter(r => r.status === 'present').length;
            swimmerStats.attendance = (present / records.length) * 100;
        }
    }
    
    // Calculer moyennes de l'équipe (simulation si pas d'équipe disponible)
    const teamAvg = {
        wellbeing: 3.8,
        load: 550,
        vma: 14.2,
        availability: 88,
        attendance: 87
    };
    
    // Si plusieurs nageurs existent, calculer les vraies moyennes
    if (swimmers.length > 1) {
        let totalWellbeing = 0, totalLoad = 0, totalVma = 0, totalAvailability = 0, totalAttendance = 0;
        let countWellbeing = 0, countLoad = 0, countVma = 0, countAvailability = 0, countAttendance = 0;
        
        swimmers.forEach(s => {
            if (s.id !== swimmer.id) {
                const wb = calculateWeekAverage(s, 'wellbeingData', 'sleep');
                if (wb > 0) { totalWellbeing += wb; countWellbeing++; }
                
                const ld = calculateWeekAverage(s, 'trainingData', 'load');
                if (ld > 0) { totalLoad += ld; countLoad++; }
                
                if (s.performanceData && s.performanceData.length > 0) {
                    totalVma += s.performanceData[s.performanceData.length - 1].vma;
                    countVma++;
                }
                
                if (s.medicalData && s.medicalData.length > 0) {
                    totalAvailability += s.medicalData[s.medicalData.length - 1].availability;
                    countAvailability++;
                }
                
                if (s.attendance && s.attendance.records && s.attendance.records.length > 0) {
                    const present = s.attendance.records.filter(r => r.status === 'present').length;
                    totalAttendance += (present / s.attendance.records.length) * 100;
                    countAttendance++;
                }
            }
        });
        
        if (countWellbeing > 0) teamAvg.wellbeing = totalWellbeing / countWellbeing;
        if (countLoad > 0) teamAvg.load = totalLoad / countLoad;
        if (countVma > 0) teamAvg.vma = totalVma / countVma;
        if (countAvailability > 0) teamAvg.availability = totalAvailability / countAvailability;
        if (countAttendance > 0) teamAvg.attendance = totalAttendance / countAttendance;
    }
    
    const comparisons = [
        {
            metric: 'Bien-être',
            icon: '😊',
            swimmer: swimmerStats.wellbeing.toFixed(1),
            team: teamAvg.wellbeing.toFixed(1),
            unit: '/5',
            higherIsBetter: true
        },
        {
            metric: 'Charge entraînement',
            icon: '💪',
            swimmer: swimmerStats.load.toFixed(0),
            team: teamAvg.load.toFixed(0),
            unit: '',
            higherIsBetter: false // Dépend du contexte
        },
        {
            metric: 'VMA',
            icon: '🚀',
            swimmer: swimmerStats.vma.toFixed(1),
            team: teamAvg.vma.toFixed(1),
            unit: ' km/h',
            higherIsBetter: true
        },
        {
            metric: 'Disponibilité',
            icon: '🏃',
            swimmer: swimmerStats.availability.toFixed(0),
            team: teamAvg.availability.toFixed(0),
            unit: '%',
            higherIsBetter: true
        },
        {
            metric: 'Assiduité',
            icon: '📅',
            swimmer: swimmerStats.attendance.toFixed(0),
            team: teamAvg.attendance.toFixed(0),
            unit: '%',
            higherIsBetter: true
        }
    ];
    
    let html = `
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-users"></i> Comparaison avec l'équipe</h3>
            </div>
            <div class="card-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`;
    
    comparisons.forEach(comp => {
        const swimmerVal = parseFloat(comp.swimmer);
        const teamVal = parseFloat(comp.team);
        const diff = swimmerVal - teamVal;
        const diffPercent = teamVal !== 0 ? ((diff / teamVal) * 100).toFixed(1) : 0;
        
        let statusIcon, statusColor, statusText;
        if (comp.higherIsBetter) {
            if (diff > 0) {
                statusIcon = '✅';
                statusColor = '#28a745';
                statusText = `+${diffPercent}% au-dessus`;
            } else if (diff < 0) {
                statusIcon = '⚠️';
                statusColor = '#ffc107';
                statusText = `${diffPercent}% en-dessous`;
            } else {
                statusIcon = '➖';
                statusColor = '#6c757d';
                statusText = 'Dans la moyenne';
            }
        } else {
            statusIcon = '➖';
            statusColor = '#17a2b8';
            statusText = diff > 0 ? `+${diffPercent}%` : `${diffPercent}%`;
        }
        
        html += `
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                        <div style="font-size: 1.5rem; margin-bottom: 5px;">${comp.icon}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">${comp.metric}</div>
                        <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 10px;">
                            <div>
                                <div style="font-size: 0.75rem; color: #666;">Vous</div>
                                <div style="font-size: 1.3rem; font-weight: bold; color: #1a73e8;">${comp.swimmer}${comp.unit}</div>
                            </div>
                            <div style="font-size: 1.2rem; color: #ccc;">vs</div>
                            <div>
                                <div style="font-size: 0.75rem; color: #666;">Équipe</div>
                                <div style="font-size: 1.3rem; font-weight: bold; color: #6c757d;">${comp.team}${comp.unit}</div>
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; color: ${statusColor}; font-weight: bold;">
                            ${statusIcon} ${statusText}
                        </div>
                    </div>`;
    });
    
    html += `
                </div>
            </div>
        </div>`;
    
    return html;
}

function showDashboard() {
    const container = document.getElementById('dashboardContent');
    if (!container) return;
    
    if (swimmers.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
                <i class="fas fa-swimmer" style="font-size: 4rem; color: #1a73e8; margin-bottom: 20px;"></i>
                <h3 style="color: #333; margin-bottom: 10px;">Aucun nageur enregistré</h3>
                <p style="color: #666; font-size: 1.1rem;">Commencez par ajouter votre premier nageur</p>
                <button class="btn btn-primary" onclick="document.getElementById('addSwimmerBtn').click()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Ajouter un Nageur
                </button>
            </div>`;
        return;
    }

    let content = '';
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        if (swimmer) {
            content = generateEnhancedSwimmerDashboard(swimmer);
        } else {
            content = `
                <div class="card" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
                    <i class="fas fa-swimmer" style="font-size: 4rem; color: #1a73e8; margin-bottom: 20px;"></i>
                    <h3 style="color: #333; margin-bottom: 10px;">Sélectionnez un nageur pour commencer</h3>
                    <p style="color: #666; font-size: 1.1rem;">Utilisez le sélecteur ci-dessus</p>
                </div>`;
        }
    } else {
        content = generateOverviewDashboard();
    }
    
    container.innerHTML = content;
    
    if (currentSwimmerId) {
        initializeCharts();
    }
}

// ✅ NOUVELLE FONCTION - Aperçu Complet (fusion de Dashboard + Analyse + Sessions + Retours)
// =============================================
// FONCTIONS DE GÉNÉRATION DES SECTIONS D'APERÇU
// Chaque section correspond à un formulaire de saisie
// =============================================

function generateWellbeingSection(swimmer) {
    const data = swimmer.wellbeingData || [];
    const sectionId = 'wellbeing-section';
    
    let html = `
    <div class="analysis-section" id="${sectionId}" style="margin-bottom: 30px;">
        <div class="section-header" onclick="toggleSection('${sectionId}')" style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 16px 20px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(255,107,53,0.2);">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.4rem; letter-spacing: 0.3px;">Bien-être & Condition</span>
                <span style="font-size: 1.7rem; opacity: 0.9; transition: transform 0.3s ease;">😊</span>
            </h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 0.9rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Analyse du sommeil, fatigue et stress</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body">`;
    
    if (data.length === 0) {
        html += `
                    <div style="text-align: center; padding: 40px; color: #999;">
                        <i class="fas fa-bed" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p style="font-size: 1.1rem;">Aucune donnée de bien-être enregistrée</p>
                        <p style="font-size: 0.9rem;">Utilisez le bouton flottant pour commencer</p>
                    </div>`;
    } else {
        // Calculer les moyennes sur les 7 derniers jours
        const recent = data.slice(-7);
        const avgSleepQuality = (recent.reduce((sum, d) => sum + (d.sleepQuality || d.sleep || 0), 0) / recent.length).toFixed(1);
        const avgEnergy = (recent.reduce((sum, d) => sum + (d.energyLevel || 0), 0) / recent.length).toFixed(1);
        const avgMotivation = (recent.reduce((sum, d) => sum + (d.motivation || 0), 0) / recent.length).toFixed(1);
        const avgStress = (recent.reduce((sum, d) => sum + (d.stressLevel || d.stress || 0), 0) / recent.length).toFixed(1);
        const avgRecovery = (recent.reduce((sum, d) => sum + (d.muscleRecovery || 0), 0) / recent.length).toFixed(1);
        const avgScore = (recent.reduce((sum, d) => sum + (d.score || 0), 0) / recent.length).toFixed(1);
        
        // Moyenne du poids et heures de sommeil
        const latestWeight = data[data.length - 1]?.bodyWeight;
        const avgSleepHours = (recent.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / recent.length).toFixed(1);
        
        html += `
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 25px;">
                        <div class="stat-card" style="text-align: center; padding: 18px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="font-size: 1.8rem; font-weight: bold; color: #4caf50;">${avgSleepQuality}/10</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">🛏️ Qualité Sommeil</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 18px; background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="font-size: 1.8rem; font-weight: bold; color: #f9a825;">${avgEnergy}/10</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">⚡ Énergie</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 18px; background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="font-size: 1.8rem; font-weight: bold; color: #0288d1;">${avgMotivation}/10</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">🎯 Motivation</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 18px; background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="font-size: 1.8rem; font-weight: bold; color: #c2185b;">${avgStress}/10</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">😰 Stress</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 18px; background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="font-size: 1.8rem; font-weight: bold; color: #7b1fa2;">${avgRecovery}/10</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">💪 Récupération</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 18px; background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <div style="font-size: 1.8rem; font-weight: bold; color: #00796b;">${avgScore}/10</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">📊 Score Global</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <div style="text-align: center;">
                            <div style="font-size: 1.4rem; font-weight: bold; color: #1976d2;">${avgSleepHours}h</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 3px;">⏰ Sommeil moyen</div>
                        </div>
                        ${latestWeight ? `
                        <div style="text-align: center;">
                            <div style="font-size: 1.4rem; font-weight: bold; color: #5e35b1;">${latestWeight} kg</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 3px;">⚖️ Poids actuel</div>
                        </div>` : ''}
                    </div>
                    
                    <div class="chart-container" style="height: 350px; margin: 25px 0;">
                        <canvas id="wellbeingChart"></canvas>
                    </div>
                    
                    <div style="margin-top: 25px;">
                        <h4 style="margin-bottom: 15px; color: #333;">📋 Dernières entrées complètes</h4>
                        <div style="overflow-x: auto;">
                            <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                                <thead>
                                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                        <th style="padding: 12px; text-align: left;">Date</th>
                                        <th style="padding: 12px; text-align: center;">Sommeil</th>
                                        <th style="padding: 12px; text-align: center;">Énergie</th>
                                        <th style="padding: 12px; text-align: center;">Motivation</th>
                                        <th style="padding: 12px; text-align: center;">Stress</th>
                                        <th style="padding: 12px; text-align: center;">Récup.</th>
                                        <th style="padding: 12px; text-align: center;">Heures</th>
                                        <th style="padding: 12px; text-align: center;">Poids</th>
                                        <th style="padding: 12px; text-align: center;">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.slice(-5).reverse().map(d => {
                                        const score = d.score || 0;
                                        const scoreColor = score >= 7 ? '#4caf50' : score >= 5 ? '#ff9800' : '#f44336';
                                        return `
                                        <tr style="border-bottom: 1px solid #eee;">
                                            <td style="padding: 12px; font-weight: 500;">${new Date(d.date).toLocaleDateString('fr-FR')}</td>
                                            <td style="padding: 12px; text-align: center;">${d.sleepQuality || d.sleep || '-'}/10</td>
                                            <td style="padding: 12px; text-align: center;">${d.energyLevel || '-'}/10</td>
                                            <td style="padding: 12px; text-align: center;">${d.motivation || '-'}/10</td>
                                            <td style="padding: 12px; text-align: center;">${d.stressLevel || d.stress || '-'}/10</td>
                                            <td style="padding: 12px; text-align: center;">${d.muscleRecovery || '-'}/10</td>
                                            <td style="padding: 12px; text-align: center;">${d.sleepHours ? d.sleepHours + 'h' : '-'}</td>
                                            <td style="padding: 12px; text-align: center;">${d.bodyWeight ? d.bodyWeight + ' kg' : '-'}</td>
                                            <td style="padding: 12px; text-align: center; font-weight: bold; color: ${scoreColor};">${score.toFixed(1)}/10</td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>`;
    }
    
    html += `
                </div>
            </div>
        </div>
    </div>`;
    
    return html;
}

// Fonction pour évaluer la performance et attribuer une couleur
function evaluatePerformance(metric, value, gender = 'male') {
    // Seuils de performance basés sur des standards sportifs
    const thresholds = {
        vma: {
            male: { excellent: 16, good: 14, average: 12 },
            female: { excellent: 14, good: 12, average: 10 }
        },
        legStrength: { // Saut vertical en cm
            male: { excellent: 50, good: 40, average: 30 },
            female: { excellent: 40, good: 30, average: 25 }
        },
        shoulderStrength: { // Pompes par minute
            male: { excellent: 40, good: 30, average: 20 },
            female: { excellent: 30, good: 20, average: 15 }
        },
        coreStrength: { // Gainage en secondes
            male: { excellent: 120, good: 90, average: 60 },
            female: { excellent: 90, good: 70, average: 50 }
        }
    };
    
    const levels = thresholds[metric]?.[gender] || thresholds[metric]?.male;
    if (!levels || value === null || value === undefined) {
        return { color: '#999', label: 'Non évalué', bgColor: '#f5f5f5' };
    }
    
    if (value >= levels.excellent) {
        return { color: '#4caf50', label: 'Excellent', bgColor: '#e8f5e9' };
    } else if (value >= levels.good) {
        return { color: '#8bc34a', label: 'Bon', bgColor: '#f1f8e9' };
    } else if (value >= levels.average) {
        return { color: '#ff9800', label: 'Moyen', bgColor: '#fff3e0' };
    } else {
        return { color: '#f44336', label: 'À améliorer', bgColor: '#ffebee' };
    }
}

function generatePerformanceSection(swimmer) {
    const data = swimmer.performanceData || [];
    const sectionId = 'performance-section';
    
    let html = `
    <div class="analysis-section" id="${sectionId}" style="margin-bottom: 30px;">
        <div class="section-header" onclick="toggleSection('${sectionId}')" style="background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); padding: 16px 20px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(142,68,173,0.2); cursor: pointer;">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.4rem; letter-spacing: 0.3px;">Performance Physique</span>
                <span style="font-size: 1.7rem; opacity: 0.9; transition: transform 0.3s ease;">💪</span>
            </h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 0.8rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Tests VMA, force et gainage</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body">`;
    
    if (data.length === 0) {
        html += `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-dumbbell" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucun test de performance enregistré</p>
                    <p style="font-size: 0.9rem;">Utilisez le bouton flottant pour commencer</p>
                </div>`;
    } else {
        const latest = data[data.length - 1];
        const gender = swimmer.gender === 'Féminin' ? 'female' : 'male';
        
        // Évaluer chaque métrique
        const vmaEval = evaluatePerformance('vma', latest.vma, gender);
        const legEval = evaluatePerformance('legStrength', latest.legStrength, gender);
        const shoulderEval = evaluatePerformance('shoulderStrength', latest.shoulderStrength, gender);
        const coreEval = evaluatePerformance('coreStrength', latest.coreStrength, gender);
        
        html += `
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">📊</span>
                        <span>Dernière Évaluation - ${new Date(latest.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </h4>
                    
                    <!-- Cartes de performance avec bandes colorées -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        
                        <!-- VMA -->
                        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${vmaEval.color};">
                            <div style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">🏃 VMA</div>
                                        <div style="font-size: 2rem; font-weight: bold; color: #333;">${latest.vma || '-'} <span style="font-size: 1rem; color: #999;">km/h</span></div>
                                    </div>
                                    <div style="background: ${vmaEval.bgColor}; color: ${vmaEval.color}; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                                        ${vmaEval.label}
                                    </div>
                                </div>
                                <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                                    <div style="height: 100%; background: linear-gradient(90deg, ${vmaEval.color}, ${vmaEval.color}cc); width: ${Math.min(((latest.vma || 0) / 20) * 100, 100)}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Saut Vertical -->
                        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${legEval.color};">
                            <div style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">🦵 Saut Vertical</div>
                                        <div style="font-size: 2rem; font-weight: bold; color: #333;">${latest.legStrength || '-'} <span style="font-size: 1rem; color: #999;">cm</span></div>
                                    </div>
                                    <div style="background: ${legEval.bgColor}; color: ${legEval.color}; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                                        ${legEval.label}
                                    </div>
                                </div>
                                <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                                    <div style="height: 100%; background: linear-gradient(90deg, ${legEval.color}, ${legEval.color}cc); width: ${Math.min(((latest.legStrength || 0) / 70) * 100, 100)}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pompes -->
                        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${shoulderEval.color};">
                            <div style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">💪 Pompes</div>
                                        <div style="font-size: 2rem; font-weight: bold; color: #333;">${latest.shoulderStrength || '-'} <span style="font-size: 1rem; color: #999;">/min</span></div>
                                    </div>
                                    <div style="background: ${shoulderEval.bgColor}; color: ${shoulderEval.color}; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                                        ${shoulderEval.label}
                                    </div>
                                </div>
                                <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                                    <div style="height: 100%; background: linear-gradient(90deg, ${shoulderEval.color}, ${shoulderEval.color}cc); width: ${Math.min(((latest.shoulderStrength || 0) / 50) * 100, 100)}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Gainage -->
                        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${coreEval.color};">
                            <div style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">⏱️ Gainage</div>
                                        <div style="font-size: 2rem; font-weight: bold; color: #333;">${latest.coreStrength || '-'} <span style="font-size: 1rem; color: #999;">sec</span></div>
                                    </div>
                                    <div style="background: ${coreEval.bgColor}; color: ${coreEval.color}; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                                        ${coreEval.label}
                                    </div>
                                </div>
                                <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                                    <div style="height: 100%; background: linear-gradient(90deg, ${coreEval.color}, ${coreEval.color}cc); width: ${Math.min(((latest.coreStrength || 0) / 180) * 100, 100)}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chart-container" style="height: 350px; margin: 25px 0;">
                    <canvas id="performanceChart"></canvas>
                </div>
                
                <div style="margin-top: 25px;">
                    <h4 style="margin-bottom: 15px; color: #333;">📋 Historique des tests</h4>
                    <div style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                    <th style="padding: 12px; text-align: left;">Date</th>
                                    <th style="padding: 12px; text-align: center;">VMA (km/h)</th>
                                    <th style="padding: 12px; text-align: center;">Saut (cm)</th>
                                    <th style="padding: 12px; text-align: center;">Pompes (/min)</th>
                                    <th style="padding: 12px; text-align: center;">Gainage (sec)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.slice(-5).reverse().map(d => {
                                    const vE = evaluatePerformance('vma', d.vma, gender);
                                    const lE = evaluatePerformance('legStrength', d.legStrength, gender);
                                    const sE = evaluatePerformance('shoulderStrength', d.shoulderStrength, gender);
                                    const cE = evaluatePerformance('coreStrength', d.coreStrength, gender);
                                    return `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px; font-weight: 500;">${new Date(d.date).toLocaleDateString('fr-FR')}</td>
                                        <td style="padding: 12px; text-align: center; color: ${vE.color}; font-weight: 600;">${d.vma || '-'}</td>
                                        <td style="padding: 12px; text-align: center; color: ${lE.color}; font-weight: 600;">${d.legStrength || '-'}</td>
                                        <td style="padding: 12px; text-align: center; color: ${sE.color}; font-weight: 600;">${d.shoulderStrength || '-'}</td>
                                        <td style="padding: 12px; text-align: center; color: ${cE.color}; font-weight: 600;">${d.coreStrength || '-'}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
    }
    
    html += `
            </div>
        </div>
    </div>`;
    
    return html;
}

function generateMedicalSection(swimmer) {
    const data = swimmer.medicalData || [];
    
    let html = `
    <div class="analysis-section" style="margin-bottom: 30px;" id="medical-section">
        <div class="section-header" onclick="toggleSection('medical-section')" style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); padding: 16px 20px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(233,30,99,0.2);">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.4rem; letter-spacing: 0.3px;">Suivi Médical</span>
                <span style="font-size: 1.7rem; opacity: 0.9; transition: transform 0.3s ease;">🏥</span>
            </h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 0.9rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Suivi quotidien et hebdomadaire</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body">`;
    
    if (data.length === 0) {
        html += `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-heartbeat" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucune donnée de présence, disponibilité et médicale enregistrée</p>
                    <p style="font-size: 0.9rem;">Utilisez le bouton flottant pour commencer</p>
                </div>`;
    } else {
        // Séparer données quotidiennes et hebdomadaires
        const dailyData = data.filter(d => d.type === 'daily');
        const weeklyData = data.filter(d => d.type === 'weekly');
        
        // Statistiques quotidiennes (7 derniers jours)
        const recentDaily = dailyData.slice(-7);
        const presentCount = recentDaily.filter(d => d.availability === 'present').length;
        const absentCount = recentDaily.filter(d => d.availability === 'absent').length;
        const avgCondition = recentDaily.length > 0 
            ? (recentDaily.reduce((sum, d) => sum + (d.dailyCondition || 0), 0) / recentDaily.length).toFixed(1) 
            : 0;
        const painAlerts = recentDaily.filter(d => d.painIntensity > 5);
        
        // Données hebdomadaires (dernière semaine)
        const latestWeekly = weeklyData[weeklyData.length - 1];
        
        const conditionColor = avgCondition >= 4 ? '#4caf50' : avgCondition >= 3 ? '#8bc34a' : avgCondition >= 2 ? '#ff9800' : '#f44336';
        const attendanceRate = recentDaily.length > 0 ? ((presentCount / recentDaily.length) * 100).toFixed(0) : 0;
        const attendanceColor = attendanceRate >= 80 ? '#4caf50' : attendanceRate >= 60 ? '#ff9800' : '#f44336';
        
        html += `
                <!-- Statistiques Quotidiennes -->
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">📊</span>
                        <span>Suivi Quotidien - 7 derniers jours</span>
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                        <!-- Présence -->
                        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${attendanceColor};">
                            <div style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">📅 Taux de Présence</div>
                                        <div style="font-size: 2rem; font-weight: bold; color: #333;">${attendanceRate}%</div>
                                        <div style="font-size: 0.75rem; color: #999; margin-top: 3px;">${presentCount}/${recentDaily.length} présences</div>
                                    </div>
                                    <div style="background: ${attendanceColor}20; color: ${attendanceColor}; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                                        ${attendanceRate >= 80 ? 'Excellent' : attendanceRate >= 60 ? 'Correct' : 'Faible'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- État de forme moyen -->
                        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${conditionColor};">
                            <div style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">💪 État de Forme</div>
                                        <div style="font-size: 2rem; font-weight: bold; color: #333;">${avgCondition}<span style="font-size: 1rem; color: #999;">/5</span></div>
                                        <div style="font-size: 0.75rem; color: #999; margin-top: 3px;">Moyenne quotidienne</div>
                                    </div>
                                    <div style="background: ${conditionColor}20; color: ${conditionColor}; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                                        ${avgCondition >= 4 ? 'Excellent' : avgCondition >= 3 ? 'Bon' : avgCondition >= 2 ? 'Moyen' : 'Faible'}
                                    </div>
                                </div>
                                <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 15px;">
                                    <div style="height: 100%; background: linear-gradient(90deg, ${conditionColor}, ${conditionColor}cc); width: ${(avgCondition / 5) * 100}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Alertes douleurs -->
                        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${painAlerts.length > 0 ? '#f44336' : '#4caf50'};">
                            <div style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">🩹 Alertes Douleurs</div>
                                        <div style="font-size: 2rem; font-weight: bold; color: ${painAlerts.length > 0 ? '#f44336' : '#4caf50'};">${painAlerts.length}</div>
                                        <div style="font-size: 0.75rem; color: #999; margin-top: 3px;">${painAlerts.length > 0 ? 'Intensité > 5/10' : 'Aucune alerte'}</div>
                                    </div>
                                    <div style="font-size: 2rem;">${painAlerts.length > 0 ? '⚠️' : '✅'}</div>
                                </div>
                                ${painAlerts.length > 0 ? `
                                <div style="margin-top: 10px; padding: 8px; background: #fff3e0; border-radius: 6px; font-size: 0.8rem;">
                                    ${painAlerts.slice(-2).map(p => `<div style="margin: 3px 0;">📍 ${p.painZone} (${p.painIntensity}/10)</div>`).join('')}
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${weeklyData.length > 0 && latestWeekly ? `
                <!-- Bilan Hebdomadaire -->
                <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 12px;">
                    <h4 style="margin-bottom: 20px; color: #4a148c; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">📈</span>
                        <span>Bilan Hebdomadaire - ${new Date(latestWeekly.date).toLocaleDateString('fr-FR')}</span>
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">😴 Sommeil</div>
                            <div style="font-size: 1.6rem; font-weight: bold; color: #7b1fa2;">${latestWeekly.weeklySleep}/5</div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">😰 Stress</div>
                            <div style="font-size: 1.6rem; font-weight: bold; color: #e91e63;">${latestWeekly.weeklyStress}/5</div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">🎯 Motivation</div>
                            <div style="font-size: 1.6rem; font-weight: bold; color: #2196f3;">${latestWeekly.weeklyMotivation}/5</div>
                        </div>
                    </div>
                    
                    ${latestWeekly.weeklyComment ? `
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <div style="font-size: 0.85rem; font-weight: bold; color: #7b1fa2; margin-bottom: 8px;">💬 Commentaire :</div>
                        <div style="color: #555; font-size: 0.9rem; line-height: 1.5;">${latestWeekly.weeklyComment}</div>
                    </div>` : ''}
                </div>` : ''}
                
                <div class="chart-container" style="height: 350px; margin: 25px 0;">
                    <canvas id="medicalChart"></canvas>
                </div>
                
                <div style="margin-top: 25px;">
                    <h4 style="margin-bottom: 15px; color: #333;">📋 Historique des suivis</h4>
                    <div style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white;">
                                    <th style="padding: 12px; text-align: left;">Date</th>
                                    <th style="padding: 12px; text-align: center;">Type</th>
                                    <th style="padding: 12px; text-align: center;">Disponibilité</th>
                                    <th style="padding: 12px; text-align: center;">État/Info</th>
                                    <th style="padding: 12px; text-align: center;">Détails</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.slice(-10).reverse().map(d => {
                                    if (d.type === 'daily') {
                                        const status = d.availability === 'present' ? '✅ Présent' : '❌ Absent';
                                        const statusColor = d.availability === 'present' ? '#4caf50' : '#f44336';
                                        const conditionEmoji = ['😫', '😔', '😐', '🙂', '😄'][d.dailyCondition - 1] || '😐';
                                        return `
                                        <tr style="border-bottom: 1px solid #eee;">
                                            <td style="padding: 12px; font-weight: 500;">${new Date(d.date).toLocaleDateString('fr-FR')}</td>
                                            <td style="padding: 12px; text-align: center;"><span style="background: #e3f2fd; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">📅 Quotidien</span></td>
                                            <td style="padding: 12px; text-align: center; color: ${statusColor}; font-weight: 600;">${status}</td>
                                            <td style="padding: 12px; text-align: center;">${conditionEmoji} ${d.dailyCondition}/5</td>
                                            <td style="padding: 12px; text-align: center; font-size: 0.85rem;">
                                                ${d.availability === 'absent' ? `<span style="color: #f44336;">Motif: ${d.absenceReason}</span>` : 
                                                  d.painIntensity > 0 ? `<span style="color: #ff9800;">🩹 ${d.painZone} (${d.painIntensity}/10)</span>` : 
                                                  '<span style="color: #4caf50;">✓ OK</span>'}
                                            </td>
                                        </tr>`;
                                    } else {
                                        return `
                                        <tr style="border-bottom: 1px solid #eee; background: #f3e5f5;">
                                            <td style="padding: 12px; font-weight: 500;">${new Date(d.date).toLocaleDateString('fr-FR')}</td>
                                            <td style="padding: 12px; text-align: center;"><span style="background: #7b1fa2; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">📊 Hebdo</span></td>
                                            <td style="padding: 12px; text-align: center;" colspan="2">
                                                <span style="font-size: 0.85rem;">😴 ${d.weeklySleep} | 😰 ${d.weeklyStress} | 🎯 ${d.weeklyMotivation}</span>
                                            </td>
                                            <td style="padding: 12px; text-align: center; font-size: 0.85rem;">
                                                ${d.weeklyComment ? `<span style="color: #7b1fa2;">💬 Commentaire</span>` : '-'}
                                            </td>
                                        </tr>`;
                                    }
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
    }
    
    html += `
                </div>
            </div>
        </div>
    </div>`;
    
    return html;
}

function generateRaceSection(swimmer) {
    const data = swimmer.raceData || [];
    
    let html = `
    <div class="analysis-section" style="margin-bottom: 30px;" id="race-section">
        <div class="section-header" onclick="toggleSection('race-section')" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 16px 20px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(52,152,219,0.2);">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.4rem; letter-spacing: 0.3px;">Performances de Course</span>
                <span style="font-size: 1.7rem; opacity: 0.9; transition: transform 0.3s ease;">🏆</span>
            </h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 0.9rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Résultats de compétition</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body">`;
    
    if (data.length === 0) {
        html += `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-trophy" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucune performance de course enregistrée</p>
                    <p style="font-size: 0.9rem;">Cliquez sur "Saisie de Données" pour commencer</p>
                </div>`;
    } else {
        const totalEvents = data.length;
        const totalRaces = data.reduce((sum, event) => sum + event.races.length, 0);
        
        // Calculer les meilleurs temps par nage
        const bestTimes = calculateBestTimes(data);
        
        html += `
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #e3f2fd; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #2196f3;">${totalEvents}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">📅 Compétitions</div>
                    </div>
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #fff3e0; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #ff9800;">${totalRaces}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">🏊 Courses</div>
                    </div>
                </div>
                
                <!-- Meilleurs temps par nage -->
                <div style="margin-top: 30px; margin-bottom: 30px;">
                    <h4 style="margin-bottom: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">🏆</span>
                        <span>Meilleurs Temps Personnel</span>
                    </h4>
                    ${bestTimes.length > 0 ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                            ${bestTimes.map(bt => {
                                const styleColors = {
                                    'Crawl': '#2196f3',
                                    'Dos': '#9c27b0',
                                    'Brasse': '#4caf50',
                                    'Papillon': '#ff9800',
                                    '4 Nages': '#f44336'
                                };
                                const color = styleColors[bt.style] || '#607d8b';
                                const icon = bt.distance === '50m' ? '⚡' : bt.distance === '100m' ? '🎯' : 
                                           bt.distance === '200m' ? '💪' : bt.distance.includes('400') ? '🔥' : '🌟';
                                
                                return `
                                <div style="background: linear-gradient(135deg, ${color}15 0%, ${color}05 100%); 
                                            border: 2px solid ${color}; border-radius: 12px; padding: 15px; 
                                            position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;">
                                    <div style="position: absolute; top: -10px; right: -10px; font-size: 4rem; opacity: 0.1;">${icon}</div>
                                    <div style="position: relative; z-index: 1;">
                                        <div style="font-size: 0.9rem; font-weight: 600; color: ${color}; margin-bottom: 8px; text-transform: uppercase;">
                                            ${bt.style} ${bt.distance}
                                        </div>
                                        <div style="font-size: 2rem; font-weight: bold; color: ${color}; margin-bottom: 5px; font-family: 'Courier New', monospace;">
                                            ${bt.time}
                                        </div>
                                        <div style="font-size: 0.8rem; color: #666; margin-top: 8px;">
                                            📅 ${new Date(bt.date).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div style="font-size: 0.75rem; color: #999; margin-top: 3px;">
                                            📍 ${bt.event}
                                        </div>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : '<p style="color: #999; text-align: center; padding: 20px;">Continuez à nager pour établir vos records !</p>'}
                </div>
                
                <!-- Historique des compétitions avec pagination -->
                <div style="margin-top: 30px;" id="race-history-container">
                    <h4 style="margin-bottom: 15px; color: #333; display: flex; align-items: center; justify-content: space-between;">
                        <span>📋 Historique des compétitions</span>
                        <span style="font-size: 0.9rem; color: #666;">Total: ${totalEvents}</span>
                    </h4>
                    <div id="race-history-content"></div>
                    ${totalEvents > 3 ? `
                        <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <button onclick="changeRaceHistoryPage(-1)" id="race-prev-btn" 
                                    class="btn btn-outline" style="padding: 8px 20px; background: white; border: 1px solid #ddd;">
                                <i class="fas fa-chevron-left"></i> Précédent
                            </button>
                            <span id="race-page-info" style="font-weight: 500; color: #666;"></span>
                            <button onclick="changeRaceHistoryPage(1)" id="race-next-btn" 
                                    class="btn btn-outline" style="padding: 8px 20px; background: white; border: 1px solid #ddd;">
                                Suivant <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <script>
                    // Initialiser la pagination pour l'historique des courses
                    (function() {
                        const raceData = ${JSON.stringify(data)};
                        let currentPage = 0;
                        const itemsPerPage = 3;
                        const totalPages = Math.ceil(raceData.length / itemsPerPage);
                        
                        window.changeRaceHistoryPage = function(direction) {
                            currentPage = Math.max(0, Math.min(totalPages - 1, currentPage + direction));
                            displayRaceHistory();
                        };
                        
                        function displayRaceHistory() {
                            const start = currentPage * itemsPerPage;
                            const end = start + itemsPerPage;
                            const pageData = raceData.slice().reverse().slice(start, end);
                            
                            const content = document.getElementById('race-history-content');
                            if (!content) return;
                            
                            content.innerHTML = pageData.map(event => \`
                                <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: box-shadow 0.2s;">
                                    <div style="background: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                                        <h5 style="margin: 0; color: #2196f3;">📍 \${event.event}</h5>
                                        <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">\${new Date(event.date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div style="padding: 15px;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <thead>
                                                <tr style="border-bottom: 2px solid #e0e0e0;">
                                                    <th style="padding: 8px; text-align: left;">Nage</th>
                                                    <th style="padding: 8px; text-align: center;">Distance</th>
                                                    <th style="padding: 8px; text-align: center;">Temps</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                \${event.races.map(race => \\\`
                                                <tr style="border-bottom: 1px solid #f0f0f0;">
                                                    <td style="padding: 8px;">\\\${race.style}</td>
                                                    <td style="padding: 8px; text-align: center;">\\\${race.distance}</td>
                                                    <td style="padding: 8px; text-align: center; font-weight: 500; color: #2196f3;">\\\${race.time}</td>
                                                </tr>\\\`).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            \`).join('');
                            
                            // Mise à jour des contrôles de pagination
                            const prevBtn = document.getElementById('race-prev-btn');
                            const nextBtn = document.getElementById('race-next-btn');
                            const pageInfo = document.getElementById('race-page-info');
                            
                            if (prevBtn) prevBtn.disabled = currentPage === 0;
                            if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
                            if (pageInfo) pageInfo.textContent = \`Page \${currentPage + 1} / \${totalPages}\`;
                        }
                        
                        // Afficher la première page
                        displayRaceHistory();
                    })();
                </script>`;
    }
    
    html += `
                </div>
            </div>
        </div>
    </div>`;
    
    return html;
}

// Fonction utilitaire pour calculer les meilleurs temps
function calculateBestTimes(raceData) {
    const bestTimesMap = new Map();
    
    raceData.forEach(event => {
        event.races.forEach(race => {
            const key = `${race.style}|${race.distance}`;
            const timeInSeconds = parseTimeToSeconds(race.time);
            
            if (!bestTimesMap.has(key) || timeInSeconds < bestTimesMap.get(key).timeInSeconds) {
                bestTimesMap.set(key, {
                    style: race.style,
                    distance: race.distance,
                    time: race.time,
                    timeInSeconds: timeInSeconds,
                    date: event.date,
                    event: event.event
                });
            }
        });
    });
    
    // Convertir en tableau et trier par distance puis par style
    const distanceOrder = { '50m': 1, '100m': 2, '200m': 3, '400m': 4, '800m': 5, '1500m': 6 };
    return Array.from(bestTimesMap.values()).sort((a, b) => {
        const distA = distanceOrder[a.distance] || 999;
        const distB = distanceOrder[b.distance] || 999;
        if (distA !== distB) return distA - distB;
        return a.style.localeCompare(b.style);
    });
}

// Fonction utilitaire pour convertir un temps en secondes (format SS:MS ou MM:SS:MS)
function parseTimeToSeconds(timeStr) {
    if (!timeStr) return Infinity;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
        // Format SS:MS
        return parts[0] + parts[1] / 100;
    } else if (parts.length === 3) {
        // Format MM:SS:MS
        return parts[0] * 60 + parts[1] + parts[2] / 100;
    }
    return Infinity;
}

function generateTechnicalSection(swimmer) {
    const data = swimmer.technicalData || [];
    
    let html = `
    <div class="analysis-section" style="margin-bottom: 30px;" id="technical-section">
        <div class="section-header" onclick="toggleSection('technical-section')" style="background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); padding: 16px 20px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(26,188,156,0.2);">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.4rem; letter-spacing: 0.3px;">Suivi Technique</span>
                <span style="font-size: 1.7rem; opacity: 0.9; transition: transform 0.3s ease;">🎯</span>
            </h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 0.9rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Évaluation technique détaillée par nage</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body">`;
    
    if (data.length === 0) {
        html += `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-swimming-pool" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucune évaluation technique enregistrée</p>
                    <p style="font-size: 0.9rem;">Cliquez sur "Saisie de Données" pour commencer</p>
                    <button onclick="addTestTechnicalData()" style="margin-top: 15px; padding: 10px 20px; background: #00bcd4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                        🧪 Ajouter des données de test
                    </button>
                </div>`;
    } else {
        const latest = data[data.length - 1];
        const categories = ['crawl', 'dos', 'brasse', 'papillon'];
        const nageColors = {
            'crawl': { bg: '#2196f315', border: '#2196f3', text: '#2196f3' },
            'dos': { bg: '#9c27b015', border: '#9c27b0', text: '#9c27b0' },
            'brasse': { bg: '#4caf5015', border: '#4caf50', text: '#4caf50' },
            'papillon': { bg: '#ff980015', border: '#ff9800', text: '#ff9800' }
        };
        
        // Calculer les moyennes globales
        const swimStats = [];
        categories.forEach(cat => {
            const catData = latest[cat];
            if (catData) {
                const fields = ['position', 'respiration', 'battements', 'bras', 'virage'];
                const avg = fields.reduce((sum, f) => sum + (catData[f] || 0), 0) / fields.length;
                swimStats.push({ name: cat, avg: avg.toFixed(1), data: catData });
            }
        });
        
        // Statistiques globales en cartes
        html += `
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">📊</span>
                        <span>Vue d'Ensemble Technique</span>
                        <span style="font-size: 0.9rem; color: #666; font-weight: normal;">(${new Date(latest.date).toLocaleDateString('fr-FR')})</span>
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                        ${swimStats.map(stat => {
                            const colors = nageColors[stat.name];
                            const avgColor = stat.avg >= 8 ? '#4caf50' : stat.avg >= 6 ? '#ff9800' : stat.avg >= 4 ? '#ffc107' : '#f44336';
                            const nageName = stat.name.charAt(0).toUpperCase() + stat.name.slice(1);
                            const icon = stat.name === 'crawl' ? '🏊' : stat.name === 'dos' ? '🔙' : stat.name === 'brasse' ? '💪' : '🦋';
                            
                            return `
                            <div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 12px; padding: 20px; position: relative; overflow: hidden;">
                                <div style="position: absolute; top: -10px; right: -10px; font-size: 4rem; opacity: 0.1;">${icon}</div>
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 0.9rem; font-weight: 600; color: ${colors.text}; margin-bottom: 10px; text-transform: uppercase;">
                                        ${icon} ${nageName}
                                    </div>
                                    <div style="font-size: 2.8rem; font-weight: bold; color: ${avgColor}; margin-bottom: 5px;">
                                        ${stat.avg}/10
                                    </div>
                                    <div style="font-size: 0.8rem; color: #666;">Note Moyenne</div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Graphique Radar -->
                <div style="margin: 30px 0;">
                    <h4 style="margin-bottom: 15px; color: #333;">📈 Comparaison des Nages (Radar)</h4>
                    <div class="chart-container" style="height: 400px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <canvas id="technicalChart"></canvas>
                    </div>
                </div>
                
                <!-- Détail par nage avec barres de progression - Pagination -->
                <div style="margin-top: 30px;" id="detailed-analysis-container">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h4 style="margin: 0; color: #333;">🔍 Analyse Détaillée par Nage</h4>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <button onclick="changeDetailedNage(-1)" id="prev-nage-btn" style="padding: 8px 12px; border: 2px solid #00bcd4; background: white; color: #00bcd4; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s;">
                                ← Précédent
                            </button>
                            <span id="nage-indicator" style="font-size: 0.9rem; color: #666; min-width: 80px; text-align: center;"></span>
                            <button onclick="changeDetailedNage(1)" id="next-nage-btn" style="padding: 8px 12px; border: 2px solid #00bcd4; background: white; color: #00bcd4; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s;">
                                Suivant →
                            </button>
                        </div>
                    </div>
                    <div id="detailed-nage-content" style="min-height: 300px;">
                        <!-- Le contenu sera injecté par JavaScript -->
                    </div>
                </div>
                
                <!-- Tableau récapitulatif -->
                <div style="margin-top: 30px;">
                    <h4 style="margin-bottom: 15px; color: #333;">📋 Tableau Récapitulatif</h4>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%); color: white;">
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Nage</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 600;">Position</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 600;">Respiration</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 600;">Battements</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 600;">Bras</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 600;">Virage</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 600;">Moyenne</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${categories.map((cat, idx) => {
                                    const catData = latest[cat];
                                    if (!catData) return '';
                                    const colors = nageColors[cat];
                                    const fields = ['position', 'respiration', 'battements', 'bras', 'virage'];
                                    const avg = fields.reduce((sum, f) => sum + (catData[f] || 0), 0) / fields.length;
                                    const avgColor = avg >= 8 ? '#4caf50' : avg >= 6 ? '#ff9800' : '#f44336';
                                    const nageName = cat.charAt(0).toUpperCase() + cat.slice(1);
                                    const icon = cat === 'crawl' ? '🏊' : cat === 'dos' ? '🔙' : cat === 'brasse' ? '💪' : '🦋';
                                    
                                    return `
                                    <tr style="border-bottom: 1px solid #eee; background: ${idx % 2 === 0 ? 'white' : '#f8f9fa'};">
                                        <td style="padding: 12px; font-weight: 600; color: ${colors.text};">${icon} ${nageName}</td>
                                        ${fields.map(f => {
                                            const score = catData[f] || 0;
                                            const scoreColor = score >= 8 ? '#4caf50' : score >= 6 ? '#ff9800' : score >= 4 ? '#ffc107' : '#f44336';
                                            return `<td style="padding: 12px; text-align: center; font-weight: 500; color: ${scoreColor};">${score}</td>`;
                                        }).join('')}
                                        <td style="padding: 12px; text-align: center; font-weight: bold; font-size: 1.1rem; color: ${avgColor};">${avg.toFixed(1)}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Historique des évaluations (si plusieurs) -->
                ${data.length > 1 ? `
                <div style="margin-top: 30px;">
                    <h4 style="margin-bottom: 15px; color: #333;">📅 Historique des Évaluations</h4>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 12px; text-align: left;">Date</th>
                                    <th style="padding: 12px; text-align: center;">Crawl</th>
                                    <th style="padding: 12px; text-align: center;">Dos</th>
                                    <th style="padding: 12px; text-align: center;">Brasse</th>
                                    <th style="padding: 12px; text-align: center;">Papillon</th>
                                    <th style="padding: 12px; text-align: center;">Moyenne</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.slice(-5).reverse().map((entry, idx) => {
                                    const allAvgs = [];
                                    categories.forEach(cat => {
                                        const catData = entry[cat];
                                        if (catData) {
                                            const fields = ['position', 'respiration', 'battements', 'bras', 'virage'];
                                            const avg = fields.reduce((sum, f) => sum + (catData[f] || 0), 0) / fields.length;
                                            allAvgs.push(avg);
                                        }
                                    });
                                    const globalAvg = allAvgs.length > 0 ? (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(1) : '-';
                                    const globalColor = globalAvg >= 8 ? '#4caf50' : globalAvg >= 6 ? '#ff9800' : '#f44336';
                                    
                                    return `
                                    <tr style="border-bottom: 1px solid #eee; background: ${idx % 2 === 0 ? 'white' : '#f8f9fa'};">
                                        <td style="padding: 12px;">${new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                                        ${categories.map(cat => {
                                            const catData = entry[cat];
                                            if (!catData) return '<td style="padding: 12px; text-align: center; color: #ccc;">-</td>';
                                            const fields = ['position', 'respiration', 'battements', 'bras', 'virage'];
                                            const avg = fields.reduce((sum, f) => sum + (catData[f] || 0), 0) / fields.length;
                                            const color = avg >= 8 ? '#4caf50' : avg >= 6 ? '#ff9800' : '#f44336';
                                            return `<td style="padding: 12px; text-align: center; font-weight: 500; color: ${color};">${avg.toFixed(1)}</td>`;
                                        }).join('')}
                                        <td style="padding: 12px; text-align: center; font-weight: bold; color: ${globalColor};">${globalAvg}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}`;
    }
    
    html += `
                </div>
            </div>
        </div>
    </div>`;
    
    return html;
}

function generateAttendanceSection(swimmer) {
    const attendance = swimmer.attendance || { records: [] };
    const records = attendance.records || [];
    
    let html = `
    <div class="analysis-section" style="margin-bottom: 30px;" id="attendance-section">
        <div class="section-header" onclick="toggleSection('attendance-section')" style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 16px 20px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(39,174,96,0.2);">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.4rem; letter-spacing: 0.3px;">Suivi de Présence</span>
                <span style="font-size: 1.7rem; opacity: 0.9; transition: transform 0.3s ease;">✅</span>
            </h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 0.9rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Assiduité et ponctualité</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body">`;
    
    if (records.length === 0) {
        html += `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-calendar-check" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucune donnée de présence enregistrée</p>
                    <p style="font-size: 0.9rem;">Cliquez sur "Saisie de Données" pour commencer</p>
                </div>`;
    } else {
        const present = records.filter(r => r.status === 'present').length;
        const late = records.filter(r => r.status === 'late').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const total = records.length;
        
        const presentPercent = ((present / total) * 100).toFixed(0);
        const latePercent = ((late / total) * 100).toFixed(0);
        const absentPercent = ((absent / total) * 100).toFixed(0);
        
        html += `
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #e8f5e9; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #4caf50;">${present}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">✅ Présent</div>
                        <div style="font-size: 0.8rem; color: #999; margin-top: 3px;">${presentPercent}%</div>
                    </div>
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #fff3e0; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #ff9800;">${late}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">⏰ Retard</div>
                        <div style="font-size: 0.8rem; color: #999; margin-top: 3px;">${latePercent}%</div>
                    </div>
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #ffebee; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #f44336;">${absent}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">❌ Absent</div>
                        <div style="font-size: 0.8rem; color: #999; margin-top: 3px;">${absentPercent}%</div>
                    </div>
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #e3f2fd; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #2196f3;">${total}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">📊 Total</div>
                        <div style="font-size: 0.8rem; color: #999; margin-top: 3px;">séances</div>
                    </div>
                </div>
                
                <div class="chart-container" style="height: 350px; margin-top: 20px;">
                    <canvas id="attendanceChart"></canvas>
                </div>
                
                <div style="margin-top: 25px;">
                    <h4 style="margin-bottom: 15px; color: #333;">📋 Dernières présences</h4>
                    <div style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 12px; text-align: left;">Date</th>
                                    <th style="padding: 12px; text-align: center;">Statut</th>
                                    <th style="padding: 12px; text-align: left;">Remarque</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${records.slice(-10).reverse().map(r => {
                                    const statusIcon = r.status === 'present' ? '✅' : r.status === 'late' ? '⏰' : '❌';
                                    const statusText = r.status === 'present' ? 'Présent' : r.status === 'late' ? 'Retard' : 'Absent';
                                    const statusColor = r.status === 'present' ? '#4caf50' : r.status === 'late' ? '#ff9800' : '#f44336';
                                    return `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px;">${new Date(r.date).toLocaleDateString('fr-FR')}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <span style="color: ${statusColor}; font-weight: 500;">${statusIcon} ${statusText}</span>
                                        </td>
                                        <td style="padding: 12px; color: #666;">${r.remark || '-'}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
    }
    
    html += `
                </div>
            </div>
        </div>
    </div>`;
    
    return html;
}

function generateSessionsSection(swimmer) {
    const data = swimmer.sessionData || [];
    
    let html = `
    <div class="analysis-section" style="margin-bottom: 30px;" id="sessions-section">
        <div class="section-header" onclick="toggleSection('sessions-section')" style="background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); padding: 16px 20px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(108,92,231,0.2);">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.4rem; letter-spacing: 0.3px;">Sessions d'Entraînement</span>
                <span style="font-size: 1.7rem; opacity: 0.9; transition: transform 0.3s ease;">📋</span>
            </h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 0.9rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Structure détaillée avec volume et RPE</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body">`;
    
    if (data.length === 0) {
        html += `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-swimming-pool" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucune session d'entraînement enregistrée</p>
                    <p style="font-size: 0.9rem;">Cliquez sur "Saisie de Données" pour commencer</p>
                </div>`;
    } else {
        const totalVolume = data.reduce((sum, s) => {
            // Utiliser indicators.totalVolume si disponible, sinon calculer
            return sum + (s.indicators ? s.indicators.totalVolume : (s.warmUp.volumeMeters + s.mainSet.volumeMeters + s.coolDown.volumeMeters));
        }, 0);
        const avgVolume = (totalVolume / data.length).toFixed(0);
        const totalDuration = data.reduce((sum, s) => {
            // Utiliser indicators.totalDuration si disponible, sinon calculer
            return sum + (s.indicators ? s.indicators.totalDuration : (s.warmUp.duration + s.mainSet.duration + s.coolDown.duration));
        }, 0);
        const avgDuration = (totalDuration / data.length).toFixed(0);
        
        html += `
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #e8eaf6; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #673ab7;">${data.length}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">📋 Sessions</div>
                    </div>
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #e3f2fd; border-radius: 8px;">
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2196f3;">${(totalVolume / 1000).toFixed(1)} km</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">🏊 Volume Total</div>
                    </div>
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #f3e5f5; border-radius: 8px;">
                        <div style="font-size: 1.8rem; font-weight: bold; color: #9c27b0;">${avgVolume} m</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">📊 Moy/Session</div>
                    </div>
                    <div class="stat-card" style="text-align: center; padding: 20px; background: #fff3e0; border-radius: 8px;">
                        <div style="font-size: 1.8rem; font-weight: bold; color: #ff9800;">${avgDuration} min</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">⏱️ Durée Moy</div>
                    </div>
                </div>
                
                <div class="chart-container" style="height: 350px; margin-top: 20px;">
                    <canvas id="sessionsChart"></canvas>
                </div>
                
                <div style="margin-top: 25px;">
                    <h4 style="margin-bottom: 15px; color: #333;">📋 Dernières sessions</h4>
                    ${data.slice(-3).reverse().map(session => {
                        // Utiliser indicators si disponibles
                        const totalVol = session.indicators ? session.indicators.totalVolume : 
                            (session.warmUp.volumeMeters + session.mainSet.volumeMeters + session.coolDown.volumeMeters);
                        const totalDur = session.indicators ? session.indicators.totalDuration : 
                            (session.warmUp.duration + session.mainSet.duration + session.coolDown.duration);
                        const avgRPE = session.indicators ? session.indicators.avgRPE : null;
                        const trainingLoad = session.indicators ? session.indicators.trainingLoad : null;
                        return `
                        <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                            <div style="background: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h5 style="margin: 0; color: #673ab7;">📅 ${new Date(session.date).toLocaleDateString('fr-FR')}</h5>
                                    <div style="display: flex; gap: 15px; font-size: 0.9rem;">
                                        <span style="color: #2196f3; font-weight: 500;">🏊 ${totalVol}m</span>
                                        <span style="color: #ff9800; font-weight: 500;">⏱️ ${totalDur}min</span>
                                        ${avgRPE ? `<span style="color: #9c27b0; font-weight: 500;">💯 RPE ${avgRPE}</span>` : ''}
                                        ${trainingLoad ? `<span style="color: #4caf50; font-weight: 500;">⚡ ${trainingLoad}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style="padding: 15px;">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                                    <div style="padding: 12px; background: #e8f5e9; border-radius: 6px;">
                                        <h6 style="margin: 0 0 8px 0; color: #4caf50;">🔥 Échauffement</h6>
                                        <p style="margin: 5px 0; font-size: 0.9rem;">${session.warmUp.content}</p>
                                        <div style="margin-top: 8px; display: flex; gap: 15px; font-size: 0.85rem; color: #666;">
                                            <span>${session.warmUp.volumeMeters}m</span>
                                            <span>${session.warmUp.duration}min</span>
                                            ${session.warmUp.rpe ? `<span>RPE ${session.warmUp.rpe}</span>` : ''}
                                        </div>
                                    </div>
                                    <div style="padding: 12px; background: #e3f2fd; border-radius: 6px;">
                                        <h6 style="margin: 0 0 8px 0; color: #2196f3;">💪 Corps de Séance</h6>
                                        ${session.mainSet.parts ? 
                                            session.mainSet.parts.map((part, idx) => `
                                                <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px;">
                                                    <div style="font-weight: 500; margin-bottom: 4px;">Partie ${idx + 1}</div>
                                                    <p style="margin: 0; font-size: 0.85rem; color: #555;">${part.content}</p>
                                                    <div style="margin-top: 4px; display: flex; gap: 10px; font-size: 0.8rem; color: #666;">
                                                        <span>${part.volumeMeters}m</span>
                                                        <span>${part.duration}min</span>
                                                        <span>RPE ${part.rpe}</span>
                                                    </div>
                                                </div>
                                            `).join('') :
                                            `<p style="margin: 5px 0; font-size: 0.9rem;">${session.mainSet.content}</p>`
                                        }
                                        <div style="margin-top: 8px; display: flex; gap: 15px; font-size: 0.85rem; color: #666;">
                                            <span>${session.mainSet.parts ? 
                                                session.mainSet.parts.reduce((sum, p) => sum + p.volumeMeters, 0) : 
                                                session.mainSet.volumeMeters}m</span>
                                            <span>${session.mainSet.parts ? 
                                                session.mainSet.parts.reduce((sum, p) => sum + p.duration, 0) : 
                                                session.mainSet.duration}min</span>
                                        </div>
                                    </div>
                                    <div style="padding: 12px; background: #fff3e0; border-radius: 6px;">
                                        <h6 style="margin: 0 0 8px 0; color: #ff9800;">🧘 Retour au Calme</h6>
                                        <p style="margin: 5px 0; font-size: 0.9rem;">${session.coolDown.content}</p>
                                        <div style="margin-top: 8px; display: flex; gap: 15px; font-size: 0.85rem; color: #666;">
                                            <span>${session.coolDown.volumeMeters}m</span>
                                            <span>${session.coolDown.duration}min</span>
                                            ${session.coolDown.rpe ? `<span>RPE ${session.coolDown.rpe}</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>`;
    }
    
    html += `
                </div>
            </div>
        </div>
    </div>`;
    
    return html;
}

function generateGlobalSummaryChart(swimmer) {
    let html = `
    <div class="analysis-section" style="margin-bottom: 35px;" id="global-summary-section">
        <div class="section-header" onclick="toggleSection('global-summary-section')" style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 18px 22px; border-radius: 10px; color: white; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(253,121,168,0.2);">
            <h2 style="margin: 0; display: flex; align-items: center; justify-content: space-between; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                <span style="font-size: 1.5rem; letter-spacing: 0.3px;">Vue d'Ensemble Globale</span>
                <span style="font-size: 1.8rem; opacity: 0.9; transition: transform 0.3s ease;">📊</span>
            </h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 0.95rem; font-weight: 300; text-shadow: 0 1px 1px rgba(0,0,0,0.2);">Synthèse complète de toutes les données du nageur</p>
        </div>
        <div class="section-content">
            <div class="card" style="border-radius: 0 0 12px 12px; margin-top: 0; border-top: none;">
                <div class="card-body" style="padding: 30px;">
                    
                    <!-- KPIs Principaux -->
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">`;
    
    // Calcul des KPIs
    const wellbeingData = swimmer.wellbeingData || [];
    const performanceData = swimmer.performanceData || [];
    const medicalData = swimmer.medicalData || [];
    const raceData = swimmer.raceData || [];
    const technicalData = swimmer.technicalData || [];
    const attendanceRecords = (swimmer.attendance || {}).records || [];
    const sessionData = swimmer.sessionData || [];
    
    // Bien-être moyen
    let wellbeingScore = 0;
    if (wellbeingData.length > 0) {
        const recent = wellbeingData.slice(-7);
        wellbeingScore = (recent.reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / recent.length).toFixed(1);
    }
    
    // Disponibilité
    let availability = 0;
    if (medicalData.length > 0) {
        const recent = medicalData.slice(-7);
        const avg = recent.reduce((sum, d) => sum + d.availability, 0) / recent.length;
        availability = ((avg / 3) * 100).toFixed(0);
    }
    
    // Assiduité
    let assiduityRate = 0;
    if (attendanceRecords.length > 0) {
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        assiduityRate = ((present / attendanceRecords.length) * 100).toFixed(0);
    }
    
    // Volume total sessions
    let totalVolume = 0;
    if (sessionData.length > 0) {
        totalVolume = sessionData.reduce((sum, s) => 
            sum + s.warmUp.volumeMeters + s.mainSet.volumeMeters + s.coolDown.volumeMeters, 0
        );
    }
    
    // Nombre de compétitions
    const totalRaces = raceData.reduce((sum, event) => sum + event.races.length, 0);
    
    html += `
                        <div class="stat-card" style="text-align: center; padding: 25px; background: linear-gradient(135deg, #f39c12, #e67e22); border-radius: 12px; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${wellbeingScore}/10</div>
                            <div style="font-size: 1rem; opacity: 0.95;">😊 Bien-être</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 25px; background: linear-gradient(135deg, #4caf50, #388e3c); border-radius: 12px; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${availability}%</div>
                            <div style="font-size: 1rem; opacity: 0.95;">🏥 Disponibilité</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 25px; background: linear-gradient(135deg, #2196f3, #1976d2); border-radius: 12px; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${assiduityRate}%</div>
                            <div style="font-size: 1rem; opacity: 0.95;">✅ Assiduité</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 25px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); border-radius: 12px; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="font-size: 2.2rem; font-weight: bold; margin-bottom: 8px;">${(totalVolume / 1000).toFixed(1)} km</div>
                            <div style="font-size: 1rem; opacity: 0.95;">🏊 Volume Total</div>
                        </div>
                        <div class="stat-card" style="text-align: center; padding: 25px; background: linear-gradient(135deg, #ff5722, #e64a19); border-radius: 12px; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${totalRaces}</div>
                            <div style="font-size: 1rem; opacity: 0.95;">🏆 Courses</div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>`;
    
    return html;
}

function showCompleteDashboard() {
    const container = document.getElementById('dashboardContent');
    if (!container) {
        console.error('❌ Container dashboardContent introuvable !');
        return;
    }
    
    console.log('✅ showCompleteDashboard appelé');
    console.log('📊 currentSwimmerId:', currentSwimmerId);
    console.log('👥 Nombre de nageurs:', swimmers.length);
    console.log('👥 Nageurs:', swimmers);
    
    if (swimmers.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
                <i class="fas fa-swimmer" style="font-size: 4rem; color: #1a73e8; margin-bottom: 20px;"></i>
                <h3 style="color: #333; margin-bottom: 10px;">Aucun nageur enregistré</h3>
                <p style="color: #666; font-size: 1.1rem;">Commencez par ajouter votre premier nageur</p>
                <button class="btn btn-primary" onclick="document.getElementById('addSwimmerBtn').click()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Ajouter un Nageur
                </button>
            </div>`;
        return;
    }

    let content = '';
    
    if (!currentSwimmerId || currentSwimmerId === 'all') {
        content = `
            <div class="card" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
                <i class="fas fa-swimmer" style="font-size: 4rem; color: #1a73e8; margin-bottom: 20px;"></i>
                <h3 style="color: #333; margin-bottom: 10px;">Sélectionnez un nageur pour commencer</h3>
                <p style="color: #666; font-size: 1.1rem;">Utilisez le sélecteur ci-dessus ou créez un nouveau nageur</p>
            </div>`;
        container.innerHTML = content;
        return;
    }
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) {
        content = `
            <div class="card" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
                <i class="fas fa-swimmer" style="font-size: 4rem; color: #1a73e8; margin-bottom: 20px;"></i>
                <h3 style="color: #333; margin-bottom: 10px;">Nageur non trouvé</h3>
                <p style="color: #666; font-size: 1.1rem;">Veuillez sélectionner un autre nageur</p>
            </div>`;
        container.innerHTML = content;
        return;
    }
    
    console.log('Swimmer found:', swimmer.name);
    
    // 📊 NOUVELLE STRUCTURE: Une section d'analyse pour chaque formulaire de saisie
    
    // ========================================
    // 0. VUE D'ENSEMBLE GLOBALE 📊 (EN PREMIER)
    // ========================================
    content += generateGlobalSummaryChart(swimmer);
    
    // ========================================
    // 1. BIEN-ÊTRE 😊
    // ========================================
    content += generateWellbeingSection(swimmer);
    
    // ========================================
    // 2. PERFORMANCE 💪
    // ========================================
    content += generatePerformanceSection(swimmer);
    
    // Espace de séparation entre Performance et Médical
    content += '<div style="height: 15px; margin: 10px 0;"></div>';
    
    // ========================================
    // 3. SUIVI DE PRÉSENCE, DISPONIBILITÉ ET MÉDICAL 🏥
    // ========================================
    content += generateMedicalSection(swimmer);
    
    // ========================================
    // 4. PERFORMANCES DE COURSE 🏊‍♂️
    // ========================================
    content += generateRaceSection(swimmer);
    
    // ========================================
    // 5. SUIVI TECHNIQUE 🎯
    // ========================================
    content += generateTechnicalSection(swimmer);
    
    // ========================================
    // 6. SESSIONS D'ENTRAÎNEMENT 📋
    // ========================================
    content += generateSessionsSection(swimmer);
    
    console.log('✅ Total content length:', content.length);
    console.log('✅ Setting innerHTML...');
    container.innerHTML = content;
    console.log('✅ innerHTML set successfully');
    
    initializeCharts();
    console.log('✅ Charts initialized');
}

function showDataEntry() {
    const container = document.getElementById('dataEntryContent');
    if (!container) return;
    
    let content = '';
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        content = `
            <div class="data-entry-section">
                <div style="text-align: center; margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px;">
                    <h3 style="margin: 0 0 10px 0; color: #1a73e8; font-size: 1.4rem;">
                        <i class="fas fa-swimmer"></i> ${swimmer.name}
                    </h3>
                    <p style="margin: 0; color: #666; font-size: 0.95rem;">
                        Sélectionnez un formulaire pour enregistrer vos données
                    </p>
                </div>
                
                <div class="data-entry-list">
                    <div class="data-entry-list-item" onclick="openDataEntryModal('wellbeing')">
                        <div class="data-entry-list-item-content">
                            <div class="data-entry-list-item-icon icon-wellbeing">
                                <i class="fas fa-smile"></i>
                            </div>
                            <div class="data-entry-list-item-text">
                                <h4>Bien-être</h4>
                                <p>Sommeil, fatigue, douleur et stress</p>
                            </div>
                        </div>
                        <div class="data-entry-list-item-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="data-entry-list-item" onclick="openDataEntryModal('performance')">
                        <div class="data-entry-list-item-content">
                            <div class="data-entry-list-item-icon icon-performance">
                                <i class="fas fa-dumbbell"></i>
                            </div>
                            <div class="data-entry-list-item-text">
                                <h4>Performance</h4>
                                <p>Tests de VMA, force et puissance</p>
                            </div>
                        </div>
                        <div class="data-entry-list-item-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="data-entry-list-item" onclick="openDataEntryModal('medical')">
                        <div class="data-entry-list-item-content">
                            <div class="data-entry-list-item-icon icon-medical">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <div class="data-entry-list-item-text">
                                <h4>Suivi de Présence, Disponibilité et Médical</h4>
                                <p>Disponibilité et problèmes de santé</p>
                            </div>
                        </div>
                        <div class="data-entry-list-item-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="data-entry-list-item" onclick="openDataEntryModal('race')">
                        <div class="data-entry-list-item-content">
                            <div class="data-entry-list-item-icon icon-race">
                                <i class="fas fa-swimming-pool"></i>
                            </div>
                            <div class="data-entry-list-item-text">
                                <h4>Performances de Course</h4>
                                <p>Temps de course par distance</p>
                            </div>
                        </div>
                        <div class="data-entry-list-item-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="data-entry-list-item" onclick="openDataEntryModal('technical')">
                        <div class="data-entry-list-item-content">
                            <div class="data-entry-list-item-icon icon-technical">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="data-entry-list-item-text">
                                <h4>Suivi Technique</h4>
                                <p>Évaluation technique par nage</p>
                            </div>
                        </div>
                        <div class="data-entry-list-item-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="data-entry-list-item" onclick="openDataEntryModal('session')">
                        <div class="data-entry-list-item-content">
                            <div class="data-entry-list-item-icon icon-session">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <div class="data-entry-list-item-text">
                                <h4>Sessions d'Entraînement</h4>
                                <p>Structure détaillée avec volume et RPE</p>
                            </div>
                        </div>
                        <div class="data-entry-list-item-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </div>`;
    } else {
        content = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <i class="fas fa-user-slash" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 10px;">Aucun nageur sélectionné</h3>
                <p style="font-size: 1rem;">Sélectionnez un nageur dans le menu ci-dessus pour commencer</p>
            </div>`;
    }
    
    container.innerHTML = content;
}

function showSessions() {
    const container = document.getElementById('sessionsContent');
    const addBtn = document.getElementById('addSessionBtn');
    if (!container) return;
    
    let content = '';
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        addBtn.style.display = 'inline-block';
        
        // Initialize sessionData if not exists
        if (!swimmer.sessionData) {
            swimmer.sessionData = [];
        }
        
        if (swimmer.sessionData.length === 0) {
            content = `
                <div class="card" style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);">
                    <i class="fas fa-swimming-pool" style="font-size: 4rem; color: #2196f3; margin-bottom: 20px;"></i>
                    <h3 style="color: #333; margin-bottom: 10px;">Aucune session enregistrée</h3>
                    <p style="color: #666; font-size: 1.1rem; margin-bottom: 20px;">Commencez à enregistrer vos séances d'entraînement détaillées</p>
                    <button class="btn btn-primary" onclick="openSessionEntry()">
                        <i class="fas fa-plus"></i> Créer votre première session
                    </button>
                </div>
            `;
        } else {
            // Sort sessions by date (newest first)
            const sortedSessions = [...swimmer.sessionData].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            content = `
                <div class="sessions-list">
                    <div class="sessions-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                        <div>
                            <h3 style="margin: 0; color: #333;">📊 ${swimmer.sessionData.length} Session${swimmer.sessionData.length > 1 ? 's' : ''} Enregistrée${swimmer.sessionData.length > 1 ? 's' : ''}</h3>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">Volume total: ${swimmer.sessionData.reduce((sum, s) => {
                                // Utiliser indicators.totalVolume si disponible, sinon calculer
                                return sum + (s.indicators ? s.indicators.totalVolume : (s.warmUp.volumeMeters + s.mainSet.volumeMeters + s.coolDown.volumeMeters));
                            }, 0).toLocaleString()} m</p>
                        </div>
                    </div>
                    
                    <div class="sessions-grid" style="display: grid; gap: 20px;">
                        ${sortedSessions.map((session, index) => {
                            // Utiliser indicators si disponibles, sinon calculer manuellement
                            const totalVolume = session.indicators ? session.indicators.totalVolume : 
                                (session.warmUp.volumeMeters + session.mainSet.volumeMeters + session.coolDown.volumeMeters);
                            const totalDuration = session.indicators ? session.indicators.totalDuration : 
                                (session.warmUp.duration + session.mainSet.duration + session.coolDown.duration);
                            const avgIntensity = session.indicators ? session.indicators.avgIntensity : 
                                (totalDuration > 0 ? (totalVolume / totalDuration).toFixed(1) : 0);
                            const avgRPE = session.indicators ? session.indicators.avgRPE : null;
                            const dateObj = new Date(session.date);
                            const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                            
                            return `
                                <div class="card session-card" style="border-left: 4px solid #2196f3;">
                                    <div class="card-header" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 15px; border-radius: 8px 8px 0 0;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <h4 style="margin: 0; font-size: 1.2rem;">📅 ${formattedDate}</h4>
                                                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Séance #${swimmer.sessionData.length - index}</p>
                                            </div>
                                            <button class="btn btn-danger" onclick="deleteSession('${session.date}')" style="padding: 8px 12px;">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="card-body" style="padding: 20px;">
                                        <!-- Totaux en haut -->
                                        <div style="display: grid; grid-template-columns: repeat(${avgRPE ? '4' : '3'}, 1fr); gap: 15px; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                                            <div style="text-align: center;">
                                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Volume Total</div>
                                                <div style="font-size: 1.5rem; font-weight: bold; color: #2196f3;">${totalVolume} m</div>
                                            </div>
                                            <div style="text-align: center;">
                                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Durée Totale</div>
                                                <div style="font-size: 1.5rem; font-weight: bold; color: #4caf50;">${totalDuration} min</div>
                                            </div>
                                            <div style="text-align: center;">
                                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Intensité Moy.</div>
                                                <div style="font-size: 1.5rem; font-weight: bold; color: #ff9800;">${avgIntensity} m/min</div>
                                            </div>
                                            ${avgRPE ? `
                                            <div style="text-align: center;">
                                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">RPE Moyen</div>
                                                <div style="font-size: 1.5rem; font-weight: bold; color: #9c27b0;">${avgRPE}/10</div>
                                            </div>
                                            ` : ''}
                                        </div>
                                        
                                        <!-- Détails des 3 parties -->
                                        <div style="display: grid; gap: 15px;">
                                            <!-- Échauffement -->
                                            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
                                                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                                                    <h5 style="margin: 0; color: #2e7d32; display: flex; align-items: center; gap: 8px;">
                                                        <i class="fas fa-fire"></i> Échauffement
                                                    </h5>
                                                    <span style="font-size: 0.9rem; color: #666; margin-left: auto;">
                                                        ${session.warmUp.volumeMeters}m · ${session.warmUp.duration}min${session.warmUp.rpe ? ` · RPE ${session.warmUp.rpe}` : ''}
                                                    </span>
                                                </div>
                                                <p style="margin: 0; color: #555; font-size: 0.95rem; line-height: 1.5;">${session.warmUp.content}</p>
                                            </div>
                                            
                                            <!-- Corps de séance -->
                                            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                                    <h5 style="margin: 0; color: #1565c0; display: flex; align-items: center; gap: 8px;">
                                                        <i class="fas fa-dumbbell"></i> Corps de Séance
                                                    </h5>
                                                    <span style="font-size: 0.9rem; color: #666;">
                                                        ${session.mainSet.parts ? 
                                                            `${session.mainSet.parts.reduce((sum, p) => sum + p.volumeMeters, 0)}m · ${session.mainSet.parts.reduce((sum, p) => sum + p.duration, 0)}min` :
                                                            `${session.mainSet.volumeMeters}m · ${session.mainSet.duration}min`}
                                                    </span>
                                                </div>
                                                ${session.mainSet.parts ? 
                                                    session.mainSet.parts.map((part, idx) => `
                                                        <div style="margin-bottom: 10px; padding: 10px; background: rgba(33, 150, 243, 0.1); border-radius: 4px;">
                                                            <div style="font-weight: 500; color: #1565c0; margin-bottom: 5px;">Partie ${idx + 1} - ${part.volumeMeters}m · ${part.duration}min · RPE ${part.rpe}/10</div>
                                                            <p style="margin: 0; color: #555; font-size: 0.9rem; line-height: 1.4;">${part.content}</p>
                                                        </div>
                                                    `).join('') :
                                                    `<p style="margin: 0; color: #555; font-size: 0.95rem; line-height: 1.5;">${session.mainSet.content}</p>`
                                                }
                                            </div>
                                            
                                            <!-- Retour au calme -->
                                            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                                    <h5 style="margin: 0; color: #e65100; display: flex; align-items: center; gap: 8px;">
                                                        <i class="fas fa-spa"></i> Retour au Calme
                                                    </h5>
                                                    <span style="font-size: 0.9rem; color: #666;">
                                                        ${session.coolDown.volumeMeters}m · ${session.coolDown.duration}min${session.coolDown.rpe ? ` · RPE ${session.coolDown.rpe}` : ''}
                                                    </span>
                                                </div>
                                                <p style="margin: 0; color: #555; font-size: 0.95rem; line-height: 1.5;">${session.coolDown.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    } else {
        addBtn.style.display = 'none';
        content = `
            <div class="card" style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-swimming-pool" style="font-size: 3rem; color: #999; margin-bottom: 15px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Sélectionnez un nageur pour gérer les sessions</p>
            </div>
        `;
    }
    
    container.innerHTML = content;
}

function showAnalysis() {
    const container = document.getElementById('analysisContent');
    if (!container) return;
    
    let content = '';
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        const analysis = analyzeSwimmerData(swimmer);
        
        // En-tête synchronisé avec Aperçu
        content += `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <h2 style="margin: 0 0 10px 0; font-size: 2rem;">📊 Analyse Détaillée</h2>
                    <p style="margin: 0; font-size: 1.1rem; opacity: 0.9;">${swimmer.name}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">Score Global</div>
                    <div style="font-size: 2.5rem; font-weight: bold;">${calculateGlobalScore(swimmer)}/100</div>
                </div>
            </div>
        </div>`;
        
        // Résumé Exécutif (nouveau)
        content += generateExecutiveSummary(swimmer, analysis);
        
        // Cartes de statut (améliorées)
        content += `<div class="cards-grid">`;
        
        // Bien-être
        content += generateAnalysisCard('Bien-être', analysis.wellbeing, '😊');
        
        // Performance
        content += generateAnalysisCard('Performance', analysis.performance, '💪');
        
        // Médical
        content += generateAnalysisCard('Suivi de Présence, Disponibilité et Médicale', analysis.medical, '🏥');
        
        // Suivi Technique
        content += generateAnalysisCard('Suivi Technique', analysis.technical, '🎯');
        
        // Suivi de Présence
        content += generateAnalysisCard('Suivi de Présence', analysis.attendance, '✅');
        
        // ✅ NOUVEAU - Sessions d'Entraînement
        content += generateAnalysisCard('Sessions d\'Entraînement', analysis.sessions, '📋');
        
        content += `</div>`;
        
        // Analyse Comparative (nouveau)
        content += generateComparativeAnalysis(swimmer);
        
        // Historique de Progression (nouveau)
        content += generateProgressionHistory(swimmer);
        
        // Graphiques
        content += `<div class="section">
            <h3 class="section-title"><i class="fas fa-chart-area"></i> Visualisations Détaillées</h3>
            <div class="cards-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Évolution du Bien-être</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="wellbeingChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Volume & RPE</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="volumeRpeChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Performances (Radar)</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="performanceRadarChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Suivi Technique</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="technicalChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Statistiques de Présence</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="attendanceChart"></canvas>
                        </div>
                    </div>
                </div>
                ${(swimmer.wellbeingData && swimmer.wellbeingData.length > 0) ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🎯 Radar Bien-être 5D</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="wellbeingRadarChart"></canvas>
                        </div>
                    </div>
                </div>
                ` : ''}
                ${(swimmer.trainingData && swimmer.trainingData.length > 2 && swimmer.performanceData && swimmer.performanceData.length > 2) ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💎 Matrice Performance (Charge vs VMA vs Bien-être)</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="performanceBubbleChart"></canvas>
                        </div>
                    </div>
                </div>
                ` : ''}
                ${(swimmer.trainingData && swimmer.trainingData.length > 5) ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Répartition Types d'Entraînement</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="trainingTypesDoughnutChart"></canvas>
                        </div>
                    </div>
                </div>
                ` : ''}
                ${swimmer.sessionData && swimmer.sessionData.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Structure des Sessions</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="sessionVolumeChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Durée des Sessions</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="sessionDurationChart"></canvas>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>`;
        
    } else {
        content += `<div class="empty-state">
            <div class="empty-state-icon">📈</div>
            <h3 class="empty-state-title">Aucun nageur sélectionné</h3>
            <p class="empty-state-text">Veuillez sélectionner un nageur pour voir l'analyse.</p>
        </div>`;
    }
    
    container.innerHTML = content;
    
    if (currentSwimmerId) {
        initializeAnalysisCharts();
    }
}

// =============================================
// FONCTIONS D'ANALYSE SYNCHRONISÉES - NOUVEAU
// =============================================

// Calculer score global du nageur (sur 100)
function calculateGlobalScore(swimmer) {
    let totalScore = 0;
    let categories = 0;
    
    // Bien-être (25 points)
    if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
        const recent = swimmer.wellbeingData.slice(-7);
        const avg = recent.reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / recent.length;
        totalScore += (avg / 5) * 25;
        categories++;
    }
    
    // Performance (25 points)
    if (swimmer.performanceData && swimmer.performanceData.length > 0) {
        const vma = swimmer.performanceData[swimmer.performanceData.length - 1].vma || 0;
        totalScore += Math.min((vma / 20) * 25, 25);
        categories++;
    }
    
    // Assiduité (25 points)
    if (swimmer.attendance && swimmer.attendance.records && swimmer.attendance.records.length > 0) {
        const present = swimmer.attendance.records.filter(r => r.status === 'present').length;
        const rate = (present / swimmer.attendance.records.length) * 100;
        totalScore += (rate / 100) * 25;
        categories++;
    }
    
    // Disponibilité (25 points)
    if (swimmer.medicalData && swimmer.medicalData.length > 0) {
        const availability = swimmer.medicalData[swimmer.medicalData.length - 1].availability || 0;
        totalScore += (availability / 3) * 25;
        categories++;
    }
    
    return categories > 0 ? Math.round(totalScore) : 0;
}

// Générer résumé exécutif
function generateExecutiveSummary(swimmer, analysis) {
    const stats = calculateTeamDetailedStats({ swimmers: [swimmer.id] }, [swimmer]);
    
    let html = `
        <div class="card" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: none; margin-bottom: 30px;">
            <div class="card-header" style="background: transparent; border-bottom: 2px solid rgba(255,255,255,0.5);">
                <h3 style="color: #1565c0; margin: 0;"><i class="fas fa-file-alt"></i> Résumé Exécutif</h3>
            </div>
            <div class="card-body" style="padding: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">📊 Points Forts</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: #28a745;">
                            ${getStrengths(swimmer).join(', ') || 'À développer'}
                        </div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">⚠️ Points d'Attention</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: #ffc107;">
                            ${getWeaknesses(swimmer).join(', ') || 'Aucun'}
                        </div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">🎯 Priorité Semaine</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: #1a73e8;">
                            ${getWeeklyPriority(swimmer)}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    
    return html;
}

// Identifier points forts
function getStrengths(swimmer) {
    const strengths = [];
    
    // Vérifier assiduité
    if (swimmer.attendance && swimmer.attendance.records) {
        const present = swimmer.attendance.records.filter(r => r.status === 'present').length;
        const rate = swimmer.attendance.records.length > 0 ? (present / swimmer.attendance.records.length) * 100 : 0;
        if (rate >= 90) strengths.push('Assiduité');
    }
    
    // Vérifier bien-être
    if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
        const recent = swimmer.wellbeingData.slice(-7);
        const avg = recent.reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / recent.length;
        if (avg >= 4.0) strengths.push('Bien-être');
    }
    
    // Vérifier VMA
    if (swimmer.performanceData && swimmer.performanceData.length >= 2) {
        const current = swimmer.performanceData[swimmer.performanceData.length - 1].vma;
        const previous = swimmer.performanceData[swimmer.performanceData.length - 2].vma;
        if (current > previous) strengths.push('Progression VMA');
    }
    
    return strengths;
}

// Identifier faiblesses
function getWeaknesses(swimmer) {
    const weaknesses = [];
    
    // Vérifier assiduité
    if (swimmer.attendance && swimmer.attendance.records) {
        const present = swimmer.attendance.records.filter(r => r.status === 'present').length;
        const rate = swimmer.attendance.records.length > 0 ? (present / swimmer.attendance.records.length) * 100 : 0;
        if (rate < 75) weaknesses.push('Absences');
    }
    
    // Vérifier bien-être
    if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
        const recent = swimmer.wellbeingData.slice(-3);
        const avg = recent.reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / recent.length;
        if (avg < 3.0) weaknesses.push('Bien-être');
    }
    
    // Vérifier blessures
    if (swimmer.medicalData && swimmer.medicalData.length > 0) {
        const last = swimmer.medicalData[swimmer.medicalData.length - 1];
        if (last.injuries && last.injuries.length > 0) weaknesses.push('Blessures');
    }
    
    return weaknesses;
}

// Déterminer priorité de la semaine
function getWeeklyPriority(swimmer) {
    const weaknesses = getWeaknesses(swimmer);
    
    if (weaknesses.includes('Blessures')) return 'Récupération';
    if (weaknesses.includes('Bien-être')) return 'Charge réduite';
    if (weaknesses.includes('Absences')) return 'Motivation';
    
    // Si pas de faiblesses, focus sur progression
    if (swimmer.performanceData && swimmer.performanceData.length > 0) {
        const vma = swimmer.performanceData[swimmer.performanceData.length - 1].vma;
        if (vma < 15) return 'Endurance';
    }
    
    return 'Technique';
}

// Générer analyse comparative
function generateComparativeAnalysis(swimmer) {
    let html = `
        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-balance-scale"></i> Analyse Comparative</h3>
            </div>
            <div class="card-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">`;
    
    // Comparaison bien-être
    const wellbeingComparison = compareToAverage(swimmer, 'wellbeing');
    html += generateComparisonCard('Bien-être', wellbeingComparison, '😊');
    
    // Comparaison charge
    const loadComparison = compareToAverage(swimmer, 'load');
    html += generateComparisonCard('Charge', loadComparison, '💪');
    
    // Comparaison VMA
    const vmaComparison = compareToAverage(swimmer, 'vma');
    html += generateComparisonCard('VMA', vmaComparison, '📈');
    
    html += `
                </div>
            </div>
        </div>`;
    
    return html;
}

// Comparer à la moyenne
function compareToAverage(swimmer, metric) {
    let swimmerValue = 0;
    let teamAverage = 0;
    let unit = '';
    
    switch(metric) {
        case 'wellbeing':
            if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
                const recent = swimmer.wellbeingData.slice(-7);
                swimmerValue = recent.reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / recent.length;
            }
            teamAverage = 3.8;
            unit = '/5';
            break;
        case 'load':
            if (swimmer.trainingData && swimmer.trainingData.length > 0) {
                const recent = swimmer.trainingData.slice(-7);
                swimmerValue = recent.reduce((sum, d) => sum + (d.load || 0), 0) / recent.length;
            }
            teamAverage = 550;
            unit = '';
            break;
        case 'vma':
            if (swimmer.performanceData && swimmer.performanceData.length > 0) {
                swimmerValue = swimmer.performanceData[swimmer.performanceData.length - 1].vma || 0;
            }
            teamAverage = 14.5;
            unit = ' km/h';
            break;
    }
    
    const diff = swimmerValue - teamAverage;
    const diffPercent = teamAverage !== 0 ? ((diff / teamAverage) * 100) : 0;
    
    return {
        swimmerValue: swimmerValue.toFixed(1),
        teamAverage: teamAverage.toFixed(1),
        diff: diff.toFixed(1),
        diffPercent: diffPercent.toFixed(1),
        unit: unit,
        status: diff > 0 ? 'above' : diff < 0 ? 'below' : 'equal'
    };
}

// Générer carte de comparaison
function generateComparisonCard(title, comparison, icon) {
    const color = comparison.status === 'above' ? '#28a745' : comparison.status === 'below' ? '#dc3545' : '#6c757d';
    const arrow = comparison.status === 'above' ? '↗' : comparison.status === 'below' ? '↘' : '→';
    
    return `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 1.5rem;">${icon}</span>
                <strong>${title}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>
                    <div style="font-size: 0.85rem; color: #666;">Vous</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: ${color};">${comparison.swimmerValue}${comparison.unit}</div>
                </div>
                <div style="text-align: center; color: ${color}; font-size: 1.5rem; padding: 0 10px;">
                    ${arrow}
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.85rem; color: #666;">Équipe</div>
                    <div style="font-size: 1.3rem; font-weight: bold;">${comparison.teamAverage}${comparison.unit}</div>
                </div>
            </div>
            <div style="text-align: center; font-size: 0.9rem; color: ${color}; font-weight: 600;">
                ${comparison.diffPercent > 0 ? '+' : ''}${comparison.diffPercent}% ${comparison.status === 'above' ? 'au-dessus' : comparison.status === 'below' ? 'en-dessous' : 'égal'} à la moyenne
            </div>
        </div>`;
}

// Générer historique de progression
function generateProgressionHistory(swimmer) {
    let html = `
        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-history"></i> Historique de Progression</h3>
            </div>
            <div class="card-content">`;
    
    const milestones = getProgressionMilestones(swimmer);
    
    if (milestones.length > 0) {
        html += `<div style="position: relative; padding-left: 30px;">`;
        milestones.forEach((milestone, index) => {
            const isLast = index === milestones.length - 1;
            html += `
                <div style="position: relative; padding-bottom: 20px; ${!isLast ? 'border-left: 2px solid #e0e0e0;' : ''}">
                    <div style="position: absolute; left: -37px; top: 0; width: 20px; height: 20px; border-radius: 50%; background: ${milestone.color}; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-left: 5px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <strong style="color: ${milestone.color}; font-size: 1.1rem;">${milestone.icon} ${milestone.title}</strong>
                            <span style="font-size: 0.85rem; color: #666;">${milestone.date}</span>
                        </div>
                        <p style="margin: 0; color: #555;">${milestone.description}</p>
                    </div>
                </div>`;
        });
        html += `</div>`;
    } else {
        html += `<p style="text-align: center; color: #999; padding: 20px;">Aucun événement marquant enregistré</p>`;
    }
    
    html += `
            </div>
        </div>`;
    
    return html;
}

// Obtenir jalons de progression
function getProgressionMilestones(swimmer) {
    const milestones = [];
    
    // VMA milestones
    if (swimmer.performanceData && swimmer.performanceData.length >= 2) {
        for (let i = 1; i < swimmer.performanceData.length; i++) {
            const current = swimmer.performanceData[i].vma;
            const previous = swimmer.performanceData[i - 1].vma;
            if (current - previous >= 0.5) {
                milestones.push({
                    date: new Date(swimmer.performanceData[i].date).toLocaleDateString('fr-FR'),
                    icon: '🚀',
                    title: 'Amélioration VMA',
                    description: `VMA passée de ${previous} à ${current} km/h (+${(current - previous).toFixed(1)})`,
                    color: '#28a745'
                });
            }
        }
    }
    
    // Records personnels
    if (swimmer.raceData && swimmer.raceData.length > 0) {
        swimmer.raceData.slice(-3).forEach(race => {
            milestones.push({
                date: new Date(race.date).toLocaleDateString('fr-FR'),
                icon: '🏆',
                title: race.event || 'Compétition',
                description: race.races && race.races[0] ? `${race.races[0].distance} ${race.races[0].style} en ${race.races[0].time}` : 'Participation',
                color: '#ffc107'
            });
        });
    }
    
    // Assiduité exceptionnelle
    if (swimmer.attendance && swimmer.attendance.records) {
        const recent = swimmer.attendance.records.slice(-20);
        const present = recent.filter(r => r.status === 'present').length;
        if (recent.length >= 20 && present === 20) {
            milestones.push({
                date: 'Récent',
                icon: '⭐',
                title: 'Assiduité parfaite',
                description: '20 présences consécutives',
                color: '#17a2b8'
            });
        }
    }
    
    return milestones.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
}

function showFeedback() {
    const container = document.getElementById('feedbackContent');
    if (!container) return;
    
    let content = '';
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        const analysis = analyzeSwimmerData(swimmer);
        
        content += generatePersonalizedFeedback(swimmer, analysis);
        
    } else {
        content += `<div class="card" style="text-align: center; padding: 40px 20px;">
            <i class="fas fa-comments" style="font-size: 3rem; color: #999; margin-bottom: 15px;"></i>
            <p style="color: #999; font-size: 1.1rem;">Sélectionnez un nageur pour voir les retours personnalisés</p>
        </div>`;
    }
    
    container.innerHTML = content;
}

function generateAnalysisCard(title, data, icon) {
    let statusClass = 'badge-good';
    let statusText = 'Bon';
    let percentage = 75;
    let barColor = '#28a745';
    
    if (data.status === 'excellent') {
        statusClass = 'badge-excellent';
        statusText = 'Excellent';
        percentage = 95;
        barColor = '#28a745';
    } else if (data.status === 'warning') {
        statusClass = 'badge-ok';
        statusText = 'Attention';
        percentage = 60;
        barColor = '#ffc107';
    } else if (data.status === 'poor') {
        statusClass = 'badge-poor';
        statusText = 'Problématique';
        percentage = 35;
        barColor = '#dc3545';
    } else if (data.status === 'no_data') {
        statusClass = 'badge';
        statusText = 'Données manquantes';
        percentage = 0;
        barColor = '#ccc';
    }
    
    // Calcul du pourcentage basé sur les données réelles
    if (data.status !== 'no_data') {
        percentage = calculatePercentageFromData(data, title);
    }
    
    return `
        <div class="progress-section">
            <div class="progress-header">
                <div class="progress-title">
                    <span class="progress-icon">${icon}</span>
                    <h3>${title}</h3>
                </div>
                <div class="progress-status">
                    <span class="badge ${statusClass}">${statusText}</span>
                    <span class="progress-value">${percentage}%</span>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%; background: linear-gradient(90deg, ${barColor} 0%, ${adjustColor(barColor, 30)} 100%);">
                    <div class="progress-bar-shine"></div>
                </div>
            </div>
            <div class="progress-details">
                ${data.status !== 'no_data' ? getAnalysisDetails(data, title) : '<p style="color: #999; font-style: italic;">Aucune donnée disponible pour cette catégorie</p>'}
            </div>
        </div>`;
}

function getAnalysisDetails(data, title) {
    switch(title) {
        case 'Bien-être':
            return `Dernier score: ${data.recent.sleep + data.recent.fatigue + data.recent.pain + data.recent.stress}/20`;
        case 'Performance':
            return `VMA: ${data.recent.vma}, Force épaule: ${data.recent.shoulder}kg`;
        case 'Suivi de Présence, Disponibilité et Médicale':
            return `Disponibilité: ${data.recent.availability}/3`;
        case 'Suivi Technique':
            if (data.status === 'no_data') return '';
            let html = `<div style="margin-top: 15px;">`;
            html += `<p style="font-size: 16px; font-weight: 500; margin-bottom: 10px;">Moyenne globale: <strong>${data.overallAverage}/10</strong></p>`;
            
            // Catégories évaluées
            if (Object.keys(data.categoryStats).length > 0) {
                html += `<div style="margin: 15px 0;">`;
                html += `<h4 style="font-size: 14px; color: var(--primary-color); margin-bottom: 8px;">Nages évaluées:</h4>`;
                Object.values(data.categoryStats).forEach(cat => {
                    const color = cat.status === 'excellent' ? '#28a745' : 
                                 cat.status === 'good' ? '#17a2b8' : 
                                 cat.status === 'warning' ? '#ffc107' : '#dc3545';
                    html += `<div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 4px;">`;
                    html += `<span>${cat.name}</span>`;
                    html += `<strong style="color: ${color}">${cat.average}/10</strong>`;
                    html += `</div>`;
                });
                html += `</div>`;
            }
            
            // Points forts
            if (data.strengths && data.strengths.length > 0) {
                html += `<div style="margin: 15px 0;">`;
                html += `<h4 style="font-size: 14px; color: #28a745; margin-bottom: 8px;">💪 Points forts:</h4>`;
                html += `<ul style="margin: 0; padding-left: 20px;">`;
                data.strengths.slice(0, 3).forEach(s => {
                    html += `<li style="font-size: 13px;">${s.category} - ${s.field} (${s.score}/10)</li>`;
                });
                html += `</ul></div>`;
            }
            
            // Points faibles
            if (data.weaknesses && data.weaknesses.length > 0) {
                html += `<div style="margin: 15px 0;">`;
                html += `<h4 style="font-size: 14px; color: #dc3545; margin-bottom: 8px;">⚠️ À améliorer:</h4>`;
                html += `<ul style="margin: 0; padding-left: 20px;">`;
                data.weaknesses.slice(0, 3).forEach(w => {
                    html += `<li style="font-size: 13px;">${w.category} - ${w.field} (${w.score}/10)</li>`;
                });
                html += `</ul></div>`;
            }
            
            html += `</div>`;
            return html;
        case 'Suivi de Présence':
            if (data.status === 'no_data') return '';
            let presHtml = `<div style="margin-top: 15px;">`;
            presHtml += `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">`;
            presHtml += `<div style="text-align: center; padding: 10px; background: #d4edda; border-radius: 4px;">`;
            presHtml += `<div style="font-size: 24px; font-weight: bold; color: #28a745;">${data.presentRate}%</div>`;
            presHtml += `<div style="font-size: 12px; color: #666;">Présent</div>`;
            presHtml += `</div>`;
            presHtml += `<div style="text-align: center; padding: 10px; background: #fff3cd; border-radius: 4px;">`;
            presHtml += `<div style="font-size: 24px; font-weight: bold; color: #ffc107;">${data.lateRate}%</div>`;
            presHtml += `<div style="font-size: 12px; color: #666;">Retard</div>`;
            presHtml += `</div>`;
            presHtml += `<div style="text-align: center; padding: 10px; background: #f8d7da; border-radius: 4px;">`;
            presHtml += `<div style="font-size: 24px; font-weight: bold; color: #dc3545;">${data.absentRate}%</div>`;
            presHtml += `<div style="font-size: 12px; color: #666;">Absent</div>`;
            presHtml += `</div>`;
            presHtml += `</div>`;
            if (data.unjustifiedAbsences > 0) {
                presHtml += `<p style="color: #dc3545; font-weight: 500;">⚠️ ${data.unjustifiedAbsences} absence(s) non justifiée(s)</p>`;
            }
            presHtml += `</div>`;
            return presHtml;
        
        case 'Sessions d\'Entraînement':
            if (data.status === 'no_data') return '';
            let sessHtml = `<div style="margin-top: 15px;">`;
            
            // ✅ INDICATEURS CLÉS avec RPE
            sessHtml += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">`;
            
            sessHtml += `<div style="text-align: center; padding: 10px; background: #e3f2fd; border-radius: 4px;">`;
            sessHtml += `<div style="font-size: 20px; font-weight: bold; color: #2196f3;">${data.avgVolume}m</div>`;
            sessHtml += `<div style="font-size: 12px; color: #666;">Volume Moyen</div>`;
            sessHtml += `</div>`;
            
            sessHtml += `<div style="text-align: center; padding: 10px; background: #e8f5e9; border-radius: 4px;">`;
            sessHtml += `<div style="font-size: 20px; font-weight: bold; color: #4caf50;">${data.avgDuration}min</div>`;
            sessHtml += `<div style="font-size: 12px; color: #666;">Durée Moyenne</div>`;
            sessHtml += `</div>`;
            
            sessHtml += `<div style="text-align: center; padding: 10px; background: #fff3e0; border-radius: 4px;">`;
            sessHtml += `<div style="font-size: 20px; font-weight: bold; color: #ff9800;">${data.avgIntensity} m/min</div>`;
            sessHtml += `<div style="font-size: 12px; color: #666;">Intensité</div>`;
            sessHtml += `</div>`;
            
            // ✅ NOUVEAU - RPE Moyen
            const rpeColor = data.avgRPE > 8 ? '#f44336' : data.avgRPE < 4 ? '#ff9800' : '#4caf50';
            sessHtml += `<div style="text-align: center; padding: 10px; background: #f3e5f5; border-radius: 4px;">`;
            sessHtml += `<div style="font-size: 20px; font-weight: bold; color: ${rpeColor};">${data.avgRPE}/10</div>`;
            sessHtml += `<div style="font-size: 12px; color: #666;">RPE Moyen</div>`;
            sessHtml += `</div>`;
            
            // ✅ NOUVEAU - Charge d'Entraînement
            sessHtml += `<div style="text-align: center; padding: 10px; background: #fce4ec; border-radius: 4px;">`;
            sessHtml += `<div style="font-size: 18px; font-weight: bold; color: #e91e63;">${data.avgTrainingLoad}</div>`;
            sessHtml += `<div style="font-size: 12px; color: #666;">Charge Moyenne</div>`;
            sessHtml += `</div>`;
            
            // ✅ NOUVEAU - Monotonie
            const monotonyColor = data.monotony > 2.0 ? '#f44336' : data.monotony > 1.5 ? '#ff9800' : '#4caf50';
            sessHtml += `<div style="text-align: center; padding: 10px; background: #fff9c4; border-radius: 4px;">`;
            sessHtml += `<div style="font-size: 18px; font-weight: bold; color: ${monotonyColor};">${data.monotony}</div>`;
            sessHtml += `<div style="font-size: 12px; color: #666;">Monotonie</div>`;
            sessHtml += `</div>`;
            
            // Tendance Volume
            const trendIcon = parseFloat(data.volumeTrend) > 0 ? '📈' : parseFloat(data.volumeTrend) < 0 ? '📉' : '➡️';
            const trendColor = parseFloat(data.volumeTrend) > 0 ? '#4caf50' : parseFloat(data.volumeTrend) < 0 ? '#f44336' : '#757575';
            sessHtml += `<div style="text-align: center; padding: 10px; background: #e0f2f1; border-radius: 4px;">`;
            sessHtml += `<div style="font-size: 20px; font-weight: bold; color: ${trendColor};">${trendIcon} ${data.volumeTrend}%</div>`;
            sessHtml += `<div style="font-size: 12px; color: #666;">Tendance</div>`;
            sessHtml += `</div>`;
            
            sessHtml += `</div>`;
            
            // ✅ RÉPARTITION DES PHASES
            sessHtml += `<div style="margin-top: 15px;">`;
            sessHtml += `<h4 style="font-size: 14px; color: var(--primary-color); margin-bottom: 8px;">Répartition Moyenne:</h4>`;
            
            sessHtml += `<div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: #e8f5e9; border-radius: 4px;">`;
            sessHtml += `<span>🔥 Échauffement</span>`;
            sessHtml += `<strong style="color: #4caf50">${data.avgWarmUpPercent}%</strong>`;
            sessHtml += `</div>`;
            
            sessHtml += `<div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: #e3f2fd; border-radius: 4px;">`;
            sessHtml += `<span>💪 Corps de Séance</span>`;
            sessHtml += `<strong style="color: #2196f3">${data.avgMainSetPercent}%</strong>`;
            sessHtml += `</div>`;
            
            sessHtml += `<div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: #fff3e0; border-radius: 4px;">`;
            sessHtml += `<span>🧘 Retour Calme</span>`;
            sessHtml += `<strong style="color: #ff9800">${data.avgCoolDownPercent}%</strong>`;
            sessHtml += `</div>`;
            
            sessHtml += `</div>`;
            
            // ✅ INFO SESSIONS
            sessHtml += `<p style="margin-top: 15px; color: #666; font-size: 13px;">`;
            sessHtml += `📊 ${data.totalSessions} session(s) • Charge totale: ${data.totalStrain}`;
            sessHtml += `</p>`;
            
            sessHtml += `</div>`;
            return sessHtml;
        
        default:
            return 'Détails non disponibles';
    }
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

// Fonction pour calculer le pourcentage à partir des données
function calculatePercentageFromData(data, title) {
    switch(title) {
        case 'Bien-être':
            // Score sur 20, convertir en pourcentage
            const totalScore = data.recent.sleep + data.recent.fatigue + data.recent.pain + data.recent.stress;
            return Math.round((totalScore / 20) * 100);
        
        case 'Performance':
            // Calculer en fonction de la VMA et de la force
            const vmaScore = Math.min((data.recent.vma / 20) * 100, 100);
            const strengthScore = Math.min((data.recent.shoulder / 50) * 100, 100);
            return Math.round((vmaScore + strengthScore) / 2);
        
        case 'Suivi de Présence, Disponibilité et Médicale':
            // Disponibilité sur 3, convertir en pourcentage
            return Math.round((data.recent.availability / 3) * 100);
        
        case 'Suivi Technique':
            // Moyenne sur 10, convertir en pourcentage
            return Math.round((data.overallAverage / 10) * 100);
        
        case 'Suivi de Présence':
            // Utiliser le taux de présence
            return Math.round(data.presentRate || 0);
        
        case 'Sessions d\'Entraînement':
            // Calculer en fonction du volume et de la régularité
            const volumeScore = Math.min((data.avgVolume / 5000) * 100, 100);
            return Math.round(volumeScore);
        
        default:
            return 75;
    }
}

// Fonction pour ajuster la couleur (éclaircir ou foncer)
function adjustColor(color, amount) {
    // Convertir hex en RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    // Ajuster
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Reconvertir en hex
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function updateAthleteSelector() {
    // Mise à jour pour le design circulaire compact
    const selectorOptions = document.getElementById('selectorOptions');
    const circleBtn = document.getElementById('selectorCircleBtn');
    
    if (!selectorOptions || !circleBtn) return;
    
    // Vider les options existantes
    selectorOptions.innerHTML = `
        <div class="selector-item" data-value="all">
            <span>Tous les nageurs</span>
        </div>`;
    
    // Ajouter chaque nageur
    swimmers.forEach(swimmer => {
        const option = document.createElement('div');
        option.className = 'selector-item';
        option.setAttribute('data-value', swimmer.id);
        option.innerHTML = `<span>${swimmer.name}</span>`;
        selectorOptions.appendChild(option);
    });
    
    // Mettre à jour l'indicateur visuel
    updateCircleIndicator();
    
    // Ajouter les écouteurs d'événements
    setupCircleSelectorEvents();
}

function updateCircleIndicator() {
    const circleBtn = document.getElementById('selectorCircleBtn');
    if (!circleBtn) return;
    
    // Ajouter/retirer la classe has-selection
    if (currentSwimmerId && currentSwimmerId !== 'all') {
        circleBtn.classList.add('has-selection');
        circleBtn.title = `Nageur sélectionné: ${getCurrentSwimmerName()}`;
    } else {
        circleBtn.classList.remove('has-selection');
        circleBtn.title = 'Sélectionner un nageur';
    }
    
    // Mettre à jour les options sélectionnées
    const options = document.querySelectorAll('.selector-item');
    options.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-value') === currentSwimmerId) {
            option.classList.add('selected');
        }
    });
}

function getCurrentSwimmerName() {
    if (!currentSwimmerId) return 'Aucun';
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    return swimmer ? swimmer.name : 'Inconnu';
}

function setupCircleSelectorEvents() {
    const circleBtn = document.getElementById('selectorCircleBtn');
    const dropdown = document.getElementById('selectorDropdown');
    const overlay = document.getElementById('selectorOverlay');
    const searchInput = document.getElementById('swimmerSearchInput');
    const options = document.querySelectorAll('.selector-item');
    const stickySelector = document.querySelector('.sticky-selector');
    
    if (!circleBtn || !dropdown) return;
    
    // Fonction pour ouvrir le dropdown
    function openDropdown() {
        dropdown.classList.add('active');
        if (overlay) overlay.classList.add('active');
        circleBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 300);
    }
    
    // Fonction pour fermer le dropdown
    function closeDropdown() {
        dropdown.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        circleBtn.classList.remove('active');
        document.body.style.overflow = ''; // Rétablir le scroll
        if (searchInput) searchInput.value = '';
        // Réafficher tous les éléments
        options.forEach(option => {
            option.style.display = 'flex';
        });
    }
    
    // Toggle dropdown
    circleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.classList.contains('active')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });
    
    // Fermer avec l'overlay
    if (overlay) {
        overlay.addEventListener('click', closeDropdown);
    }
    
    // Fermer dropdown en cliquant ailleurs (fallback)
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !circleBtn.contains(e.target)) {
            closeDropdown();
        }
    });
    
    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('active')) {
            closeDropdown();
        }
    });
    
    // Recherche
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            options.forEach(option => {
                const text = option.querySelector('span').textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }
    
    // Sélection d'option
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            currentSwimmerId = value === 'all' ? null : value;
            updateCircleIndicator();
            closeDropdown();
            
            // Mettre à jour l'affichage
            showCompleteDashboard();
        });
    });
    
    // ===== FONCTIONNALITÉ DRAG AND DROP MOBILE =====
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    // Touch events pour mobile
    if (window.innerWidth <= 768) {
        circleBtn.addEventListener('touchstart', handleTouchStart, { passive: false });
        circleBtn.addEventListener('touchmove', handleTouchMove, { passive: false });
        circleBtn.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Mouse events pour desktop (en cas de simulation touch)
        circleBtn.addEventListener('mousedown', handleMouseStart);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseEnd);
    }
    
    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            startDragging(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }
    }
    
    function handleTouchMove(e) {
        if (isDragging && e.touches.length === 1) {
            updatePosition(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }
    }
    
    function handleTouchEnd(e) {
        endDragging();
    }
    
    function handleMouseStart(e) {
        if (window.innerWidth <= 768) {
            startDragging(e.clientX, e.clientY);
            e.preventDefault();
        }
    }
    
    function handleMouseMove(e) {
        if (isDragging && window.innerWidth <= 768) {
            updatePosition(e.clientX, e.clientY);
        }
    }
    
    function handleMouseEnd(e) {
        if (window.innerWidth <= 768) {
            endDragging();
        }
    }
    
    function startDragging(x, y) {
        isDragging = true;
        startX = x;
        startY = y;
        
        const rect = stickySelector.getBoundingClientRect();
        initialX = rect.right - window.innerWidth;
        initialY = window.innerHeight - rect.bottom;
        
        stickySelector.classList.add('dragging');
        dropdown.classList.remove('active');
        circleBtn.classList.remove('active');
    }
    
    function updatePosition(x, y) {
        if (!isDragging) return;
        
        const deltaX = startX - x;
        const deltaY = y - startY;
        
        let newRight = initialX + deltaX;
        let newBottom = initialY - deltaY;
        
        // Contraindre dans les limites de l'écran
        const minRight = 10;
        const maxRight = window.innerWidth - 60;
        const minBottom = 10;
        const maxBottom = window.innerHeight - 60;
        
        newRight = Math.max(minRight, Math.min(maxRight - window.innerWidth + 60, newRight));
        newBottom = Math.max(minBottom, Math.min(maxBottom, newBottom));
        
        stickySelector.style.right = newRight + 'px';
        stickySelector.style.bottom = newBottom + 'px';
    }
    
    function endDragging() {
        if (!isDragging) return;
        
        isDragging = false;
        stickySelector.classList.remove('dragging');
        
        // Magnétisme vers les bords
        const rect = stickySelector.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const rightDistance = window.innerWidth - rect.right;
        
        if (centerX < window.innerWidth / 2) {
            // Aimanter vers la gauche
            stickySelector.style.right = (window.innerWidth - 70) + 'px';
        } else {
            // Aimanter vers la droite
            stickySelector.style.right = '10px';
        }
    }
}

function closeAllModals() {
    if (addSwimmerModal) addSwimmerModal.style.display = 'none';
    if (dataEntryModal) dataEntryModal.style.display = 'none';
    const editModal = document.getElementById('editSwimmerModal');
    const historyModal = document.getElementById('dataHistoryModal');
    const compareModal = document.getElementById('compareModal');
    if (editModal) editModal.style.display = 'none';
    if (historyModal) historyModal.style.display = 'none';
    if (compareModal) compareModal.style.display = 'none';
}

// =============================================
// ÉDITION ET SUPPRESSION DE NAGEURS
// =============================================

function openEditSwimmerModal(swimmerId) {
    const swimmer = swimmers.find(s => s.id === swimmerId);
    if (!swimmer) return;
    
    document.getElementById('editSwimmerId').value = swimmer.id;
    document.getElementById('editSwimmerName').value = swimmer.name;
    document.getElementById('editSwimmerAge').value = swimmer.age;
    document.getElementById('editSwimmerGender').value = swimmer.gender;
    document.getElementById('editSwimmerSpecialty').value = swimmer.specialty;
    
    document.getElementById('editSwimmerModal').style.display = 'flex';
}

function saveSwimmerEdit() {
    const swimmerId = document.getElementById('editSwimmerId').value;
    const swimmer = swimmers.find(s => s.id === swimmerId);
    if (!swimmer) return;
    
    const name = document.getElementById('editSwimmerName').value;
    const age = document.getElementById('editSwimmerAge').value;
    const gender = document.getElementById('editSwimmerGender').value;
    const specialty = document.getElementById('editSwimmerSpecialty').value;
    
    if (!name || !age || !gender || !specialty) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    swimmer.name = name;
    swimmer.age = parseInt(age);
    swimmer.gender = gender;
    swimmer.specialty = specialty;
    
    saveToLocalStorage();
    updateAthleteSelector();
    updateDashboard();
    closeAllModals();
    showNotification('success', `Nageur ${name} modifié avec succès!`);
}

function deleteSwimmer() {
    const swimmerId = document.getElementById('editSwimmerId').value;
    const swimmer = swimmers.find(s => s.id === swimmerId);
    if (!swimmer) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${swimmer.name} ? Cette action est irréversible.`)) {
        return;
    }
    
    swimmers = swimmers.filter(s => s.id !== swimmerId);
    
    if (currentSwimmerId === swimmerId) {
        currentSwimmerId = null;
    }
    
    saveToLocalStorage();
    updateAthleteSelector();
    updateDashboard();
    closeAllModals();
    showNotification('info', `Nageur ${swimmer.name} supprimé`);
}

// =============================================
// HISTORIQUE ET MODIFICATION DES DONNÉES
// =============================================

function openDataHistoryModal() {
    if (!currentSwimmerId) {
        alert('Veuillez sélectionner un nageur');
        return;
    }
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    document.getElementById('historyTitle').textContent = `Historique - ${swimmer.name}`;
    document.getElementById('dataTypeFilter').value = 'all';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    displayDataHistory(swimmer);
    document.getElementById('dataHistoryModal').style.display = 'flex';
}

function applyDataFilters() {
    if (!currentSwimmerId) return;
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    displayDataHistory(swimmer);
}

function displayDataHistory(swimmer) {
    const dataType = document.getElementById('dataTypeFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    let allData = [];
    
    // Collecter toutes les données
    if (dataType === 'all' || dataType === 'wellbeing') {
        swimmer.wellbeing.dates.forEach((date, index) => {
            if (isDateInRange(date, dateFrom, dateTo)) {
                allData.push({
                    type: 'Bien-être',
                    date: date,
                    index: index,
                    data: `Sommeil: ${swimmer.wellbeing.sleep[index]}, Fatigue: ${swimmer.wellbeing.fatigue[index]}, Douleur: ${swimmer.wellbeing.pain[index]}, Stress: ${swimmer.wellbeing.stress[index]}`,
                    category: 'wellbeing'
                });
            }
        });
    }
    
    if (dataType === 'all' || dataType === 'training') {
        swimmer.training.dates.forEach((date, index) => {
            if (isDateInRange(date, dateFrom, dateTo)) {
                allData.push({
                    type: 'Entraînement',
                    date: date,
                    index: index,
                    data: `Volume: ${swimmer.training.volume[index]}min (${swimmer.training.volumeMeters ? swimmer.training.volumeMeters[index] + 'm' : 'N/A'}), RPE: ${swimmer.training.rpe[index]}, Charge: ${swimmer.training.charge[index]}`,
                    category: 'training'
                });
            }
        });
    }
    
    if (dataType === 'all' || dataType === 'performance') {
        swimmer.performance.dates.forEach((date, index) => {
            if (isDateInRange(date, dateFrom, dateTo)) {
                allData.push({
                    type: 'Performance',
                    date: date,
                    index: index,
                    data: `VMA: ${swimmer.performance.vma[index]} km/h, Épaule: ${swimmer.performance.shoulderStrength[index]} min, Pectoraux: ${swimmer.performance.chestStrength[index]} min, Jambes: ${swimmer.performance.legStrength[index]} min`,
                    category: 'performance'
                });
            }
        });
    }
    
    if (dataType === 'all' || dataType === 'medical') {
        swimmer.medical.dates.forEach((date, index) => {
            if (isDateInRange(date, dateFrom, dateTo)) {
                allData.push({
                    type: 'Médical',
                    date: date,
                    index: index,
                    data: `Disponibilité: ${swimmer.medical.availability[index]}, Maladies: ${swimmer.medical.illnesses[index]}, Blessures: ${swimmer.medical.injuries[index]}, Autres: ${swimmer.medical.otherIssues[index]}`,
                    category: 'medical'
                });
            }
        });
    }
    
    if ((dataType === 'all' || dataType === 'race') && swimmer.racePerformances) {
        swimmer.racePerformances.dates.forEach((date, index) => {
            if (isDateInRange(date, dateFrom, dateTo)) {
                let racesText = '';
                
                // Nouveau format
                if (swimmer.racePerformances.races && swimmer.racePerformances.races[index]) {
                    const races = swimmer.racePerformances.races[index];
                    racesText = races.map(r => `${r.style} ${r.distance}: ${r.time}`).join(', ');
                } 
                // Ancien format (pour compatibilité)
                else {
                    const times = [];
                    if (swimmer.racePerformances.crawl50m && swimmer.racePerformances.crawl50m[index]) times.push(`Crawl 50m: ${swimmer.racePerformances.crawl50m[index]}`);
                    if (swimmer.racePerformances.back50m && swimmer.racePerformances.back50m[index]) times.push(`Dos 50m: ${swimmer.racePerformances.back50m[index]}`);
                    if (swimmer.racePerformances.crawl100m && swimmer.racePerformances.crawl100m[index]) times.push(`Crawl 100m: ${swimmer.racePerformances.crawl100m[index]}`);
                    racesText = times.join(', ');
                }
                
                allData.push({
                    type: 'Course',
                    date: date,
                    index: index,
                    data: `Événement: ${swimmer.racePerformances.event[index]} | ${racesText}`,
                    category: 'race'
                });
            }
        });
    }
    
    if ((dataType === 'all' || dataType === 'technical') && swimmer.technical) {
        const categories = ['crawl', 'backstroke', 'breaststroke', 'butterfly', 'turns', 'starts'];
        const categoryNames = {
            crawl: 'Crawl',
            backstroke: 'Dos',
            breaststroke: 'Brasse',
            butterfly: 'Papillon',
            turns: 'Virages',
            starts: 'Départs'
        };
        
        categories.forEach(cat => {
            if (swimmer.technical[cat] && swimmer.technical[cat].dates) {
                swimmer.technical[cat].dates.forEach((date, index) => {
                    if (isDateInRange(date, dateFrom, dateTo)) {
                        const fields = Object.keys(swimmer.technical[cat]).filter(key => key !== 'dates');
                        const values = fields.map(field => {
                            const fieldNames = {
                                entries: 'Entrées', rotation: 'Rotation', breathing: 'Respiration',
                                kicks: 'Battements', armMovement: 'Bras', pullPhase: 'Traction',
                                kickPhase: 'Battement', coordination: 'Coordination',
                                undulation: 'Ondulation', approach: 'Approche', pushOff: 'Poussée',
                                underwaterPhase: 'Sous-marine', position: 'Position',
                                reaction: 'Réaction', flight: 'Vol', entry: 'Entrée', underwater: 'Sous-marin'
                            };
                            return `${fieldNames[field] || field}: ${swimmer.technical[cat][field][index]}`;
                        }).join(', ');
                        
                        allData.push({
                            type: 'Technique',
                            date: date,
                            index: index,
                            data: `${categoryNames[cat]} | ${values}`,
                            category: 'technical',
                            subCategory: cat
                        });
                    }
                });
            }
        });
    }
    
    if ((dataType === 'all' || dataType === 'attendance') && swimmer.attendance && swimmer.attendance.records) {
        swimmer.attendance.records.forEach((record, index) => {
            if (isDateInRange(record.date, dateFrom, dateTo)) {
                let statusText = '';
                if (record.status === 'present') {
                    statusText = '✅ Présent';
                } else if (record.status === 'late') {
                    statusText = `⏰ Retard (${record.lateMinutes || 0} min)`;
                    if (record.reason) statusText += ` - ${record.reason}`;
                } else if (record.status === 'absent') {
                    statusText = `❌ Absent`;
                    if (record.reason) statusText += ` - ${record.reason}`;
                    if (record.justified) statusText += ` (${record.justified === 'yes' ? 'Justifié' : 'Non justifié'})`;
                }
                
                allData.push({
                    type: 'Présence',
                    date: record.date,
                    index: index,
                    data: `${record.session} | ${statusText}`,
                    category: 'attendance'
                });
            }
        });
    }
    
    // Trier par date (plus récent en premier)
    allData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Afficher dans un tableau
    const container = document.getElementById('historyTableContainer');
    if (allData.length === 0) {
        container.innerHTML = '<p class="empty-state-text">Aucune donnée trouvée pour cette période.</p>';
        return;
    }
    
    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Données</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    allData.forEach(entry => {
        html += `
            <tr>
                <td>${formatDate(entry.date)}</td>
                <td><span class="badge badge-new">${entry.type}</span></td>
                <td>${entry.data}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.85rem;" 
                            onclick="deleteDataEntry('${entry.category}', ${entry.index})">Supprimer</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function isDateInRange(date, dateFrom, dateTo) {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(date);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo)) return false;
    return true;
}

function deleteDataEntry(category, index) {
    if (!currentSwimmerId) return;
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
        return;
    }
    
    // Supprimer l'entrée selon la catégorie
    switch(category) {
        case 'wellbeing':
            swimmer.wellbeing.dates.splice(index, 1);
            swimmer.wellbeing.sleep.splice(index, 1);
            swimmer.wellbeing.fatigue.splice(index, 1);
            swimmer.wellbeing.pain.splice(index, 1);
            swimmer.wellbeing.stress.splice(index, 1);
            break;
        case 'training':
            swimmer.training.dates.splice(index, 1);
            swimmer.training.volume.splice(index, 1);
            swimmer.training.rpe.splice(index, 1);
            swimmer.training.charge.splice(index, 1);
            break;
        case 'performance':
            swimmer.performance.dates.splice(index, 1);
            swimmer.performance.vma.splice(index, 1);
            swimmer.performance.shoulderStrength.splice(index, 1);
            swimmer.performance.chestStrength.splice(index, 1);
            swimmer.performance.legStrength.splice(index, 1);
            break;
        case 'medical':
            swimmer.medical.dates.splice(index, 1);
            swimmer.medical.availability.splice(index, 1);
            swimmer.medical.illnesses.splice(index, 1);
            swimmer.medical.injuries.splice(index, 1);
            swimmer.medical.otherIssues.splice(index, 1);
            break;
        case 'race':
            if (swimmer.racePerformances) {
                swimmer.racePerformances.dates.splice(index, 1);
                swimmer.racePerformances.event.splice(index, 1);
                if (swimmer.racePerformances.races) {
                    swimmer.racePerformances.races.splice(index, 1);
                }
            }
            break;
        case 'technical':
            // Pour technical, nous devons parcourir toutes les catégories pour trouver la bonne entrée
            // Cette approche fonctionne car nous passons également le subCategory depuis displayDataHistory
            alert('Suppression du suivi technique non encore implémentée dans cette interface. Utilisez l\'export/import JSON pour gérer ces données.');
            return;
        case 'attendance':
            if (swimmer.attendance && swimmer.attendance.records) {
                swimmer.attendance.records.splice(index, 1);
            }
            break;
    }
    
    saveToLocalStorage();
    displayDataHistory(swimmer);
    updateDashboard();
    showNotification('info', 'Entrée supprimée');
}

// =============================================
// EXPORT PDF
// =============================================

function generatePdfReport() {
    if (!currentSwimmerId) {
        alert('Veuillez sélectionner un nageur');
        return;
    }
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    const analysis = analyzeSwimmerData(swimmer);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = 20;
    
    // Titre
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Rapport de Suivi - Nageur', 105, yPos, { align: 'center' });
    yPos += 10;
    
    // Informations nageur
    doc.setFontSize(14);
    doc.text(swimmer.name, 105, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Age: ${swimmer.age} ans | Spécialité: ${swimmer.specialty} | Date: ${new Date().toLocaleDateString('fr-FR')}`, 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Statut général
    const overallStatus = getOverallStatus(analysis);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Statut Général', 20, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.text(overallStatus.message, 20, yPos);
    yPos += 12;
    
    // Bien-être
    if (analysis.wellbeing.status !== 'no_data') {
        doc.setFont(undefined, 'bold');
        doc.text('Bien-être', 20, yPos);
        yPos += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`Sommeil: ${analysis.wellbeing.recent.sleep}/5`, 25, yPos);
        yPos += 5;
        doc.text(`Fatigue: ${analysis.wellbeing.recent.fatigue}/5`, 25, yPos);
        yPos += 5;
        doc.text(`Douleur: ${analysis.wellbeing.recent.pain}/5`, 25, yPos);
        yPos += 5;
        doc.text(`Stress: ${analysis.wellbeing.recent.stress}/5`, 25, yPos);
        yPos += 10;
    }
    
    // Entraînement
    if (analysis.training.status !== 'no_data') {
        doc.setFont(undefined, 'bold');
        doc.text('Entraînement', 20, yPos);
        yPos += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`Volume récent: ${analysis.training.recent.volume} min`, 25, yPos);
        yPos += 5;
        doc.text(`RPE: ${analysis.training.recent.rpe}/10`, 25, yPos);
        yPos += 5;
        doc.text(`Charge: ${analysis.training.recent.charge}`, 25, yPos);
        yPos += 5;
        doc.text(`Monotonie: ${analysis.training.monotony.toFixed(2)}`, 25, yPos);
        yPos += 10;
    }
    
    // Performance
    if (analysis.performance.status !== 'no_data') {
        doc.setFont(undefined, 'bold');
        doc.text('Performance', 20, yPos);
        yPos += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`VMA 6min: ${analysis.performance.recent.vma}m`, 25, yPos);
        yPos += 5;
        doc.text(`Force épaule: ${analysis.performance.recent.shoulder}kg`, 25, yPos);
        yPos += 5;
        doc.text(`Force pectoraux: ${analysis.performance.recent.chest}kg`, 25, yPos);
        yPos += 5;
        doc.text(`Force jambes: ${analysis.performance.recent.legs}kg`, 25, yPos);
        yPos += 10;
    }
    
    // Recommandations
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Recommandations', 20, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    
    analysis.recommendations.forEach((rec, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5 + 3;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`Achbal Sportifs Natation - Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
    }
    
    // Téléchargement
    const filename = `rapport-${swimmer.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    showNotification('success', 'Rapport PDF généré avec succès!');
}

// =============================================
// COMPARAISON MULTI-NAGEURS
// =============================================

function openCompareModal() {
    if (swimmers.length < 2) {
        alert('Au moins 2 nageurs sont nécessaires pour une comparaison');
        return;
    }
    
    // Générer les checkboxes
    const container = document.getElementById('swimmerCheckboxes');
    container.innerHTML = swimmers.map(swimmer => `
        <label style="display: flex; align-items: center; gap: 8px; padding: 8px; background: var(--light-color); border-radius: 4px; cursor: pointer;">
            <input type="checkbox" class="swimmer-compare-checkbox" value="${swimmer.id}" style="cursor: pointer;">
            <span>${swimmer.name}</span>
        </label>
    `).join('');
    
    document.getElementById('compareModal').style.display = 'flex';
}

function generateComparison() {
    const checkboxes = document.querySelectorAll('.swimmer-compare-checkbox:checked');
    
    if (checkboxes.length < 2 || checkboxes.length > 4) {
        alert('Veuillez sélectionner entre 2 et 4 nageurs');
        return;
    }
    
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    const selectedSwimmers = swimmers.filter(s => selectedIds.includes(s.id));
    const metric = document.getElementById('compareMetric').value;
    
    const resultContainer = document.getElementById('comparisonResult');
    
    let html = '<div class="comparison-container">';
    html += '<h4 style="margin-bottom: 15px;">Résultats de la comparaison</h4>';
    
    // Tableau comparatif
    html += '<div class="table-container"><table><thead><tr><th>Nageur</th>';
    
    switch(metric) {
        case 'wellbeing':
            html += '<th>Sommeil</th><th>Fatigue</th><th>Douleur</th><th>Stress</th><th>Score Global</th>';
            break;
        case 'training':
            html += '<th>Volume Moy.</th><th>RPE Moy.</th><th>Charge Moy.</th><th>Monotonie</th>';
            break;
        case 'vma':
            html += '<th>VMA Actuelle</th><th>VMA Moyenne</th><th>Tendance</th>';
            break;
        case 'strength':
            html += '<th>Épaule</th><th>Pectoraux</th><th>Jambes</th><th>Total</th>';
            break;
    }
    
    html += '</tr></thead><tbody>';
    
    selectedSwimmers.forEach(swimmer => {
        const analysis = analyzeSwimmerData(swimmer);
        html += `<tr><td><strong>${swimmer.name}</strong></td>`;
        
        switch(metric) {
            case 'wellbeing':
                if (analysis.wellbeing.status !== 'no_data') {
                    const avg = analysis.wellbeing.averages;
                    const score = (avg.sleep + (5 - avg.fatigue) + (5 - avg.pain) + (5 - avg.stress)) / 4;
                    html += `<td>${avg.sleep.toFixed(1)}</td><td>${avg.fatigue.toFixed(1)}</td><td>${avg.pain.toFixed(1)}</td><td>${avg.stress.toFixed(1)}</td><td><strong>${score.toFixed(1)}/5</strong></td>`;
                } else {
                    html += '<td colspan="5">Pas de données</td>';
                }
                break;
            case 'training':
                if (analysis.training.status !== 'no_data') {
                    const avg = analysis.training.averages;
                    html += `<td>${avg.volume.toFixed(0)} min</td><td>${avg.rpe.toFixed(1)}</td><td>${avg.charge.toFixed(0)}</td><td>${analysis.training.monotony.toFixed(2)}</td>`;
                } else {
                    html += '<td colspan="4">Pas de données</td>';
                }
                break;
            case 'vma':
                if (analysis.performance.status !== 'no_data' && swimmer.performance.vma.length > 0) {
                    const current = analysis.performance.recent.vma;
                    const avg = swimmer.performance.vma.reduce((a, b) => a + b, 0) / swimmer.performance.vma.length;
                    const trend = analysis.performance.trends.vma;
                    const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️';
                    html += `<td>${current}m</td><td>${avg.toFixed(0)}m</td><td>${trendIcon} ${(trend * 100).toFixed(1)}%</td>`;
                } else {
                    html += '<td colspan="3">Pas de données</td>';
                }
                break;
            case 'strength':
                if (analysis.performance.status !== 'no_data') {
                    const p = analysis.performance.recent;
                    const total = p.shoulder + p.chest + p.legs;
                    html += `<td>${p.shoulder}kg</td><td>${p.chest}kg</td><td>${p.legs}kg</td><td><strong>${total}kg</strong></td>`;
                } else {
                    html += '<td colspan="4">Pas de données</td>';
                }
                break;
        }
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div></div>';
    
    resultContainer.innerHTML = html;
}

// =============================================
// MODE SOMBRE
// =============================================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const btn = document.getElementById('themeToggleBtn');
    if (newTheme === 'dark') {
        btn.innerHTML = '☀️ Mode Clair';
        showNotification('success', 'Mode sombre activé');
    } else {
        btn.innerHTML = '🌙 Mode Sombre';
        showNotification('success', 'Mode clair activé');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const btn = document.getElementById('themeToggleBtn');
    if (savedTheme === 'dark') {
        btn.innerHTML = '☀️ Mode Clair';
    }
}

function resetData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
        // Créer une sauvegarde avant réinitialisation
        if (swimmers.length > 0) {
            exportData();
        }
        swimmers = [];
        currentSwimmerId = null;
        localStorage.clear();
        updateDashboard();
        updateAthleteSelector();
        showNotification('info', 'Toutes les données ont été réinitialisées.');
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

function calculateTrend(data) {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    return (last - first) / first;
}

function calculateStandardDeviation(arr) {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
}

// Fonctions pour générer les tableaux de bord
// Fonction pour générer le dashboard amélioré du nageur
function generateEnhancedSwimmerDashboard(swimmer) {
    // Calculer les KPIs
    const wellbeingAvg = calculateWeekAverage(swimmer, 'wellbeingData', 'sleep'); // Moyenne des 4 critères
    const wellbeingData = swimmer.wellbeingData || [];
    let wellbeingScore = 0;
    if (wellbeingData.length > 0) {
        const recent = wellbeingData.slice(-7);
        wellbeingScore = recent.reduce((sum, d) => {
            return sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4);
        }, 0) / recent.length;
    }
    
    const medicalData = swimmer.medicalData || [];
    let availabilityPct = 0;
    if (medicalData.length > 0) {
        const recent = medicalData.slice(-7);
        const avgAvail = recent.reduce((sum, d) => sum + (d.availability || 0), 0) / recent.length;
        availabilityPct = (avgAvail / 3) * 100;
    }
    
    const trainingData = swimmer.trainingData || [];
    let weekVolume = 0;
    let avgLoad = 0;
    if (trainingData.length > 0) {
        const weekData = trainingData.slice(-7);
        weekVolume = weekData.reduce((sum, d) => sum + (d.volumeMeters || 0), 0) / 1000;
        avgLoad = weekData.reduce((sum, d) => sum + (d.load || 0), 0) / weekData.length;
    }
    
    const raceCount = (swimmer.raceData || []).length;
    
    const performanceData = swimmer.performanceData || [];
    let vma = 0;
    if (performanceData.length > 0) {
        vma = performanceData[performanceData.length - 1].vma || 0;
    }
    
    // Calculer assiduité
    let assiduityRate = 0;
    if (swimmer.attendance && swimmer.attendance.records) {
        const total = swimmer.attendance.records.length;
        const present = swimmer.attendance.records.filter(r => r.status === 'present').length;
        assiduityRate = total > 0 ? (present / total) * 100 : 0;
    }
    
    // Calculer tendances
    const wellbeingTrend = wellbeingData.length >= 14 ? 
        calculateTrend(
            wellbeingData.slice(-7).reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / 7,
            wellbeingData.slice(-14, -7).reduce((sum, d) => sum + ((d.sleep + d.fatigue + d.pain + d.stress) / 4), 0) / 7
        ) : { value: 0, direction: 'stable' };
    
    const loadTrend = trainingData.length >= 14 ?
        calculateTrend(
            trainingData.slice(-7).reduce((sum, d) => sum + (d.load || 0), 0) / 7,
            trainingData.slice(-14, -7).reduce((sum, d) => sum + (d.load || 0), 0) / 7
        ) : { value: 0, direction: 'stable' };
    
    // Générer alertes
    const alerts = generateSwimmerAlerts(swimmer);
    
    // Générer activité récente
    const recentActivity = generateRecentActivity(swimmer);
    
    // HTML du dashboard
    let html = `
        <!-- Cartes KPI -->
        <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 30px;">
            <div class="card stats-card" style="border-left: 4px solid #f39c12;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">😊 Bien-être</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #f39c12;">${wellbeingScore.toFixed(1)}/5</div>
                    <div style="font-size: 0.8rem; margin-top: 5px;">${getTrendIcon(wellbeingTrend)}</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #28a745;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">💪 Disponibilité</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #28a745;">${availabilityPct.toFixed(0)}%</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #666;">Forme actuelle</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #1a73e8;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">🏊 Vol. Semaine</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #1a73e8;">${weekVolume.toFixed(1)}km</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #666;">7 derniers jours</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #17a2b8;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">🏆 Courses</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #17a2b8;">${raceCount}</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #666;">Participations</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #e74c3c;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">📈 VMA</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #e74c3c;">${vma.toFixed(1)}</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #666;">km/h</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #9b59b6;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">⚡ Charge Moy.</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #9b59b6;">${avgLoad.toFixed(0)}</div>
                    <div style="font-size: 0.8rem; margin-top: 5px;">${getTrendIcon(loadTrend)}</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #16a085;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">📅 Assiduité</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #16a085;">${assiduityRate.toFixed(0)}%</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #666;">Taux présence</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #2c3e50;">
                <div class="card-body" style="text-align: center;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">📊 Données</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #2c3e50;">${(wellbeingData.length + trainingData.length + performanceData.length)}</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #666;">Entrées totales</div>
                </div>
            </div>
        </div>
        
        <!-- Alertes -->
        ${alerts.length > 0 ? `
        <div class="card" style="margin-bottom: 30px; border-left: 4px solid #ffc107;">
            <div class="card-header" style="background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%); padding: 15px;">
                <h3 style="margin: 0; color: #856404; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-bell"></i> Alertes & Notifications (${alerts.length})
                </h3>
            </div>
            <div class="card-body" style="padding: 0;">
                ${alerts.map(alert => `
                    <div style="padding: 15px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: start; gap: 15px;
                         background: ${alert.type === 'danger' ? '#ffebee' : alert.type === 'warning' ? '#fff8e1' : '#e8f5e9'};">
                        <div style="font-size: 1.5rem;">${alert.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 5px; color: ${alert.type === 'danger' ? '#c62828' : alert.type === 'warning' ? '#f57f17' : '#2e7d32'};">
                                ${alert.message}
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                → ${alert.recommendation}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- Activité Récente -->
        ${recentActivity.length > 0 ? `
        <div class="card" style="margin-bottom: 30px;">
            <div class="card-header" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 15px;">
                <h3 style="margin: 0; color: #1565c0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-history"></i> Activité Récente
                </h3>
            </div>
            <div class="card-body" style="padding: 0;">
                ${recentActivity.map((activity, index) => `
                    <div style="padding: 15px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px;">
                        <div style="font-size: 1.5rem;">${activity.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #333;">${activity.description}</div>
                            <div style="font-size: 0.85rem; color: #999; margin-top: 3px;">
                                ${formatDateRelative(activity.date)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- Phase 2: Graphiques de Progression 30 jours -->
        ${generateProgressionCharts(swimmer)}
        
        <!-- Phase 2: Objectifs & Suivi -->
        ${generateObjectivesSection(swimmer)}
        
        <!-- Phase 2: Comparaison avec l'équipe -->
        ${generateTeamComparison(swimmer)}
        
        <!-- Graphiques originaux (conservés) -->
        ${generateSwimmerDashboard(swimmer)}
    `;
    
    return html;
}

// Formater date relative (il y a X jours)
function formatDateRelative(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays === 2) return 'Il y a 2 jours';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
    return date.toLocaleDateString('fr-FR');
}

function generateSwimmerDashboard(swimmer) {
    const analysis = analyzeSwimmerData(swimmer);
    
    // Calculer les statistiques
    const wellbeingCount = swimmer.wellbeingData ? swimmer.wellbeingData.length : 0;
    const trainingCount = swimmer.trainingData ? swimmer.trainingData.length : 0;
    const performanceCount = swimmer.performanceData ? swimmer.performanceData.length : 0;
    const raceCount = swimmer.raceData ? swimmer.raceData.length : 0;
    const totalData = wellbeingCount + trainingCount + performanceCount + raceCount;
    
    // Dernière performance
    let lastPerf = 'Aucune';
    if (swimmer.raceData && swimmer.raceData.length > 0) {
        const last = swimmer.raceData[swimmer.raceData.length - 1];
        lastPerf = `${last.time} (${last.distance}m ${last.stroke})`;
    }
    
    // Dernière VMA
    let lastVMA = 'N/A';
    if (swimmer.performanceData && swimmer.performanceData.length > 0) {
        const vmaTests = swimmer.performanceData.filter(p => p.vma);
        if (vmaTests.length > 0) {
            lastVMA = vmaTests[vmaTests.length - 1].vma + ' km/h';
        }
    }
    
    // Bien-être moyen
    let avgWellbeing = 'N/A';
    if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
        const sum = swimmer.wellbeingData.reduce((acc, w) => acc + (w.sleep + w.fatigue + w.stress + w.pain) / 4, 0);
        avgWellbeing = (sum / swimmer.wellbeingData.length).toFixed(1) + '/10';
    }
    
    let content = `
        <!-- Cartes statistiques -->
        <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 30px;">
            <div class="card stats-card" style="border-left: 4px solid #1a73e8;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-database"></i></div>
                    <div class="stat-value">${totalData}</div>
                    <div class="stat-label">Données enregistrées</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #28a745;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-heartbeat"></i></div>
                    <div class="stat-value">${avgWellbeing}</div>
                    <div class="stat-label">Bien-être moyen</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #ffc107;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-bolt"></i></div>
                    <div class="stat-value">${lastVMA}</div>
                    <div class="stat-label">Dernière VMA</div>
                </div>
            </div>
            
            <div class="card stats-card" style="border-left: 4px solid #dc3545;">
                <div class="card-body">
                    <div class="stat-icon"><i class="fas fa-stopwatch"></i></div>
                    <div class="stat-value" style="font-size: 1.2rem;">${lastPerf}</div>
                    <div class="stat-label">Dernière performance</div>
                </div>
            </div>
        </div>
        
        <!-- Détails par catégorie -->
        <div class="cards-grid" style="margin-bottom: 30px;">
            <!-- Bien-être -->
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h3 style="color: white; margin: 0;"><i class="fas fa-smile"></i> Bien-être</h3>
                    <span class="badge" style="background: rgba(255,255,255,0.3);">${wellbeingCount} entrées</span>
                </div>
                <div class="card-body">
                    ${wellbeingCount > 0 ? `
                        <div class="stat-item">
                            <span>Dernière saisie:</span>
                            <strong>${new Date(swimmer.wellbeingData[wellbeingCount - 1].date).toLocaleDateString('fr-FR')}</strong>
                        </div>
                        <div class="stat-item">
                            <span>Sommeil:</span>
                            <strong>${swimmer.wellbeingData[wellbeingCount - 1].sleep}/10</strong>
                        </div>
                        <div class="stat-item">
                            <span>Fatigue:</span>
                            <strong>${swimmer.wellbeingData[wellbeingCount - 1].fatigue}/10</strong>
                        </div>
                    ` : '<p style="color: #999; text-align: center; padding: 20px;">Aucune donnée</p>'}
                </div>
            </div>
            
            <!-- Entraînement -->
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                    <h3 style="color: white; margin: 0;"><i class="fas fa-dumbbell"></i> Entraînement</h3>
                    <span class="badge" style="background: rgba(255,255,255,0.3);">${trainingCount} entrées</span>
                </div>
                <div class="card-body">
                    ${trainingCount > 0 ? `
                        <div class="stat-item">
                            <span>Dernière saisie:</span>
                            <strong>${new Date(swimmer.trainingData[trainingCount - 1].date).toLocaleDateString('fr-FR')}</strong>
                        </div>
                        <div class="stat-item">
                            <span>Volume:</span>
                            <strong>${swimmer.trainingData[trainingCount - 1].volume} km</strong>
                        </div>
                        <div class="stat-item">
                            <span>RPE:</span>
                            <strong>${swimmer.trainingData[trainingCount - 1].rpe}/10</strong>
                        </div>
                    ` : '<p style="color: #999; text-align: center; padding: 20px;">Aucune donnée</p>'}
                </div>
            </div>
            
            <!-- Performance -->
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                    <h3 style="color: white; margin: 0;"><i class="fas fa-chart-line"></i> Performance</h3>
                    <span class="badge" style="background: rgba(255,255,255,0.3);">${performanceCount} entrées</span>
                </div>
                <div class="card-body">
                    ${performanceCount > 0 ? `
                        <div class="stat-item">
                            <span>Dernière saisie:</span>
                            <strong>${new Date(swimmer.performanceData[performanceCount - 1].date).toLocaleDateString('fr-FR')}</strong>
                        </div>
                        ${swimmer.performanceData[performanceCount - 1].vma ? `
                            <div class="stat-item">
                                <span>VMA:</span>
                                <strong>${swimmer.performanceData[performanceCount - 1].vma} km/h</strong>
                            </div>
                        ` : ''}
                        ${swimmer.performanceData[performanceCount - 1].shoulderStrength ? `
                            <div class="stat-item">
                                <span>Force épaule:</span>
                                <strong>${swimmer.performanceData[performanceCount - 1].shoulderStrength} kg</strong>
                            </div>
                        ` : ''}
                    ` : '<p style="color: #999; text-align: center; padding: 20px;">Aucune donnée</p>'}
                </div>
            </div>
            
            <!-- Courses -->
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">
                    <h3 style="color: white; margin: 0;"><i class="fas fa-swimming-pool"></i> Courses</h3>
                    <span class="badge" style="background: rgba(255,255,255,0.3);">${raceCount} performances</span>
                </div>
                <div class="card-body">
                    ${raceCount > 0 ? `
                        <div class="stat-item">
                            <span>Dernière course:</span>
                            <strong>${new Date(swimmer.raceData[raceCount - 1].date).toLocaleDateString('fr-FR')}</strong>
                        </div>
                        <div class="stat-item">
                            <span>${swimmer.raceData[raceCount - 1].distance}m ${swimmer.raceData[raceCount - 1].stroke}:</span>
                            <strong>${swimmer.raceData[raceCount - 1].time}</strong>
                        </div>
                    ` : '<p style="color: #999; text-align: center; padding: 20px;">Aucune donnée</p>'}
                </div>
            </div>
        </div>
        
        <!-- Graphiques de progression -->
        ${raceCount > 0 ? `
            <div class="card" style="margin-top: 30px;">
                <div class="card-header">
                    <h3><i class="fas fa-chart-area"></i> Progression des Performances</h3>
                </div>
                <div class="card-body">
                    <canvas id="performanceChart" width="400" height="200"></canvas>
                </div>
            </div>
        ` : ''}
        
        ${wellbeingCount > 0 ? `
            <div class="card" style="margin-top: 30px;">
                <div class="card-header">
                    <h3><i class="fas fa-heart"></i> Évolution du Bien-être</h3>
                </div>
                <div class="card-body">
                    <canvas id="wellbeingChart" width="400" height="200"></canvas>
                </div>
            </div>
        ` : ''}
    `;
    
    return content;
}

function generateOverviewDashboard() {
    if (swimmers.length === 0) {
        return showEmptyState();
    }
    
    const totalSwimmers = swimmers.length;
    let totalDataPoints = 0;
    let alertCount = 0;
    
    swimmers.forEach(swimmer => {
        const analysis = analyzeSwimmerData(swimmer);
        totalDataPoints += swimmer.wellbeing.dates.length + swimmer.training.dates.length + 
                          swimmer.performance.dates.length + swimmer.medical.dates.length;
        
        if (analysis.wellbeing.status === 'poor' || analysis.training.status === 'poor' ||
            analysis.performance.status === 'poor' || analysis.medical.status === 'poor') {
            alertCount++;
        }
    });
    
    let content = `
        <div class="section">
            <h3 class="section-title">Vue d'Ensemble de l'Équipe</h3>
            
            <div class="cards-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Statistiques Globales</h3>
                        <div class="card-icon">📊</div>
                    </div>
                    <div class="card-content">
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-value">${totalSwimmers}</span>
                                <span class="stat-label">Nageurs</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${totalDataPoints}</span>
                                <span class="stat-label">Entrées de données</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${alertCount}</span>
                                <span class="stat-label">Alertes</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${(totalDataPoints / totalSwimmers).toFixed(1)}</span>
                                <span class="stat-label">Moy. par nageur</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3 class="section-title">Liste des Nageurs</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Âge</th>
                                <th>Spécialité</th>
                                <th>Données</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${swimmers.map(swimmer => generateSwimmerRow(swimmer)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    return content;
}

function generateSwimmerRow(swimmer) {
    const analysis = analyzeSwimmerData(swimmer);
    const overallStatus = getOverallStatus(analysis);
    const raceCount = swimmer.racePerformances ? swimmer.racePerformances.dates.length : 0;
    const dataCount = swimmer.wellbeing.dates.length + swimmer.training.dates.length + 
                     swimmer.performance.dates.length + swimmer.medical.dates.length + raceCount;
    
    return `
        <tr>
            <td><strong>${swimmer.name}</strong></td>
            <td>${swimmer.age}</td>
            <td>${swimmer.specialty}</td>
            <td>${dataCount}</td>
            <td><span class="badge ${getBadgeClass(overallStatus.status)}">${overallStatus.message}</span></td>
            <td>
                <button class="btn btn-primary" onclick="selectSwimmer('${swimmer.id}')" style="padding: 6px 12px; margin-right: 5px;">Voir</button>
                <button class="btn btn-secondary edit-swimmer-btn" data-swimmer-id="${swimmer.id}" style="padding: 6px 12px;">✏️</button>
            </td>
        </tr>
    `;
}

function selectSwimmer(swimmerId) {
    currentSwimmerId = swimmerId;
    athleteSelector.value = swimmerId;
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    if (viewHistoryBtn) {
        viewHistoryBtn.style.display = swimmerId ? 'block' : 'none';
    }
    updateActionButtons();
    updateDashboard();
}

function generateQuickStats(data, type) {
    if (!data.dates || data.dates.length === 0) {
        return '<p class="stat-label">Aucune donnée disponible</p>';
    }
    
    const lastIndex = data.dates.length - 1;
    const lastDate = data.dates[lastIndex];
    
    switch(type) {
        case 'wellbeing':
            return `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${data.sleep[lastIndex]}/5</span>
                        <span class="stat-label">Sommeil</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${data.fatigue[lastIndex]}/5</span>
                        <span class="stat-label">Fatigue</span>
                    </div>
                </div>
                <p class="stat-label" style="margin-top: 10px;">Dernière entrée: ${formatDate(lastDate)}</p>
            `;
            
        case 'training':
            return `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${data.volume[lastIndex]}</span>
                        <span class="stat-label">Volume (min)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${data.rpe[lastIndex]}/10</span>
                        <span class="stat-label">RPE</span>
                    </div>
                </div>
                <p class="stat-label" style="margin-top: 10px;">Dernière entrée: ${formatDate(lastDate)}</p>
            `;
            
        case 'performance':
            return `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${data.vma[lastIndex]}</span>
                        <span class="stat-label">VMA 6min</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${data.shoulderStrength[lastIndex]}</span>
                        <span class="stat-label">Force (kg)</span>
                    </div>
                </div>
                <p class="stat-label" style="margin-top: 10px;">Dernière entrée: ${formatDate(lastDate)}</p>
            `;
            
        case 'medical':
            return `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${data.availability[lastIndex]}/3</span>
                        <span class="stat-label">Disponibilité</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${data.injuries[lastIndex]}</span>
                        <span class="stat-label">Blessures</span>
                    </div>
                </div>
                <p class="stat-label" style="margin-top: 10px;">Dernière entrée: ${formatDate(lastDate)}</p>
            `;
            
        case 'race':
            if (!data.dates || data.dates.length === 0) {
                return '<p class="stat-label">Aucune course enregistrée</p>';
            }
            
            let firstRace = '-';
            if (data.races && data.races[lastIndex] && data.races[lastIndex].length > 0) {
                const first = data.races[lastIndex][0];
                firstRace = `${first.style} ${first.distance}: ${first.time}`;
            }
            
            return `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${data.dates.length}</span>
                        <span class="stat-label">Courses</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${data.races && data.races[lastIndex] ? data.races[lastIndex].length : 0}</span>
                        <span class="stat-label">Nages</span>
                    </div>
                </div>
                <p class="stat-label" style="margin-top: 10px;">${firstRace}</p>
                <p class="stat-label">Événement: ${data.event[lastIndex]}</p>
                <p class="stat-label">Date: ${formatDate(lastDate)}</p>
            `;
            
        default:
            return '<p>Type inconnu</p>';
    }
}

function getBadgeClass(status) {
    const classes = {
        'excellent': 'badge-good',
        'good': 'badge-good',
        'warning': 'badge-ok',
        'poor': 'badge-poor',
        'no_data': 'badge'
    };
    return classes[status] || 'badge';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// =============================================
// GRAPHIQUES PERFORMANCES DE COURSE
// =============================================

function generateRecommendationsSection(analysis) {
    let html = '';
    
    // Recommandations techniques détaillées
    if (analysis.technical && analysis.technical.recommendations && analysis.technical.recommendations.length > 0) {
        html += `<div class="card" style="margin-bottom: 20px;">
            <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h3 class="card-title">🎯 Recommandations Techniques</h3>
            </div>
            <div class="card-content">`;
        
        analysis.technical.recommendations.forEach(rec => {
            const bgColor = rec.type === 'success' ? '#d4edda' : 
                           rec.type === 'warning' ? '#fff3cd' : 
                           rec.type === 'alert' ? '#f8d7da' : 
                           rec.type === 'priority' ? '#f5c6cb' : '#d1ecf1';
            
            const borderColor = rec.type === 'success' ? '#28a745' : 
                               rec.type === 'warning' ? '#ffc107' : 
                               rec.type === 'alert' ? '#dc3545' : 
                               rec.type === 'priority' ? '#c82333' : '#17a2b8';
            
            html += `<div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; margin: 10px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">
                    ${rec.icon} ${rec.title}
                </h4>
                <p style="margin: 5px 0; color: #555;">${rec.message}</p>
                <p style="margin: 8px 0 0 0; padding: 10px; background: rgba(255,255,255,0.6); border-radius: 4px; font-style: italic; font-size: 14px;">
                    💡 <strong>Action:</strong> ${rec.action}
                </p>
            </div>`;
        });
        
        html += `</div></div>`;
    }
    
    // Recommandations sur la présence
    if (analysis.attendance && analysis.attendance.recommendations && analysis.attendance.recommendations.length > 0) {
        html += `<div class="card" style="margin-bottom: 20px;">
            <div class="card-header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                <h3 class="card-title">✅ Recommandations Présence</h3>
            </div>
            <div class="card-content">
                <ul style="margin: 0; padding-left: 20px;">`;
        
        analysis.attendance.recommendations.forEach(rec => {
            html += `<li style="margin: 10px 0; font-size: 14px;">${rec}</li>`;
        });
        
        html += `</ul></div></div>`;
    }
    
    // Recommandations générales
    const generalRecs = analysis.recommendations.filter(rec => typeof rec === 'string');
    if (generalRecs.length > 0) {
        html += `<div class="card">
            <div class="card-header">
                <h3 class="card-title">📋 Recommandations Générales</h3>
            </div>
            <div class="card-content">
                <ul style="margin: 0; padding-left: 20px;">`;
        
        generalRecs.slice(0, 5).forEach(rec => {
            html += `<li style="margin: 10px 0; font-size: 14px;">${rec}</li>`;
        });
        
        html += `</ul></div></div>`;
    }
    
    // Si aucune recommandation
    if (!html) {
        html = `<div class="feedback-box" style="text-align: center; padding: 40px;">
            <p style="font-size: 18px; color: #28a745;">✨ Excellent travail !</p>
            <p>Continuez sur cette lancée et maintenez votre régularité.</p>
        </div>`;
    }
    
    return html;
}

function generateRacePerformanceCharts(swimmer) {
    if (!swimmer.racePerformances || !swimmer.racePerformances.races || swimmer.racePerformances.races.length === 0) {
        return '';
    }
    
    // Organiser les données par style et distance
    const raceData = organizeRaceData(swimmer.racePerformances);
    
    // Générer un graphique pour chaque style de nage
    const styles = ['Crawl', 'Dos', 'Brasse', 'Papillon'];
    let chartsHtml = '<div class="section"><h3 class="section-title">📈 Évolution des Performances par Style</h3>';
    
    styles.forEach(style => {
        if (raceData[style] && Object.keys(raceData[style]).length > 0) {
            chartsHtml += `
                <div class="card" style="margin-bottom: 20px;">
                    <div class="card-header">
                        <h3 class="card-title">Style: ${style}</h3>
                    </div>
                    <div class="card-content">
                        <canvas id="chart-race-${style.toLowerCase()}" style="max-height: 300px;"></canvas>
                    </div>
                </div>
            `;
        }
    });
    
    chartsHtml += '</div>';
    
    // Créer les graphiques après le rendu
    setTimeout(() => {
        styles.forEach(style => {
            if (raceData[style] && Object.keys(raceData[style]).length > 0) {
                createRaceChart(style, raceData[style], swimmer.racePerformances.dates);
            }
        });
    }, 100);
    
    return chartsHtml;
}

function organizeRaceData(racePerformances) {
    const organized = {
        'Crawl': {},
        'Dos': {},
        'Brasse': {},
        'Papillon': {}
    };
    
    racePerformances.races.forEach((raceArray, index) => {
        raceArray.forEach(race => {
            const style = race.style;
            const distance = race.distance;
            
            if (organized[style]) {
                if (!organized[style][distance]) {
                    organized[style][distance] = [];
                }
                organized[style][distance].push({
                    time: race.time,
                    dateIndex: index
                });
            }
        });
    });
    
    return organized;
}

function createRaceChart(style, styleData, dates) {
    const canvasId = `chart-race-${style.toLowerCase()}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Détruire le graphique existant s'il y en a un
    if (window[`raceChart${style}`]) {
        window[`raceChart${style}`].destroy();
    }
    
    // Préparer les datasets pour chaque distance
    const datasets = [];
    const colors = {
        '50m': '#3b82f6',
        '100m': '#10b981',
        '200m': '#f59e0b',
        '400m': '#ef4444',
        '800m': '#8b5cf6',
        '1500m': '#ec4899'
    };
    
    Object.keys(styleData).forEach(distance => {
        const distanceData = styleData[distance];
        
        datasets.push({
            label: distance,
            data: distanceData.map(d => ({
                x: dates[d.dateIndex],
                y: convertTimeToSeconds(d.time)
            })),
            borderColor: colors[distance] || '#6b7280',
            backgroundColor: (colors[distance] || '#6b7280') + '33',
            borderWidth: 2,
            tension: 0.1,
            fill: false
        });
    });
    
    window[`raceChart${style}`] = new Chart(ctx, {
        type: 'line',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatSecondsToTime(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'dd/MM/yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temps (secondes)'
                    },
                    reverse: true,
                    ticks: {
                        callback: function(value) {
                            return formatSecondsToTime(value);
                        }
                    }
                }
            }
        }
    });
}

// =============================================
// ANALYSE DU SUIVI TECHNIQUE
// =============================================

function analyzeTechnical(technical) {
    if (!technical || Object.keys(technical).length === 0) {
        return {
            status: 'no_data',
            message: 'Aucune donnée technique',
            recommendations: ['Commencer à enregistrer des évaluations techniques pour suivre la progression']
        };
    }
    
    const categories = ['crawl', 'breaststroke', 'backstroke', 'butterfly', 'medley', 'startsAndTurns'];
    const categoryStats = {};
    let totalEvaluations = 0;
    const strengths = [];
    const weaknesses = [];
    const improvements = [];
    const recentProgress = [];
    
    categories.forEach(category => {
        if (!technical[category] || !technical[category].dates || technical[category].dates.length === 0) {
            return;
        }
        
        const catData = technical[category];
        const fields = Object.keys(catData).filter(key => 
            key !== 'dates' && 
            key !== 'pointsForts' && 
            key !== 'pointsAmeliorer' && 
            key !== 'exercicesRecommandes' &&
            key !== 'pointsFortsParNage' &&
            key !== 'transitionsAmeliorer' &&
            key !== 'strategieRecommandee' &&
            key !== 'repartitionEffort' &&
            key !== 'pointsFortsTechniques' &&
            key !== 'tempsReaction' &&
            key !== 'efficaciteCoulees' &&
            key !== 'exercicesAmelioration'
        );
        
        const lastIndex = catData.dates.length - 1;
        
        let categoryAvg = 0;
        let fieldCount = 0;
        const fieldAverages = {};
        const fieldTrends = {};
        
        fields.forEach(field => {
            if (catData[field] && catData[field].length > 0) {
                const values = catData[field].filter(v => v !== null && !isNaN(v));
                if (values.length === 0) return;
                
                const lastValue = values[values.length - 1];
                const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
                
                fieldAverages[field] = {
                    last: lastValue,
                    average: avgValue.toFixed(2),
                    trend: values.length >= 2 ? calculateTrend(values) : 0
                };
                
                categoryAvg += lastValue;
                fieldCount++;
                
                // Détecter forces et faiblesses (échelle 1-10)
                if (lastValue >= 8) {
                    strengths.push({
                        category: getCategoryName(category),
                        field: getFieldName(field),
                        score: lastValue
                    });
                } else if (lastValue <= 4) {
                    weaknesses.push({
                        category: getCategoryName(category),
                        field: getFieldName(field),
                        score: lastValue
                    });
                }
                
                // Détecter améliorations significatives
                if (values.length >= 2) {
                    const previousValue = values[values.length - 2];
                    const improvement = lastValue - previousValue;
                    
                    if (improvement >= 2) {
                        improvements.push({
                            category: getCategoryName(category),
                            field: getFieldName(field),
                            progress: improvement,
                            from: previousValue,
                            to: lastValue
                        });
                    }
                    
                    // Progression récente (3 dernières mesures)
                    if (values.length >= 3) {
                        const recent = values.slice(-3);
                        const recentTrend = calculateTrend(recent);
                        if (Math.abs(recentTrend) > 0.3) {
                            recentProgress.push({
                                category: getCategoryName(category),
                                field: getFieldName(field),
                                trend: recentTrend > 0 ? 'up' : 'down',
                                value: Math.abs(recentTrend).toFixed(2)
                            });
                        }
                    }
                }
            }
        });
        
        if (fieldCount > 0) {
            const avgScore = (categoryAvg / fieldCount).toFixed(2);
            
            // Récupérer les observations textuelles de la dernière évaluation
            const observations = {
                pointsForts: catData.pointsForts?.[lastIndex] || catData.pointsFortsParNage?.[lastIndex] || catData.pointsFortsTechniques?.[lastIndex] || '',
                pointsAmeliorer: catData.pointsAmeliorer?.[lastIndex] || catData.transitionsAmeliorer?.[lastIndex] || '',
                exercices: catData.exercicesRecommandes?.[lastIndex] || catData.exercicesAmelioration?.[lastIndex] || ''
            };
            
            categoryStats[category] = {
                name: getCategoryName(category),
                average: avgScore,
                evaluations: catData.dates.length,
                lastDate: catData.dates[lastIndex],
                fields: fieldAverages,
                observations: observations,
                status: avgScore >= 8 ? 'excellent' : avgScore >= 6 ? 'good' : avgScore >= 4 ? 'warning' : 'poor'
            };
            totalEvaluations += catData.dates.length;
        }
    });
    
    // Déterminer le statut global
    let status = 'good';
    const avgScores = Object.values(categoryStats).map(c => parseFloat(c.average));
    const overallAvg = avgScores.length > 0 ? avgScores.reduce((a, b) => a + b, 0) / avgScores.length : 0;
    
    if (overallAvg >= 8) {
        status = 'excellent';
    } else if (overallAvg <= 4) {
        status = 'poor';
    } else if (overallAvg < 6 || weaknesses.length > strengths.length) {
        status = 'warning';
    }
    
    // Générer des recommandations personnalisées
    const recommendations = generateTechnicalRecommendations(
        categoryStats, 
        strengths, 
        weaknesses, 
        improvements,
        recentProgress
    );
    
    return {
        status,
        overallAverage: overallAvg.toFixed(2),
        categoryStats,
        strengths: strengths.slice(0, 5),
        weaknesses: weaknesses.slice(0, 5),
        improvements: improvements.slice(0, 5),
        recentProgress: recentProgress.slice(0, 5),
        totalEvaluations,
        recommendations
    };
}

function generateTechnicalRecommendations(categoryStats, strengths, weaknesses, improvements, recentProgress) {
    const recommendations = [];
    
    // Recommandations basées sur les améliorations
    if (improvements.length > 0) {
        improvements.sort((a, b) => b.progress - a.progress);
        const best = improvements[0];
        recommendations.push({
            type: 'success',
            icon: '🎉',
            title: 'Excellente progression détectée',
            message: `${best.category} - ${best.field} : progression de ${best.from}/10 à ${best.to}/10 (+${best.progress} points)`,
            action: 'Continuez sur cette lancée et consolidez ces acquis'
        });
    }
    
    // Recommandations basées sur les points forts
    if (strengths.length > 0) {
        strengths.sort((a, b) => b.score - a.score);
        const topStrengths = strengths.slice(0, 3).map(s => `${s.field} (${s.score}/10)`).join(', ');
        recommendations.push({
            type: 'info',
            icon: '💪',
            title: 'Points forts identifiés',
            message: topStrengths,
            action: 'Exploitez ces forces en compétition et servez-vous en pour progresser sur d\'autres aspects'
        });
    }
    
    // Recommandations prioritaires basées sur les faiblesses
    if (weaknesses.length > 0) {
        weaknesses.sort((a, b) => a.score - b.score);
        const critical = weaknesses[0];
        
        recommendations.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Point critique à travailler',
            message: `${critical.category} - ${critical.field} : ${critical.score}/10`,
            action: generateSpecificExercise(critical.category, critical.field)
        });
        
        // Si plusieurs faiblesses
        if (weaknesses.length >= 3) {
            recommendations.push({
                type: 'warning',
                icon: '🎯',
                title: 'Plan d\'amélioration nécessaire',
                message: `${weaknesses.length} aspects nécessitent une attention particulière`,
                action: 'Établir un programme d\'entraînement ciblé sur 4-6 semaines avec focus sur ces points'
            });
        }
    }
    
    // Recommandations basées sur la progression récente
    const upwardTrends = recentProgress.filter(p => p.trend === 'up');
    const downwardTrends = recentProgress.filter(p => p.trend === 'down');
    
    if (downwardTrends.length > 2) {
        recommendations.push({
            type: 'alert',
            icon: '📉',
            title: 'Baisse de performance détectée',
            message: `${downwardTrends.length} aspects en régression récente`,
            action: 'Vérifier la fatigue, la technique et ajuster le programme d\'entraînement'
        });
    }
    
    if (upwardTrends.length >= 3) {
        recommendations.push({
            type: 'success',
            icon: '📈',
            title: 'Progression constante',
            message: `${upwardTrends.length} aspects en amélioration continue`,
            action: 'Excellente dynamique ! Maintenez l\'intensité et la régularité'
        });
    }
    
    // Analyse par catégorie
    const categoryArray = Object.values(categoryStats);
    if (categoryArray.length > 0) {
        const bestCategory = categoryArray.reduce((max, cat) => 
            parseFloat(cat.average) > parseFloat(max.average) ? cat : max
        );
        const worstCategory = categoryArray.reduce((min, cat) => 
            parseFloat(cat.average) < parseFloat(min.average) ? cat : min
        );
        
        // Si une nage est significativement plus faible
        if (parseFloat(worstCategory.average) < 5 && categoryArray.length > 1) {
            recommendations.push({
                type: 'priority',
                icon: '🏊',
                title: `Focus sur ${worstCategory.name}`,
                message: `Moyenne de ${worstCategory.average}/10 - nettement en dessous des autres nages`,
                action: generateCategoryPlan(worstCategory.name)
            });
        }
        
        // Si une nage est excellente
        if (parseFloat(bestCategory.average) >= 8.5) {
            recommendations.push({
                type: 'success',
                icon: '🏆',
                title: `Excellence en ${bestCategory.name}`,
                message: `Moyenne de ${bestCategory.average}/10 - niveau compétitif atteint`,
                action: 'Utilisez cette nage comme référence technique pour les autres styles'
            });
        }
    }
    
    // Recommandations générales si peu de données
    if (Object.keys(categoryStats).length <= 2) {
        recommendations.push({
            type: 'info',
            icon: '📊',
            title: 'Élargir l\'évaluation',
            message: 'Seulement quelques catégories évaluées',
            action: 'Effectuer des évaluations sur toutes les nages pour un suivi complet'
        });
    }
    
    return recommendations;
}

function generateSpecificExercise(category, field) {
    const exercises = {
        'crawl': {
            'alignementCorporel': 'Exercice du Superman : nager avec un bras le long du corps, alterner tous les 25m',
            'rotationEpaules': 'Nage avec planche latérale : 6 battements sur le côté, puis une traction',
            'entreeDansEau': 'Exercice de la fermeture éclair : main glisse le long du corps avant l\'entrée',
            'phaseTraction': 'Nage avec palettes : 8x50m en se concentrant sur la phase de traction',
            'amplitudeBattement': 'Battements avec palmes courtes : 10x25m pour développer l\'amplitude',
            'techniqueRespiration': 'Respiration tous les 3 temps : améliorer la coordination bilatérale'
        },
        'breaststroke': {
            'mouvementEcartement': 'Écartement avec planche : isoler le mouvement des bras',
            'coordinationBrasJambes': 'Brasse 2 temps (2 mouvements de bras, 1 de jambes)',
            'phaseGlisse': 'Brasse avec temps de glisse prolongé : 3 secondes minimum',
            'positionGenoux': 'Battements de brasse au mur : focus sur la position des genoux'
        },
        'backstroke': {
            'flottaisonHorizontale': 'Exercice de la flèche dorsale : 8x15m en position streamline',
            'orientationLigne': 'Nage avec repères visuels : regarder les drapeaux et les lignes',
            'approcheMur': 'Virages dos : 10 répétitions en comptant les mouvements',
            'continuiteMouvement': 'Rattrapage dos : maintenir un bras devant en permanence'
        },
        'butterfly': {
            'mouvementOndulatoire': 'Ondulations sans bras : 10x15m en position streamline',
            'coordinationTeteBuste': 'Papillon un bras : alterner bras droit/gauche tous les 25m',
            'amplitudeBattement': 'Double battement avec planche : isoler le travail des jambes',
            'timingRespiration': 'Papillon 3-5 temps : respirer tous les 3 ou 5 mouvements'
        },
        'medley': {
            'transitionsNages': 'Enchaînement 4 nages 4x100m : travailler spécifiquement les transitions',
            'energieManagement': 'Test 200m 4 nages : établir les temps de passage par nage',
            'viragePapillonDos': 'Virages papillon-dos isolés : 15 répétitions'
        },
        'startsAndTurns': {
            'positionDepart': 'Départs sur plot : 10 répétitions avec analyse vidéo',
            'trajectoire': 'Départs avec marquage : viser un point précis à 5m',
            'rotationCrawl': 'Virages culbute : 20 répétitions avec focus sur la rotation',
            'couleeApresVirageCrawl': 'Coulées chronométrées : viser 7-8m minimum',
            'battementUnderwater': 'Battements dauphins underwater : 10x15m'
        }
    };
    
    const categoryExercises = exercises[category.toLowerCase().replace(' ', '')];
    if (categoryExercises && categoryExercises[field]) {
        return categoryExercises[field];
    }
    
    return 'Consulter l\'entraîneur pour un programme personnalisé sur cet aspect';
}

function generateCategoryPlan(categoryName) {
    const plans = {
        'Crawl': 'Plan 4 semaines : Séances techniques 3x/semaine avec focus rotation et traction. Vidéo tous les 10 jours.',
        'Brasse': 'Plan 4 semaines : Travail de coordination et timing. Exercices éducatifs quotidiens (10 min).',
        'Dos': 'Plan 4 semaines : Orientation et virages. Exercices de flottaison et travail spécifique de coulée.',
        'Papillon': 'Plan 4 semaines : Ondulation et timing respiratoire. Progression : 1 bras → papillon complet.',
        '4 Nages': 'Plan 6 semaines : Focus sur nages faibles + transitions. Chrono par nage chaque semaine.',
        'Départs et Virages': 'Plan 3 semaines : Technique de départ 2x/semaine + virages chaque séance. Chronométrage systématique.'
    };
    
    return plans[categoryName] || 'Établir un programme spécifique avec l\'entraîneur';
}

function getCategoryName(category) {
    const names = {
        crawl: 'Crawl',
        backstroke: 'Dos',
        breaststroke: 'Brasse',
        butterfly: 'Papillon',
        medley: '4 Nages',
        startsAndTurns: 'Départs et Virages'
    };
    return names[category] || category;
}

function getFieldName(field) {
    const names = {
        // Crawl
        alignementCorporel: 'Alignement corporel',
        rotationEpaules: 'Rotation des épaules',
        stabiliteHanches: 'Stabilité des hanches',
        flottaison: 'Flottaison',
        entreeDansEau: 'Entrée dans l\'eau',
        phaseTraction: 'Phase de traction',
        phasePoussee: 'Phase de poussée',
        retourAerien: 'Retour aérien',
        longueurMouvement: 'Longueur du mouvement',
        amplitudeBattement: 'Amplitude du battement',
        frequenceBattement: 'Fréquence du battement',
        flexibiliteChevilles: 'Flexibilité des chevilles',
        coordinationBras: 'Coordination avec les bras',
        techniqueRespiration: 'Technique de respiration',
        timingRespiration: 'Timing de la respiration',
        rythmeNage: 'Rythme de nage',
        coordinationGlobale: 'Coordination globale',
        
        // Brasse
        alignementHorizontal: 'Alignement horizontal',
        positionTete: 'Position de la tête',
        stabiliteTronc: 'Stabilité du tronc',
        mouvementEcartement: 'Mouvement d\'écartement',
        mouvementTraction: 'Mouvement de traction',
        mouvementRetour: 'Mouvement de retour',
        synchronisationBrasRespiration: 'Synchronisation bras-respiration',
        positionGenoux: 'Position des genoux',
        mouvementCiseaux: 'Mouvement de ciseaux',
        flexionChevilles: 'Flexion des chevilles',
        puissancePropulsion: 'Puissance de propulsion',
        coordinationBrasJambes: 'Coordination bras-jambes',
        phaseGlisse: 'Phase de glisse',
        fluiditeMouvement: 'Fluidité du mouvement',
        
        // Dos
        flottaisonHorizontale: 'Flottaison horizontale',
        positionHanches: 'Position des hanches',
        stabiliteTete: 'Stabilité de la tête',
        alignmentGeneral: 'Alignment général',
        phaseSousMarine: 'Phase sous-marine',
        continuiteMouvement: 'Continuité du mouvement',
        surfacePieds: 'Surface des pieds',
        regulariteRespiratoire: 'Régularité respiratoire',
        orientationLigne: 'Orientation dans la ligne',
        consciencePosition: 'Conscience de la position',
        approcheMur: 'Approche du mur',
        rotation: 'Rotation',
        impulsion: 'Impulsion',
        couleeApresVirage: 'Coulée après virage',
        
        // Papillon
        mouvementOndulatoire: 'Mouvement ondulatoire',
        coordinationTeteBuste: 'Coordination tête-buste',
        fluiditeOndulation: 'Fluidité de l\'ondulation',
        amplitudeMouvement: 'Amplitude du mouvement',
        puissanceBattement: 'Puissance du battement',
        synchronisation: 'Synchronisation',
        hauteurTete: 'Hauteur de la tête',
        retourRapide: 'Retour rapide',
        uniteMouvement: 'Unité du mouvement',
        rythme: 'Rythme',
        energieDepensee: 'Énergie dépensée',
        
        // 4 Nages
        transitionsNages: 'Transitions entre nages',
        rythmeGlobal: 'Rythme global',
        energieManagement: 'Énergie management',
        strategieCourse: 'Stratégie de course',
        techniquePapillon: 'Technique papillon',
        conservationEnergie: 'Conservation d\'énergie',
        techniqueDos: 'Technique dos',
        transitionPapillonDos: 'Transition papillon→dos',
        techniqueBrasse: 'Technique brasse',
        transitionDosBrasse: 'Transition dos→brasse',
        techniqueCrawl: 'Technique crawl',
        transitionBrasseCrawl: 'Transition brasse→crawl',
        finCourse: 'Fin de course',
        viragePapillonDos: 'Virage papillon→dos',
        virageDosBrasse: 'Virage dos→brasse',
        virageBrasseCrawl: 'Virage brasse→crawl',
        
        // Départs et Virages
        positionDepart: 'Position de départ',
        trajectoire: 'Trajectoire',
        profondeur: 'Profondeur',
        distance: 'Distance',
        positionCorps: 'Position du corps',
        battementUnderwater: 'Battement underwater',
        approcheMurCrawl: 'Approche du mur (crawl)',
        rotationCrawl: 'Rotation (crawl)',
        appuiPiedsCrawl: 'Appui des pieds (crawl)',
        impulsionCrawl: 'Impulsion (crawl)',
        couleeApresVirageCrawl: 'Coulée après virage (crawl)',
        approcheMurBrasse: 'Approche du mur (brasse)',
        toucherSimultane: 'Toucher simultané',
        rotationBrasse: 'Rotation (brasse)',
        impulsionBrasse: 'Impulsion (brasse)',
        approcheMurArrivee: 'Approche du mur (arrivée)',
        toucherFinal: 'Toucher final',
        vitesseMaintenue: 'Vitesse maintenue'
    };
    return names[field] || field;
}

// =============================================
// ANALYSE DE LA PRÉSENCE
// =============================================

function analyzeAttendance(attendance) {
    if (!attendance.records || attendance.records.length === 0) {
        return { 
            status: 'no_data', 
            message: 'Aucune donnée de présence',
            presentRate: 0,
            lateRate: 0,
            absentRate: 0,
            unjustifiedAbsences: 0
        };
    }
    
    const totalRecords = attendance.records.length;
    const presentCount = attendance.records.filter(r => r.status === 'present').length;
    const lateCount = attendance.records.filter(r => r.status === 'late').length;
    const absentCount = attendance.records.filter(r => r.status === 'absent').length;
    const unjustifiedCount = attendance.records.filter(r => 
        r.status === 'absent' && r.justified === 'no'
    ).length;
    
    const presentRate = ((presentCount / totalRecords) * 100).toFixed(1);
    const lateRate = ((lateCount / totalRecords) * 100).toFixed(1);
    const absentRate = ((absentCount / totalRecords) * 100).toFixed(1);
    
    // Déterminer le statut
    let status = 'good';
    if (presentRate < 75 || unjustifiedCount > 3) {
        status = 'poor';
    } else if (presentRate < 85 || unjustifiedCount > 1) {
        status = 'warning';
    }
    
    return {
        status,
        totalRecords,
        presentCount,
        lateCount,
        absentCount,
        presentRate: parseFloat(presentRate),
        lateRate: parseFloat(lateRate),
        absentRate: parseFloat(absentRate),
        unjustifiedAbsences: unjustifiedCount
    };
}

// ✅ NOUVELLE FONCTION - Analyse complète des sessions avec RPE
function analyzeSessions(sessionData) {
    if (!sessionData || sessionData.length === 0) {
        return {
            status: 'no_data',
            message: 'Aucune session d\'entraînement enregistrée',
            recommendations: ['Commencer à enregistrer les sessions détaillées']
        };
    }
    
    // ✅ INDICATEUR 1: Volume moyen par session
    const avgVolume = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.totalVolume || 0);
    }, 0) / sessionData.length;
    
    // ✅ INDICATEUR 2: Durée moyenne par session
    const avgDuration = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.totalDuration || 0);
    }, 0) / sessionData.length;
    
    // ✅ INDICATEUR 3: Intensité moyenne (m/min)
    const avgIntensity = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.avgIntensity || 0);
    }, 0) / sessionData.length;
    
    // ✅ NOUVEAU - INDICATEUR 4: RPE moyen global
    const avgRPE = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.avgRPE || 0);
    }, 0) / sessionData.length;
    
    // ✅ NOUVEAU - INDICATEUR 5: Charge d'entraînement moyenne (Volume × RPE)
    const avgTrainingLoad = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.trainingLoad || 0);
    }, 0) / sessionData.length;
    
    // ✅ NOUVEAU - INDICATEUR 6: Monotonie (écart-type des charges)
    const trainingLoads = sessionData.map(s => s.indicators?.trainingLoad || 0);
    const chargeStdDev = calculateStandardDeviation(trainingLoads);
    const monotony = chargeStdDev > 0 && avgTrainingLoad > 0 ? (avgTrainingLoad / chargeStdDev).toFixed(2) : 0;
    
    // ✅ NOUVEAU - INDICATEUR 7: Strain (charge totale sur période)
    const totalStrain = trainingLoads.reduce((sum, load) => sum + load, 0);
    
    // ✅ INDICATEUR 8: Répartition moyenne des phases
    const avgWarmUpPercent = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.warmUpPercent || 0);
    }, 0) / sessionData.length;
    
    const avgMainSetPercent = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.mainSetPercent || 0);
    }, 0) / sessionData.length;
    
    const avgCoolDownPercent = sessionData.reduce((sum, s) => {
        return sum + (s.indicators?.coolDownPercent || 0);
    }, 0) / sessionData.length;
    
    // ✅ INDICATEUR 9: Progression volume (compare 3 dernières vs 3 précédentes)
    let volumeTrend = 0;
    if (sessionData.length >= 6) {
        const recent = sessionData.slice(-3);
        const previous = sessionData.slice(-6, -3);
        
        const recentAvg = recent.reduce((sum, s) => sum + (s.indicators?.totalVolume || 0), 0) / recent.length;
        const previousAvg = previous.reduce((sum, s) => sum + (s.indicators?.totalVolume || 0), 0) / previous.length;
        
        if (previousAvg > 0) {
            volumeTrend = ((recentAvg - previousAvg) / previousAvg) * 100;
        }
    }
    
    // ✅ DÉTERMINER STATUT basé sur RPE et équilibre
    let status = 'good';
    
    // Vérifier RPE (alerte si trop élevé)
    if (avgRPE > 8.5) {
        status = 'warning'; // RPE très élevé = fatigue excessive
    } else if (avgRPE < 4.0) {
        status = 'warning'; // RPE trop faible = intensité insuffisante
    }
    
    // Vérifier monotonie (alerte si > 2.0)
    if (parseFloat(monotony) > 2.0) {
        status = 'poor'; // Monotonie élevée = risque de blessure
    }
    
    // Vérifier équilibre des phases
    if (avgWarmUpPercent < 10 || avgWarmUpPercent > 25) {
        status = 'warning';
    }
    if (avgMainSetPercent < 60 || avgMainSetPercent > 85) {
        status = 'warning';
    }
    if (avgCoolDownPercent < 5 || avgCoolDownPercent > 15) {
        status = 'warning';
    }
    
    // Vérifier intensité
    if (avgIntensity < 30 || avgIntensity > 60) {
        status = 'warning';
    }
    
    // Si tout est optimal
    if (status === 'good' && sessionData.length >= 10 && avgRPE >= 5.5 && avgRPE <= 7.5 && parseFloat(monotony) < 1.5) {
        status = 'excellent';
    }
    
    // ✅ GÉNÉRER RECOMMANDATIONS avec RPE
    const recommendations = generateSessionRecommendations(
        avgWarmUpPercent,
        avgMainSetPercent,
        avgCoolDownPercent,
        avgIntensity,
        avgRPE,
        avgTrainingLoad,
        monotony,
        volumeTrend,
        sessionData.length
    );
    
    return {
        status,
        totalSessions: sessionData.length,
        avgVolume: Math.round(avgVolume),
        avgDuration: Math.round(avgDuration),
        avgIntensity: avgIntensity.toFixed(1),
        avgRPE: avgRPE.toFixed(1),
        avgTrainingLoad: Math.round(avgTrainingLoad),
        monotony: parseFloat(monotony),
        totalStrain: Math.round(totalStrain),
        avgWarmUpPercent: avgWarmUpPercent.toFixed(1),
        avgMainSetPercent: avgMainSetPercent.toFixed(1),
        avgCoolDownPercent: avgCoolDownPercent.toFixed(1),
        volumeTrend: volumeTrend.toFixed(1),
        lastSession: lastSession,
        recommendations: recommendations
    };
}

// ✅ Générer recommandations pour les sessions avec RPE
function generateSessionRecommendations(warmUp, mainSet, coolDown, intensity, avgRPE, avgLoad, monotony, trend, count) {
    const recs = [];
    
    // ✅ NOUVEAU - Recommandations RPE
    if (avgRPE < 4.0) {
        recs.push("⚠️ RPE moyen faible (" + avgRPE.toFixed(1) + "/10). Augmenter l'intensité des séances pour progresser.");
    } else if (avgRPE > 8.5) {
        recs.push("🔴 RPE moyen élevé (" + avgRPE.toFixed(1) + "/10). Risque de surmenage. Intégrer plus de récupération.");
    } else if (avgRPE >= 6.0 && avgRPE <= 7.5) {
        recs.push("✅ RPE optimal (" + avgRPE.toFixed(1) + "/10). Bonne gestion de l'intensité.");
    }
    
    // ✅ NOUVEAU - Recommandations charge d'entraînement
    if (avgLoad > 30000) {
        recs.push("⚡ Charge d'entraînement élevée (" + Math.round(avgLoad) + "). Surveiller signes de fatigue.");
    } else if (avgLoad < 10000) {
        recs.push("💡 Charge d'entraînement modérée (" + Math.round(avgLoad) + "). Peut être augmentée progressivement.");
    }
    
    // ✅ NOUVEAU - Recommandations monotonie
    if (parseFloat(monotony) > 2.0) {
        recs.push("🔴 Monotonie élevée (" + monotony + "). DANGER: Varier les séances pour réduire risque de blessure!");
    } else if (parseFloat(monotony) > 1.5) {
        recs.push("⚠️ Monotonie modérée (" + monotony + "). Diversifier davantage les entraînements.");
    } else if (parseFloat(monotony) < 1.2) {
        recs.push("✅ Excellente variété d'entraînement (monotonie: " + monotony + ").");
    }
    
    // Recommandations sur la structure
    if (warmUp < 10) {
        recs.push("⚠️ Échauffement insuffisant (" + warmUp.toFixed(1) + "%). Augmenter à 15-20% du volume total.");
    } else if (warmUp > 25) {
        recs.push("💡 Échauffement long (" + warmUp.toFixed(1) + "%). Optimiser pour garder énergie pour corps de séance.");
    } else {
        recs.push("✅ Échauffement bien proportionné (" + warmUp.toFixed(1) + "%).");
    }
    
    if (mainSet < 60) {
        recs.push("⚠️ Corps de séance trop court (" + mainSet.toFixed(1) + "%). Cibler 70-80% du volume.");
    } else if (mainSet > 85) {
        recs.push("⚠️ Corps de séance trop long (" + mainSet.toFixed(1) + "%). Réduire pour meilleure récupération.");
    } else {
        recs.push("✅ Corps de séance optimal (" + mainSet.toFixed(1) + "%).");
    }
    
    if (coolDown < 5) {
        recs.push("⚠️ Retour au calme insuffisant (" + coolDown.toFixed(1) + "%). Minimum 5-10% recommandé.");
    } else {
        recs.push("✅ Retour au calme adéquat (" + coolDown.toFixed(1) + "%).");
    }
    
    // Recommandations sur l'intensité
    if (intensity < 30) {
        recs.push("🐢 Intensité faible (" + intensity.toFixed(1) + " m/min). Envisager augmentation volume ou réduction pauses.");
    } else if (intensity > 60) {
        recs.push("⚡ Intensité très élevée (" + intensity.toFixed(1) + " m/min). Excellent si objectif vitesse, sinon altérer avec séances endurance.");
    } else {
        recs.push("✅ Intensité équilibrée (" + intensity.toFixed(1) + " m/min).");
    }
    
    // Recommandations sur la progression
    if (Math.abs(trend) > 20) {
        if (trend > 0) {
            recs.push("📈 Volume en forte hausse (+" + trend.toFixed(1) + "%). Surveiller récupération et bien-être.");
        } else {
            recs.push("📉 Volume en baisse (" + trend.toFixed(1) + "%). Si intentionnel (affutage), OK. Sinon, vérifier motivation/disponibilité.");
        }
    } else if (trend > 5) {
        recs.push("📈 Progression volume modérée (+" + trend.toFixed(1) + "%). Bonne évolution.");
    } else {
        recs.push("➡️ Volume stable. Maintenir cohérence.");
    }
    
    // Recommandations globales
    if (count < 5) {
        recs.push("📊 Seulement " + count + " session(s) enregistrée(s). Plus de données pour analyse précise.");
    } else if (count >= 20) {
        recs.push("✅ Excellent suivi avec " + count + " sessions! Continuer ce tracking détaillé.");
    }
    
    return recs;
}

function analyzeAttendance(attendance) {
    if (!attendance || !attendance.records || attendance.records.length === 0) {
        return {
            status: 'no_data',
            message: 'Aucune donnée de présence',
            recommendations: ['Commencer à enregistrer la présence pour suivre l\'assiduité']
        };
    }
    
    const records = attendance.records;
    const total = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    
    const presentRate = ((presentCount / total) * 100).toFixed(1);
    const lateRate = ((lateCount / total) * 100).toFixed(1);
    const absentRate = ((absentCount / total) * 100).toFixed(1);
    
    // Analyser les absences justifiées
    const absences = records.filter(r => r.status === 'absent');
    const justifiedAbsences = absences.filter(r => r.justified === 'yes').length;
    const unjustifiedAbsences = absences.filter(r => r.justified === 'no').length;
    
    // Analyser les retards
    const lateRecords = records.filter(r => r.status === 'late');
    const avgLateMinutes = lateRecords.length > 0 
        ? (lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / lateRecords.length).toFixed(0)
        : 0;
    
    // Analyser les 10 dernières séances
    const recentRecords = records.slice(-10);
    const recentAbsences = recentRecords.filter(r => r.status === 'absent').length;
    const recentLate = recentRecords.filter(r => r.status === 'late').length;
    
    // Déterminer le statut
    let status = 'good';
    if (presentRate >= 90 && lateRate < 5) {
        status = 'excellent';
    } else if (presentRate < 70 || unjustifiedAbsences > 2) {
        status = 'poor';
    } else if (presentRate < 80 || recentAbsences > 3) {
        status = 'warning';
    }
    
    // Générer des recommandations
    const recommendations = generateAttendanceRecommendations(
        presentRate,
        lateRate,
        absentRate,
        unjustifiedAbsences,
        recentAbsences,
        recentLate,
        avgLateMinutes
    );
    
    return {
        status,
        total,
        presentCount,
        lateCount,
        absentCount,
        presentRate,
        lateRate,
        absentRate,
        justifiedAbsences,
        unjustifiedAbsences,
        avgLateMinutes,
        recentAbsences,
        recentLate,
        recommendations
    };
}

function generateAttendanceRecommendations(presentRate, lateRate, absentRate, unjustified, recentAbsences, recentLate, avgLateMinutes) {
    const recommendations = [];
    
    if (presentRate >= 95) {
        recommendations.push('🌟 Excellente assiduité ! Continuez ainsi.');
    } else if (presentRate >= 85) {
        recommendations.push('✅ Bonne assiduité générale.');
    } else if (presentRate < 70) {
        recommendations.push('⚠️ Assiduité préoccupante. Un entretien est recommandé.');
    }
    
    if (unjustified > 2) {
        recommendations.push(`❌ ${unjustified} absence(s) non justifiée(s) détectée(s). Justification requise.`);
    }
    
    if (recentAbsences > 3) {
        recommendations.push('📉 Augmentation des absences récentes. Vérifier la motivation et les obstacles.');
    }
    
    if (recentLate > 3) {
        recommendations.push(`⏰ Retards fréquents récents (moyenne: ${avgLateMinutes} min). Discuter de la ponctualité.`);
    }
    
    if (lateRate > 10) {
        recommendations.push('⚠️ Taux de retard élevé. Identifier les causes et trouver des solutions.');
    }
    
    if (presentRate >= 90 && lateRate < 5 && unjustified === 0) {
        recommendations.push('🏆 Comportement exemplaire ! Parfait engagement envers l\'équipe.');
    }
    
    return recommendations;
}

function convertTimeToSeconds(timeString) {
    // Format peut être SS:MS ou MM:SS:MS
    const parts = timeString.split(':');
    
    if (parts.length === 2) {
        // Format SS:MS
        const seconds = parseInt(parts[0]);
        const centiseconds = parseInt(parts[1]);
        return seconds + (centiseconds / 100);
    } else if (parts.length === 3) {
        // Format MM:SS:MS
        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);
        const centiseconds = parseInt(parts[2]);
        return (minutes * 60) + seconds + (centiseconds / 100);
    }
    
    return 0;
}

function formatSecondsToTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centis = Math.floor((seconds % 1) * 100);
    
    if (mins > 0) {
        return `${mins}:${secs.toString().padStart(2, '0')}:${centis.toString().padStart(2, '0')}`;
    } else {
        return `${secs}:${centis.toString().padStart(2, '0')}`;
    }
}

function initializeCharts() {
    // Détruire les charts existants pour éviter les conflits
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
    window.chartInstances = {};
    
    if (!currentSwimmerId) return;
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    console.log('🎨 Initialisation des graphiques pour:', swimmer.name);
    
    // ========================================
    // 1. GRAPHIQUE BIEN-ÊTRE (5 MÉTRIQUES SUBJECTIVES)
    // ========================================
    const wellbeingChartEl = document.getElementById('wellbeingChart');
    if (wellbeingChartEl) {
        const wellbeingData = swimmer.wellbeingData || [];
        if (wellbeingData.length > 0) {
            const recent = wellbeingData.slice(-30); // 30 derniers jours
            window.chartInstances.wellbeingChart = new Chart(wellbeingChartEl, {
                type: 'line',
                data: {
                    labels: recent.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                    datasets: [
                        {
                            label: '🛏️ Qualité Sommeil',
                            data: recent.map(d => d.sleepQuality || d.sleep || 0),
                            borderColor: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 3,
                            pointHoverRadius: 6
                        },
                        {
                            label: '⚡ Niveau Énergie',
                            data: recent.map(d => d.energyLevel || 0),
                            borderColor: '#ffd93d',
                            backgroundColor: 'rgba(255, 217, 61, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 3,
                            pointHoverRadius: 6
                        },
                        {
                            label: '🎯 Motivation',
                            data: recent.map(d => d.motivation || 0),
                            borderColor: '#2196f3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 3,
                            pointHoverRadius: 6
                        },
                        {
                            label: '😰 Stress Perçu',
                            data: recent.map(d => d.stressLevel || d.stress || 0),
                            borderColor: '#e91e63',
                            backgroundColor: 'rgba(233, 30, 99, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 3,
                            pointHoverRadius: 6
                        },
                        {
                            label: '💪 Récupération',
                            data: recent.map(d => d.muscleRecovery || 0),
                            borderColor: '#9c27b0',
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 3,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: { 
                            display: true, 
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 11 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '/10';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            ticks: { 
                                stepSize: 2,
                                font: { size: 11 }
                            },
                            title: { 
                                display: true, 
                                text: 'Score (1-10)',
                                font: { size: 12, weight: 'bold' }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: { size: 10 },
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
            console.log('✅ Wellbeing chart créé');
        }
    }
    
    // ========================================
    // 2. GRAPHIQUE PERFORMANCE (4 MÉTRIQUES)
    // ========================================
    const performanceChartEl = document.getElementById('performanceChart');
    if (performanceChartEl) {
        const perfData = swimmer.performanceData || [];
        if (perfData.length > 0) {
            const recent = perfData.slice(-20);
            window.chartInstances.performanceChart = new Chart(performanceChartEl, {
                type: 'line',
                data: {
                    labels: recent.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                    datasets: [
                        {
                            label: '🏃 VMA (km/h)',
                            data: recent.map(d => d.vma || 0),
                            borderColor: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y1',
                            pointRadius: 4,
                            pointHoverRadius: 7
                        },
                        {
                            label: '🦵 Saut Vertical (cm)',
                            data: recent.map(d => d.legStrength || 0),
                            borderColor: '#2196f3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y2',
                            pointRadius: 4,
                            pointHoverRadius: 7
                        },
                        {
                            label: '💪 Pompes (/min)',
                            data: recent.map(d => d.shoulderStrength || 0),
                            borderColor: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y2',
                            pointRadius: 4,
                            pointHoverRadius: 7
                        },
                        {
                            label: '⏱️ Gainage (sec)',
                            data: recent.map(d => d.coreStrength || 0),
                            borderColor: '#9c27b0',
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y2',
                            pointRadius: 4,
                            pointHoverRadius: 7
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { 
                        mode: 'index', 
                        intersect: false 
                    },
                    plugins: {
                        legend: { 
                            display: true, 
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 11 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { 
                                display: true, 
                                text: 'VMA (km/h)', 
                                color: '#4caf50',
                                font: { size: 12, weight: 'bold' }
                            },
                            ticks: { color: '#4caf50' },
                            grid: {
                                color: 'rgba(76, 175, 80, 0.1)'
                            }
                        },
                        y2: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { 
                                display: true, 
                                text: 'Autres métriques', 
                                color: '#2196f3',
                                font: { size: 12, weight: 'bold' }
                            },
                            ticks: { color: '#2196f3' },
                            grid: { drawOnChartArea: false }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: { size: 10 },
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
            console.log('✅ Performance chart créé');
        }
    }
    
    // ========================================
    // 3. GRAPHIQUE MÉDICAL (État de forme quotidien)
    // ========================================
    const medicalChartEl = document.getElementById('medicalChart');
    if (medicalChartEl) {
        const medicalData = swimmer.medicalData || [];
        const dailyData = medicalData.filter(d => d.type === 'daily');
        
        if (dailyData.length > 0) {
            const recent = dailyData.slice(-30); // 30 derniers jours
            window.chartInstances.medicalChart = new Chart(medicalChartEl, {
                type: 'line',
                data: {
                    labels: recent.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                    datasets: [
                        {
                            label: '💪 État de Forme',
                            data: recent.map(d => d.dailyCondition || 0),
                            borderColor: '#e91e63',
                            backgroundColor: 'rgba(233, 30, 99, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointBackgroundColor: recent.map(d => {
                                if (d.availability === 'absent') return '#f44336';
                                if (d.painIntensity > 5) return '#ff9800';
                                return '#e91e63';
                            }),
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: { 
                            display: true, 
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 12, weight: 'bold' }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 15,
                            callbacks: {
                                title: function(context) {
                                    return 'Date: ' + context[0].label;
                                },
                                label: function(context) {
                                    const item = recent[context.dataIndex];
                                    const lines = [];
                                    const emojis = ['😫 Très fatigué', '😔 Fatigué', '😐 Normal', '🙂 Bon', '😄 Excellent'];
                                    lines.push('État: ' + emojis[item.dailyCondition - 1]);
                                    lines.push('Disponibilité: ' + (item.availability === 'present' ? '✅ Présent' : '❌ Absent'));
                                    if (item.availability === 'absent') {
                                        lines.push('Motif: ' + item.absenceReason);
                                    }
                                    if (item.painIntensity > 0) {
                                        lines.push('🩹 Douleur: ' + item.painZone + ' (' + item.painIntensity + '/10)');
                                    }
                                    return lines;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: { 
                                stepSize: 1,
                                font: { size: 11 },
                                callback: function(value) {
                                    const emojis = ['', '😫', '😔', '😐', '🙂', '😄'];
                                    return emojis[value] || value;
                                }
                            },
                            title: { 
                                display: true, 
                                text: 'État de Forme (1-5)',
                                font: { size: 12, weight: 'bold' }
                            },
                            grid: {
                                color: 'rgba(233, 30, 99, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: { size: 10 },
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
            console.log('✅ Medical chart créé');
        }
    }
    
    // ========================================
    // 4. GRAPHIQUE TECHNIQUE (Radar)
    // ========================================
    const technicalChartEl = document.getElementById('technicalChart');
    if (technicalChartEl) {
        const techData = swimmer.technicalData || [];
        if (techData.length > 0) {
            const latest = techData[techData.length - 1];
            const categories = ['crawl', 'dos', 'brasse', 'papillon'];
            const styles = ['Crawl', 'Dos', 'Brasse', 'Papillon'];
            const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0'];
            
            const datasets = categories.map((cat, idx) => {
                const catData = latest[cat];
                if (!catData) return null;
                
                return {
                    label: styles[idx],
                    data: [
                        catData.position || 0,
                        catData.respiration || 0,
                        catData.battements || 0,
                        catData.bras || 0,
                        catData.virage || 0
                    ],
                    borderColor: colors[idx],
                    backgroundColor: colors[idx].replace(')', ', 0.2)').replace('rgb', 'rgba'),
                    borderWidth: 2,
                    pointRadius: 4
                };
            }).filter(d => d !== null);
            
            window.chartInstances.technicalChart = new Chart(technicalChartEl, {
                type: 'radar',
                data: {
                    labels: ['Position', 'Respiration', 'Battements', 'Bras', 'Virage'],
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top' }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 10,
                            ticks: { stepSize: 2 }
                        }
                    }
                }
            });
            console.log('✅ Technical chart créé');
        }
    }
    
    // ========================================
    // 5. GRAPHIQUE PRÉSENCE (Pie Chart)
    // ========================================
    const attendanceChartEl = document.getElementById('attendanceChart');
    if (attendanceChartEl) {
        const attendance = swimmer.attendance || { records: [] };
        const records = attendance.records || [];
        if (records.length > 0) {
            const present = records.filter(r => r.status === 'present').length;
            const late = records.filter(r => r.status === 'late').length;
            const absent = records.filter(r => r.status === 'absent').length;
            
            window.chartInstances.attendanceChart = new Chart(attendanceChartEl, {
                type: 'doughnut',
                data: {
                    labels: ['✅ Présent', '⏰ Retard', '❌ Absent'],
                    datasets: [{
                        data: [present, late, absent],
                        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = present + late + absent;
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Attendance chart créé');
        }
    }
    
    // ========================================
    // 6. GRAPHIQUE SESSIONS (Volume)
    // ========================================
    const sessionsChartEl = document.getElementById('sessionsChart');
    if (sessionsChartEl) {
        const sessionData = swimmer.sessionData || [];
        if (sessionData.length > 0) {
            const recent = sessionData.slice(-15);
            
            window.chartInstances.sessionsChart = new Chart(sessionsChartEl, {
                type: 'bar',
                data: {
                    labels: recent.map(s => new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                    datasets: [
                        {
                            label: 'Échauffement (m)',
                            data: recent.map(s => s.warmUp.volumeMeters),
                            backgroundColor: '#4caf50',
                            stack: 'Stack 0'
                        },
                        {
                            label: 'Corps Principal (m)',
                            data: recent.map(s => s.mainSet.volumeMeters),
                            backgroundColor: '#2196f3',
                            stack: 'Stack 0'
                        },
                        {
                            label: 'Retour au Calme (m)',
                            data: recent.map(s => s.coolDown.volumeMeters),
                            backgroundColor: '#ff9800',
                            stack: 'Stack 0'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top' },
                        tooltip: {
                            callbacks: {
                                footer: function(tooltipItems) {
                                    const idx = tooltipItems[0].dataIndex;
                                    const session = recent[idx];
                                    const total = session.warmUp.volumeMeters + session.mainSet.volumeMeters + session.coolDown.volumeMeters;
                                    return 'Total: ' + total + 'm';
                                }
                            }
                        }
                    },
                    scales: {
                        x: { stacked: true },
                        y: {
                            stacked: true,
                            title: { display: true, text: 'Volume (mètres)' }
                        }
                    }
                }
            });
            console.log('✅ Sessions chart créé');
        }
    }
    
    console.log('🎉 Tous les graphiques ont été initialisés !');
}

// Fonctions utilitaires pour la conversion de temps
function timeToSeconds(timeString) {
    // Convertit "01:23.45" en secondes
    const parts = timeString.split(':');
    if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const perfData = swimmer.performanceData || [];
        const medicalData = swimmer.medicalData || [];
        const attendance = swimmer.attendance || { records: [] };
        const sessionData = swimmer.sessionData || [];
        const techData = swimmer.technicalData || [];
        
        const wellbeingAvg = wellbeingData.length > 0 
            ? wellbeingData.slice(-7).reduce((sum, d) => sum + ((d.sleep + (5 - d.fatigue) + (5 - d.pain) + (5 - d.stress)) / 4), 0) / Math.min(7, wellbeingData.length) * 2
            : 5;
            
        const perfAvg = perfData.length > 0 
            ? Math.min(10, (perfData[perfData.length - 1].vma / 2) || 5)
            : 5;
            
        const medicalAvg = medicalData.length > 0
            ? (medicalData.slice(-7).reduce((sum, d) => sum + d.availability, 0) / Math.min(7, medicalData.length)) * 3.33
            : 5;
            
        const attendanceRecords = attendance.records || [];
        const attendanceAvg = attendanceRecords.length > 0
            ? ((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 10)
            : 5;
            
        const sessionAvg = sessionData.length > 0 ? Math.min(10, sessionData.length / 5) : 5;
        
        const techAvg = techData.length > 0
            ? (() => {
                const latest = techData[techData.length - 1];
                const cats = ['crawl', 'dos', 'brasse', 'papillon'];
                let total = 0, count = 0;
                cats.forEach(cat => {
                    if (latest[cat]) {
                        const fields = ['position', 'respiration', 'battements', 'bras', 'virage'];
                        const avg = fields.reduce((sum, f) => sum + (latest[cat][f] || 0), 0) / fields.length;
                        total += avg;
                        count++;
                    }
                });
                return count > 0 ? total / count : 5;
            })()
            : 5;
            
        const raceData = swimmer.raceData || [];
        const raceAvg = Math.min(10, raceData.length / 3);
        
        window.chartInstances.globalRadarChart = new Chart(globalRadarEl, {
            type: 'radar',
            data: {
                labels: ['Bien-être', 'Performance', 'Médical', 'Assiduité', 'Sessions', 'Technique', 'Compétitions'],
                datasets: [{
                    label: swimmer.name,
                    data: [
                        wellbeingAvg,
                        perfAvg,
                        medicalAvg,
                        attendanceAvg,
                        sessionAvg,
                        techAvg,
                        raceAvg
                    ],
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.2)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#1a73e8'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { stepSize: 2 }
                    }
                }
            }
        });
        console.log('✅ Global radar chart créé');
    }
    
    // ========================================
    // 8. GRAPHIQUE TIMELINE GLOBAL
    // ========================================
    const globalTimelineEl = document.getElementById('globalTimelineChart');
    if (globalTimelineEl) {
        const allDates = new Set();
        
        // Collecter toutes les dates
        (swimmer.wellbeingData || []).forEach(d => allDates.add(d.date));
        (swimmer.performanceData || []).forEach(d => allDates.add(d.date));
        (swimmer.medicalData || []).forEach(d => allDates.add(d.date));
        (swimmer.sessionData || []).forEach(d => allDates.add(d.date));
        
        const sortedDates = Array.from(allDates).sort().slice(-30);
        
        // Créer les datasets
        const datasets = [];
        
        // Bien-être
        if (swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
            const dataMap = {};
            swimmer.wellbeingData.forEach(d => {
                dataMap[d.date] = ((d.sleep + (5 - d.fatigue) + (5 - d.pain) + (5 - d.stress)) / 4) * 2;
            });
            datasets.push({
                label: 'Bien-être',
                data: sortedDates.map(date => dataMap[date] || null),
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                spanGaps: true
            });
        }
        
        // VMA
        if (swimmer.performanceData && swimmer.performanceData.length > 0) {
            const dataMap = {};
            swimmer.performanceData.forEach(d => {
                dataMap[d.date] = (d.vma / 2) || 0;
            });
            datasets.push({
                label: 'Performance (VMA/2)',
                data: sortedDates.map(date => dataMap[date] || null),
                borderColor: '#9c27b0',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                spanGaps: true
            });
        }
        
        // Disponibilité
        if (swimmer.medicalData && swimmer.medicalData.length > 0) {
            const dataMap = {};
            swimmer.medicalData.forEach(d => {
                dataMap[d.date] = d.availability * 3.33;
            });
            datasets.push({
                label: 'Disponibilité',
                data: sortedDates.map(date => dataMap[date] || null),
                borderColor: '#e91e63',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                spanGaps: true
            });
        }
        
        if (datasets.length > 0) {
            window.chartInstances.globalTimelineChart = new Chart(globalTimelineEl, {
                type: 'line',
                data: {
                    labels: sortedDates.map(d => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: true, position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + (context.parsed.y ? context.parsed.y.toFixed(1) : 'N/A');
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            title: { display: true, text: 'Score (0-10)' }
                        }
                    }
                }
            });
            console.log('✅ Global timeline chart créé');
        }
    }
    
    console.log('🎉 Tous les graphiques ont été initialisés !');
}

// Fonctions utilitaires pour la conversion de temps
function timeToSeconds(timeString) {
    // Convertit "01:23.45" en secondes
    const parts = timeString.split(':');
    if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const seconds = parseFloat(parts[1]);
        return minutes * 60 + seconds;
    }
    return parseFloat(timeString);
}

function secondsToTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return mins > 0 ? `${mins}:${secs.padStart(5, '0')}` : `${secs}s`;
}

function initializeAnalysisCharts() {
    // Implémentation des graphiques pour l'analyse
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        
        // Graphique de bien-être
        const wellbeingCtx = document.getElementById('wellbeingChart');
        if (wellbeingCtx && swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
            new Chart(wellbeingCtx, {
                type: 'line',
                data: {
                    labels: swimmer.wellbeingData.map(d => d.date),
                    datasets: [
                        {
                            label: 'Sommeil',
                            data: swimmer.wellbeingData.map(d => d.sleep),
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Fatigue',
                            data: swimmer.wellbeingData.map(d => d.fatigue),
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Douleur',
                            data: swimmer.wellbeingData.map(d => d.pain),
                            borderColor: 'rgba(255, 159, 64, 1)',
                            backgroundColor: 'rgba(255, 159, 64, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Stress',
                            data: swimmer.wellbeingData.map(d => d.stress),
                            borderColor: 'rgba(153, 102, 255, 1)',
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Score Global',
                            data: swimmer.wellbeingData.map(d => d.score || ((d.sleep + d.fatigue + d.pain + d.stress) / 4)),
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: false,
                            borderDash: [5, 5]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Évolution du Bien-être (5 paramètres)',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                                size: 14
                            },
                            bodyFont: {
                                size: 13
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 0.5
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
        
        // Graphique Volume & RPE
        const volumeRpeCtx = document.getElementById('volumeRpeChart');
        if (volumeRpeCtx && swimmer.trainingData && swimmer.trainingData.length > 0) {
            new Chart(volumeRpeCtx, {
                type: 'line',
                data: {
                    labels: swimmer.trainingData.map(d => d.date),
                    datasets: [
                        {
                            label: 'Volume (m)',
                            data: swimmer.trainingData.map(d => d.volumeMeters || 0),
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: false,
                            yAxisID: 'y'
                        },
                        {
                            label: 'RPE',
                            data: swimmer.trainingData.map(d => d.rpe),
                            borderColor: 'rgba(255, 159, 64, 1)',
                            backgroundColor: 'rgba(255, 159, 64, 0.2)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: false,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        if (context.dataset.label === 'Volume (m)') {
                                            label += context.parsed.y + ' m';
                                        } else {
                                            label += context.parsed.y;
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Volume (m)',
                                color: 'rgba(54, 162, 235, 1)',
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                color: 'rgba(54, 162, 235, 1)'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            min: 0,
                            max: 10,
                            title: {
                                display: true,
                                text: 'RPE',
                                color: 'rgba(255, 159, 64, 1)',
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                color: 'rgba(255, 159, 64, 1)',
                                stepSize: 1
                            },
                            grid: {
                                drawOnChartArea: false
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
        
        // Graphique Radar des Performances (Technique 4 nages + Endurance + Force)
        const performanceRadarCtx = document.getElementById('performanceRadarChart');
        if (performanceRadarCtx && swimmer.performanceData && swimmer.performanceData.length > 0) {
            // Prendre les 3 dernières mesures pour comparaison
            const recentCount = Math.min(3, swimmer.performanceData.length);
            const startIndex = swimmer.performanceData.length - recentCount;
            
            const datasets = [];
            const colors = [
                { border: 'rgba(255, 99, 132, 1)', bg: 'rgba(255, 99, 132, 0.3)', label: '📅 Plus récent' },
                { border: 'rgba(54, 162, 235, 1)', bg: 'rgba(54, 162, 235, 0.2)', label: '📊 Précédent' },
                { border: 'rgba(75, 192, 192, 1)', bg: 'rgba(75, 192, 192, 0.15)', label: '📉 Ancien' }
            ];
            
            for (let i = 0; i < recentCount; i++) {
                const index = startIndex + i;
                const perf = swimmer.performanceData[index];
                datasets.push({
                    label: `${colors[i].label} (${new Date(perf.date).toLocaleDateString('fr-FR')})`,
                    data: [
                        perf.vma || 0,
                        perf.shoulderStrength || 0,
                        perf.chestStrength || 0,
                        perf.legStrength || 0
                    ],
                    borderColor: colors[i].border,
                    backgroundColor: colors[i].bg,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: colors[i].border,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                });
            }
            
            new Chart(performanceRadarCtx, {
                type: 'radar',
                data: {
                    labels: ['VMA (km/h)', 'Force Épaules (min)', 'Force Pectoraux (min)', 'Force Jambes (min)'],
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'point',
                        intersect: true
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 15,
                            titleFont: {
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.r;
                                    const metric = context.label;
                                    return `${label}: ${value} ${metric.includes('VMA') ? 'km/h' : 'min'}`;
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: '📊 Évolution des Performances (Comparaison temporelle)',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {
                                bottom: 20
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            angleLines: {
                                color: 'rgba(0, 0, 0, 0.15)',
                                lineWidth: 1
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                                circular: true
                            },
                            pointLabels: {
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                },
                                color: '#2c3e50'
                            },
                            ticks: {
                                backdropColor: 'transparent',
                                color: '#666',
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Graphique de suivi technique - Moyennes par catégorie
        const technicalCtx = document.getElementById('technicalChart');
        if (technicalCtx && swimmer.technical) {
            const categories = ['crawl', 'backstroke', 'breaststroke', 'butterfly', 'turns', 'starts'];
            const categoryNames = ['Crawl', 'Dos', 'Brasse', 'Papillon', 'Virages', 'Départs'];
            const averages = [];
            
            categories.forEach(cat => {
                if (swimmer.technical[cat] && swimmer.technical[cat].dates && swimmer.technical[cat].dates.length > 0) {
                    const fields = Object.keys(swimmer.technical[cat]).filter(key => key !== 'dates');
                    const lastIndex = swimmer.technical[cat].dates.length - 1;
                    let sum = 0;
                    let count = 0;
                    
                    fields.forEach(field => {
                        if (swimmer.technical[cat][field] && swimmer.technical[cat][field].length > 0) {
                            sum += swimmer.technical[cat][field][lastIndex];
                            count++;
                        }
                    });
                    
                    averages.push(count > 0 ? (sum / count).toFixed(2) : 0);
                } else {
                    averages.push(0);
                }
            });
            
            new Chart(technicalCtx, {
                type: 'bar',
                data: {
                    labels: categoryNames,
                    datasets: [{
                        label: 'Moyenne technique (0-5)',
                        data: averages,
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(99, 255, 132, 0.7)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(99, 255, 132, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
        
        // Graphique de présence - Statistiques
        const attendanceCtx = document.getElementById('attendanceChart');
        if (attendanceCtx && swimmer.attendance && swimmer.attendance.records.length > 0) {
            const records = swimmer.attendance.records;
            const presentCount = records.filter(r => r.status === 'present').length;
            const lateCount = records.filter(r => r.status === 'late').length;
            const absentCount = records.filter(r => r.status === 'absent').length;
            
            new Chart(attendanceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Présent', 'Retard', 'Absent'],
                    datasets: [{
                        data: [presentCount, lateCount, absentCount],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(255, 99, 132, 0.7)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return {
                                            text: `${label}: ${value} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} séances (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Session Volume Chart (Stacked Bar)
        const sessionVolumeCtx = document.getElementById('sessionVolumeChart');
        if (sessionVolumeCtx && swimmer.sessionData && swimmer.sessionData.length > 0) {
            const sessionDates = swimmer.sessionData.map(s => s.date);
            const warmupVolumes = swimmer.sessionData.map(s => s.warmUp.volumeMeters);
            const mainsetVolumes = swimmer.sessionData.map(s => s.mainSet.volumeMeters);
            const cooldownVolumes = swimmer.sessionData.map(s => s.coolDown.volumeMeters);
            
            new Chart(sessionVolumeCtx, {
                type: 'bar',
                data: {
                    labels: sessionDates,
                    datasets: [
                        {
                            label: 'Échauffement',
                            data: warmupVolumes,
                            backgroundColor: 'rgba(76, 175, 80, 0.7)',
                            borderColor: 'rgba(76, 175, 80, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Corps de Séance',
                            data: mainsetVolumes,
                            backgroundColor: 'rgba(33, 150, 243, 0.7)',
                            borderColor: 'rgba(33, 150, 243, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Retour au Calme',
                            data: cooldownVolumes,
                            backgroundColor: 'rgba(255, 152, 0, 0.7)',
                            borderColor: 'rgba(255, 152, 0, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        title: {
                            display: true,
                            text: 'Volumes par Partie de Séance (mètres)',
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            callbacks: {
                                footer: function(tooltipItems) {
                                    const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                                    return 'Total: ' + total + ' m';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            title: { display: true, text: 'Date' }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: { display: true, text: 'Volume (mètres)' },
                            ticks: {
                                callback: function(value) {
                                    return value + ' m';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Session Duration Chart (Line)
        const sessionDurationCtx = document.getElementById('sessionDurationChart');
        if (sessionDurationCtx && swimmer.sessionData && swimmer.sessionData.length > 0) {
            const sessionDates = swimmer.sessionData.map(s => s.date);
            const totalDurations = swimmer.sessionData.map(s => 
                s.warmUp.duration + s.mainSet.duration + s.coolDown.duration
            );
            const avgIntensities = swimmer.sessionData.map(s => {
                const totalVol = s.warmUp.volumeMeters + s.mainSet.volumeMeters + s.coolDown.volumeMeters;
                const totalDur = s.warmUp.duration + s.mainSet.duration + s.coolDown.duration;
                return totalDur > 0 ? (totalVol / totalDur).toFixed(1) : 0;
            });
            
            new Chart(sessionDurationCtx, {
                type: 'line',
                data: {
                    labels: sessionDates,
                    datasets: [
                        {
                            label: 'Durée Totale (min)',
                            data: totalDurations,
                            borderColor: 'rgba(33, 150, 243, 1)',
                            backgroundColor: 'rgba(33, 150, 243, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Intensité Moyenne (m/min)',
                            data: avgIntensities,
                            borderColor: 'rgba(255, 152, 0, 1)',
                            backgroundColor: 'rgba(255, 152, 0, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        title: {
                            display: true,
                            text: 'Durée et Intensité des Sessions',
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Date' }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            title: { display: true, text: 'Durée (minutes)' },
                            ticks: {
                                callback: function(value) {
                                    return value + ' min';
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            title: { display: true, text: 'Intensité (m/min)' },
                            grid: {
                                drawOnChartArea: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + ' m/min';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // ========== NOUVEAUX GRAPHIQUES AVANCÉS ==========
        
        // 1. Radar Bien-être 5D (Sommeil, Fatigue, Douleur, Stress, Humeur)
        const wellbeingRadarCtx = document.getElementById('wellbeingRadarChart');
        if (wellbeingRadarCtx && swimmer.wellbeingData && swimmer.wellbeingData.length > 0) {
            const lastIndex = swimmer.wellbeingData.length - 1;
            const prevIndex = Math.max(0, lastIndex - 7); // 7 jours avant
            
            const lastData = swimmer.wellbeingData[lastIndex];
            const prevData = swimmer.wellbeingData[prevIndex];
            
            new Chart(wellbeingRadarCtx, {
                type: 'radar',
                data: {
                    labels: ['😴 Sommeil', '⚡ Énergie', '💪 Sans Douleur', '😌 Calme', '😊 Humeur'],
                    datasets: [
                        {
                            label: `📅 Actuel (${new Date(lastData.date).toLocaleDateString('fr-FR')})`,
                            data: [
                                lastData.sleep || 0,
                                (5 - (lastData.fatigue || 0)), // Inverser fatigue pour "énergie"
                                (5 - (lastData.pain || 0)),    // Inverser douleur
                                (5 - (lastData.stress || 0)),  // Inverser stress pour "calme"
                                lastData.mood || lastData.sleep || 0 // Humeur ou défaut
                            ],
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.3)',
                            borderWidth: 3,
                            pointRadius: 5,
                            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 7
                        },
                        {
                            label: `📊 7 jours avant (${new Date(prevData.date).toLocaleDateString('fr-FR')})`,
                            data: [
                                prevData.sleep || 0,
                                (5 - (prevData.fatigue || 0)),
                                (5 - (prevData.pain || 0)),
                                (5 - (prevData.stress || 0)),
                                prevData.mood || prevData.sleep || 0
                            ],
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.15)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 12, weight: 'bold' }
                            }
                        },
                        title: {
                            display: true,
                            text: '🎯 Analyse Bien-être Multidimensionnelle',
                            font: { size: 16, weight: 'bold' },
                            padding: { bottom: 20 }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 15,
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}/5`;
                                }
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 1,
                                backdropColor: 'transparent',
                                font: { size: 10 }
                            },
                            pointLabels: {
                                font: { size: 13, weight: 'bold' },
                                color: '#2c3e50'
                            },
                            grid: { color: 'rgba(0, 0, 0, 0.1)' },
                            angleLines: { color: 'rgba(0, 0, 0, 0.15)' }
                        }
                    }
                }
            });
        }
        
        // 2. Bubble Chart - Matrice Performance (Charge vs VMA vs Bien-être)
        const performanceBubbleCtx = document.getElementById('performanceBubbleChart');
        if (performanceBubbleCtx && swimmer.trainingData && swimmer.performanceData && 
            swimmer.trainingData.length > 2 && swimmer.performanceData.length > 2) {
            
            // Créer un tableau combiné avec les 30 derniers jours
            const bubbleData = [];
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            swimmer.trainingData.forEach(training => {
                const trainingDate = new Date(training.date);
                if (trainingDate < thirtyDaysAgo) return;
                
                // Trouver la VMA la plus proche
                const perfData = swimmer.performanceData.find(p => {
                    const perfDate = new Date(p.date);
                    const diff = Math.abs(perfDate - trainingDate);
                    return diff < 7 * 24 * 60 * 60 * 1000; // Dans les 7 jours
                });
                
                // Trouver le bien-être du même jour
                const wellData = swimmer.wellbeingData ? swimmer.wellbeingData.find(w => w.date === training.date) : null;
                
                if (perfData && wellData) {
                    const wellbeingScore = (wellData.sleep + (5 - wellData.fatigue) + 
                                          (5 - wellData.pain) + (5 - wellData.stress)) / 4;
                    
                    bubbleData.push({
                        x: training.load || 0,           // Charge (axe X)
                        y: perfData.vma || 0,            // VMA (axe Y)
                        r: wellbeingScore * 3,           // Bien-être (taille bulle)
                        date: training.date,
                        wellbeing: wellbeingScore
                    });
                }
            });
            
            if (bubbleData.length > 0) {
                new Chart(performanceBubbleCtx, {
                    type: 'bubble',
                    data: {
                        datasets: [{
                            label: 'Performances (Taille = Bien-être)',
                            data: bubbleData,
                            backgroundColor: function(context) {
                                const value = context.raw.wellbeing;
                                if (value >= 4) return 'rgba(75, 192, 192, 0.6)';
                                if (value >= 3) return 'rgba(255, 206, 86, 0.6)';
                                return 'rgba(255, 99, 132, 0.6)';
                            },
                            borderColor: function(context) {
                                const value = context.raw.wellbeing;
                                if (value >= 4) return 'rgba(75, 192, 192, 1)';
                                if (value >= 3) return 'rgba(255, 206, 86, 1)';
                                return 'rgba(255, 99, 132, 1)';
                            },
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    generateLabels: function() {
                                        return [
                                            { text: '🟢 Excellent bien-être (≥4)', fillStyle: 'rgba(75, 192, 192, 0.6)' },
                                            { text: '🟡 Bien-être moyen (3-4)', fillStyle: 'rgba(255, 206, 86, 0.6)' },
                                            { text: '🔴 Bien-être faible (<3)', fillStyle: 'rgba(255, 99, 132, 0.6)' }
                                        ];
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: '💎 Corrélation Charge-Performance-Bien-être',
                                font: { size: 16, weight: 'bold' }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                padding: 15,
                                callbacks: {
                                    label: function(context) {
                                        const d = context.raw;
                                        return [
                                            `📅 Date: ${new Date(d.date).toLocaleDateString('fr-FR')}`,
                                            `⚡ Charge: ${d.x}`,
                                            `🚀 VMA: ${d.y} km/h`,
                                            `😊 Bien-être: ${d.wellbeing.toFixed(1)}/5`
                                        ];
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Charge Entrainement (Volume x RPE)',
                                    font: { size: 13, weight: 'bold' }
                                },
                                beginAtZero: true
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'VMA (km/h)',
                                    font: { size: 13, weight: 'bold' }
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
        
        // 3. Doughnut Chart - Répartition Types d'Entraînement
        const trainingTypesDoughnutCtx = document.getElementById('trainingTypesDoughnutChart');
        if (trainingTypesDoughnutCtx && swimmer.trainingData && swimmer.trainingData.length > 5) {
            // Simuler des types d'entraînement basés sur RPE et volume
            const types = { endurance: 0, intensity: 0, speed: 0, recovery: 0, strength: 0 };
            
            swimmer.trainingData.forEach(t => {
                const rpe = t.rpe || 5;
                const volume = t.volumeMeters || 0;
                
                if (rpe <= 3) types.recovery++;
                else if (rpe <= 5 && volume > 3000) types.endurance++;
                else if (rpe <= 7 && volume < 2000) types.speed++;
                else if (rpe > 7 && volume < 2000) types.intensity++;
                else types.strength++;
            });
            
            new Chart(trainingTypesDoughnutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['🏃 Endurance', '⚡ Intensité', '🚀 Vitesse', '😌 Récupération', '💪 Force'],
                    datasets: [{
                        data: [types.endurance, types.intensity, types.speed, types.recovery, types.strength],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                padding: 15,
                                font: { size: 12, weight: 'bold' },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return {
                                            text: `${label}: ${value} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Distribution des Types Entrainement',
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 15,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} séances (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    // ===== INITIALISATION DE LA PAGINATION TECHNIQUE =====
    // Initialiser la pagination pour la section technique après le rendu
    setTimeout(() => {
        console.log('⏰ Tentative d\'initialisation pagination technique...');
        const contentDiv = document.getElementById('detailed-nage-content');
        if (contentDiv) {
            console.log('✅ Élément detailed-nage-content trouvé, initialisation...');
            initDetailedNagePagination(swimmer);
        } else {
            console.error('❌ Élément detailed-nage-content introuvable après 500ms');
            // Réessayer une fois de plus
            setTimeout(() => {
                console.log('🔄 Deuxième tentative d\'initialisation...');
                const contentDiv2 = document.getElementById('detailed-nage-content');
                if (contentDiv2) {
                    initDetailedNagePagination(swimmer);
                } else {
                    console.error('❌ Élément toujours introuvable après 1000ms');
                }
            }, 500);
        }
    }, 500);
}

function showEmptyState() {
    if (!dashboardContent) return; // Attendre que le DOM soit chargé
    
    dashboardContent.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🏊‍♂️</div>
            <h3 class="empty-state-title">Aucun nageur enregistré</h3>
            <p class="empty-state-text">Commencez par ajouter votre premier nageur pour utiliser le système.</p>
            <button class="btn btn-primary" id="emptyStateAddBtn">Ajouter un Nageur</button>
        </div>
    `;
    
    const emptyBtn = document.getElementById('emptyStateAddBtn');
    if (emptyBtn && addSwimmerModal) {
        emptyBtn.addEventListener('click', () => {
            addSwimmerModal.style.display = 'flex';
        });
    }
}

// ===== GESTION DE LA PAGINATION TECHNIQUE =====
let currentDetailedNageIndex = 0;
let availableNages = [];

// ===== FONCTION DE TEST POUR AJOUTER DES DONNÉES TECHNIQUES =====
function addTestTechnicalData() {
    if (!currentSwimmerId || !swimmers.length) {
        console.log('❌ Aucun nageur sélectionné');
        return;
    }
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    if (!swimmer.technicalData) {
        swimmer.technicalData = [];
    }
    
    // Ajouter des données de test
    const testData = {
        date: new Date().toISOString().split('T')[0],
        crawl: {
            position: 8,
            respiration: 7,
            battements: 8,
            bras: 9,
            virage: 7
        },
        dos: {
            position: 7,
            respiration: 8,
            battements: 7,
            bras: 8,
            virage: 6
        },
        brasse: {
            position: 6,
            respiration: 7,
            battements: 8,
            bras: 7,
            virage: 8
        },
        papillon: {
            position: 5,
            respiration: 6,
            battements: 7,
            bras: 6,
            virage: 5
        }
    };
    
    swimmer.technicalData.push(testData);
    saveSwimmersData();
    console.log('✅ Données techniques de test ajoutées');
    
    // Rafraîchir l'affichage
    showCompleteDashboard();
}

// Exposer la fonction pour les tests dans la console
window.addTestTechnicalData = addTestTechnicalData;

function initDetailedNagePagination(swimmer) {
    console.log('🏊 Initialisation pagination technique pour:', swimmer.name);
    const data = swimmer.technicalData || [];
    console.log('📊 Données techniques:', data);
    
    if (data.length === 0) {
        console.log('⚠️ Aucune donnée technique disponible');
        // Afficher un message dans le conteneur
        const contentDiv = document.getElementById('detailed-nage-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-swimming-pool" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucune évaluation technique enregistrée</p>
                    <p style="font-size: 0.9rem;">Cliquez sur "Saisie de Données" pour commencer</p>
                </div>`;
        }
        return;
    }
    
    const latest = data[data.length - 1];
    const categories = ['crawl', 'dos', 'brasse', 'papillon'];
    
    // Filtrer les nages qui ont des données
    availableNages = categories.filter(cat => latest[cat]);
    currentDetailedNageIndex = 0;
    console.log('🎯 Nages disponibles:', availableNages);
    
    if (availableNages.length > 0) {
        updateDetailedNageContent(swimmer);
        updateDetailedNageNavigation();
    } else {
        console.log('⚠️ Aucune nage avec données');
        const contentDiv = document.getElementById('detailed-nage-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-swimming-pool" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem;">Aucune donnée de nage disponible</p>
                    <p style="font-size: 0.9rem;">Vérifiez vos données techniques</p>
                </div>`;
        }
    }
}

function changeDetailedNage(direction) {
    currentDetailedNageIndex += direction;
    
    if (currentDetailedNageIndex < 0) {
        currentDetailedNageIndex = availableNages.length - 1;
    } else if (currentDetailedNageIndex >= availableNages.length) {
        currentDetailedNageIndex = 0;
    }
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (swimmer) {
        updateDetailedNageContent(swimmer);
        updateDetailedNageNavigation();
    }
}

function updateDetailedNageContent(swimmer) {
    console.log('🎨 Mise à jour contenu nage:', currentDetailedNageIndex, '/', availableNages.length);
    const contentDiv = document.getElementById('detailed-nage-content');
    if (!contentDiv) {
        console.error('❌ Élément detailed-nage-content introuvable');
        return;
    }
    
    if (availableNages.length === 0) {
        console.log('⚠️ Aucune nage disponible');
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p>Aucune nage disponible</p>
            </div>`;
        return;
    }
    
    const data = swimmer.technicalData || [];
    const latest = data[data.length - 1];
    const cat = availableNages[currentDetailedNageIndex];
    const catData = latest[cat];
    
    console.log('📊 Nage actuelle:', cat, 'Données:', catData);
    
    const nageColors = {
        'crawl': { bg: '#2196f315', border: '#2196f3', text: '#2196f3' },
        'dos': { bg: '#9c27b015', border: '#9c27b0', text: '#9c27b0' },
        'brasse': { bg: '#4caf5015', border: '#4caf50', text: '#4caf50' },
        'papillon': { bg: '#ff980015', border: '#ff9800', text: '#ff9800' }
    };
    
    const colors = nageColors[cat];
    const fields = ['position', 'respiration', 'battements', 'bras', 'virage'];
    const fieldLabels = {
        'position': 'Position du corps',
        'respiration': 'Respiration',
        'battements': 'Battements de jambes',
        'bras': 'Mouvement des bras',
        'virage': 'Virages'
    };
    const avg = fields.reduce((sum, f) => sum + (catData[f] || 0), 0) / fields.length;
    const avgColor = avg >= 8 ? '#4caf50' : avg >= 6 ? '#ff9800' : '#f44336';
    const nageName = cat.charAt(0).toUpperCase() + cat.slice(1);
    const icon = cat === 'crawl' ? '🏊' : cat === 'dos' ? '🔙' : cat === 'brasse' ? '💪' : '🦋';
    
    contentDiv.innerHTML = `
        <div style="border: 2px solid ${colors.border}; border-radius: 12px; overflow: hidden; background: white; transition: all 0.3s ease;">
            <div style="background: ${colors.bg}; padding: 20px; border-bottom: 2px solid ${colors.border};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h5 style="margin: 0; color: ${colors.text}; font-size: 1.4rem; font-weight: 600;">
                        ${icon} ${nageName}
                    </h5>
                    <span style="font-size: 2rem; font-weight: bold; color: ${avgColor}; background: white; padding: 8px 20px; border-radius: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        ${avg.toFixed(1)}/10
                    </span>
                </div>
            </div>
            <div style="padding: 25px;">
                ${fields.map(f => {
                    const score = catData[f] || 0;
                    const percentage = (score / 10) * 100;
                    const barColor = score >= 8 ? '#4caf50' : score >= 6 ? '#ff9800' : score >= 4 ? '#ffc107' : '#f44336';
                    
                    return `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 1rem; color: #555; font-weight: 500;">${fieldLabels[f]}</span>
                            <span style="font-size: 1.1rem; font-weight: bold; color: ${barColor};">${score}/10</span>
                        </div>
                        <div style="width: 100%; height: 12px; background: #e0e0e0; border-radius: 6px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, ${barColor}, ${barColor}dd); transition: width 0.5s ease-in-out;"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;
}

function updateDetailedNageNavigation() {
    console.log('🧭 Mise à jour navigation:', currentDetailedNageIndex, '/', availableNages.length);
    const indicator = document.getElementById('nage-indicator');
    const prevBtn = document.getElementById('prev-nage-btn');
    const nextBtn = document.getElementById('next-nage-btn');
    
    if (!indicator || !prevBtn || !nextBtn) {
        console.error('❌ Éléments de navigation introuvables:', {indicator: !!indicator, prevBtn: !!prevBtn, nextBtn: !!nextBtn});
        return;
    }
    
    indicator.textContent = `${currentDetailedNageIndex + 1} / ${availableNages.length}`;
    
    // Mise à jour des styles des boutons
    const btnStyle = 'padding: 8px 12px; border: 2px solid #00bcd4; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s; font-weight: 500;';
    
    if (availableNages.length <= 1) {
        prevBtn.style.cssText = btnStyle + 'background: #f5f5f5; color: #ccc; border-color: #ddd; cursor: not-allowed;';
        nextBtn.style.cssText = btnStyle + 'background: #f5f5f5; color: #ccc; border-color: #ddd; cursor: not-allowed;';
    } else {
        prevBtn.style.cssText = btnStyle + 'background: white; color: #00bcd4; border-color: #00bcd4;';
        nextBtn.style.cssText = btnStyle + 'background: white; color: #00bcd4; border-color: #00bcd4;';
        
        prevBtn.onmouseenter = () => prevBtn.style.background = '#00bcd4';
        prevBtn.onmouseleave = () => prevBtn.style.background = 'white';
        nextBtn.onmouseenter = () => nextBtn.style.background = '#00bcd4';
        nextBtn.onmouseleave = () => nextBtn.style.background = 'white';
        
        prevBtn.onmouseenter = () => {
            prevBtn.style.background = '#00bcd4';
            prevBtn.style.color = 'white';
        };
        prevBtn.onmouseleave = () => {
            prevBtn.style.background = 'white';
            prevBtn.style.color = '#00bcd4';
        };
        nextBtn.onmouseenter = () => {
            nextBtn.style.background = '#00bcd4';
            nextBtn.style.color = 'white';
        };
        nextBtn.onmouseleave = () => {
            nextBtn.style.background = 'white';
            nextBtn.style.color = '#00bcd4';
        };
    }
}
