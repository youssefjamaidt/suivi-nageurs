#!/bin/bash
# Script de déploiement pour Linux/Mac
# Usage: bash deploy.sh

echo "🏊‍♂️ Déploiement de l'application Suivi des Nageurs"
echo "================================================="
echo ""

# Vérifier Git
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé"
    exit 1
fi

echo "✅ Git est installé"
echo ""

# Initialiser Git si nécessaire
if [ ! -d ".git" ]; then
    echo "📦 Initialisation du repository Git..."
    git init
    echo "✅ Repository Git initialisé"
    echo ""
fi

# Configuration Git
if [ -z "$(git config user.name)" ]; then
    echo "⚙️ Configuration de Git..."
    read -p "Entrez votre nom: " name
    git config --global user.name "$name"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Entrez votre email: " email
    git config --global user.email "$email"
fi

echo "✅ Configuration Git complète"
echo ""

# Ajouter fichiers
echo "📝 Ajout des fichiers..."
git add .
echo "✅ Fichiers ajoutés"
echo ""

# Commit
read -p "Message du commit (Entrée pour 'Update application'): " message
message=${message:-"Update application"}

echo "💾 Création du commit..."
git commit -m "$message"
echo "✅ Commit créé"
echo ""

# Remote
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Configuration du remote GitHub..."
    echo ""
    echo "Allez sur https://github.com/new et créez un repository nommé 'suivi-nageurs'"
    echo ""
    read -p "Entrez votre nom d'utilisateur GitHub: " username
    
    git remote add origin "https://github.com/$username/suivi-nageurs.git"
    git branch -M main
    
    echo "✅ Remote configuré"
    echo ""
fi

# Push
echo "🚀 Déploiement sur GitHub..."
echo ""
echo "⚠️ Si demandé, entrez votre Personal Access Token"
echo "Créez-le sur: https://github.com/settings/tokens"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DÉPLOIEMENT RÉUSSI !"
    echo "================================================="
    echo ""
    echo "📍 Prochaines étapes:"
    echo "1. Allez sur votre repository GitHub"
    echo "2. Settings → Pages"
    echo "3. Source: GitHub Actions"
    echo "4. Attendez 1-2 minutes"
    echo "5. Votre site sera accessible ici:"
    echo ""
    
    username=$(git remote get-url origin | sed -E 's/.*github\.com[:/](.+?)\/.*/\1/')
    echo "🔗 https://$username.github.io/suivi-nageurs/"
    echo ""
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    echo "Vérifiez que:"
    echo "- Vous avez créé le repository sur GitHub"
    echo "- Vos identifiants sont corrects"
    echo "- Vous utilisez un Personal Access Token"
fi

echo ""
read -p "Appuyez sur Entrée pour continuer..."
