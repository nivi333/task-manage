# Production Deployment Guide

## 1. Production Server Configuration
- Use Ubuntu 22.04 LTS or similar
- Install JDK 21, PostgreSQL, Nginx (as reverse proxy)
- Configure environment variables for DB, secrets, etc.

## 2. Database Migration Strategy
- Use Flyway (already configured in `application.yml`)
- Run `./mvnw flyway:migrate` before each deployment

## 3. Monitoring & Logging
- Enable Spring Boot Actuator endpoints (`/actuator/health`, `/actuator/metrics`)
- Forward logs to file and/or centralized logging (e.g., ELK stack)
- Integrate Prometheus/Grafana for metrics

## 4. Backup & Recovery
- Schedule daily PostgreSQL dumps (`pg_dump`)
- Store backups securely (cloud, offsite)
- Test restore procedures quarterly

## 5. Health Checks
- Use `/actuator/health` for load balancers and uptime monitors

## 6. Rollback Procedures
- Keep previous deployment artifacts for quick rollback
- Use database backups to restore state if needed

## 7. Environment Management
- Use `.env` files or environment variables for secrets/config
- Separate dev, staging, and prod configs

---

**Automate as much as possible via CI/CD (see `.github/workflows/ci-cd.yml`).**
