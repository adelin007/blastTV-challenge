import express from "express";
import cors from "cors";
import type { Cs2MatchesResponse, HealthResponse } from "shared-types";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());

const cs2Matches: Cs2MatchesResponse["matches"] = [
  { id: "1", name: "Natus Vincere vs Team Vitality" },
  { id: "2", name: "G2 Esports vs Team Vitality" },
  { id: "3", name: "MOUZ vs Team Spirit" },
  { id: "4", name: "Astralis vs Virtus.pro" },
];

app.get("/health", (_req, res) => {
  const payload: HealthResponse = {
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  };

  res.json(payload);
});

app.get("/matches", (_req, res) => {
  const payload: Cs2MatchesResponse = {
    matches: cs2Matches,
  };

  res.json(payload);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
