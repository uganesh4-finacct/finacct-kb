# FinAcct360 Knowledge Base

Internal knowledge base and training platform for FinAcct360 accounting team.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Editor:** TipTap
- **Hosting:** Vercel

## Features

- 🔐 Role-based access (Admin, Editor, Reader, Trainee)
- 📚 7 Training Modules with Quizzes
- 🔒 Gated Access (must pass training to unlock content)
- 🏆 Certificate on completion
- 🔍 Full-text search
- 🛡️ Copy protection with watermarks
- 📊 Analytics dashboard

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Supabase

1. Your `.env.local` is already configured with:
   - Project URL: `https://eeounzuayafmxnzxuqan.supabase.co`
   - Anon Key: Already set

2. Run the database schema:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Run the SQL

### Step 3: Create Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter your admin email and password
4. After user is created, go to Table Editor → profiles
5. Find the new user and change `role` from `trainee` to `admin`

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Cursor Build Prompts

Use these prompts in Cursor to build the full application:

### PROMPT 1: Authentication & Base Layout

```
Build the authentication system and base layout for this Next.js knowledge base app.

Requirements:
1. Login page at /login with email + password
2. Password reset flow at /reset-password
3. Middleware to protect routes based on user role
4. Base layout with:
   - Header (logo, search bar, user menu)
   - Sidebar for navigation
   - Copy protection (disable right-click, Ctrl+C, etc.)
   - Watermark component showing user email

Roles:
- admin: Full access to everything
- editor: Can create/edit content, view analytics
- reader: Can view all content (completed training)
- trainee: Can ONLY view training section

Use the existing Supabase client in lib/supabase.ts
Use the types in lib/types.ts
Style with Tailwind CSS matching the premium design
```

### PROMPT 2: Admin Dashboard & Content Editor

```
Build the admin dashboard and content management system.

Requirements:
1. Admin dashboard at /admin with:
   - Stats cards (total articles, sections, team members, reads)
   - Recent activity
   - Quick actions

2. Team management at /admin/team:
   - List all users with role, training status, quiz scores
   - Add new user (sends invite email)
   - Change user role
   - Reset user's quiz attempts
   - View users who failed 3+ times (alert for Rajiv)

3. Section management at /admin/sections:
   - CRUD for sections
   - Drag to reorder
   - Toggle publish status

4. Article editor at /admin/articles:
   - List all articles by section
   - TipTap rich text editor with:
     - Headings, bold, italic, underline
     - Lists (ordered, unordered)
     - Tables
     - Code blocks
     - Images
     - Callout boxes (info, warning, success)
   - Save draft / Publish
   - Version history

5. Training module editor at /admin/training:
   - Same TipTap editor for module content
   - Quiz question builder:
     - Multiple choice (4 options)
     - Mark correct answer
     - Add explanation
   - Set passing score (default 80%)

Use existing Supabase schema and types.
```

### PROMPT 3: Reader View & Training System

```
Build the reader-facing pages and training system.

Requirements:
1. Home page (after login) showing:
   - Welcome message with user name
   - 6 section cards (or locked icons for trainees)
   - Recently updated articles
   - Training progress (if trainee)

2. Section page /[section]:
   - List of articles in section
   - Search within section
   - Breadcrumb navigation

3. Article reader /[section]/[article]:
   - Full article content
   - Table of contents sidebar
   - Related articles
   - Copy protection active
   - Watermark with user email
   - Track read in kb_reads table

4. Training section /training:
   - List of 7 modules with progress
   - Locked modules unlock sequentially
   - Show time estimate per module

5. Training module page /training/[module]:
   - Module content (from TipTap JSON)
   - "Take Quiz" button at end
   - Track time spent

6. Quiz page /training/[module]/quiz:
   - Show questions one at a time
   - 4 options each
   - Submit and calculate score
   - Show results with explanations
   - Pass (80%+) → unlock next module
   - Fail → can retry
   - Track attempt in quiz_attempts table

7. Certificate page /certificate:
   - Beautiful certificate design
   - Shows name, date, average score
   - Download as PDF
   - Auto-generated certificate number

8. Search functionality:
   - Search bar in header
   - Full-text search across all articles
   - Show results with section, excerpt
   - Highlight matching text

Gated access logic:
- Trainees see training section ONLY
- After passing all quizzes → auto-upgrade to reader
- Readers see all 6 content sections

Use existing Supabase schema and types.
```

### PROMPT 4: Seed Content

```
Seed the database with all content for the FinAcct360 Knowledge Base.

Create the following:

SECTIONS (7 total):
1. Accountant Training (is_training_section: true)
2. Chart of Accounts
3. Standard Operating Procedures  
4. Exception Handling
5. Sample Financials
6. Client Education (skip for now - Phase 2)
7. POS & Software Guides

TRAINING MODULES (7) with quiz questions:
Module 1: Restaurant Accounting Basics
Module 2: Understanding the Chart of Accounts
Module 3: Reading a Restaurant P&L
Module 4: KPI Fundamentals
Module 5: Weekly Close Process
Module 6: Using FinAcct360
Module 7: Common Mistakes to Avoid

Each module needs:
- Content explaining the topic
- 5-10 quiz questions (multiple choice)
- 80% passing score

ARTICLES for each section based on this COA framework:
[Include the full COA content from the planning document]

For Chart of Accounts section:
- Master COA Framework (with interactive expandable tree)
- Cafe / Coffee Shop COA
- Full Service Restaurant COA
- Bar & Grill COA
- Fast Casual / QSR COA
- Balance Sheet Accounts
- Cash Flow Classification
- QBO Mapping Guide

For SOPs section:
- Client Onboarding Checklist
- Books Health Check (5-Point Audit)
- Weekly Close Process
- Monthly Close Process

For Exception Handling:
- Client Refuses COA Change
- Messy Books Protocol
- Missing Data Handling
- QBO Technical Issues
- Business Model Exceptions

For Sample Financials:
- Cafe / Coffee Shop P&L
- Full Service Restaurant P&L
- Bar & Grill P&L
- Fast Casual / QSR P&L

For POS Guides:
- Square Export Guide
- Toast Export Guide
- Clover Export Guide
- QBO P&L Export Guide
- QBO Balance Sheet Export Guide
- Payroll Register Export Guide

All content should be professionally written, detailed, and ready for production use.
Author for all articles: "FinAcct Controller"
```

---

## Deployment to Vercel

1. Push code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)

3. Import your GitHub repository

4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Deploy

6. Add custom domain: `kb.finacctsolutions.com`

---

## Folder Structure

```
finacct-kb/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── reset-password/
│   ├── (reader)/
│   │   ├── training/
│   │   ├── [section]/
│   │   └── [section]/[article]/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── articles/
│   │   ├── sections/
│   │   ├── team/
│   │   └── quiz-results/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts
│   └── types.ts
├── public/
├── supabase/
│   └── schema.sql
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

---

## Support

For questions, contact the FinAcct360 team.
