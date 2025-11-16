# Script de déploiement automatique
# Usage: .\deploy.ps1

Write-Host "🏊‍♂️ Déploiement de l'application Suivi des Nageurs" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "❌ Git n'est pas installé. Téléchargez-le sur https://git-scm.com/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git est installé" -ForegroundColor Green
Write-Host ""

# Vérifier si c'est déjà un repo Git
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initialisation du repository Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repository Git initialisé" -ForegroundColor Green
    Write-Host ""
}

# Configurer Git si nécessaire
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName) {
    Write-Host "⚙️ Configuration de Git..." -ForegroundColor Yellow
    $name = Read-Host "Entrez votre nom"
    git config --global user.name "$name"
}

if (-not $userEmail) {
    $email = Read-Host "Entrez votre email"
    git config --global user.email "$email"
}

Write-Host "✅ Configuration Git complète" -ForegroundColor Green
Write-Host ""

# Ajouter tous les fichiers
Write-Host "📝 Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Créer un commit
$commitMessage = Read-Host "Message du commit (appuyez sur Entrée pour 'Update application')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update application"
}

Write-Host "💾 Création du commit..." -ForegroundColor Yellow
git commit -m "$commitMessage"
Write-Host "✅ Commit créé" -ForegroundColor Green
Write-Host ""

# Vérifier si le remote existe
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "🔗 Configuration du remote GitHub..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Allez sur https://github.com/new et créez un repository nommé 'suivi-nageurs'" -ForegroundColor Cyan
    Write-Host ""
    $username = Read-Host "Entrez votre nom d'utilisateur GitHub"
    
    git remote add origin "https://github.com/$username/suivi-nageurs.git"
    git branch -M main
    
    Write-Host "✅ Remote configuré" -ForegroundColor Green
    Write-Host ""
}

# Pousser sur GitHub
Write-Host "🚀 Déploiement sur GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️ Si demandé, entrez votre Personal Access Token (pas votre mot de passe)" -ForegroundColor Yellow
Write-Host "Créez-le sur: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Allez sur votre repository GitHub" -ForegroundColor White
    Write-Host "2. Settings → Pages" -ForegroundColor White
    Write-Host "3. Source: GitHub Actions" -ForegroundColor White
    Write-Host "4. Attendez 1-2 minutes" -ForegroundColor White
    Write-Host "5. Votre site sera accessible ici:" -ForegroundColor White
    Write-Host ""
    
    $username = (git remote get-url origin) -replace '.*github\.com[:/](.+?)/.*', '$1'
    Write-Host "🔗 https://$username.github.io/suivi-nageurs/" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    Write-Host "Vérifiez que:" -ForegroundColor Yellow
    Write-Host "- Vous avez créé le repository sur GitHub" -ForegroundColor White
    Write-Host "- Vos identifiants sont corrects" -ForegroundColor White
    Write-Host "- Vous utilisez un Personal Access Token" -ForegroundColor White
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
