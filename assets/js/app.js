
// =============================================
// DONNÉES ET ÉTAT DE L'APPLICATION
// =============================================
let swimmers = [];
let currentSwimmerId = null;
let currentDataType = null;

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
    initializeEventListeners();
    updateDashboard();
});

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

    document.getElementById('confirmAddBtn').addEventListener('click', confirmAddSwimmer);

    // Sauvegarde des données
    document.getElementById('saveDataBtn').addEventListener('click', saveData);

    // Sélection d'athlète
    athleteSelector.addEventListener('change', function() {
        currentSwimmerId = this.value === 'all' ? null : this.value;
        updateDashboard();
    });

    // Réinitialisation
    resetDataBtn.addEventListener('click', resetData);

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
    });
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
        }
    };

    swimmers.push(newSwimmer);
    updateAthleteSelector();
    updateDashboard();
    
    currentSwimmerId = newSwimmer.id;
    athleteSelector.value = newSwimmer.id;
    
    alert(`Nageur ${name} ajouté avec succès !`);
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
}

function getDataEntryTitle(dataType) {
    const titles = {
        'wellbeing': 'Saisie du Bien-être',
        'training': 'Saisie de l\'Entraînement',
        'performance': 'Saisie des Performances',
        'medical': 'Saisie du Statut Médical'
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
                        <label for="rpe">RPE (1-10)</label>
                        <input type="number" id="rpe" class="form-control" min="1" max="10" required>
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
                        <label for="vma">VMA 6min</label>
                        <input type="number" id="vma" class="form-control" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="shoulderStrength">Force épaule (kg)</label>
                        <input type="number" id="shoulderStrength" class="form-control" min="0" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="chestStrength">Force pectoraux (kg)</label>
                        <input type="number" id="chestStrength" class="form-control" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="legStrength">Force jambes (kg)</label>
                        <input type="number" id="legStrength" class="form-control" min="0" required>
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
            swimmer.training.rpe.push(parseInt(document.getElementById('rpe').value));
            swimmer.training.charge.push(
                parseInt(document.getElementById('volume').value) * parseInt(document.getElementById('rpe').value)
            );
            swimmer.training.dates.push(date);
            break;
            
        case 'performance':
            swimmer.performance.vma.push(parseInt(document.getElementById('vma').value));
            swimmer.performance.shoulderStrength.push(parseInt(document.getElementById('shoulderStrength').value));
            swimmer.performance.chestStrength.push(parseInt(document.getElementById('chestStrength').value));
            swimmer.performance.legStrength.push(parseInt(document.getElementById('legStrength').value));
            swimmer.performance.dates.push(date);
            break;
            
        case 'medical':
            swimmer.medical.availability.push(parseInt(document.getElementById('availability').value));
            swimmer.medical.illnesses.push(parseInt(document.getElementById('illnesses').value));
            swimmer.medical.injuries.push(parseInt(document.getElementById('injuries').value));
            swimmer.medical.otherIssues.push(parseInt(document.getElementById('otherIssues').value));
            swimmer.medical.dates.push(date);
            break;
    }
    
    closeAllModals();
    updateDashboard();
    alert('Données enregistrées avec succès !');
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
    
    // Recommandations générales si peu de données
    const totalDataPoints = 
        (analysis.wellbeing.status === 'no_data' ? 0 : 1) +
        (analysis.training.status === 'no_data' ? 0 : 1) +
        (analysis.performance.status === 'no_data' ? 0 : 1) +
        (analysis.medical.status === 'no_data' ? 0 : 1);
        
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
                        <h3 class="card-title">Charge d'Entraînement</h3>
                    </div>
                    <div class="card-content">
                        <div class="chart-container">
                            <canvas id="trainingChart"></canvas>
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
}

function resetData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
        swimmers = [];
        currentSwimmerId = null;
        updateDashboard();
        updateAthleteSelector();
        alert('Toutes les données ont été réinitialisées. Compte 0 créé.');
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
    return `<div class="empty-state">
        <h3>Tableau de bord pour ${swimmer.name}</h3>
        <p>Cette section afficherait le tableau de bord détaillé du nageur.</p>
    </div>`;
}

function generateOverviewDashboard() {
    return `<div class="empty-state">
        <h3>Vue d'ensemble de tous les nageurs</h3>
        <p>Cette section afficherait les statistiques globales de l'équipe.</p>
    </div>`;
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
                            tension: 0.4
                        },
                        {
                            label: 'Fatigue',
                            data: swimmer.wellbeing.fatigue,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5
                        }
                    }
                }
            });
        }
        
        // Graphique d'entraînement
        const trainingCtx = document.getElementById('trainingChart');
        if (trainingCtx && swimmer.training.dates.length > 0) {
            new Chart(trainingCtx, {
                type: 'bar',
                data: {
                    labels: swimmer.training.dates,
                    datasets: [{
                        label: 'Charge d\'entraînement',
                        data: swimmer.training.charge,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
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
