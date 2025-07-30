#!/bin/bash

echo "🔍 Verifying Python installation..."

PYTHON_CMD=""
for cmd in python3 python py; do
  if command -v "$cmd" &>/dev/null; then
    path=$(command -v "$cmd")
    if [[ "$path" == *"WindowsApps"* ]]; then
      echo "⚠️  Ignoring $cmd from Microsoft Store: $path"
      continue
    fi
    PYTHON_CMD="$cmd"
    break
  fi
done

if [[ -z "$PYTHON_CMD" ]]; then
  echo "❌ Valid Python installation not found. Download from https://www.python.org/downloads/"
  exit 1
fi

echo "✅ Using Python: $PYTHON_CMD"

# === Instalar Poetry ===
echo "📦 Installing Poetry..."
pip3 install poetry

export PATH="$HOME/.poetry/bin:$PATH"

if ! command -v poetry &>/dev/null; then
  echo "❌ Poetry is not on your path even after install. Add this to ~/.bashrc:"
  echo 'export PATH="$HOME/.poetry/bin:$PATH"'
  exit 1
fi

# === Usar Poetry ===
echo "✅ Configurando Poetry..."
poetry config virtualenvs.in-project true

echo "📂 Moving to backend Directory..."
cd .. || { echo "❌ 'backend' dir not found"; exit 1; }

echo "🐍 Installing dependencies with Poetry..."
poetry install

echo "✅ Dependencies installed."
echo ""
echo "👉 To activate python virtual environment:"
command poetry env activate
echo ""
echo "If you're on WINDOWS run this:"
unix_path=$(poetry env info --path)
windows_path=$(echo "$unix_path" | tr '\\' '/')
echo "source $windows_path/Scripts/activate"

# source C:/Users/theBeast/Documents/Github/eleuteria-scribe-flow/backend/.venv/Scripts/activate
