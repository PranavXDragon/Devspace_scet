# Development Guide

Welcome to the DevSpace development team! This guide outlines the coding standards, branching strategies, and best practices we follow to maintain a clean, performant, and secure monorepo.

---

## 1. Branching Strategy (Git Flow)

We follow a simplified Git Flow model.

- **`main`**: The production branch. This branch is always deployable. Commits to this branch automatically trigger Vercel and Render production deployments.
- **`develop`**: The staging branch. All feature branches merge into this branch for testing before being promoted to `main`.
- **`feature/*`**: For new features (e.g., `feature/student-dashboard`).
- **`bugfix/*`**: For fixing issues (e.g., `bugfix/admin-login-crash`).

### Pull Request Workflow
1. Create your feature branch from `develop`.
2. Commit your changes locally.
3. Push to origin and open a Pull Request against `develop`.
4. Ensure the CI pipeline (ESLint, Prettier, Build checks) passes.
5. Request a review from at least one core maintainer.

---

## 2. Commit Conventions

We enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to keep the git history clean and to automatically generate changelogs.

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests.
- `chore`: Changes to the build process or auxiliary tools.

**Example:**
```bash
git commit -m "feat(auth): implement clerk biometric passkeys"
```

---

## 3. Adding a New Full-Stack Feature

Because DevSpace is a monorepo, a new feature often touches both the Database, the Backend, and the Frontend. Follow this order of operations:

### Step 1: Database Migration (`/supabase`)
Never manually edit the database schema in the dashboard. Always write a migration.
1. Generate a new migration file: `npx supabase migration new add_feature_table`.
2. Write your SQL in the generated file.
3. Apply the migration locally: `npx supabase db push`.

### Step 2: Backend Logic (`/Backend`)
1. Create your Business Logic in a new Controller (`/controllers/feature.controller.js`).
2. Map an Express route to your controller (`/routes/feature.routes.js`).
3. Protect the route by adding the appropriate middleware (`verifyStudentJWT` or `verifyAdmin`).
4. Mount the route in `app.js`.

### Step 3: Frontend Implementation (`/Frontend`)
1. Create a service file (`/services/feature.service.js`) to encapsulate Axios calls to your new backend endpoint.
2. Build the UI components in `/components`.
3. Create the route page in the App Router (`/app/(student)/feature/page.jsx`).
4. Connect the components to the service file.

---

## 4. Code Quality & Formatting

We use **ESLint** and **Prettier** to enforce code quality across both the frontend and backend. 

> [!TIP]
> **Format on Save:** Ensure your IDE (VSCode, WebStorm) is configured to "Format on Save" using Prettier. This prevents ugly diffs in Pull Requests.

Before committing, you can run the global format script from the root of the project:
```bash
npm run format:all
```

---

## 5. Security Mandates

Security is a first-class citizen in DevSpace. Review the [Security Architecture](./security.md) before writing code, and adhere to these rules:

1. **Never Trust the Client:** Always re-validate input on the Express backend, even if you wrote a Zod schema on the Next.js frontend.
2. **Never Hardcode Secrets:** Always use `process.env`.
3. **Database Access:** The frontend must never talk to Supabase directly using the `service_role` key. All privileged queries must route through the Express Backend.
