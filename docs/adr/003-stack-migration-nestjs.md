# ADR-003: Stack Migration — Spring Boot to NestJS + Prisma

## Status
**Accepted** — June 2026

## Context
PairPrep initially used a Spring Boot + Java 21 backend with PostgreSQL. While the implementation was structurally sound (modular monolith, proper repository pattern), the Java stack created friction:

- Slower iteration speed compared to TypeScript across the full stack
- No shared types or validation schemas between frontend and backend
- Higher cognitive load maintaining two languages in a small team
- Spring Boot's convention-over-configuration approach was overkill for the MVP scope

## Decision
Migrate the backend to **NestJS + Prisma + PostgreSQL** while preserving the same API contract, modular architecture, and authentication strategy.

### Key choices:
- **NestJS**: TypeScript-first, decorator-based, modular architecture mirrors the Spring Boot structure
- **Prisma**: Type-safe ORM with automatic migration generation, replaces JPA/Hibernate
- **Same API paths**: All `/api/v1/*` routes maintained for frontend compatibility
- **Same auth strategy**: JWT access tokens (15min) + refresh token rotation in HttpOnly cookies
- **Same database**: PostgreSQL with UUID primary keys

## Consequences
- Full-stack TypeScript enables shared types and faster iteration
- Prisma schema serves as the single source of truth for the data model
- NestJS modules map 1:1 to the original Spring Boot packages
- CI/CD workflows updated from Maven to npm/Node.js
- Original Java code deleted entirely (no legacy branch)
