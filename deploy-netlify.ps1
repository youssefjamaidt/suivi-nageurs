# ====================================
# SCRIPT DE DÉPLOIEMENT NETLIFY
# ====================================
# Ce script automatise le déploiement sur Netlify

Write-Host "🚀 DÉPLOIEMENT SUR NETLIFY" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Vérifier que firebase-config.js est configuré
Write-Host "📋 Vérification de la configuration..." -ForegroundColor Yellow

$firebaseConfig = Get-Content "firebase-config.js" -Raw

if ($firebaseConfig -match "VOTRE_API_KEY") {
    Write-Host "❌ ERREUR : Firebase n'est pas configuré !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez d'abord configurer Firebase :" -ForegroundColor Yellow
    Write-Host "1. Allez sur https://console.firebase.google.com" -ForegroundColor White
    Write-Host "2. Créez un projet Firebase" -ForegroundColor White
    Write-Host "3. Copiez vos clés dans firebase-config.js" -ForegroundColor White
    Write-Host "4. Relancez ce script" -ForegroundColor White
    Write-Host ""
    Write-Host "Consultez DEPLOIEMENT-NETLIFY.md pour plus de détails" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Firebase configuré" -ForegroundColor Green

# Vérifier Git
Write-Host "`n📦 Vérification de Git..." -ForegroundColor Yellow

$gitStatus = git status --porcelain 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Git n'est pas initialisé" -ForegroundColor Red
    Write-Host "Exécutez : git init" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git initialisé" -ForegroundColor Green

# Vérifier remote GitHub
$gitRemote = git remote get-url origin 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR : Aucun remote GitHub configuré" -ForegroundColor Red
    Write-Host ""
    Write-Host "Exécutez :" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/VOTRE_USERNAME/suivi-nageurs.git" -ForegroundColor White
    exit 1
}

Write-Host "✅ Remote GitHub configuré : $gitRemote" -ForegroundColor Green

# Ajouter tous les fichiers
Write-Host "`n📝 Ajout des fichiers..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR lors de git add" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green

# Commit
$commitMessage = Read-Host "`n💬 Message de commit (Enter = défaut)"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "🚀 Deploy to Netlify - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "`n📝 Commit en cours..." -ForegroundColor Yellow
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aucun changement à commiter" -ForegroundColor Yellow
} else {
    Write-Host "✅ Commit réussi" -ForegroundColor Green
}

# Push vers GitHub
Write-Host "`n⬆️  Push vers GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERREUR lors du push vers GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez :" -ForegroundColor Yellow
    Write-Host "- Que vous êtes connecté à GitHub" -ForegroundColor White
    Write-Host "- Que le repository existe" -ForegroundColor White
    Write-Host "- Que vous avez les droits d'écriture" -ForegroundColor White
    exit 1
}

Write-Host "✅ Code poussé vers GitHub" -ForegroundColor Green

# Instructions Netlify
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "✅ DÉPLOIEMENT PRÊT POUR NETLIFY" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n📋 PROCHAINES ÉTAPES :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Allez sur https://app.netlify.com" -ForegroundColor White
Write-Host "2️⃣  Cliquez sur 'Add new site' > 'Import an existing project'" -ForegroundColor White
Write-Host "3️⃣  Choisissez 'GitHub' et sélectionnez 'suivi-nageurs'" -ForegroundColor White
Write-Host "4️⃣  Configuration :" -ForegroundColor White
Write-Host "    - Branch: main" -ForegroundColor Gray
Write-Host "    - Build command: (laisser vide)" -ForegroundColor Gray
Write-Host "    - Publish directory: (laisser vide)" -ForegroundColor Gray
Write-Host "5️⃣  Cliquez sur 'Deploy site'" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Netlify va déployer votre site en ~1 minute" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 Consultez DEPLOIEMENT-NETLIFY.md pour le guide complet" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Bonne chance !" -ForegroundColor Green
