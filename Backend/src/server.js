import "dotenv/config";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./app.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const PORT = process.env.PORT || 5000;
let server;

// Start server directly since Supabase client connects via HTTP
seedAdmin().then(() => {
  server = app.listen(PORT, () => {
    console.log(`Server is running at: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
  });
}).catch(err => {
  console.log("Error during startup: ", err);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
