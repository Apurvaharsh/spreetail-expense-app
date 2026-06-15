# Spreetail Expense App

A full-stack web application for tracking shared expenses, calculating simplified debts, and settling up with friends.

## Live Application
- **Frontend**: https://spreetail-expense-app-nine.vercel.app
- **Backend API**: https://spreetail-expense-app.onrender.com

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file with your `DATABASE_URL` and `JWT_SECRET`.
4. Run `npx prisma db push` to initialize the database schema.
5. Run `npm run dev` to start the server on port 5000.

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env` file with `VITE_API_URL=http://localhost:5000/api`.
4. Run `npm run dev` to start the Vite development server.

## AI Usage
AI tools were used minimally in this project to speed up boilerplate tasks:
- **Stitch**: Used to generate some basic Tailwind CSS layouts for the initial UI mockups.
- **Antigravity**: Used for minor debugging assistance during deployment.

For full details, see [AI_USAGE.md](AI_USAGE.md).
