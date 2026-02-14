.PHONY: build run test migrate seed dev docker-up docker-down lint

build:
	go build -o bin/server ./cmd/server
	go build -o bin/migrate ./cmd/migrate
	go build -o bin/worker ./cmd/worker
	go build -o bin/seed ./cmd/seed

run: build
	./bin/server

dev:
	air

migrate:
	go run ./cmd/migrate

seed:
	go run ./cmd/seed

worker:
	go run ./cmd/worker

test:
	go test ./... -v -count=1

lint:
	golangci-lint run ./...

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

generate:
	sqlc generate
