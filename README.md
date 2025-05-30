# 💰 BIDBOARD - The Internet's Most Expensive Leaderboard

> Pay to flex. The more you pay, the higher you rank.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=flat-square&logo=stripe)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql)

## 🎯 What is BIDBOARD?

BIDBOARD is a viral-ready leaderboard where people pay real money to claim spots. It's simple: the more you pay, the higher you rank. Top 10 spots get special perks like custom messages, links, and logos.

Think of it as the internet's most expensive "who's the best" Tournament. When streamers like xQc see others flexing with $500+ spots, they might drop $1k just to claim #1. That's the viral loop.

## ✨ Features

- 💳 **Secure Payments** - Stripe Checkout handles all transactions
- 🔄 **Real-time Updates** - Leaderboard refreshes every 5 seconds
- 👑 **Top 10 Perks** - Logos, custom messages, and links
- 📱 **Mobile Ready** - Responsive design that works everywhere
- 🎨 **Beautiful UI** - Dark theme with smooth animations
- 🚀 **Viral Ready** - Built to handle Reddit/Twitter traffic

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (local or cloud)
- **Payments**: Stripe Checkout + Webhooks
- **Animations**: Framer Motion
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/bidboard.git
   cd bidboard
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database and Stripe credentials
   ```

4. **Set up the database**

   ```bash
   pnpm db:setup
   pnpm db:seed  # Optional: Add test data
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 📖 Full Setup Guide

See [SETUP.md](./SETUP.md) for detailed setup instructions including:

- Database setup (local or cloud)
- Stripe configuration
- Webhook setup
- Deployment guide
- Scaling considerations

---

**Remember**: This is meant to be fun. Don't take it too seriously. Unless you're #1, then definitely take it seriously.

Built with ❤️ and capitalism
