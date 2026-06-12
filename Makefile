.PHONY: up dev down build logs logs-auth logs-task ps clean restart shell-auth shell-task shell-db

# Start semua services
up:
	docker compose up -d

# Start development stack dengan hot-reload microservice
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Start production stack
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Start dengan rebuild
build:
	docker compose up --build -d

# Stop & remove containers
down:
	docker compose down

# Stop, remove, DAN hapus volumes (⚠️ data hilang!)
clean:
	docker compose down -v
	docker system prune -f

# Restart semua
restart:
	docker compose restart

# Lihat logs (semua services)
logs:
	docker compose logs -f

# Lihat logs service aplikasi
logs-auth:
	docker compose logs -f auth-service

logs-task:
	docker compose logs -f task-service

# Lihat status (Docker compose ps)
status:
	docker compose ps

# Masuk ke shell service aplikasi
shell-auth:
	docker compose exec auth-service sh

shell-task:
	docker compose exec task-service sh

# Masuk ke database
shell-db:
	docker compose exec db psql -U postgres -d cloudapp
