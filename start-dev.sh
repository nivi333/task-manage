#!/bin/sh

set -e

echo "[1/3] Starting Docker services (Postgres, MailHog/Mailpit)..."
docker-compose up -d

echo "[2/3] Building project with Maven..."
mvn clean install

echo "[3/3] Starting Spring Boot application..."
mvn spring-boot:run
