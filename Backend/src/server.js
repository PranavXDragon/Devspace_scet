import "dotenv/config";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./app.js";
import { seedAdmin } from "./utils/seedAdmin.js";

import { supabase } from "./config/supabase.js";

const PORT = process.env.PORT || 5000;
let server;

// Start server directly since Supabase client connects via HTTP
seedAdmin().then(() => {
  server = app.listen(PORT, () => {
    console.log(`Server is running at: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
    
    // Supabase Keep-Alive: Ping database every 12 hours to prevent pausing on free tier
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        console.log("Running Supabase keep-alive ping...");
        await supabase.from('admins').select('id').limit(1);
      } catch (err) {
        console.error("Keep-alive ping failed:", err);
      }
    }, TWELVE_HOURS);

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
