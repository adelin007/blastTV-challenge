import express from "express";
import cors from "cors";
import type { HealthResponse } from "shared-types";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());

app.get("/health", (_req, res) => {
  const payload: HealthResponse = {
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  };

  res.json(payload);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
