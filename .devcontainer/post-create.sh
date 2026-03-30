#!/bin/bash
# ════════════════════════════════════════════════════════════════════
# ALihas-v2 — Codespace Bootstrap Script
# Prepara las redes Docker y levanta los contenedores automáticamente.
# Compatible con Dokploy (redes externas) y Codespace (las crea si no existen).
# ════════════════════════════════════════════════════════════════════

set -e

echo "🔧 ALihas-v2: Iniciando configuración del entorno..."

# 1. Crear redes Docker si no existen (en Dokploy ya existen, en Codespace no)
echo "📡 Verificando redes Docker..."
docker network inspect dokploy-network >/dev/null 2>&1 || \
  docker network create dokploy-network && echo "  ✅ dokploy-network creada"

docker network inspect core-agentes-net >/dev/null 2>&1 || \
  docker network create core-agentes-net && echo "  ✅ core-agentes-net creada"

# 2. Crear .env si no existe
if [ ! -f .env ]; then
  echo "📋 Creando .env desde .env.example..."
  cp .env.example .env
  echo "  ⚠️  IMPORTANTE: Edita .env con tus claves API reales"
else
  echo "  ✅ .env ya existe"
fi

# 3. Levantar contenedores
echo "🚀 Levantando contenedores ALihas-v2..."
docker compose up -d

echo ""
echo "════════════════════════════════════════════════════"
echo "  ✅ ALihas-v2 desplegado exitosamente"
echo "  🌐 Dashboard: http://localhost:8080"
echo "  🔑 Login: admin / (ver .env AUTH_PASSWORD)"
echo "  🛡️  Modo: NemoClaw Strict Policy"
echo "════════════════════════════════════════════════════"
