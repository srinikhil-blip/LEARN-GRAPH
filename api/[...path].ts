import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAuthApiRequest } from "../src/server/authServer.ts";
import { handleCurriculumApiRequest } from "../src/server/curriculumServer.ts";
import { handleDashboardApiRequest } from "../src/server/dashboardServer.ts";
import { handleQuizApiRequest } from "../src/server/quizServer.ts";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (await handleAuthApiRequest(req, res)) return;
    if (await handleCurriculumApiRequest(req, res)) return;
    if (await handleDashboardApiRequest(req, res)) return;
    if (await handleQuizApiRequest(req, res)) return;

    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        detail: "Backend API service is offline; using local fallback.",
        code: "BACKEND_OFFLINE",
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
