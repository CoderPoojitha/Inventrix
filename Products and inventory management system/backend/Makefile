.PHONY: run install upgrade downgrade migrate clean

# Variables for the virtual environment paths
VENV_BIN = venv/bin
PYTHON = $(VENV_BIN)/python
PIP = $(VENV_BIN)/pip
ALEMBIC = $(VENV_BIN)/alembic
UVICORN = $(VENV_BIN)/uvicorn

# Starts the FastAPI development server with hot-reload
run:
	$(UVICORN) app.main:app --reload

# Installs dependencies from requirements.txt
install:
	$(PIP) install -r requirements.txt

# Applies all pending database migrations
upgrade:
	$(ALEMBIC) upgrade head

# Downgrades the database by 1 migration
downgrade:
	$(ALEMBIC) downgrade -1

# Generates a new migration automatically based on model changes
# Usage: make migrate m="your message here"
migrate:
	$(ALEMBIC) revision --autogenerate -m "$(m)"

# Cleans up python cache files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# Runs the complete pytest suite (creates test database automatically if missing)
test:
	PGPASSWORD=postgres123 psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'test_inventory_db'" | grep -q 1 || PGPASSWORD=postgres123 psql -h localhost -U postgres -c "CREATE DATABASE test_inventory_db"
	$(VENV_BIN)/pytest -v
