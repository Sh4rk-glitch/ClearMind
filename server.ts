import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables immediately
const envLocalPath = path.resolve(__dirname, ".env.local");
dotenv.config({ path: envLocalPath });
dotenv.config(); // Fallback to .env

console.log("=== SERVER STARTUP ===");
console.log("Looking for .env.local at:", envLocalPath);
console.log("File exists:", fs.existsSync(envLocalPath));
console.log("HACKCLUB_API_KEY found:", !!process.env.HACKCLUB_API_KEY);
console.log("=======================");

async function startServer() {
  const app = express();
  app.use(express.json());

  app.post("/api/ai", async (req, res) => {
    // Check key inside the request to be absolutely sure
    let apiKey = process.env.HACKCLUB_API_KEY || process.env.GEMINI_API_KEY;
    
    console.log("Incoming AI Request. Key present in env:", !!apiKey);

    if (!apiKey) {
      return res.status(500).json({ 
        error: "[VER-3] No API key found in server environment. Please restart your terminal." 
      });
    }

    // Clean the key
    apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

    try {
      const { messages, model = "google/gemini-1.5-flash", systemInstruction } = req.body;
      const payloadMessages = [...messages];
      if (systemInstruction) {
        payloadMessages.unshift({ role: "system", content: systemInstruction });
      }

      const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          response_format: req.body.response_format,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("HackClub Proxy Error:", data);
        return res.status(response.status).json({ error: "Proxy Error", details: data });
      }

      res.json(data);
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => res.sendFile("dist/index.html", { root: "." }));
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running at http://localhost:3000");
  });
}

startServer();