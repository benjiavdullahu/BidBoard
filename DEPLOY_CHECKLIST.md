# BIDBOARD Deployment Checklist

## Pre-Deployment

- [ ] Set up PostgreSQL database (Supabase/Neon/Railway)
- [ ] Copy database connection string
- [ ] Update `.env.local` with `DATABASE_URL`
- [ ] Run `npx prisma db push` to create tables in production DB

## Git Setup (if not done)

- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Ready for deployment"`
- [ ] Create GitHub repo
- [ ] `git remote add origin https://github.com/YOUR_USERNAME/bidboard.git`
- [ ] `git push -u origin main`

## Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add these environment variables:
   - [ ] `DATABASE_URL` - Your PostgreSQL connection string
   - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
   - [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key
   - [ ] `STRIPE_WEBHOOK_SECRET` - (Add after creating webhook)
   - [ ] `NEXT_PUBLIC_BASE_URL` - Your app's URL (e.g., https://bidboard.site)

## Post-Deployment

1. **Set up Stripe Webhook:**

   - [ ] Go to Stripe Dashboard → Webhooks
   - [ ] Add endpoint: `https://bidboard.site/api/stripe-webhook`
   - [ ] Select event: `checkout.session.completed`
   - [ ] Copy signing secret
   - [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
   - [ ] Redeploy to apply the new env variable

2. **Test Production:**
   - [ ] Visit your live site
   - [ ] Make a test payment (use card `4242 4242 4242 4242`)
   - [ ] Verify it appears on the leaderboard

## Optional Optimizations

- [ ] Add custom domain in Vercel settings
- [ ] Set up Vercel Analytics
- [ ] Enable Web Vitals monitoring
- [ ] Set up error tracking (Sentry)

## Troubleshooting

If payments aren't showing up:

1. Check Vercel function logs
2. Verify webhook is receiving events in Stripe dashboard
3. Ensure all environment variables are set correctly
4. Check that database connection is working
