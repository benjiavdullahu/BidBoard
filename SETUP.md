# BIDBOARD Setup Guide

## 🚀 Quick Start

This is a viral-ready "pay-to-top" leaderboard where people pay to claim spots. The more you pay, the higher you rank!

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- Stripe account

## Setup Steps

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bidboard?schema=public"

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL if you haven't
# Create a database
createdb bidboard
```

#### Option B: Free Cloud PostgreSQL

1. Go to [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a free PostgreSQL database
3. Copy the connection string to your `.env.local`

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 4. Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up a webhook endpoint:
   - In Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select event: `checkout.session.completed`
   - Copy the webhook secret to `.env.local`

### 5. Run the Application

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

## 🎯 Features

- **Real-time Updates**: Leaderboard refreshes every 5 seconds
- **Secure Payments**: Stripe Checkout handles all payment processing
- **Top 10 Perks**: Logo, custom message, and link for top 10 spots
- **Beautiful UI**: Dark theme with smooth animations
- **Mobile Responsive**: Works great on all devices

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Hosting Options

- **Neon**: Free tier with 0.5GB storage
- **Supabase**: Free tier with 500MB storage
- **PlanetScale**: Free tier with 5GB storage
- **Railway**: $5/month PostgreSQL

## 💡 Going Viral Tips

1. **Launch on Twitter/X**: Tag influencers who might want to flex
2. **Reddit**: Post on r/InternetIsBeautiful or similar
3. **Add Social Sharing**: Let people share their position
4. **Gamification**: Add achievements or special badges
5. **Time-Limited Events**: "Double your position for 24h"

## 🔒 Security Notes

- Stripe handles all payment data (PCI compliant)
- Webhook signature verification prevents fake payments
- Rate limiting should be added for production
- Consider adding CAPTCHA for the submission form

## 📈 Scaling Considerations

When you go viral:

1. Upgrade to a paid database tier
2. Add caching (Redis) for the leaderboard
3. Use CDN for static assets
4. Consider queueing for webhook processing

## Need Help?

- Database not connecting? Check your `DATABASE_URL` format
- Payments not working? Verify Stripe keys and webhook setup
- Prisma errors? Run `npx prisma generate` again

Good luck! May the biggest flexer win! 💪
