# FinFlow — Production-Ready Expense Tracker PWA

A full-stack, installable Progressive Web App for tracking income, expenses, budgets, and financial insights. Built with Next.js 15, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **UI** | ShadCN-style Radix UI components, Recharts |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | Next.js API Routes (Edge-compatible) |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL |
| **Auth** | JWT via jose, bcryptjs |
| **PWA** | Service Worker, Web App Manifest, Install Prompt |

---

## 📁 Project Structure

```
finflow/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── transactions/page.tsx
│   ├── income/page.tsx
│   ├── expenses/page.tsx
│   ├── categories/page.tsx
│   ├── reports/page.tsx
│   ├── budget/page.tsx
│   ├── settings/page.tsx
│   ├── api/
│   │   ├── auth/{login,register,logout,me}/route.ts
│   │   ├── transactions/route.ts
│   │   ├── transactions/[id]/route.ts
│   │   ├── categories/route.ts
│   │   ├── categories/[id]/route.ts
│   │   ├── budgets/route.ts
│   │   ├── analytics/route.ts
│   │   └── export/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── ui/           # Radix UI primitives (Button, Input, Card, etc.)
│   ├── layout/       # Sidebar, TopBar, MobileNav, ThemeProvider, PWA
│   ├── forms/        # TransactionForm
│   ├── charts/       # MonthlyChart, CategoryPieChart, SpendingTrendChart
│   └── dashboard/    # DashboardClient
├── hooks/
│   ├── use-transactions.ts
│   ├── use-categories.ts
│   └── use-toast.ts
├── lib/
│   ├── auth.ts       # JWT, bcrypt, cookies
│   ├── prisma.ts     # Prisma singleton
│   ├── utils.ts      # Helpers, formatters
│   └── validations.ts # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── manifest.json
│   ├── sw.js         # Service Worker
│   └── icons/        # PWA icons
├── types/
│   └── index.ts
├── middleware.ts
├── next.config.js
├── tailwind.config.js
└── .env.example
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use Neon/Supabase free tier)
- npm or pnpm

### Step 1 — Clone and Install

```bash
git clone https://github.com/youruser/finflow.git
cd finflow
npm install
```

### Step 2 — Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finflow"
JWT_SECRET="change-this-to-a-random-32-char-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Step 3 — Database Setup

```bash
# Create the database schema
npm run db:push

# Seed default categories
npm run db:seed
```

### Step 4 — Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🗄️ Database Migration Steps

### Initial setup (development)
```bash
npx prisma db push
npx prisma generate
ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Creating a migration (production)
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy   # production
```

### View data
```bash
npx prisma studio
```

---

## 🌐 Deployment Guide

### Frontend + Backend → Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Set **Environment Variables**:
   - `DATABASE_URL` — your Neon/Supabase PostgreSQL URL
   - `JWT_SECRET` — random 32+ character string
   - `NEXT_PUBLIC_APP_URL` — your Vercel domain
5. Deploy

Vercel automatically handles Next.js API routes as serverless functions.

### Database → Neon PostgreSQL (Free)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (pooled)
4. Set as `DATABASE_URL` in Vercel

### Alternative: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add --database postgresql
railway up
```

### Running migrations in production

```bash
# After deployment, run:
npx prisma migrate deploy
npx prisma db seed
```

---

## 📱 Android PWA Installation

### Method 1 — Chrome on Android (Recommended)
1. Open your deployed FinFlow URL in **Chrome on Android**
2. Chrome will show a banner: "Add FinFlow to Home Screen"
3. Tap **Install** or the banner
4. App installs to your home screen with full-screen mode

### Method 2 — Manual Chrome Install
1. Open Chrome → navigate to FinFlow
2. Tap the **⋮ menu** (three dots, top-right)
3. Tap **"Add to Home screen"**
4. Confirm with **"Add"**

### PWA Features After Install
- ✅ **Offline support** — cached pages work without internet
- ✅ **No browser bar** — looks like a native app
- ✅ **Home screen icon** — custom FinFlow icon
- ✅ **Splash screen** — branded loading screen
- ✅ **Background sync** — queues transactions when offline
- ✅ **Push notifications** — budget alerts (when granted)

### Desktop Install (Chrome/Edge)
Click the **install icon (⊕)** in the address bar, or go to Settings → Install FinFlow.

---

## 🔐 Security Features

- **JWT** stored as HttpOnly cookies (not localStorage — immune to XSS)
- **bcrypt** with 12 rounds for password hashing
- **Zod validation** on all API inputs
- **Route-level auth** in middleware + API handlers
- **CSRF protection** via SameSite=Lax cookies
- Environment variables for all secrets

---

## ✨ Feature Overview

### Dashboard
- Total balance, monthly income/expense, savings
- Bar chart: 12-month income vs expense
- Pie chart: spending by category this month
- Budget status cards with alerts
- Recent transactions feed

### Transaction Management
- Add / Edit / Delete income & expenses
- Filter by type, category, payment method, date range, search
- Sort by date, amount, description
- Pagination (15 per page)
- Tags and notes per transaction
- Recurring transactions support

### Categories
- 14 default categories (Food, Transport, Bills, Salary, etc.)
- Create custom categories with custom color and icon
- Edit/delete custom categories

### Budget System
- Set monthly budgets (overall or per-category)
- Real-time spending progress bars
- Yellow warning at 80%, red alert at 100%+
- Remaining budget shown

### Reports & Analytics
- 12-month income/expense bar chart
- Category spending pie chart
- Spending trend line chart
- Month/year selector

### Export
- CSV export with all transactions
- JSON export
- Filtered by date range

### PWA (Progressive Web App)
- Installable on Android and Desktop
- Service Worker with offline caching
- Background sync for offline transactions
- Custom manifest with icons and shortcuts
- Add to home screen prompt

---

## 🎨 UI Design

- **Font**: Syne (headings) + DM Sans (body)
- **Theme**: Dark/light mode with CSS variables
- **Colors**: Indigo primary, green income, red expense
- **Components**: Rounded-2xl cards, smooth animations, glassmorphism accents
- **Responsive**: Mobile-first, sidebar on desktop, bottom nav on mobile

---

## 📸 Expected UI Screenshots

| Screen | Description |
|--------|-------------|
| Login | Clean auth card |
| Dashboard | Stats grid + charts + budgets + recent txns |
| Transactions | Full filterable table with pagination |
| Income/Expenses | Filtered views with quick-add |
| Categories | Color-coded grid, default + custom |
| Reports | Tabs: overview, categories, trends |
| Budget | Progress bars with warning states |
| Settings | Profile, theme, PWA install guide |

---

## 🔧 Extra Professional Features

| Feature | Status |
|---------|--------|
| Recurring transactions | Schema ready, UI toggle included |
| Multi-currency per transaction | ✅ Per-transaction currency field |
| Tags for transactions | ✅ Array of tags with UI |
| Smart spending insights | Savings rate, month-over-month % |
| Export CSV/JSON | ✅ Via /api/export |
| Dark/Light mode | ✅ next-themes |
| Offline support | ✅ Service Worker caching |
| Android installable | ✅ Full PWA manifest |

---

## 📄 License

MIT License — free for personal and commercial use.
