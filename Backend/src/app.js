import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import { clerkMiddleware } from '@clerk/express';

const app = express();

// Apply Clerk middleware globally
app.use(clerkMiddleware());

// Security Headers
app.use(helmet());

// Request Logging
app.use(morgan("dev"));

// Rate Limiting (limit repeated requests to public APIs and/or endpoints)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per `window`
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
});
app.use("/api", limiter);

// Compression for better performance
app.use(compression());


app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());



// routes import
import healthcheckRouter from "./routes/healthcheck.routes.js";
import adminRouter from "./routes/admin.routes.js";
import studentRouter from "./routes/student.routes.js";
import registrationRouter from "./routes/registration.routes.js";
import eventRouter from "./routes/event.routes.js";
import teamRouter from "./routes/team.routes.js";
import certificateRouter from "./routes/certificate.routes.js";
import boardingPassRouter from "./routes/boardingPass.routes.js";
import contactRouter from "./routes/contact.routes.js";
import qrRouter from "./routes/qr.routes.js";
import questionRouter from "./routes/question.routes.js";
import resourceRouter from "./routes/resource.routes.js";
import codingRouter from "./routes/coding.routes.js";
import learningRouter from "./routes/learning.routes.js";
import adminLearningRouter from "./routes/adminLearning.routes.js";
import challengesRouter from "./routes/challenges.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";
import adminChallengesRouter from "./routes/adminChallenges.routes.js";
import teamsRouter from "./routes/teams.routes.js";
import projectsRouter from "./routes/projects.routes.js";
import gitRouter from "./routes/git.routes.js";
import discussionsRouter from "./routes/discussions.routes.js";
import eventsRouter from "./routes/events.routes.js";
import progressRouter from "./routes/progress.routes.js";
import careerRouter from "./routes/career.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";

// routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/registrations", registrationRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/certificates", certificateRouter);
app.use("/api/v1/boarding-passes", boardingPassRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/qr", qrRouter);
app.use("/api/v1/admin/questions", questionRouter);
app.use("/api/v1/resources", resourceRouter);
app.use("/api/v1/coding", codingRouter);
app.use("/api/v1/learning", learningRouter);
app.use("/api/v1/admin/learning", adminLearningRouter);
app.use("/api/v1/challenges", challengesRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.use("/api/v1/admin/challenges", adminChallengesRouter);
app.use("/api/v1/teams", teamsRouter);
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/git", gitRouter);
app.use("/api/v1/discussions", discussionsRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/career", careerRouter);
app.use("/api/v1/attendance", attendanceRouter);

// swagger api documentation (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use("/docs", express.static("docs"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, {
    swaggerOptions: {
      url: '/docs/openapi.yaml'
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Devspace API Documentation"
  }));
}

// Root route for Vercel deployment check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Devspace Backend API is running!" });
});

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// error handling middleware (should be added after all routes)
app.use(errorHandler);

export default app;
