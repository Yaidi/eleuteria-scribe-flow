#!/bin/bash

echo "🔍 Verificando instalación de Python..."

PYTHON_CMD=""
for cmd in python3 python py; do
  if command -v "$cmd" &>/dev/null; then
    path=$(command -v "$cmd")
    if [[ "$path" == *"WindowsApps"* ]]; then
      echo "⚠️  Ignorando $cmd de Microsoft Store: $path"
      continue
    fi
    PYTHON_CMD="$cmd"
    break
  fi
done

if [[ -z "$PYTHON_CMD" ]]; then
  echo "❌ No se encontró Python válido. Descárgalo de https://www.python.org/downloads/"
  exit 1
fi

echo "✅ Usando Python: $PYTHON_CMD"

# === Instalar Poetry ===
echo "📦 Instalando Poetry..."
pip3 install poetry

export PATH="$HOME/.poetry/bin:$PATH"

if ! command -v poetry &>/dev/null; then
  echo "❌ Poetry no está en PATH incluso después de instalar. Añade esto a tu ~/.bashrc:"
  echo 'export PATH="$HOME/.poetry/bin:$PATH"'
  exit 1
fi

# === Usar Poetry ===
echo "✅ Configurando Poetry..."
poetry config virtualenvs.in-project true

echo "📂 Moviéndose al directorio backend..."
cd .. || { echo "❌ No se encontró el directorio 'backend'"; exit 1; }

echo "🐍 Instalando dependencias con Poetry..."
poetry install

echo "✅ Dependencias instaladas."
echo ""
echo "👉 Para activar tu entorno virtual:"
echo "source $(poetry env info --path)/bin/activate"
echo ""
echo "if you're on WINDOWS: "
echo "source $(poetry env info --path)\bin\activate"

# source C:/Users/theBeast/Documents/Github/eleuteria-scribe-flow/backend/.venv/Scripts/activate
