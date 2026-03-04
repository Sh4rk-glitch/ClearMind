import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Proxy Route
  app.post("/api/ai", async (req, res) => {
    const { messages, model = "google/gemini-3-flash-preview", systemInstruction } = req.body;
    const apiKey = process.env.HACKCLUB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "HACKCLUB_API_KEY is not configured on the server." });
    }

    const payloadMessages = [...messages];
    if (systemInstruction) {
      payloadMessages.unshift({ role: "system", content: systemInstruction });
    }

    try {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: "AI Proxy Error", details: errorData });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("AI Proxy Exception:", error);
      res.status(500).json({ error: "Internal Server Error during AI request." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
