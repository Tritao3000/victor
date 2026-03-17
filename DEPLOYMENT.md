# Victor - Vercel Deployment Guide

This guide covers deploying the Victor marketplace application to Vercel.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **GitHub Repository**: The project is already on GitHub at `https://github.com/Tritao3000/victor`
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database**: A production PostgreSQL database (recommended providers below)

## Database Options for Production

Since Vercel doesn't provide built-in PostgreSQL, you'll need to use an external database provider:

### Recommended Options:

1. **Vercel Postgres** (Powered by Neon)
   - Native Vercel integration
   - Serverless PostgreSQL
   - Easy setup through Vercel dashboard
   - Good for MVP/small scale

2. **Neon** (https://neon.tech)
   - Serverless PostgreSQL
   - Free tier available
   - Great for serverless deployments
   - Automatic scaling

3. **Supabase** (https://supabase.com)
   - PostgreSQL with additional features
   - Free tier available
   - Good developer experience

4. **Railway** (https://railway.app)
   - Simple PostgreSQL hosting
   - Free tier available
   - Good for early stage

## Deployment Steps

### 1. Set Up Production Database

Choose one of the database providers above and:

1. Create a new PostgreSQL database
2. Copy the connection string (should look like: `postgresql://user:password@host:5432/database`)
3. Keep this connection string secure - you'll need it for environment variables

### 2. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `Tritao3000/victor`
4. Vercel will automatically detect Next.js

### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Better Auth - Generate a secure random string
BETTER_AUTH_SECRET="your-production-secret-minimum-32-characters"
BETTER_AUTH_URL="https://your-app.vercel.app"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

**Important Notes:**
- Replace `your-app.vercel.app` with your actual Vercel domain (or custom domain)
- Generate a secure `BETTER_AUTH_SECRET` using: `openssl rand -base64 32`
- Add `?sslmode=require` to your `DATABASE_URL` for production databases

### 4. Configure Build Settings

Vercel automatically detects Next.js projects, but verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### 5. Add Build Script for Prisma

Vercel needs to generate the Prisma client during build. Update `package.json` to include a postinstall script:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 6. Run Database Migrations

Before your first deployment, you need to apply migrations to your production database:

#### Option A: Local Migration (Recommended for first deploy)
```bash
# Set your production DATABASE_URL temporarily
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run db:push

# Or use proper migrations
npm run db:migrate
```

#### Option B: Seed Script (Optional)
If you have a seed script, run it after migrations:
```bash
npm run db:seed
```

### 7. Deploy

1. Click "Deploy" in Vercel
2. Vercel will:
   - Install dependencies
   - Run `prisma generate`
   - Build the Next.js application
   - Deploy to their global CDN

### 8. Verify Deployment

After deployment:

1. Check the Vercel deployment URL
2. Test authentication flows
3. Verify database connectivity
4. Test API routes (bookings, user profiles, provider onboarding)

## Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

### Environment Variables Updates

If you need to update environment variables:
1. Go to Project Settings → Environment Variables
2. Update the variable
3. Redeploy for changes to take effect

## Common Issues and Solutions

### Issue: Prisma Client Not Generated
**Solution**: Ensure `postinstall` script includes `prisma generate`

### Issue: Database Connection Fails
**Solution**:
- Verify `DATABASE_URL` is correct
- Ensure SSL mode is enabled (`?sslmode=require`)
- Check database provider allows external connections

### Issue: Better Auth Errors
**Solution**:
- Verify `BETTER_AUTH_URL` matches your deployment URL
- Ensure `BETTER_AUTH_SECRET` is set and is at least 32 characters

### Issue: Build Fails
**Solution**:
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Ensure TypeScript has no errors locally: `npm run build`

## Ongoing Maintenance

### Schema Changes

When you update the Prisma schema:

```bash
# 1. Update schema.prisma locally
# 2. Create migration
npm run db:migrate

# 3. Commit migration files
git add prisma/migrations
git commit -m "feat: add new database fields"

# 4. Push to GitHub
git push

# 5. Vercel will auto-deploy and run migrations
```

### Monitoring

Vercel provides:
- **Analytics**: View traffic and performance
- **Logs**: Real-time function logs (Project → Deployments → Click deployment → Functions)
- **Speed Insights**: Core Web Vitals monitoring

## Cost Considerations

### Vercel Pricing
- **Hobby Plan**: Free
  - Good for development/MVP
  - Includes automatic deployments
  - 100GB bandwidth

- **Pro Plan**: $20/month per member
  - Better performance
  - More bandwidth
  - Team collaboration

### Database Costs
- Most providers offer free tiers suitable for MVP
- Scale pricing based on storage and compute usage

## Recommended Next Steps

1. ✅ Set up production database
2. ✅ Configure environment variables in Vercel
3. ✅ Add `postinstall` script to package.json
4. ✅ Run production migrations
5. ✅ Deploy to Vercel
6. ✅ Verify deployment
7. 🔄 Set up custom domain (optional)
8. 🔄 Configure monitoring and alerts

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
