# PairPrep

PairPrep is a mock interview platform for software engineers. It connects candidates so they can run structured mock interviews with peers. Users can set their experience levels, check other profiles, align their availabilities, and schedule interview rounds. After each session, partners can leave ratings and feedback.

## Features

- User authentication using JWT tokens and secure cookies.
- Profile management with experience levels, bio, social links, availability slots, and interview interests.
- Partner discovery page with database-driven matching based on slot and interest overlaps.
- Session scheduling, cancellation, and completions.
- Shared mock interview rooms with integrated video call (Jitsi) and side-by-side notepad editor.
- Peer feedback and aggregated ratings.

## Tech Stack

- Monorepo Manager: Turborepo
- Frontend: Next.js (App Router), TypeScript, Zustand, TailwindCSS, TanStack Query
- Backend: NestJS, TypeScript, Prisma ORM
- Database: PostgreSQL

## Repository Structure

```
PairPrep/
├── apps/web/       - Next.js frontend application
├── apps/api/       - NestJS backend API application
├── docs/           - Project architecture records, collaboration, and deployment playbooks
└── .github/        - Workflows for GitHub Actions CI and Pull Request templates
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- PostgreSQL database instance

### Installation

Clone the repository and install all monorepo dependencies from the root directory:

```bash
git clone https://github.com/Siddhesh-Codes/PairPrep.git
cd PairPrep
npm install
```

### Database Setup

Go to the backend directory and set up your environment variables:

```bash
cd apps/api
cp .env.example .env
```

Open `apps/api/.env` and update the `DATABASE_URL` with your PostgreSQL connection string. Then, push the schema to the database:

```bash
npx prisma db push
```

### Running the Application

You can start both the frontend and backend development servers concurrently from the root directory:

```bash
cd ../..
npm run dev
```

This starts:
- The Next.js frontend on http://localhost:3000
- The NestJS backend on http://localhost:8080

## Documentation

For workflows and deployment, read the playbooks in the docs folder:
- [Collaboration Playbook](docs/COLLABORATION.md) - Branch naming rules, pull requests, and Git workflows.
- [Deployment Playbook](docs/DEPLOYMENT.md) - System architecture details, free hosting guides, and GitHub profile integration rationale.

## License

MIT - see the LICENSE file for details.
