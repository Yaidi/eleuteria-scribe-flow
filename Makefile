.PHONY: venv install-backend start-backend start-frontend start-all clean

VENV=backend/.venv
PYTHON=$(VENV)/bin/python
UVICORN=$(VENV)/bin/uvicorn
VENV_PATH=backend/.venv
REQS=backend/requirements.txt
REQS_DEV=backend/requirements-dev.txt
BACKEND_ENTRY=backend/app/main.py
DIST_PATH=backend/dist
BUILD_NAME=eleuteria-backend
SPEC_FILE=backend/eleuteria-backend.spec

# Limpiar entorno virtual y caches
clean:
	rm -rf backend/.venv
	@echo "Entorno virtual eliminado"

build-backend:
	cd backend && .venv/bin/pyinstaller --distpath dist eleuteria-backend.spec

clean-backend:
	rm -rf backend/build backend/dist backend/__pycache__

rebuild-backend: clean-backend build-backend