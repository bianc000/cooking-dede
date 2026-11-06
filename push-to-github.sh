#!/bin/bash
# Script per collegare e inviare Cooking Dede su GitHub

USERNAME=$1
TOKEN=$2
REPO_NAME="cooking-dede"

if [ -z "$USERNAME" ]; then
  echo "Uso: ./push-to-github.sh <USERNAME> [TOKEN]"
  exit 1
fi

if [ -n "$TOKEN" ]; then
  REMOTE_URL="https://${TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"
else
  REMOTE_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"
fi

echo "🥒 Configurazione remote per $REPO_NAME..."
arch -x86_64 git remote remove origin 2>/dev/null
arch -x86_64 git remote add origin "$REMOTE_URL"

echo "🚀 Invio dei file su GitHub (ramo main)..."
arch -x86_64 git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✨ Fatto con successo! I file sono online!"
  echo "Ora ricarica Safari (Cmd + R) su Settings -> Pages e seleziona 'main'!"
else
  echo ""
  echo "⚠️ Assicurati che il token sia corretto e che il repository esista su GitHub!"
fi
