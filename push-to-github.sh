#!/bin/bash
# Script per collegare e inviare Cooking Dede su GitHub

if [ -z "$1" ]; then
  echo "Uso: ./push-to-github.sh <TUO_USERNAME_GITHUB>"
  echo "Esempio: ./push-to-github.sh mario-rossi"
  exit 1
fi

USERNAME=$1
REPO_NAME="cooking-dede"

echo "🥒 Configurazione remote per https://github.com/$USERNAME/$REPO_NAME.git..."
arch -x86_64 git remote remove origin 2>/dev/null
arch -x86_64 git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"

echo "🚀 Invio dei file su GitHub (ramo main)..."
arch -x86_64 git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✨ Fatto con successo!"
  echo "Ora vai su: https://github.com/$USERNAME/$REPO_NAME/settings/pages"
  echo "Seleziona 'main' come branch e salva per ottenere il link giocabile per i tuoi amici!"
else
  echo ""
  echo "⚠️ Assicurati di aver prima creato il repository vuoto su https://github.com/new con nome '$REPO_NAME'!"
fi
