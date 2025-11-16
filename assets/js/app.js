
// =============================================
// DONNÉES ET ÉTAT DE L'APPLICATION
// =============================================
let swimmers = [];
let currentSwimmerId = null;
let currentDataType = null;

// Fonction pour créer un nageur de test avec données complètes
function createTestSwimmer() {
    const testSwimmer = {
        id: Date.now().toString(),
        name: "Alex Dupont (TEST)",
        age: 22,
        specialty: "Dos & Papillon",
        wellbeing: {
            sleep: [3, 4, 3, 5, 4, 4, 3],
            fatigue: [3, 2, 3, 2, 3, 2, 3],
            pain: [1, 1, 2, 1, 1, 0, 1],
            stress: [2, 3, 2, 2, 3, 2, 2],
            dates: [
                '2024-11-01', '2024-11-03', '2024-11-05', 
                '2024-11-07', '2024-11-09', '2024-11-11', '2024-11-13'
            ]
        },
        training: {
            volume: [60, 75, 80, 90, 85, 70, 95],
            volumeMeters: [3000, 3500, 4000, 4200, 3800, 3200, 4500],
            rpe: [6, 7, 8, 7, 8, 6, 9],
            charge: [360, 525, 640, 630, 680, 420, 855],
            dates: [
                '2024-11-01', '2024-11-03', '2024-11-05', 
                '2024-11-07', '2024-11-09', '2024-11-11', '2024-11-13'
            ]
        },
        performance: {
            vma: [13.5, 13.8, 14.2, 14.5, 14.3, 14.8, 14.6],
            shoulderStrength: [2.5, 2.8, 3.0, 3.2, 3.5, 3.7, 4.0],
            chestStrength: [1.8, 2.0, 2.2, 2.5, 2.7, 2.9, 3.1],
            legStrength: [3.2, 3.5, 3.8, 4.0, 4.3, 4.5, 4.8],
            dates: [
                '2024-11-01', '2024-11-03', '2024-11-05', 
                '2024-11-07', '2024-11-09', '2024-11-11', '2024-11-13'
            ]
        },
        medical: {
            availability: [3, 3, 2, 3, 3, 3, 3],
            illnesses: [0, 0, 1, 0, 0, 0, 0],
            injuries: [0, 0, 0, 0, 0, 0, 0],
            otherIssues: [0, 0, 0, 0, 0, 0, 0],
            dates: [
                '2024-11-01', '2024-11-03', '2024-11-05', 
                '2024-11-07', '2024-11-09', '2024-11-11', '2024-11-13'
            ]
        },
        racePerformances: {
            event: [
                "Championnats Régionaux - Nov 2024",
                "Meeting Interclubs - Nov 2024",
                "Compétition Nationale - Nov 2024"
            ],
            races: [
                [
                    { style: "Crawl", distance: "50m", time: "26:45" },
                    { style: "Crawl", distance: "100m", time: "58:30" },
                    { style: "Dos", distance: "50m", time: "29:80" },
                    { style: "Dos", distance: "100m", time: "01:05:20" }
                ],
                [
                    { style: "Crawl", distance: "50m", time: "26:20" },
                    { style: "Dos", distance: "100m", time: "01:04:85" },
                    { style: "Papillon", distance: "50m", time: "31:50" },
                    { style: "Brasse", distance: "100m", time: "01:18:40" }
                ],
                [
                    { style: "Crawl", distance: "50m", time: "25:95" },
                    { style: "Crawl", distance: "200m", time: "02:08:75" },
                    { style: "Dos", distance: "50m", time: "29:20" },
                    { style: "Dos", distance: "200m", time: "02:25:40" },
                    { style: "Papillon", distance: "100m", time: "01:10:30" },
                    { style: "Crawl", distance: "400m", time: "04:38:60" }
                ]
            ],
            dates: ['2024-11-02', '2024-11-08', '2024-11-14']
        }
    };
    
    swimmers.push(testSwimmer);
    updateAthleteSelector();
    saveToLocalStorage();
    showNotification('success', 'Nageur de test créé avec succès ! Sélectionnez "Alex Dupont (TEST)" pour voir toutes les fonctionnalités.');
    return testSwimmer;
}

// =============================================
// PERSISTANCE DES DONNÉES - localStorage
// =============================================
function saveToLocalStorage() {
    try {
        localStorage.setItem('swimmers', JSON.stringify(swimmers));
        localStorage.setItem('currentSwimmerId', currentSwimmerId);
        console.log('Données sauvegardées avec succès');
    } catch (e) {
        console.error('Erreur lors de la sauvegarde:', e);
        alert('Erreur: Impossible de sauvegarder les données');
    }
}

function loadFromLocalStorage() {
    try {
        const savedSwimmers = localStorage.getItem('swimmers');
        const savedCurrentId = localStorage.getItem('currentSwimmerId');
        
        if (savedSwimmers) {
            swimmers = JSON.parse(savedSwimmers);
            console.log('Données chargées:', swimmers.length, 'nageur(s)');
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
// ÉLÉMENTS DOM
// =============================================
const dashboardContent = document.getElementById('dashboardContent');
const athleteSelector = document.getElementById('athleteSelector');
const addSwimmerBtn = document.getElementById('addSwimmerBtn');
const resetDataBtn = document.getElementById('resetDataBtn');
const addSwimmerModal = document.getElementById('addSwimmerModal');
const dataEntryModal = document.getElementById('dataEntryModal');
const dataEntryForm = document.getElementById('dataEntryForm');
const dataEntryTitle = document.getElementById('dataEntryTitle');

// =============================================
// INITIALISATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    loadTheme();
    initializeEventListeners();
    updateAthleteSelector();
    updateDashboard();
    updateActionButtons();
});

function updateActionButtons() {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const compareBtn = document.getElementById('compareSwimmersBtn');
    
    if (exportPdfBtn) {
        exportPdfBtn.style.display = currentSwimmerId ? 'block' : 'none';
    }
    
    if (compareBtn) {
        compareBtn.style.display = swimmers.length >= 2 ? 'block' : 'none';
    }
}

// =============================================
// GESTION DES ÉVÉNEMENTS
// =============================================
function initializeEventListeners() {
    // Navigation mobile
    document.querySelector('.nav-toggle').addEventListener('click', function() {
        document.querySelector('nav').classList.toggle('active');
    });

    // Navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
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

    // Sélection d'athlète
    athleteSelector.addEventListener('change', function() {
        currentSwimmerId = this.value === 'all' ? null : this.value;
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.style.display = currentSwimmerId ? 'block' : 'none';
        }
        updateDashboard();
    });

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
        // Données par défaut

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
    if (!currentSwimmerId) {
        alert('Veuillez sélectionner un nageur d\'abord');
        return;
    }

    currentDataType = dataType;
    dataEntryTitle.textContent = getDataEntryTitle(dataType);
    dataEntryForm.innerHTML = generateDataEntryForm(dataType);
    dataEntryModal.style.display = 'flex';
    
    // Réinitialiser le compteur de nages si c'est une course
    if (dataType === 'race') {
        raceEntryCount = 0;
        const container = document.getElementById('raceEntriesContainer');
        if (container) {
            container.innerHTML = '';
        }
    }
}

function getDataEntryTitle(dataType) {
    const titles = {
        'wellbeing': 'Saisie du Bien-être',
        'training': 'Saisie de l\'Entraînement',
        'performance': 'Saisie des Performances',
        'medical': 'Saisie du Statut Médical',
        'race': 'Saisie des Performances de Course'
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
                <div class="form-row">
                    <div class="form-group">
                        <label for="sleep">Sommeil (1-5)</label>
                        <input type="number" id="sleep" class="form-control" min="1" max="5" required>
                    </div>
                    <div class="form-group">
                        <label for="fatigue">Fatigue (1-5)</label>
                        <input type="number" id="fatigue" class="form-control" min="1" max="5" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="pain">Douleur (1-5)</label>
                        <input type="number" id="pain" class="form-control" min="1" max="5" required>
                    </div>
                    <div class="form-group">
                        <label for="stress">Stress (1-5)</label>
                        <input type="number" id="stress" class="form-control" min="1" max="5" required>
                    </div>
                </div>
            `;
            
        case 'training':
            return `
                <div class="form-group">
                    <label for="entryDate">Date</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="volume">Volume (min)</label>
                        <input type="number" id="volume" class="form-control" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="volumeMeters">Volume (mètres)</label>
                        <input type="number" id="volumeMeters" class="form-control" min="0" step="100" placeholder="Ex: 3000" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="rpe">RPE (1-10)</label>
                        <input type="number" id="rpe" class="form-control" min="1" max="10" required>
                    </div>
                    <div class="form-group" style="display: flex; align-items: flex-end;">
                        <span style="padding: 10px; background: #f0f0f0; border-radius: 4px; font-weight: 500;">Charge = Volume (min) × RPE</span>
                    </div>
                </div>
            `;
            
        case 'performance':
            return `
                <div class="form-group">
                    <label for="entryDate">Date</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="vma">VMA (km/h)</label>
                        <input type="number" id="vma" class="form-control" min="0" step="0.1" placeholder="Ex: 14.5" required>
                    </div>
                    <div class="form-group">
                        <label for="shoulderStrength">Force épaule (min)</label>
                        <input type="number" id="shoulderStrength" class="form-control" min="0" step="0.1" placeholder="Ex: 3.5" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="chestStrength">Force pectoraux (min)</label>
                        <input type="number" id="chestStrength" class="form-control" min="0" step="0.1" placeholder="Ex: 2.8" required>
                    </div>
                    <div class="form-group">
                        <label for="legStrength">Force jambes (min)</label>
                        <input type="number" id="legStrength" class="form-control" min="0" step="0.1" placeholder="Ex: 4.2" required>
                    </div>
                </div>
            `;
            
        case 'medical':
            return `
                <div class="form-group">
                    <label for="entryDate">Date</label>
                    <input type="date" id="entryDate" class="form-control" value="${today}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="availability">Disponibilité (0-3)</label>
                        <input type="number" id="availability" class="form-control" min="0" max="3" required>
                    </div>
                    <div class="form-group">
                        <label for="illnesses">Maladies</label>
                        <input type="number" id="illnesses" class="form-control" min="0" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="injuries">Blessures</label>
                        <input type="number" id="injuries" class="form-control" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="otherIssues">Autres problèmes</label>
                        <input type="number" id="otherIssues" class="form-control" min="0" required>
                    </div>
                </div>
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
            
        default:
            return '<p>Type de données non reconnu</p>';
    }
}

// Sauvegarder les données saisies
function saveData() {
    if (!currentSwimmerId || !currentDataType) return;
    
    const swimmer = swimmers.find(s => s.id === currentSwimmerId);
    if (!swimmer) return;
    
    const date = document.getElementById('entryDate').value;
    
    switch(currentDataType) {
        case 'wellbeing':
            swimmer.wellbeing.sleep.push(parseInt(document.getElementById('sleep').value));
            swimmer.wellbeing.fatigue.push(parseInt(document.getElementById('fatigue').value));
            swimmer.wellbeing.pain.push(parseInt(document.getElementById('pain').value));
            swimmer.wellbeing.stress.push(parseInt(document.getElementById('stress').value));
            swimmer.wellbeing.dates.push(date);
            break;
            
        case 'training':
            swimmer.training.volume.push(parseInt(document.getElementById('volume').value));
            swimmer.training.volumeMeters.push(parseInt(document.getElementById('volumeMeters').value));
            swimmer.training.rpe.push(parseInt(document.getElementById('rpe').value));
            swimmer.training.charge.push(
                parseInt(document.getElementById('volume').value) * parseInt(document.getElementById('rpe').value)
            );
            swimmer.training.dates.push(date);
            break;
            
        case 'performance':
            swimmer.performance.vma.push(parseFloat(document.getElementById('vma').value));
            swimmer.performance.shoulderStrength.push(parseFloat(document.getElementById('shoulderStrength').value));
            swimmer.performance.chestStrength.push(parseFloat(document.getElementById('chestStrength').value));
            swimmer.performance.legStrength.push(parseFloat(document.getElementById('legStrength').value));
            swimmer.performance.dates.push(date);
            break;
            
        case 'medical':
            swimmer.medical.availability.push(parseInt(document.getElementById('availability').value));
            swimmer.medical.illnesses.push(parseInt(document.getElementById('illnesses').value));
            swimmer.medical.injuries.push(parseInt(document.getElementById('injuries').value));
            swimmer.medical.otherIssues.push(parseInt(document.getElementById('otherIssues').value));
            swimmer.medical.dates.push(date);
            break;
            
        case 'race':
            const eventName = document.getElementById('eventName').value;
            
            if (!eventName) {
                alert('Veuillez saisir le nom de l\'événement');
                return;
            }
            
            // Initialiser races si nécessaire
            if (!swimmer.racePerformances.races) {
                swimmer.racePerformances.races = [];
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
            
            swimmer.racePerformances.event.push(eventName);
            swimmer.racePerformances.races.push(raceEntries);
            swimmer.racePerformances.dates.push(date);
            break;
    }
    
    saveToLocalStorage();
    closeAllModals();
    updateDashboard();
    showNotification('success', 'Données enregistrées avec succès!');
}

// =============================================
// GESTION DES PERFORMANCES DE COURSE
// =============================================

let raceEntryCount = 0;

function addRaceEntry() {
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

function updateTimeFormat(entryId) {
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

function removeRaceEntry(entryId) {
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
        training: analyzeTraining(swimmer.training),
        performance: analyzePerformance(swimmer.performance),
        medical: analyzeMedical(swimmer.medical),
        race: analyzeRacePerformances(swimmer.racePerformances || {dates: []}),
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

function analyzeTraining(training) {
    if (training.dates.length === 0) return { status: 'no_data', message: 'Aucune donnée d\'entraînement' };
    
    const lastIndex = training.dates.length - 1;
    const recentVolume = training.volume[lastIndex];
    const recentRPE = training.rpe[lastIndex];
    const recentCharge = training.charge[lastIndex];
    
    const avgVolume = training.volume.reduce((a, b) => a + b, 0) / training.volume.length;
    const avgRPE = training.rpe.reduce((a, b) => a + b, 0) / training.rpe.length;
    const avgCharge = training.charge.reduce((a, b) => a + b, 0) / training.charge.length;
    
    // Calculer la monotonie (écart-type des charges)
    const chargeStdDev = calculateStandardDeviation(training.charge);
    const monotony = chargeStdDev > 0 ? avgCharge / chargeStdDev : 0;
    
    let status = 'good';
    if (recentRPE > 8 && recentVolume > 120) {
        status = 'warning';
    } else if (recentRPE > 9 || monotony > 2.0) {
        status = 'poor';
    }
    
    return {
        status,
        recent: { volume: recentVolume, rpe: recentRPE, charge: recentCharge },
        averages: { volume: avgVolume, rpe: avgRPE, charge: avgCharge },
        monotony: monotony,
        trend: calculateTrend(training.charge)
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
    if (medical.dates.length === 0) return { status: 'no_data', message: 'Aucune donnée médicale' };
    
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
    
    // Recommandations basées sur le statut médical
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
    
    // Recommandations générales si peu de données
    const totalDataPoints = 
        (analysis.wellbeing.status === 'no_data' ? 0 : 1) +
        (analysis.training.status === 'no_data' ? 0 : 1) +
        (analysis.performance.status === 'no_data' ? 0 : 1) +
        (analysis.medical.status === 'no_data' ? 0 : 1) +
        (analysis.race && analysis.race.status !== 'no_data' ? 1 : 0);
        
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
        const medicalStatus = getStatusMessage(analysis.medical.status, 'statut médical');
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
            showDashboard();
            break;
        case 'saisie':
            showDataEntry();
            break;
        case 'analyse':
            showAnalysis();
            break;
        case 'retours':
            showFeedback();
            break;
        default:
            showDashboard();
    }
}

function showDashboard() {
    if (swimmers.length === 0) {
        showEmptyState();
        return;
    }

    let content = '';
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        if (swimmer) {
            content = generateSwimmerDashboard(swimmer);
        }
    } else {
        content = generateOverviewDashboard();
    }
    
    dashboardContent.innerHTML = content;
    
    if (currentSwimmerId) {
        initializeCharts();
    }
}

function showDataEntry() {
    let content = `<div class="section">
        <h2 class="section-title">Saisie des Données</h2>
        <p>Sélectionnez un nageur et le type de données à saisir.</p>`;
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        content += `
            <div class="data-entry-section">
                <h3 class="data-entry-title">Saisie pour ${swimmer.name}</h3>
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Bien-être</h3>
                            <div class="card-icon">😊</div>
                        </div>
                        <div class="card-content">
                            <p>Saisir les données de sommeil, fatigue, douleur et stress.</p>
                            <button class="btn btn-primary data-entry-btn" data-type="wellbeing">Saisir</button>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Entraînement</h3>
                            <div class="card-icon">📊</div>
                        </div>
                        <div class="card-content">
                            <p>Saisir le volume, RPE et charge d'entraînement.</p>
                            <button class="btn btn-primary data-entry-btn" data-type="training">Saisir</button>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Performance</h3>
                            <div class="card-icon">💪</div>
                        </div>
                        <div class="card-content">
                            <p>Saisir les tests de VMA, force et puissance.</p>
                            <button class="btn btn-primary data-entry-btn" data-type="performance">Saisir</button>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Statut Médical</h3>
                            <div class="card-icon">🏥</div>
                        </div>
                        <div class="card-content">
                            <p>Saisir la disponibilité et les problèmes de santé.</p>
                            <button class="btn btn-primary data-entry-btn" data-type="medical">Saisir</button>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Performances de Course</h3>
                            <div class="card-icon">🏊‍♂️</div>
                        </div>
                        <div class="card-content">
                            <p>Enregistrer les temps de course par distance.</p>
                            <button class="btn btn-primary data-entry-btn" data-type="race">Saisir</button>
                        </div>
                    </div>
                </div>
            </div>`;
    } else {
        content += `<div class="empty-state">
            <div class="empty-state-icon">👤</div>
            <h3 class="empty-state-title">Aucun nageur sélectionné</h3>
            <p class="empty-state-text">Veuillez sélectionner un nageur pour saisir des données.</p>
        </div>`;
    }
    
    content += `</div>`;
    dashboardContent.innerHTML = content;
}

function showAnalysis() {
    let content = `<div class="section">
        <h2 class="section-title">Analyse des Données</h2>`;
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        const analysis = analyzeSwimmerData(swimmer);
        
        content += `<h3>Analyse pour ${swimmer.name}</h3>`;
        
        // Cartes de statut
        content += `<div class="cards-grid">`;
        
        // Bien-être
        content += generateAnalysisCard('Bien-être', analysis.wellbeing, '😊');
        
        // Entraînement
        content += generateAnalysisCard('Entraînement', analysis.training, '📊');
        
        // Performance
        content += generateAnalysisCard('Performance', analysis.performance, '💪');
        
        // Médical
        content += generateAnalysisCard('Statut Médical', analysis.medical, '🏥');
        
        content += `</div>`;
        
        // Graphiques
        content += `<div class="section">
            <h3 class="section-title">Visualisations</h3>
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
                        <h3 class="card-title">Charge d'Entraînement</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="trainingChart"></canvas>
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
            </div>
        </div>`;
        
    } else {
        content += `<div class="empty-state">
            <div class="empty-state-icon">📈</div>
            <h3 class="empty-state-title">Aucun nageur sélectionné</h3>
            <p class="empty-state-text">Veuillez sélectionner un nageur pour voir l'analyse.</p>
        </div>`;
    }
    
    content += `</div>`;
    dashboardContent.innerHTML = content;
    
    if (currentSwimmerId) {
        initializeAnalysisCharts();
    }
}

function showFeedback() {
    let content = `<div class="section">
        <h2 class="section-title">Retours Personnalisés</h2>`;
    
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        const analysis = analyzeSwimmerData(swimmer);
        
        content += generatePersonalizedFeedback(swimmer, analysis);
        
    } else {
        content += `<div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <h3 class="empty-state-title">Aucun nageur sélectionné</h3>
            <p class="empty-state-text">Veuillez sélectionner un nageur pour voir les retours personnalisés.</p>
        </div>`;
    }
    
    content += `</div>`;
    dashboardContent.innerHTML = content;
}

function generateAnalysisCard(title, data, icon) {
    let statusClass = 'badge-good';
    let statusText = 'Bon';
    
    if (data.status === 'warning') {
        statusClass = 'badge-ok';
        statusText = 'Attention';
    } else if (data.status === 'poor') {
        statusClass = 'badge-poor';
        statusText = 'Problématique';
    } else if (data.status === 'no_data') {
        statusClass = 'badge';
        statusText = 'Données manquantes';
    }
    
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${title}</h3>
                <div class="card-icon">${icon}</div>
            </div>
            <div class="card-content">
                <div class="stat-item" style="background: none; padding: 0;">
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                ${data.status !== 'no_data' ? `
                    <p>${getAnalysisDetails(data, title)}</p>
                ` : '<p>Aucune donnée disponible</p>'}
            </div>
        </div>`;
}

function getAnalysisDetails(data, title) {
    switch(title) {
        case 'Bien-être':
            return `Dernier score: ${data.recent.sleep + data.recent.fatigue + data.recent.pain + data.recent.stress}/20`;
        case 'Entraînement':
            return `Charge récente: ${data.recent.charge} (Monotonie: ${data.monotony.toFixed(2)})`;
        case 'Performance':
            return `VMA: ${data.recent.vma}, Force épaule: ${data.recent.shoulder}kg`;
        case 'Statut Médical':
            return `Disponibilité: ${data.recent.availability}/3`;
        default:
            return 'Détails non disponibles';
    }
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

function updateAthleteSelector() {
    const currentSelection = athleteSelector.value;
    
    athleteSelector.innerHTML = '<option value="all">Tous les nageurs</option>';
    
    swimmers.forEach(swimmer => {
        const option = document.createElement('option');
        option.value = swimmer.id;
        option.textContent = swimmer.name;
        athleteSelector.appendChild(option);
    });
    
    if (currentSelection && swimmers.some(s => s.id === currentSelection)) {
        athleteSelector.value = currentSelection;
    } else if (currentSwimmerId) {
        athleteSelector.value = currentSwimmerId;
    }
}

function closeAllModals() {
    addSwimmerModal.style.display = 'none';
    dataEntryModal.style.display = 'none';
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
function generateSwimmerDashboard(swimmer) {
    const analysis = analyzeSwimmerData(swimmer);
    const overallStatus = getOverallStatus(analysis);
    
    let content = `
        <div class="section">
            <div class="swimmer-header">
                <h3 class="swimmer-name">${swimmer.name}</h3>
                <div class="swimmer-info">
                    <span class="badge badge-new">${swimmer.age} ans</span>
                    <span class="badge badge-new">${swimmer.specialty}</span>
                    <span class="badge ${getBadgeClass(overallStatus.status)}">${overallStatus.message}</span>
                </div>
            </div>
            
            <div class="cards-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Résumé Bien-être</h3>
                        <div class="card-icon">😊</div>
                    </div>
                    <div class="card-content">
                        ${generateQuickStats(swimmer.wellbeing, 'wellbeing')}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Résumé Entraînement</h3>
                        <div class="card-icon">📊</div>
                    </div>
                    <div class="card-content">
                        ${generateQuickStats(swimmer.training, 'training')}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Résumé Performance</h3>
                        <div class="card-icon">💪</div>
                    </div>
                    <div class="card-content">
                        ${generateQuickStats(swimmer.performance, 'performance')}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Statut Médical</h3>
                        <div class="card-icon">🏥</div>
                    </div>
                    <div class="card-content">
                        ${generateQuickStats(swimmer.medical, 'medical')}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Performances de Course</h3>
                        <div class="card-icon">🏊‍♂️</div>
                    </div>
                    <div class="card-content">
                        ${generateQuickStats(swimmer.racePerformances || {dates: []}, 'race')}
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3 class="section-title">Dernières Recommandations</h3>
                <div class="feedback-box">
                    <ul>
                        ${analysis.recommendations.slice(0, 3).map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            ${generateRacePerformanceCharts(swimmer)}
        </div>
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

function initializeCharts() {
    // Implémentation des graphiques pour le tableau de bord
}

function initializeAnalysisCharts() {
    // Implémentation des graphiques pour l'analyse
    if (currentSwimmerId) {
        const swimmer = swimmers.find(s => s.id === currentSwimmerId);
        
        // Graphique de bien-être
        const wellbeingCtx = document.getElementById('wellbeingChart');
        if (wellbeingCtx && swimmer.wellbeing.dates.length > 0) {
            new Chart(wellbeingCtx, {
                type: 'line',
                data: {
                    labels: swimmer.wellbeing.dates,
                    datasets: [
                        {
                            label: 'Sommeil',
                            data: swimmer.wellbeing.sleep,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Fatigue',
                            data: swimmer.wellbeing.fatigue,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Douleur',
                            data: swimmer.wellbeing.pain,
                            borderColor: 'rgba(255, 159, 64, 1)',
                            backgroundColor: 'rgba(255, 159, 64, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Stress',
                            data: swimmer.wellbeing.stress,
                            borderColor: 'rgba(153, 102, 255, 1)',
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
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
                                stepSize: 1
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
        if (volumeRpeCtx && swimmer.training.dates.length > 0) {
            new Chart(volumeRpeCtx, {
                type: 'line',
                data: {
                    labels: swimmer.training.dates,
                    datasets: [
                        {
                            label: 'Volume (m)',
                            data: swimmer.training.volumeMeters || [],
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: false,
                            yAxisID: 'y'
                        },
                        {
                            label: 'RPE',
                            data: swimmer.training.rpe,
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
        
        // Graphique Charge d'entraînement (barres)
        const trainingCtx = document.getElementById('trainingChart');
        if (trainingCtx && swimmer.training.dates.length > 0) {
            new Chart(trainingCtx, {
                type: 'bar',
                data: {
                    labels: swimmer.training.dates,
                    datasets: [{
                        label: 'Charge d\'entraînement',
                        data: swimmer.training.charge,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Charge',
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
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
        
        // Graphique Radar des Performances
        const performanceRadarCtx = document.getElementById('performanceRadarChart');
        if (performanceRadarCtx && swimmer.performance.dates.length > 0) {
            // Prendre les 3 dernières mesures pour comparaison
            const recentCount = Math.min(3, swimmer.performance.dates.length);
            const startIndex = swimmer.performance.dates.length - recentCount;
            
            const datasets = [];
            const colors = [
                { border: 'rgba(255, 99, 132, 1)', bg: 'rgba(255, 99, 132, 0.2)' },
                { border: 'rgba(54, 162, 235, 1)', bg: 'rgba(54, 162, 235, 0.2)' },
                { border: 'rgba(75, 192, 192, 1)', bg: 'rgba(75, 192, 192, 0.2)' }
            ];
            
            for (let i = 0; i < recentCount; i++) {
                const index = startIndex + i;
                datasets.push({
                    label: swimmer.performance.dates[index],
                    data: [
                        swimmer.performance.vma[index],
                        swimmer.performance.shoulderStrength[index],
                        swimmer.performance.chestStrength[index],
                        swimmer.performance.legStrength[index]
                    ],
                    borderColor: colors[i].border,
                    backgroundColor: colors[i].bg,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            angleLines: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            pointLabels: {
                                font: {
                                    size: 11,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                backdropColor: 'transparent'
                            }
                        }
                    }
                }
            });
        }
    }
}

function showEmptyState() {
    dashboardContent.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🏊‍♂️</div>
            <h3 class="empty-state-title">Aucun nageur enregistré</h3>
            <p class="empty-state-text">Commencez par ajouter votre premier nageur pour utiliser le système.</p>
            <button class="btn btn-primary" id="emptyStateAddBtn">Ajouter un Nageur</button>
        </div>
    `;
    
    document.getElementById('emptyStateAddBtn').addEventListener('click', () => {
        addSwimmerModal.style.display = 'flex';
    });
}
