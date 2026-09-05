import express, { type Request, type Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazy Google Gen AI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash"
];

interface ContentPart {
  text: string;
}

interface MessageTurn {
  role: 'user' | 'model';
  parts: ContentPart[];
}

/**
 * Standard Helper Implementation: generateContentWithFallback
 * Wraps generation with fallback ladder catching recoverable status codes.
 */
async function generateContentWithFallback(
  contents: string | MessageTurn[],
  systemInstruction?: string
): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents as any,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      const responseText = response.text || '';
      if (responseText) {
        return { text: responseText, modelUsed: modelName };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || err?.code;
      const errMsg = String(err?.message || '');
      const isRecoverable =
        status === 503 ||
        status === 429 ||
        status === 404 ||
        status === 500 ||
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('ResourceExhausted') ||
        errMsg.includes('not found');

      console.warn(`Attempt with ${modelName} failed (recoverable: ${isRecoverable}): ${errMsg}`);
      if (!isRecoverable && status === 400 && !errMsg.includes('model')) {
        // Non-model related client error, break early
        throw err;
      }
    }
  }

  throw lastError || new Error("All Gemini models in fallback ladder were unavailable.");
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    uptime: process.uptime()
  });
});

// Chat & Reflection Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    // Defensive Payload Ingestion (Null-Safe Destructuring)
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const mode = typeof body.mode === 'string' ? body.mode : 'reflect';
    const rawHistory = Array.isArray(body.history) ? body.history : [];

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "User prompt text is required."
      });
    }

    // Determine tailored system instruction based on mode
    let systemInstruction = "You are a thoughtful, empathetic reflection companion assisting the user in their personal journal.";
    if (mode === 'reflect') {
      systemInstruction = "You are an empathetic, insightful psychological and philosophical reflection companion. Help the user examine their thoughts, feelings, and underlying beliefs without judgment. Provide a supportive perspective, highlight meaningful patterns, and gently offer one resonant reflection question to help them gain clarity.";
    } else if (mode === 'summarize') {
      systemInstruction = "You are an expert personal journal summarizer. Distill the user's reflection into concise, structured bullet points: (1) Core Themes, (2) Emotional Climate, and (3) Concrete Takeaways or Action Items.";
    } else if (mode === 'brainstorm') {
      systemInstruction = "You are an inspiring, creative brainstorming coach. Help the user expand their perspectives on whatever challenge or question they face. Provide 3-4 creative angles, actionable options, or reframed viewpoints to open up new possibilities.";
    } else if (mode === 'converse') {
      systemInstruction = "You are an active-listening, supportive conversational companion. Engage warmly and thoughtfully with the user's personal expressions.";
    }

    // Format multi-turn conversation history
    const contents: MessageTurn[] = [];
    for (const item of rawHistory) {
      if (item && typeof item === 'object' && typeof item.text === 'string' && item.text.trim()) {
        const role = item.sender === 'user' ? 'user' : 'model';
        contents.push({
          role,
          parts: [{ text: item.text.trim() }]
        });
      }
    }

    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const { text, modelUsed } = await generateContentWithFallback(contents, systemInstruction);

    return res.json({
      success: true,
      reply: text,
      modelUsed
    });
  } catch (err: any) {
    console.error("Error generating Gemini reply:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to generate AI reflection. Please check API key configuration or try again."
    });
  }
});

// Title suggestion endpoint
app.post('/api/suggest-title', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const text = typeof body.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return res.json({ success: true, title: "Journal Reflection" });
    }

    const prompt = `Based on the following journal reflection entry, generate a concise, inspiring 3-6 word title that captures the essence. Output ONLY the title itself, with no quotation marks or preamble:\n\n${text.slice(0, 500)}`;

    const { text: title, modelUsed } = await generateContentWithFallback(prompt);
    const cleanedTitle = title.replace(/^["'\s]+|["'\s]+$/g, '').slice(0, 60);

    return res.json({
      success: true,
      title: cleanedTitle || "Journal Reflection",
      modelUsed
    });
  } catch (err: any) {
    console.warn("Failed to generate title suggestion:", err);
    return res.json({
      success: true,
      title: "Personal Reflection"
    });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Reflective Journal Server listening on port ${PORT} (0.0.0.0)`);
  });
}

startServer().catch(err => {
  console.error("Failed to start Express server:", err);
  process.exit(1);
});
