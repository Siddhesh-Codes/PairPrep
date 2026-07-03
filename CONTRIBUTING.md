# Contributing to PairPrep

Thank you for considering contributing to PairPrep! This document outlines the process for contributing to this project.

## Code of Conduct

Be respectful, constructive, and professional. We're building a product that helps people prepare for interviews — bring that same supportive energy to contributions.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch from `main`
4. Make your changes
5. Submit a pull request

## Branch Naming

Use the following conventions:

```
feature/<short-description>    → new features
fix/<short-description>        → bug fixes
hotfix/<short-description>     → urgent production fixes
chore/<short-description>      → maintenance, deps, CI
docs/<short-description>       → documentation only
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add discovery filter for experience level
fix: prevent duplicate match requests to same user
chore: update Spring Boot to 3.3.2
docs: add ADR for auth strategy
test: add integration tests for feedback submission
```

## Pull Request Process

1. **Every PR must reference an issue.** Create one if it doesn't exist.
2. **Fill out the PR template completely.**
3. **All CI checks must pass** before review.
4. **Squash merge only** — keep `main` history clean.
5. **One approval required** before merging.

## Development Setup

### Backend (Spring Boot)

```bash
cd apps/api
cp .env.example .env
./mvnw spring-boot:run
```

### Frontend (Next.js)

```bash
cd apps/web
npm install
npm run dev
```

## Code Standards

### Java (Backend)
- Follow standard Java conventions
- Use `final` for immutable fields
- Validate all DTO inputs with Jakarta Validation
- Write service-level unit tests
- Use records for DTOs where possible

### TypeScript (Frontend)
- Strict TypeScript — no `any` types
- Use CSS Modules for component styling
- Use React Server Components where possible
- Client Components only when interactivity is needed
- Write semantic HTML with proper ARIA attributes

## Architecture Decisions

Major architectural decisions are documented in `docs/adr/`. Read existing ADRs before proposing changes to established patterns.

## Questions?

Open a [discussion](../../discussions) or an issue tagged `question`.
