#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BIDBOARD Setup Script\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bidboard?schema=public"

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local - Please update it with your credentials!\n');
} else {
  console.log('✅ .env.local already exists\n');
}

// Install dependencies if needed
console.log('📦 Checking dependencies...');
try {
  execSync('pnpm install', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Failed to install dependencies. Make sure pnpm is installed.');
}

// Generate Prisma Client
console.log('\n🔧 Generating Prisma Client...');
try {
  execSync('pnpm db:generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully!\n');
} catch (error) {
  console.log('❌ Failed to generate Prisma Client');
}

console.log(`
📋 Next Steps:
1. Update .env.local with your database and Stripe credentials
2. Run 'pnpm db:push' to create database tables
3. Run 'pnpm db:seed' to add test data (optional)
4. Run 'pnpm dev' to start the development server

Need help? Check out SETUP.md for detailed instructions!
`); 