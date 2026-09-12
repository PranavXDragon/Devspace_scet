# Environment Variables

This document explains all environment variables required by the DevSpace Monorepo. 

Environment variables allow the application to be securely configured without hardcoding secrets into the source code. Because DevSpace is a monorepo, configuration is split between the **Frontend** and the **Backend**.

---

## 1. Frontend Configuration (`/Frontend/.env.local`)

The Next.js application requires environment variables to connect to Clerk (Authentication) and the backend API.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Public key for the Clerk frontend SDK. | `pk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | Route for Student Login. | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | Route for Student Registration. | `/sign-up` |
| `NEXT_PUBLIC_API_URL` | Yes | The URL of the Express Backend. | `http://localhost:5000/api/v1` |

> [!WARNING]  
> **Public vs Private Variables**  
> In Next.js, only variables prefixed with `NEXT_PUBLIC_` are bundled and sent to the browser. Never prefix sensitive secrets (like API keys) with `NEXT_PUBLIC_`.

---

## 2. Backend Configuration (`/Backend/.env`)

The Express.js backend requires extensive configuration to connect to Supabase, Clerk, Cloudinary, and SMTP servers.

### 2.1 Server Configuration
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Application environment (`development` or `production`) | `development` |
| `PORT` | No | Backend Express server port | `5000` |
| `CORS_ORIGIN` | No | Allowed frontend origin for CORS policies | `*` |

### 2.2 Supabase Database
We use Supabase as our PostgreSQL provider.

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | The project URL (local or cloud) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | The master key that bypasses RLS. |

> [!CAUTION]  
> **Never expose the Service Role Key!**  
> The `SUPABASE_SERVICE_ROLE_KEY` has absolute power over your database, bypassing all Row Level Security (RLS). It must remain strictly in the backend `.env`.

### 2.3 Clerk Authentication (Student)
| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | Yes | Used by the backend Clerk SDK to verify incoming student JWTs. |

### 2.4 Custom JWT Authentication (Admin)
Used for the custom administrator authentication flow.

| Variable | Required | Description |
|----------|----------|-------------|
| `ACCESS_TOKEN_SECRET` | Yes | Cryptographic secret used to sign Admin JWT cookies. |
| `ACCESS_TOKEN_EXPIRY` | Yes | JWT expiration time (e.g., `10d`). |

### 2.5 Cloudinary (Media Storage)
Cloudinary stores uploaded images (Event Covers, Team Member Photos).

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

### 2.6 SMTP Email Services
Used for sending Admin Login OTPs and Student notifications.

| Variable | Required | Description |
|----------|----------|-------------|
| `SMTP_HOST` | Yes | SMTP server host (e.g., `smtp.mailtrap.io`) |
| `SMTP_PORT` | Yes | SMTP server port |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASSWORD` | Yes | SMTP password |
| `FROM_EMAIL` | Yes | Sender email address (e.g., `noreply@devspace.com`) |
| `FROM_NAME` | Yes | Sender display name (e.g., `DevSpace Team`) |

---

## 3. Best Practices & Security

- **Do NOT Commit Secrets:** Never commit `.env` or `.env.local` to Git. Ensure they are listed in your `.gitignore`.
- **Use Examples:** If you add a new required variable, add a placeholder for it in `.env.example` so other developers know it's required.
- **Rotate Secrets:** Periodically rotate your `ACCESS_TOKEN_SECRET` and Clerk keys in production to maintain a hardened security posture.

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [`getting-started.md`](./getting-started.md) | Local monorepo setup instructions |
| [`deployment.md`](./deployment.md) | Production deployment guide |
| [`security.md`](./security.md) | Security recommendations & Threat Models |
