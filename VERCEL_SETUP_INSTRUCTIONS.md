# Vercel Setup Instructions - Ready to Deploy

## ✅ Pre-Deployment Complete

- ✅ Database schema pushed to Neon production database
- ✅ Connection string validated
- ✅ Auth secret generated
- ✅ Code ready for deployment

## Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub account and find: `Tritao3000/victor`
4. Click "Import"

## Step 2: Configure Environment Variables

In the "Configure Project" screen, add these environment variables:

### Copy-Paste Ready Values:

```
DATABASE_URL
postgresql://neondb_owner:npg_ZIzlKkJhS5U3@ep-solitary-river-agj4gv7y-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
BETTER_AUTH_SECRET
1lLLwsfMmiRqR2F8RDUzX3Xk3W7m7LnQf5ztRofnHzs=
```

**Note:** The following two values need your actual Vercel deployment URL. After the first deployment, Vercel will give you a URL like `victor-abc123.vercel.app`. You'll need to:
1. Deploy first with placeholder values
2. Get your deployment URL
3. Update these environment variables with the real URL
4. Redeploy

For now, use placeholders:

```
BETTER_AUTH_URL
https://your-app.vercel.app
```

```
NEXT_PUBLIC_APP_URL
https://your-app.vercel.app
```

## Step 3: Verify Build Settings

Vercel should auto-detect these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

✅ These should be correct by default. Don't change them.

## Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Vercel will show you the deployment URL

## Step 5: Update Environment Variables with Real URL

After your first deployment:

1. Copy your Vercel deployment URL (e.g., `https://victor-abc123.vercel.app`)
2. Go to: Project Settings → Environment Variables
3. Update these two variables:
   - `BETTER_AUTH_URL` → `https://victor-abc123.vercel.app` (your actual URL)
   - `NEXT_PUBLIC_APP_URL` → `https://victor-abc123.vercel.app` (your actual URL)
4. Go to Deployments tab
5. Click "Redeploy" on the latest deployment

## Step 6: Verify Deployment

Visit your deployment URL and test:

- ✅ Homepage loads
- ✅ Sign up / Sign in works
- ✅ Navigation works
- ✅ No console errors

## Optional: Add Custom Domain

If you have a custom domain:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `victor.com`)
3. Configure DNS records as shown
4. Update environment variables to use custom domain instead of `.vercel.app`

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set correctly
- Ensure no syntax errors in code

### Database Connection Errors
- Verify `DATABASE_URL` is exactly as shown above
- Check that `?sslmode=require` is included

### Authentication Errors
- Verify `BETTER_AUTH_URL` matches your actual deployment URL
- Ensure `BETTER_AUTH_SECRET` is set
- Check that auth endpoints are accessible: `https://your-url.vercel.app/api/auth/session`

## What's Already Done

✅ Database schema created in Neon
✅ All necessary tables created (User, Session, ServiceProvider, Booking, etc.)
✅ Code configured for production
✅ Build scripts configured with Prisma generation

## Next Steps After Deployment

1. Test user registration and login
2. Test booking flow
3. Test provider onboarding
4. Monitor Vercel deployment logs for any errors
5. Set up error tracking (optional: Sentry, LogRocket)
6. Configure custom domain (optional)

## Cost Summary

- **Neon Database**: Free tier (sufficient for MVP)
- **Vercel Hosting**: Free tier (sufficient for MVP, includes 100GB bandwidth)
- **Total Monthly Cost**: $0 (on free tiers)

## Support

If you encounter issues:
- Vercel build logs: Project → Deployments → Click deployment → Build Logs
- Runtime logs: Project → Deployments → Click deployment → Functions
- Vercel docs: https://vercel.com/docs
- Neon docs: https://neon.tech/docs

---

**Status**: Ready to deploy! Follow Steps 1-6 above to go live. 🚀
