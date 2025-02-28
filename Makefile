# Color definitions for prettier output
GREEN  = \033[0;32m
BLUE   = \033[0;34m
YELLOW = \033[0;33m
RED    = \033[0;31m
RESET  = \033[0m

.PHONY: help install-backend build-backend start-backend install-frontend build-frontend start-frontend start-database all

help:
	@echo ""
	@echo "$(BLUE)============================================$(RESET)"
	@echo "$(BLUE)==         PROJECT MAKEFILE HELP         ==$(RESET)"
	@echo "$(BLUE)============================================$(RESET)"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@echo "  help              - Show this help message"
	@echo "  install-backend   - Install backend dependencies"
	@echo "  build-backend     - Build backend"
	@echo "  start-backend     - Start backend server"
	@echo "  install-frontend  - Install frontend dependencies"
	@echo "  build-frontend    - Build frontend"
	@echo "  start-frontend    - Start frontend preview server"
	@echo "  start-database    - Build and start the database container with Docker Compose"
	@echo "  all               - Build and start database, backend and frontend concurrently"
	@echo ""

# Backend targets
install-backend:
	@echo "$(BLUE)==> Installing backend dependencies...$(RESET)"
	cd backend && npm install

build-backend: install-backend
	@echo "$(GREEN)==> Building backend...$(RESET)"
	cd backend && npm run build

start-backend: build-backend
	@echo "$(YELLOW)==> Starting backend...$(RESET)"
	cd backend && npm run start

# Frontend targets
install-frontend:
	@echo "$(BLUE)==> Installing frontend dependencies...$(RESET)"
	cd frontend && npm install

build-frontend: install-frontend
	@echo "$(GREEN)==> Building frontend...$(RESET)"
	cd frontend && npm run build

start-frontend: build-frontend
	@echo "$(YELLOW)==> Starting frontend preview...$(RESET)"
	cd frontend && npm run preview

# Database target
start-database:
	@echo "$(RED)==> Starting database container with Docker Compose...$(RESET)"
	cd ./database docker-compose up --build -d

# Combined target: Build and start everything
all:
	@echo "$(BLUE)==> Building backend and frontend...$(RESET)"
	$(MAKE) build-backend
	$(MAKE) build-frontend
	@echo "$(RED)==> Starting database container...$(RESET)"
	$(MAKE) start-database
	@echo "$(YELLOW)==> Starting backend and frontend concurrently...$(RESET)"
	$(MAKE) start-backend &
	$(MAKE) start-frontend &
	wait
