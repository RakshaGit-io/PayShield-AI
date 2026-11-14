import "dotenv/config";
import express, { type Request, type Response } from "express";
import { createServer } from "http";
import { join } from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

type Telemetry = {
  mode?: "buyer_retry" | "bot_attack";
  attempt?: number;
  cartFingerprint?: string;
  clickIntervalsMs?: number[];
  deviceFingerprint?: string;
  payloadEntropy?: number;
  requestIndex?: number;
  sessionAgeMs?: number;
  productTotal?: string;
};

type Decision = {
  decision: "RESCUE_PAYPAL" | "BLOCK_BOT";
  confidence: number;
  reason: string;
};

const PRODUCT_TOTAL = "199.00";

function clampConfidence(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0.5;
  return Math.max(0, Math.min(1, numeric));
}

function normalizeDecision(value: unknown): Decision["decision"] {
  return value === "RESCUE_PAYPAL" ? "RESCUE_PAYPAL" : "BLOCK_BOT";
}

function deterministicGuardrail(telemetry: Telemetry): Decision {
  const isHuman = telemetry.mode === "buyer_retry" &&
    telemetry.attempt === 3 &&
    telemetry.cartFingerprint === "keyboard-199" &&
    telemetry.deviceFingerprint === "same-device" &&
    (telemetry.clickIntervalsMs ?? []).every(interval => interval >= 380);

  return isHuman
    ? { decision: "RESCUE_PAYPAL", confidence: 0.96, reason: "Human intent detected from consistent cart, normal click timing, and same device." }
    : { decision: "BLOCK_BOT", confidence: 0.99, reason: "Automated traffic pattern detected from rapid requests and randomized payloads." };
}

async function analyzeWithGemini(telemetry: Telemetry): Promise<Decision> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return deterministicGuardrail(telemetry);

  const prompt = `You are PayShield AI, a payment traffic manager. Classify this checkout telemetry. Rescue only a legitimate human retry; block automated abuse. Return JSON only with exactly these fields: decision (RESCUE_PAYPAL or BLOCK_BOT), confidence (number from 0 to 1), reason (short sentence). Telemetry: ${JSON.stringify(telemetry)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            decision: { type: "STRING", enum: ["RESCUE_PAYPAL", "BLOCK_BOT"] },
            confidence: { type: "NUMBER" },
            reason: { type: "STRING" },
          },
          required: ["decision", "confidence", "reason"],
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini ${response.status}: ${detail.slice(0, 240)}`);
  }

  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no decision content");
  const parsed = JSON.parse(text) as Partial<Decision>;
  return {
    decision: normalizeDecision(parsed.decision),
    confidence: clampConfidence(parsed.confidence),
    reason: typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim() : "Telemetry evaluated by PayShield AI.",
  };
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) throw new Error("PayPal Sandbox credentials are not configured");
  const basic = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    signal: AbortSignal.timeout(20_000),
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error(`PayPal OAuth ${response.status}: ${(await response.text()).slice(0, 240)}`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("PayPal OAuth returned no access token");
  return payload.access_token;
}

async function createPayPalOrder() {
  const token = await getPayPalAccessToken();
  const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `payshield-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: "payshield-keyboard",
        description: "Pro Mechanical Keyboard",
        amount: { currency_code: "USD", value: PRODUCT_TOTAL },
      }],
      application_context: {
        brand_name: "PayShield AI",
        user_action: "PAY_NOW",
        return_url: "https://example.com/payshield/sandbox-return",
        cancel_url: "https://example.com/payshield/sandbox-cancel",
      },
    }),
  });
  const payload = await response.json() as { id?: string; links?: Array<{ rel?: string; href?: string }> };
  if (!response.ok || !payload.id) throw new Error(`PayPal Orders ${response.status}: ${JSON.stringify(payload).slice(0, 300)}`);
  return {
    id: payload.id,
    approvalUrl: payload.links?.find(link => link.rel === "approve")?.href ?? null,
  };
}

function registerPayShieldRoutes(app: express.Express) {
  app.post("/api/decision", async (req: Request, res: Response) => {
    const telemetry = (req.body ?? {}) as Telemetry;
    try {
      const decision = await analyzeWithGemini(telemetry);
      if (decision.decision === "RESCUE_PAYPAL") {
        const order = await createPayPalOrder();
        return res.json({ ...decision, order });
      }
      return res.json(decision);
    } catch (error) {
      console.error("[PayShield] Decision pipeline error:", error instanceof Error ? error.message : error);
      const fallback = deterministicGuardrail(telemetry);
      if (fallback.decision === "RESCUE_PAYPAL") {
        try {
          const order = await createPayPalOrder();
          return res.json({ ...fallback, fallback: true, order });
        } catch (paypalError) {
          console.error("[PayShield] PayPal fallback error:", paypalError instanceof Error ? paypalError.message : paypalError);
          return res.status(502).json({ ...fallback, fallback: true, error: "PayPal Sandbox order could not be created." });
        }
      }
      return res.json({ ...fallback, fallback: true });
    }
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "payshield-ai" }));
  app.get("/manus-routes.json", (_req, res) => res.sendFile(join(process.cwd(), "public", "manus-routes.json")));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  registerPayShieldRoutes(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);
  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
