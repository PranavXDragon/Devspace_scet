# Getting Started with DevSpace

This guide provides step-by-step instructions for setting up the DevSpace Monorepo (Next.js Frontend + Express.js Backend + Supabase) on your local machine for development.

---

## 📋 Prerequisites

Ensure you have the following software installed before proceeding:

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 20.x LTS or 22.x | Runtime for Next.js & Express |
| **npm** | 10.x+ | Package Manager |
| **Supabase CLI** | Latest | Local Database Development |
| **Docker** | Latest | Required by Supabase CLI |
| **Git** | Latest | Version Control |

> [!TIP]
> Ensure Docker Desktop is running before attempting to start the local Supabase instance.

---

## 🚀 1. Clone & Setup

1. **Clone the Monorepo**
   ```bash
   git clone <repository-url>
   cd DevSpace
   ```

2. **Install Workspace Dependencies**
   From the root of the monorepo, run:
   ```bash
   npm run install:all
   ```
   *(This will run `npm install` in both the `/Frontend` and `/Backend` directories concurrently).*

---

## 🗄️ 2. Database Setup (Supabase Local)

We treat our database as code. Instead of relying on a shared remote database for development, every developer spins up their own local instance of Supabase using Docker.

1. **Initialize Supabase**
   Navigate to the root directory and start the local database:
   ```bash
   npx supabase start
   ```
   
2. **Retrieve Local Keys**
   Once started, the CLI will output your local API keys and Database URL. Keep these handy.
   ```text
   API URL: http://127.0.0.1:54321
   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   anon key: eyJh...
   service_role key: eyJh...
   ```

3. **Database Migrations**
   The `supabase start` command automatically applies all SQL migrations located in `supabase/migrations/` and seeds the database using `supabase/seed.sql`. Your database is instantly ready for development!

---

## 🔐 3. Environment Variables

You need to configure environment variables for **both** the Frontend and the Backend.

### Backend Configuration (`/Backend/.env`)
Navigate to `/Backend` and create an `.env` file from the sample:
```bash
cd Backend
cp .env.sample .env
```
Update the `.env` file with your local Supabase credentials and Clerk Secret Keys.

### Frontend Configuration (`/Frontend/.env.local`)
Navigate to `/Frontend` and create an `.env.local` file:
```bash
cd ../Frontend
cp .env.example .env.local
```
Ensure your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is properly set.

> [!WARNING]
> **Never commit your `.env` files.** They contain highly sensitive `service_role` keys and Clerk secrets that grant full administrative access to your instances.

---

## 🏃 4. Running the Application

You can start both the Frontend and Backend simultaneously from the root directory if a root script is configured, or run them in separate terminal tabs:

**Terminal 1: Start Backend**
```bash
cd Backend
npm run dev
```
*The Express server will start on `http://localhost:5000` (or whatever `PORT` is set in `.env`).*

**Terminal 2: Start Frontend**
```bash
cd Frontend
npm run dev
```
*The Next.js application will start on `http://localhost:3000`.*

---

## 🧪 5. Verify Installation

To confirm everything is working correctly:

1. **Backend Health Check:** Open `http://localhost:5000/api/v1/healthcheck`. You should receive a JSON response indicating the server and database are healthy.
2. **Frontend UI:** Open `http://localhost:3000` to view the DevSpace landing page.
3. **Admin Login:** Navigate to `http://localhost:3000/admin/login` and authenticate using the credentials seeded in the `supabase/seed.sql` file.

---

## 🐛 Troubleshooting

### `supabase start` fails
- Ensure Docker Desktop is running.
- Ensure ports `54321` and `54322` are not being used by another local Postgres instance.

### JWT Authentication Fails (Admin)
- Verify `ACCESS_TOKEN_SECRET` exists in the Backend `.env`.
- Ensure your browser allows cross-origin cookies if testing from a different port.

### Clerk Authentication Fails (Student)
- Ensure both the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Frontend) and `CLERK_SECRET_KEY` (Backend) belong to the exact same Clerk instance.

---

## 📚 Next Steps

Once your local environment is running perfectly, check out these architectural documents:
- [Project Structure](./project-structure.md)
- [Authentication Architecture](./authentication.md)
- [Middleware Pipeline](./middleware.md)
