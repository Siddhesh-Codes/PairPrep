# PairPrep

A trust-first peer-to-peer mock interview marketplace for software engineers.

## What is PairPrep?

PairPrep connects software engineering candidates with practice partners for structured mock interviews. Users build profiles, match by skill and availability, schedule sessions using external meeting links, and leave structured feedback that builds trust and improves future matches.

**V1 focus:** DSA · Backend · System Design · Behavioral interviews for software roles.

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+, TypeScript, TanStack Query, Zustand |
| Backend | Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA |
| Database | PostgreSQL 16 (Neon Free) |
| Storage | Cloudflare R2 |
| Hosting | Vercel (frontend), Oracle Cloud Always Free (backend) |

## Monorepo Structure

```
PairPrep/
├── apps/web/       → Next.js frontend
├── apps/api/       → Spring Boot backend
├── docs/adr/       → Architecture Decision Records
├── infra/          → Deployment configs
└── .github/        → CI/CD, templates, governance
```

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- PostgreSQL 16+ (or Neon account)
- Maven 3.9+

### Backend

```bash
cd apps/api
cp .env.example .env
# Edit .env with your database credentials
./mvnw spring-boot:run
```

### Frontend

```bash
cd apps/web
cp .env.example .env.local
# Edit .env.local with your backend URL
npm install
npm run dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

MIT — see [LICENSE](LICENSE) for details.
