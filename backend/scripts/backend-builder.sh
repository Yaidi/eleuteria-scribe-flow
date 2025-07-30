#!/usr/bin/env bash
set -e

# Detectar ruta del script compatible con bash y zsh
if [ -n "$BASH_VERSION" ]; then
  SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
elif [ -n "$ZSH_VERSION" ]; then
  SCRIPT_DIR="$( cd "$( dirname "${(%):-%x}" )" && pwd )"
else
  echo "❌ Shell no compatible. Usa bash o zsh."
  exit 1
fi

case "$1" in
  install)
    "$SCRIPT_DIR/dependencies-installer.sh"
    ;;

  clean)
    cd ..
    rm -rf .venv
    echo "✅ Entorno virtual eliminado"
    ;;

  build-backend)
    cd ..

    if [[ "$OS" == "Windows_NT" ]]; then
      PYINSTALLER=".venv/Scripts/pyinstaller.exe"
    else
      PYINSTALLER=".venv/bin/pyinstaller"
    fi

    if [ ! -f "$PYINSTALLER" ]; then
      echo "❌ pyinstaller no encontrado en $PYINSTALLER. ¿Ya creaste el entorno virtual?"
      exit 1
    fi

    "$PYINSTALLER" --distpath dist eleuteria-backend.spec
    ;;

  clean-backend)
    cd ..
    rm -rf build backend/dist backend/__pycache__
    echo "✅ Archivos de build del backend eliminados"
    ;;

  rebuild-backend)
    "$0" clean-backend
    "$0" build-backend
    ;;

  *)
    echo "Uso: $0 {install|clean|build-backend|clean-backend|rebuild-backend}"
    exit 1
    ;;
esac
