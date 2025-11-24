# 🔥 STRUCTURE FIRESTORE - SUIVI NAGEURS

## Collections Firestore

### 1. `users` (Utilisateurs)
Contient tous les utilisateurs (admin, coach, nageur)

```javascript
{
  uid: "auto-generated-by-auth",
  email: "user@example.com",
  firstName: "Jean",
  lastName: "Dupont",
  role: "coach|admin|nageur",
  status: "active|pending|disabled",
  
  // Spécifique coach
  club: "CN Paris",
  phone: "+33612345678",
  teams: ["teamId1", "teamId2"], // IDs des équipes
  
  // Spécifique nageur
  coachId: "coachUserId",
  teamId: "teamId",
  hasAccount: true,
  birthDate: "2005-03-15",
  
  // Métadonnées
  createdAt: Timestamp,
  createdBy: "userId", // Pour nageurs: ID du coach qui l'a créé
  lastLogin: Timestamp,
  updatedAt: Timestamp
}
```

**Index requis:**
- `role` ASC, `status` ASC
- `teamId` ASC, `role` ASC
- `coachId` ASC, `status` ASC

---

### 2. `teams` (Équipes)
Équipes créées par les coachs

```javascript
{
  id: "auto-generated",
  name: "Équipe Compétition 2025",
  coachId: "userId",
  category: "Senior|Junior|Jeunes|Poussins",
  season: "2024-2025",
  swimmers: ["swimmerId1", "swimmerId2"], // IDs des nageurs
  
  // Stats
  totalSwimmers: 15,
  activeSwimmers: 14,
  
  // Métadonnées
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Index requis:**
- `coachId` ASC, `createdAt` DESC

---

### 3. `wellbeing_data` (Données Bien-être)
Saisies quotidiennes/hebdomadaires des nageurs

```javascript
{
  id: "auto-generated",
  swimmerId: "userId",
  teamId: "teamId",
  date: "2025-11-24", // Format YYYY-MM-DD
  timestamp: Timestamp,
  
  // Champs quotidiens (obligatoires)
  sleepQuality: 7, // 1-10
  energyLevel: 8,
  motivation: 9,
  stressLevel: 3,
  muscleRecovery: 7,
  score: 7.6, // Calculé: (sleep+energy+motivation+(11-stress)+recovery)/5
  
  // Champs hebdomadaires (optionnels)
  sleepHours: 8.5,
  bodyWeight: 68.5,
  nightAwakenings: "0|1-2|3+",
  wakeQuality: 4, // 1-5
  musclePain: 2, // 0-10
  painLocation: "Épaule droite",
  generalFatigue: "Faible|Modérée|Élevée",
  appetite: "Faible|Normal|Élevé",
  
  // Métadonnées
  enteredBy: "self|coach",
  enteredByUserId: "userId",
  notes: "Texte libre optionnel"
}
```

**Index requis:**
- `swimmerId` ASC, `date` DESC
- `teamId` ASC, `date` DESC
- `swimmerId` ASC, `timestamp` DESC

---

### 4. `performance_data` (Données Performance)
Tests de performance (VMA, force, etc.)

```javascript
{
  id: "auto-generated",
  swimmerId: "userId",
  teamId: "teamId",
  date: "2025-11-24",
  timestamp: Timestamp,
  
  // VMA (Vitesse Maximale Aérobie)
  vmaTest: {
    type: "Cooper|Léger-Boucher|30-15 IFT",
    distance: 3200, // mètres
    time: 720, // secondes
    vma: 16.0, // km/h
    vo2max: 56.0 // ml/min/kg
  },
  
  // Force
  strengthTest: {
    type: "Pompes|Tractions|Gainage",
    repetitions: 45,
    duration: 180, // secondes pour gainage
    weight: 0 // kg (si applicable)
  },
  
  // Sprint
  sprintTest: {
    distance: 50, // mètres
    time: 25.3, // secondes
    stroke: "Crawl|Dos|Brasse|Papillon"
  },
  
  // Métadonnées
  testType: "VMA|Force|Sprint|Endurance",
  enteredBy: "coach",
  enteredByUserId: "userId",
  notes: ""
}
```

**Index requis:**
- `swimmerId` ASC, `date` DESC
- `teamId` ASC, `date` DESC
- `swimmerId` ASC, `testType` ASC, `date` DESC

---

### 5. `medical_data` (Données Médicales)
Blessures, conditions médicales

```javascript
{
  id: "auto-generated",
  swimmerId: "userId",
  teamId: "teamId",
  date: "2025-11-24",
  timestamp: Timestamp,
  
  // Blessure
  type: "Blessure|Maladie|Fatigue|Autre",
  condition: "Tendinite épaule",
  location: "Épaule droite",
  severity: "Légère|Modérée|Sévère",
  status: "active|recovering|resolved",
  
  // Traitement
  treatment: "Repos + Kiné",
  restrictions: "Pas de papillon",
  expectedRecovery: "2025-12-15",
  
  // Suivi
  painLevel: 4, // 0-10
  evolution: "Amélioration|Stable|Aggravation",
  
  // Métadonnées
  reportedBy: "self|coach|doctor",
  enteredByUserId: "userId",
  resolvedAt: Timestamp,
  notes: ""
}
```

**Index requis:**
- `swimmerId` ASC, `date` DESC
- `swimmerId` ASC, `status` ASC
- `teamId` ASC, `status` ASC

---

### 6. `race_data` (Données Compétitions)
Résultats de courses

```javascript
{
  id: "auto-generated",
  swimmerId: "userId",
  teamId: "teamId",
  date: "2025-11-24",
  timestamp: Timestamp,
  
  // Compétition
  competition: "Championnats Régionaux 2025",
  location: "Paris",
  level: "Club|Régional|National|International",
  
  // Course
  event: "100m Nage Libre",
  distance: 100,
  stroke: "Crawl|Dos|Brasse|Papillon|4 Nages",
  category: "Senior|Junior|Jeunes",
  
  // Résultat
  time: 53.45, // secondes
  rank: 3,
  points: 850, // Points FINA
  personalBest: true,
  
  // Splits (optionnel)
  splits: [26.2, 27.25], // temps intermédiaires
  
  // Métadonnées
  enteredBy: "coach",
  enteredByUserId: "userId",
  notes: "Bon départ, à améliorer le virage"
}
```

**Index requis:**
- `swimmerId` ASC, `date` DESC
- `teamId` ASC, `date` DESC
- `swimmerId` ASC, `event` ASC, `date` DESC

---

### 7. `technical_data` (Données Techniques)
Évaluations techniques

```javascript
{
  id: "auto-generated",
  swimmerId: "userId",
  teamId: "teamId",
  date: "2025-11-24",
  timestamp: Timestamp,
  
  // Évaluation
  stroke: "Crawl|Dos|Brasse|Papillon",
  aspect: "Départ|Virage|Coulée|Respiration|Coordination",
  
  // Notation
  rating: 7, // 1-10
  improvement: "En progrès|Stable|À travailler",
  
  // Détails
  strengths: ["Bonne glisse", "Virages rapides"],
  weaknesses: ["Respiration tardive", "Coulée courte"],
  recommendations: ["Travailler la respiration bilatérale"],
  
  // Métadonnées
  evaluatedBy: "coach",
  enteredByUserId: "userId",
  videoUrl: "", // URL vidéo optionnelle
  notes: ""
}
```

**Index requis:**
- `swimmerId` ASC, `date` DESC
- `teamId` ASC, `date` DESC
- `swimmerId` ASC, `stroke` ASC, `date` DESC

---

### 8. `attendance_data` (Données Présence)
Suivi des présences aux entraînements

```javascript
{
  id: "auto-generated",
  swimmerId: "userId",
  teamId: "teamId",
  date: "2025-11-24",
  timestamp: Timestamp,
  
  // Séance
  sessionType: "Entraînement|Compétition|Test",
  sessionTime: "Matin|Après-midi|Soir",
  duration: 120, // minutes
  
  // Présence
  status: "present|absent|late|excused",
  arrivalTime: "18:00",
  excuseReason: "Maladie|Blessure|Famille|Autre",
  
  // Effort
  effortLevel: 8, // 1-10
  participationQuality: "Excellent|Bon|Moyen|Faible",
  
  // Métadonnées
  markedBy: "coach|self",
  enteredByUserId: "userId",
  notes: ""
}
```

**Index requis:**
- `swimmerId` ASC, `date` DESC
- `teamId` ASC, `date` DESC
- `swimmerId` ASC, `status` ASC

---

## Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonctions utilitaires
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isCoach() {
      return isAuthenticated() && getUserData().role == 'coach';
    }
    
    function isSwimmer() {
      return isAuthenticated() && getUserData().role == 'nageur';
    }
    
    function isActive() {
      return getUserData().status == 'active';
    }
    
    // Collection USERS
    match /users/{userId} {
      // Lecture: soi-même, son coach, ou admin
      allow read: if isAuthenticated() && (
        request.auth.uid == userId ||
        isAdmin() ||
        (isCoach() && resource.data.coachId == request.auth.uid)
      );
      
      // Création: seulement admin ou coach (pour nageurs)
      allow create: if isAdmin() || 
        (isCoach() && request.resource.data.role == 'nageur');
      
      // Mise à jour: soi-même (champs limités), son coach, ou admin
      allow update: if isAuthenticated() && (
        (request.auth.uid == userId && 
         !request.resource.data.diff(resource.data).affectedKeys()
           .hasAny(['role', 'status', 'coachId', 'teamId'])) ||
        isAdmin() ||
        (isCoach() && resource.data.coachId == request.auth.uid)
      );
      
      // Suppression: seulement admin
      allow delete: if isAdmin();
    }
    
    // Collection TEAMS
    match /teams/{teamId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.coachId == request.auth.uid ||
        getUserData().teamId == teamId
      );
      
      allow create: if isCoach() && isActive();
      
      allow update: if isAuthenticated() && (
        isAdmin() ||
        resource.data.coachId == request.auth.uid
      );
      
      allow delete: if isAdmin() || 
        resource.data.coachId == request.auth.uid;
    }
    
    // Collection WELLBEING_DATA
    match /wellbeing_data/{dataId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.swimmerId == request.auth.uid ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
      
      allow create: if isAuthenticated() && (
        request.resource.data.swimmerId == request.auth.uid ||
        (isCoach() && isActive())
      );
      
      allow update: if isAuthenticated() && (
        resource.data.swimmerId == request.auth.uid ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
      
      allow delete: if isAdmin() || 
        (isCoach() && resource.data.teamId in getUserData().teams);
    }
    
    // Collections PERFORMANCE, MEDICAL, RACE, TECHNICAL, ATTENDANCE
    match /{collection}/{dataId} {
      allow read: if collection in [
        'performance_data', 'medical_data', 'race_data', 
        'technical_data', 'attendance_data'
      ] && isAuthenticated() && (
        isAdmin() ||
        resource.data.swimmerId == request.auth.uid ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
      
      allow create: if collection in [
        'performance_data', 'medical_data', 'race_data', 
        'technical_data', 'attendance_data'
      ] && isAuthenticated() && (
        (isSwimmer() && request.resource.data.swimmerId == request.auth.uid) ||
        (isCoach() && isActive())
      );
      
      allow update, delete: if collection in [
        'performance_data', 'medical_data', 'race_data', 
        'technical_data', 'attendance_data'
      ] && isAuthenticated() && (
        isAdmin() ||
        (isCoach() && resource.data.teamId in getUserData().teams)
      );
    }
  }
}
```

---

## Configuration des Index

Dans la console Firebase, créer ces index composites :

### Collection `users`:
1. `role` (ASC) + `status` (ASC)
2. `teamId` (ASC) + `role` (ASC)
3. `coachId` (ASC) + `createdAt` (DESC)

### Collection `teams`:
1. `coachId` (ASC) + `createdAt` (DESC)

### Collection `wellbeing_data`:
1. `swimmerId` (ASC) + `date` (DESC)
2. `teamId` (ASC) + `date` (DESC)
3. `swimmerId` (ASC) + `timestamp` (DESC)

### Collection `performance_data`:
1. `swimmerId` (ASC) + `date` (DESC)
2. `teamId` (ASC) + `date` (DESC)
3. `swimmerId` (ASC) + `testType` (ASC) + `date` (DESC)

### Collection `medical_data`:
1. `swimmerId` (ASC) + `date` (DESC)
2. `swimmerId` (ASC) + `status` (ASC)
3. `teamId` (ASC) + `status` (ASC)

### Collection `race_data`:
1. `swimmerId` (ASC) + `date` (DESC)
2. `teamId` (ASC) + `date` (DESC)
3. `swimmerId` (ASC) + `event` (ASC) + `date` (DESC)

### Collection `technical_data`:
1. `swimmerId` (ASC) + `date` (DESC)
2. `teamId` (ASC) + `date` (DESC)

### Collection `attendance_data`:
1. `swimmerId` (ASC) + `date` (DESC)
2. `teamId` (ASC) + `date` (DESC)

---

## Migration depuis localStorage

Voir `GUIDE-MIGRATION-FIRESTORE.md` pour migrer les données existantes.
