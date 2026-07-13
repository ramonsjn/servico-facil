#!/bin/bash
set -e

# Render build script - garante que DATABASE_URL esteja disponivel no build
export DATABASE_URL="${DATABASE_URL:-postgresql://servico_facil_user:p7Y0VQ9dULf7oM5ZSiMNBlBqbqw82RYa@dpg-d9a4sle7r5hc73c6bmc0-a/servico_facil}"

echo "=== Instalando dependencias ==="
npm ci

echo "=== Gerando Prisma Client ==="
npx prisma generate

echo "=== Compilando TypeScript ==="
npm run build

echo "=== Build concluido ==="
