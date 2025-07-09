.PHONY: venv install-backend start-backend start-frontend start-all clean

VENV=backend/.venv
PYTHON=$(VENV)/bin/python
UVICORN=$(VENV)/bin/uvicorn

# Crear entorno virtual
venv:
	@echo "Creando entorno virtual..."
	python3 -m venv $(VENV)

# Instalar dependencias backend
install-backend: venv
	@echo "Activando entorno y instalando dependencias..."
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r backend/requirements.txt

# Levantar backend con uvicorn
start-backend: install-backend
	@echo "Iniciando backend..."
	$(UVICORN) backend.app.main:app --reload --host localhost --port 8000

# Levantar frontend con vite + electron
start-frontend:
	@echo "Iniciando frontend..."
	# Aquí pon tu comando para correr vite + electron
	# Ejemplo si usas npm script:
	npm run dev

# Levantar backend y frontend juntos (en paralelo con &)
start-all:
	@echo "Iniciando backend y frontend..."
	$(MAKE) start-backend & \
	$(MAKE) start-frontend

# Limpiar entorno virtual y caches
clean:
	rm -rf backend/.venv
	@echo "Entorno virtual eliminado"
