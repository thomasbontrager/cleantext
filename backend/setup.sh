#!/bin/bash
# Setup script for TextWash backend

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🔐 Generating Prisma client..."
npm run prisma:generate

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database (or use cloud DB like Supabase)"
echo "2. Copy .env.example to .env and fill in your values:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - SENDGRID_API_KEY (optional)"
echo ""
echo "3. Run migrations: npm run prisma:migrate"
echo "4. Start dev server: npm run dev"
echo ""
