# Victor

An Uber-style marketplace for plumbing and electrical domestic services. Connect homeowners with verified professionals for on-demand and scheduled repairs, installations, and maintenance.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (target)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Update .env with your database credentials
```

3. Run database migrations:

```bash
npm run db:push
```

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
victor/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   └── ui/           # shadcn/ui components
│   └── lib/              # Utilities and configurations
│       ├── auth.ts       # Better Auth configuration
│       ├── prisma.ts     # Prisma client
│       └── utils.ts      # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── agents/               # Agent configurations
```

## Deployment

Ready to deploy to production? See our deployment guides:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete Vercel deployment guide with database setup, environment variables, and troubleshooting
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick reference checklist for deployment steps

Key requirements for deployment:
- PostgreSQL database (Vercel Postgres, Neon, Supabase, or Railway)
- Environment variables configured in Vercel
- Database migrations applied to production

## License

ISC
