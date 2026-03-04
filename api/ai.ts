import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let apiKey = process.env.HACKCLUB_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  }

  if (!apiKey) {
    return res.status(500).json({ 
      error: "No AI API key configured on the server. Please check your Vercel environment variables." 
    });
  }

  try {
    const { messages, model = "google/gemini-1.5-flash", systemInstruction, response_format } = req.body;
    
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
        response_format,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("HackClub Proxy Error:", data);
      return res.status(response.status).json({ error: "Proxy Error", details: data });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Serverless Function Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
