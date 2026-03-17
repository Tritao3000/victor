# Victor Deployment Checklist

Quick reference checklist for deploying Victor to Vercel.

## Pre-Deployment Checklist

- [ ] **GitHub Repository**: Code pushed to `https://github.com/Tritao3000/victor`
- [ ] **Vercel Account**: Created at [vercel.com](https://vercel.com)
- [ ] **Production Database**: PostgreSQL database provisioned

### Database Setup

Choose one provider and complete setup:
- [ ] **Vercel Postgres** (via Vercel dashboard) OR
- [ ] **Neon** (https://neon.tech) OR
- [ ] **Supabase** (https://supabase.com) OR
- [ ] **Railway** (https://railway.app)

- [ ] Database connection string obtained
- [ ] Connection string tested (can connect successfully)

## Vercel Setup

- [ ] GitHub repository imported to Vercel
- [ ] Project created in Vercel dashboard

### Environment Variables (Required)

Add these in Vercel Project Settings → Environment Variables:

```bash
DATABASE_URL="postgresql://..."           # Your production database URL with ?sslmode=require
BETTER_AUTH_SECRET="..."                  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="https://..."            # Your Vercel app URL
NEXT_PUBLIC_APP_URL="https://..."        # Your Vercel app URL (same as above)
```

- [ ] `DATABASE_URL` - Production PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` - 32+ character random string
- [ ] `BETTER_AUTH_URL` - Vercel deployment URL
- [ ] `NEXT_PUBLIC_APP_URL` - Vercel deployment URL

### Build Configuration

- [ ] Framework Preset: Next.js
- [ ] Build Command: `npm run build`
- [ ] Install Command: `npm install`
- [ ] Output Directory: `.next`

## Database Migration

Before first deployment:

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run db:push

# Optional: Run seed data
npm run db:seed
```

- [ ] Production database migrations applied
- [ ] Seed data loaded (if needed)

## First Deployment

- [ ] Click "Deploy" in Vercel
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

## Post-Deployment Verification

Test these on your production URL:

- [ ] Homepage loads successfully
- [ ] Sign up / Sign in works (Better Auth)
- [ ] Database connection working
- [ ] API routes responding:
  - [ ] `/api/auth/*`
  - [ ] `/api/bookings`
  - [ ] `/api/provider/onboarding`
  - [ ] `/api/user/profile`

## Optional Enhancements

- [ ] Custom domain configured (Project Settings → Domains)
- [ ] DNS records updated
- [ ] SSL certificate verified
- [ ] Vercel Analytics enabled
- [ ] Error monitoring configured

## Troubleshooting

If deployment fails, check:

1. **Build Logs**: Vercel dashboard → Deployments → Latest deployment
2. **Function Logs**: For runtime errors
3. **Environment Variables**: Verify all are set correctly
4. **Database Connection**: Test connectivity from your local machine

Common issues:
- Missing environment variables → Add them in Vercel settings
- Prisma client errors → Verify `postinstall` script in `package.json`
- Database connection fails → Check `DATABASE_URL` and add `?sslmode=require`

## Next Steps After Deployment

- [ ] Share production URL with team
- [ ] Set up monitoring/alerts
- [ ] Configure backup strategy for database
- [ ] Plan for staging environment (optional)
- [ ] Document any custom domain setup

## Quick Commands Reference

```bash
# Generate secure secret
openssl rand -base64 32

# Test local build (should match Vercel)
npm run build
npm run start

# View build output size
npm run build

# Database operations
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:studio    # Open database GUI
```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Deployment Guide**: See `DEPLOYMENT.md` in project root
- **Vercel Support**: https://vercel.com/support
