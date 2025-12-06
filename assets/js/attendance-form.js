/**
 * ============================================================
 * FORMULAIRE DE SUIVI DE PRÉSENCE - ARCHITECTURE REFACTORISÉE
 * ============================================================
 * 
 * Organisation:
 * 1. ÉTAT GLOBAL (State Management)
 * 2. GESTION D'ÉTAT (State Functions)
 * 3. RENDU UI (Rendering Functions)
 * 4. GESTIONNAIRES D'ÉVÉNEMENTS (Event Handlers)
 * 5. UTILITAIRES (Helper Functions)
 * 6. CALENDRIER (Calendar Functions)
 * 7. MODALES (Modal Functions)
 */

// ============================================================
// 1. ÉTAT GLOBAL - State Management
// ============================================================

const AttendanceState = {
  // Données de la session actuelle
  currentDate: null,                    // Date actuellement affichée
  statuses: {},                         // Statuts des nageurs: {swimmerId: status}
  mode: 'new',                          // Mode: 'new' (saisie) ou 'edit' (modification)
  editDate: null,                       // Date en mode modification
  
  // Constantes
  STATUSES: ['present', 'absent', 'absent_excused', 'late', 'late_excused'],
  STATUS_CONFIG: {
    present: { label: '✅ Présent', color: '#4caf50', bg: '#c8e6c9' },
    absent: { label: '❌ Absent', color: '#f44336', bg: '#ffcdd2' },
    absent_excused: { label: '📝 Absent Justifié', color: '#9c27b0', bg: '#f3e5f5' },
    late: { label: '⏰ Retard', color: '#ff9800', bg: '#ffe0b2' },
    late_excused: { label: '⏰ Retard Justifié', color: '#2196f3', bg: '#e3f2fd' }
  }
};

// ============================================================
// 2. GESTION D'ÉTAT - State Functions
// ============================================================

/**
 * Initialiser l'état du formulaire de présence
 */
function initializeAttendanceState(swimmers, date = null) {
  const today = new Date().toISOString().split('T')[0];
  AttendanceState.currentDate = date || today;
  AttendanceState.statuses = {};
  AttendanceState.mode = 'new';
  AttendanceState.editDate = null;
  
  // Initialiser tous les statuts à "absent"
  swimmers.forEach(swimmer => {
    AttendanceState.statuses[swimmer.id] = 'absent';
  });
  
  // Si pas de date fournie, essayer de charger la dernière date
  if (!date) {
    const lastDate = getLastAttendanceDate(swimmers);
    if (lastDate) {
      AttendanceState.currentDate = lastDate;
      loadAttendanceDataForDate(swimmers, lastDate);
    }
  }
}

/**
 * Charger les données d'une date spécifique
 */
function loadAttendanceDataForDate(swimmers, date) {
  const allSwimmers = getAllSwimmers();
  
  swimmers.forEach(swimmer => {
    const fullSwimmer = allSwimmers.find(s => s.id === swimmer.id);
    if (fullSwimmer && fullSwimmer.attendanceData) {
      const record = fullSwimmer.attendanceData.find(r => r.date === date);
      if (record) {
        // Reconstruire le statut complet depuis l'historique
        let status = record.status;
        if (record.excused) {
          status = record.status === 'absent' ? 'absent_excused' : (record.status === 'late' ? 'late_excused' : status);
        }
        AttendanceState.statuses[swimmer.id] = status;
      }
    }
  });
}

/**
 * Mettre à jour le statut d'un nageur
 */
function updateSwimmerStatus(swimmerId, status) {
  AttendanceState.statuses[swimmerId] = status;
}

/**
 * Cycler au statut suivant
 */
function cycleSwimmerStatus(swimmerId) {
  const currentStatus = AttendanceState.statuses[swimmerId] || 'absent';
  const currentIndex = AttendanceState.STATUSES.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % AttendanceState.STATUSES.length;
  AttendanceState.statuses[swimmerId] = AttendanceState.STATUSES[nextIndex];
}

/**
 * Définir le mode du formulaire
 */
function setAttendanceMode(mode, editDate = null) {
  AttendanceState.mode = mode;
  AttendanceState.editDate = editDate;
}

/**
 * Réinitialiser le formulaire
 */
function resetAttendanceForm() {
  const swimmers = getTeamSwimmers();
  AttendanceState.statuses = {};
  swimmers.forEach(swimmer => {
    AttendanceState.statuses[swimmer.id] = 'absent';
  });
  AttendanceState.currentDate = new Date().toISOString().split('T')[0];
  AttendanceState.mode = 'new';
  AttendanceState.editDate = null;
}

// ============================================================
// 3. RENDU UI - Rendering Functions
// ============================================================

/**
 * Générer le HTML principal du formulaire
 */
function generateAttendanceFormHTML(swimmers) {
  return `
    <div style="padding: 20px;">
      <!-- En-tête avec bouton retour -->
      ${generateFormHeader()}
      
      <!-- Section de sélection de date -->
      ${generateDateSection()}
      
      <!-- Boîte d'information -->
      ${generateInfoBox()}
      
      <!-- Compteurs de statuts -->
      ${generateStatusCounters()}
      
      <!-- Liste des nageurs -->
      ${generateSwimmersList(swimmers)}
      
      <!-- Boutons d'action -->
      ${generateActionButtons()}
    </div>
  `;
}

/**
 * Générer l'en-tête du formulaire
 */
function generateFormHeader() {
  return `
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <button onclick="showCollectiveDataEntry()" class="btn btn-outline">
        <i class="fas fa-arrow-left"></i> Retour
      </button>
      <h2 style="margin: 0; color: #333; flex: 1; text-align: center;">
        <i class="fas fa-clipboard-check" style="margin-right: 10px;"></i>Feuille de Présence
      </h2>
      <div style="width: 150px;"></div>
    </div>
  `;
}

/**
 * Générer la section de sélection de date
 */
function generateDateSection() {
  const today = new Date().toISOString().split('T')[0];
  const displayDate = new Date(AttendanceState.currentDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
    <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: white; box-shadow: 0 4px 15px rgba(39,174,96,0.3);">
      <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 1.1rem;">
        <i class="fas fa-calendar-alt"></i> Sélectionner la Date
      </label>
      <input type="date" 
             id="attendanceDate" 
             value="${AttendanceState.currentDate}" 
             style="width: 100%; padding: 12px 15px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.95); font-size: 1.1rem; color: #333; font-weight: 500;"
             onchange="handleDateChange(this.value)">
      <div style="margin-top: 10px; font-size: 1.05rem; opacity: 0.9; text-align: center;">
        ${displayDate}
      </div>
    </div>
  `;
}

/**
 * Générer la boîte d'information
 */
function generateInfoBox() {
  const isEditMode = AttendanceState.mode === 'edit';
  const bgColor = isEditMode ? '#fff3cd' : '#e3f2fd';
  const borderColor = isEditMode ? '#ffc107' : '#2196f3';
  const textColor = isEditMode ? '#856404' : '#1976d2';
  const icon = isEditMode ? 'pencil-alt' : 'info-circle';
  const message = isEditMode 
    ? `<strong>Mode modification:</strong> Modifiez les statuts et cliquez sur "Enregistrer les Modifications".`
    : `<strong>Nouvelle saisie:</strong> Tous les nageurs sont définis comme "Absent" par défaut. Modifiez si nécessaire.`;
  
  return `
    <div style="background: ${bgColor}; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${borderColor};">
      <p style="margin: 0; color: ${textColor}; font-weight: 500;">
        <i class="fas fa-${icon}"></i> ${message}
      </p>
    </div>
  `;
}

/**
 * Générer les compteurs de statuts
 */
function generateStatusCounters() {
  const counts = calculateStatusCounts();
  
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 25px;">
      <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(76,175,80,0.3);">
        <div style="font-size: 2rem; font-weight: bold;">${counts.present}</div>
        <div style="font-size: 0.85rem; opacity: 0.9;">✅ Présents</div>
      </div>
      <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f44336 0%, #e57373 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(244,67,54,0.3);">
        <div style="font-size: 2rem; font-weight: bold;">${counts.absent}</div>
        <div style="font-size: 0.85rem; opacity: 0.9;">❌ Absents</div>
      </div>
      <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(156,39,176,0.3);">
        <div style="font-size: 2rem; font-weight: bold;">${counts.absent_excused}</div>
        <div style="font-size: 0.85rem; opacity: 0.9;">📝 Abs. Just.</div>
      </div>
      <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(255,152,0,0.3);">
        <div style="font-size: 2rem; font-weight: bold;">${counts.late}</div>
        <div style="font-size: 0.85rem; opacity: 0.9;">⏰ Retards</div>
      </div>
      <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%); border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(33,150,243,0.3);">
        <div style="font-size: 2rem; font-weight: bold;">${counts.late_excused}</div>
        <div style="font-size: 0.85rem; opacity: 0.9;">⏰ Ret. Just.</div>
      </div>
    </div>
  `;
}

/**
 * Générer la liste des nageurs avec boutons de statut
 */
function generateSwimmersList(swimmers) {
  return `
    <div style="max-height: 50vh; overflow-y: auto; border: 2px solid #e0e0e0; border-radius: 12px; padding: 15px; background: #fafafa; margin-bottom: 20px;">
      ${swimmers.map((swimmer, index) => generateSwimmerCard(swimmer, index)).join('')}
    </div>
  `;
}

/**
 * Générer une carte de nageur
 */
function generateSwimmerCard(swimmer, index) {
  const status = AttendanceState.statuses[swimmer.id] || 'absent';
  const config = AttendanceState.STATUS_CONFIG[status];
  
  return `
    <div class="attendance-swimmer-card" data-swimmer-id="${swimmer.id}" 
         style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: all 0.3s;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-weight: 600; color: #333; font-size: 1.1rem; margin-bottom: 5px;">
            <span style="display: inline-block; width: 30px; height: 30px; background: #27ae60; color: white; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-size: 0.9rem;">${index + 1}</span>
            ${swimmer.name || 'Nageur ' + (index + 1)}
          </div>
          <div style="font-size: 0.85rem; color: #666; margin-left: 40px;">
            <i class="fas fa-user"></i> ${swimmer.username || 'N/A'}
          </div>
        </div>
        
        <div style="display: flex; gap: 8px; align-items: center;">
          <!-- Bouton cycle unique -->
          <button onclick="handleStatusCycle('${swimmer.id}')"
                  style="padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 0.95rem; min-width: 160px; transition: all 0.2s; background: ${config.color}; color: white; border: 2px solid ${config.color};">
            ${config.label}
          </button>
          <!-- Bouton historique -->
          <button onclick="openSwimmerHistory('${swimmer.id}')" 
                  title="Visualiser l'historique" 
                  style="padding: 8px 10px; border-radius: 8px; border: 1px solid #e0e0e0; background: white; cursor: pointer; font-size: 0.9rem; color: #333;">
            <i class="fas fa-history"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Générer les boutons d'action
 */
function generateActionButtons() {
  const isEditMode = AttendanceState.mode === 'edit';
  const swimmerCount = Object.keys(AttendanceState.statuses).length;
  
  return `
    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px; padding-top: 25px; border-top: 3px solid #e0e0e0;">
      ${isEditMode ? `
        <button onclick="handleCancelEdit()" 
                style="flex: 1; min-width: 200px; max-width: 250px; padding: 15px; font-size: 1.05rem; background: white; color: #e53935; border: 2px solid #e53935; border-radius: 8px; cursor: pointer; transition: all 0.3s; font-weight: 600;"
                onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='white'">
          <i class="fas fa-times-circle"></i> Annuler Modification
        </button>
      ` : ''}
      
      <button onclick="handleOpenCalendar()" 
              style="flex: 1; min-width: 200px; max-width: 250px; padding: 15px; font-size: 1.05rem; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 3px 10px rgba(255,152,0,0.3); transition: all 0.3s;"
              onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <i class="fas fa-calendar"></i> ${isEditMode ? 'Fermer' : 'Autre Date'}
      </button>
      
      <button onclick="handleSaveAttendance()" 
              style="flex: 2; min-width: 280px; max-width: 450px; padding: 15px; font-size: 1.1rem; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 3px 10px rgba(39,174,96,0.3); transition: all 0.3s; font-weight: 600;"
              onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <i class="fas fa-save"></i> ${isEditMode ? 'Enregistrer les Modifications' : `Enregistrer (${swimmerCount} nageurs)`}
      </button>
    </div>
  `;
}

// ============================================================
// 4. GESTIONNAIRES D'ÉVÉNEMENTS - Event Handlers
// ============================================================

/**
 * Gérer le changement de date
 */
function handleDateChange(newDate) {
  AttendanceState.currentDate = newDate;
  const swimmers = getTeamSwimmers();
  loadAttendanceDataForDate(swimmers, newDate);
  refreshAttendanceFormUI(swimmers);
}

/**
 * Gérer le cycle de statut
 */
function handleStatusCycle(swimmerId) {
  cycleSwimmerStatus(swimmerId);
  refreshAttendanceFormUI(getTeamSwimmers());
}

/**
 * Gérer l'ouverture du calendrier
 */
function handleOpenCalendar() {
  openAttendanceCalendarForEdit();
}

/**
 * Gérer l'annulation de modification
 */
function handleCancelEdit() {
  if (!confirm('Voulez-vous abandonner les modifications en cours ?')) {
    return;
  }
  resetAttendanceForm();
  const swimmers = getTeamSwimmers();
  refreshAttendanceFormUI(swimmers);
}

/**
 * Gérer la sauvegarde
 */
function handleSaveAttendance() {
  saveAttendanceData();
}

/**
 * Rafraîchir l'interface du formulaire
 */
function refreshAttendanceFormUI(swimmers) {
  const content = document.getElementById('collectiveDataContent');
  if (content) {
    content.innerHTML = generateAttendanceFormHTML(swimmers);
  }
}

// ============================================================
// 5. UTILITAIRES - Helper Functions
// ============================================================

/**
 * Compter les statuts
 */
function calculateStatusCounts() {
  const counts = {
    present: 0,
    absent: 0,
    absent_excused: 0,
    late: 0,
    late_excused: 0
  };
  
  Object.values(AttendanceState.statuses).forEach(status => {
    if (counts.hasOwnProperty(status)) {
      counts[status]++;
    }
  });
  
  return counts;
}

/**
 * Obtenir le label d'un statut
 */
function getStatusLabel(status) {
  return AttendanceState.STATUS_CONFIG[status]?.label || 'Inconnu';
}

/**
 * Obtenir la couleur d'un statut
 */
function getStatusColor(status) {
  return AttendanceState.STATUS_CONFIG[status]?.color || '#999';
}

// ============================================================
// 6. CALENDRIER & MODALES - Calendar and Modal Functions
// ============================================================

// Les fonctions existantes de calendrier et modales restent inchangées
// (openAttendanceCalendarForEdit, generateCalendarGrid, createNewAttendanceForDate, etc.)

// Ils seront gardés comme étant jusqu'à ce qu'ils soient refactorisés séparément

/**
 * Sauvegarder les données de présence
 */
function saveAttendanceData() {
  const date = AttendanceState.currentDate;
  const statuses = AttendanceState.statuses;
  
  if (!date) {
    alert('⚠️ Veuillez sélectionner une date');
    return;
  }
  
  if (Object.keys(statuses).length === 0) {
    alert('⚠️ Aucun statut défini');
    return;
  }
  
  let savedCount = 0;
  let swimmers = getAllSwimmers();
  
  Object.keys(statuses).forEach(swimmerId => {
    const status = statuses[swimmerId];
    const swimmerIndex = swimmers.findIndex(s => s.id === swimmerId);
    
    if (swimmerIndex !== -1) {
      const swimmer = swimmers[swimmerIndex];
      
      if (!swimmer.attendanceData) {
        swimmer.attendanceData = [];
      }
      
      const existingIndex = swimmer.attendanceData.findIndex(entry => entry.date === date);
      
      let attendanceEntry = {
        date: date,
        status: status,
        excused: false,
        timestamp: new Date().toISOString()
      };
      
      if (status === 'late_excused') {
        attendanceEntry.status = 'late';
        attendanceEntry.excused = true;
      } else if (status === 'absent_excused') {
        attendanceEntry.status = 'absent';
        attendanceEntry.excused = true;
      }
      
      if (existingIndex !== -1) {
        swimmer.attendanceData[existingIndex] = attendanceEntry;
      } else {
        swimmer.attendanceData.push(attendanceEntry);
      }
      
      swimmers[swimmerIndex] = swimmer;
      savedCount++;
    }
  });
  
  localStorage.setItem('swimmers', JSON.stringify(swimmers));
  
  const isEditMode = AttendanceState.mode === 'edit';
  const dateStr = new Date(date).toLocaleDateString('fr-FR');
  const modeMsg = isEditMode ? 'modifiées' : 'enregistrées';
  
  alert(`✅ Présence ${modeMsg} avec succès pour ${savedCount} nageur(s) le ${dateStr}`);
  
  // Réinitialiser le formulaire
  resetAttendanceForm();
  const swimmers2 = getTeamSwimmers();
  refreshAttendanceFormUI(swimmers2);
}
