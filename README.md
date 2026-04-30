# Inventra — Inventory Management System

A single-page inventory management app with daily income/outcome charts, stock monitoring, and analytics.

## Features
- Dashboard with stats, income vs outcome chart, category breakdown
- Inventory management (add, search, restock)
- Transaction log (sales & restocks)
- Analytics page with 30-day revenue trend and top products

## Deploy to Vercel via GitHub + VS Code

### 1. Open in VS Code
Unzip the downloaded folder and open it in VS Code.

### 2. Initialize Git & push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
```
Then create a new repo on GitHub (github.com → New repository), and run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your GitHub repo
4. Leave all settings as default — Vercel auto-detects static HTML
5. Click **Deploy**

Your app will be live at `https://your-project.vercel.app` in under a minute.

### 4. Auto-deploy on push
Every future `git push` to `main` will automatically redeploy on Vercel.

## File structure
```
inventory-app/
├── index.html      # Entire app (HTML + CSS + JS)
├── vercel.json     # Vercel deployment config
└── README.md       # This file
```
