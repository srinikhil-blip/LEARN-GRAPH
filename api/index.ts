import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAuthApiRequest } from "../src/server/authServer";
import { handleCurriculumApiRequest } from "../src/server/curriculumServer";
import { handleDashboardApiRequest } from "../src/server/dashboardServer";
import { handleQuizApiRequest } from "../src/server/quizServer";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Determine actual requested URL from Vercel headers or req.url
    const rawUrl =
      (req.headers["x-matched-path"] as string) ||
      (req.headers["x-forwarded-uri"] as string) ||
      req.url ||
      "/";

    req.url = rawUrl;

    if (await handleAuthApiRequest(req, res)) return;
    if (await handleCurriculumApiRequest(req, res)) return;
    if (await handleDashboardApiRequest(req, res)) return;
    if (await handleQuizApiRequest(req, res)) return;

    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        detail: "Backend API route not found or service offline.",
        code: "NOT_FOUND",
      }),
    );
  } catch (err) {
    console.error("[LearnGraph Vercel API] Error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ detail: "Internal server error" }));
    }
  }
}
