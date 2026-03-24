import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import type { Cs2MatchesResponse, HealthResponse } from "shared-types";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());

type ParsedMatch = {
  id: string;
  name: string;
  sourceFile: string;
  map: string | null;
  teams: {
    ct: string | null;
    terrorist: string | null;
  };
  totalLines: number;
};

const parsedMatches: ParsedMatch[] = [];

function parseMatchLog(fileName: string, rawLog: string): ParsedMatch {
  const id = fileName.replace(/\.txt$/i, "");
  const lines = rawLog.split(/\r?\n/);

  let map: string | null = null;
  let ctTeam: string | null = null;
  let terroristTeam: string | null = null;

  for (const line of lines) {
    const mapMatch = line.match(/World triggered "Match_Start" on "([^"]+)"/);
    if (mapMatch) {
      map = mapMatch[1];
    }

    const ctMatch = line.match(/Team playing "CT":\s*(.+)$/);
    if (ctMatch) {
      ctTeam = ctMatch[1].trim();
    }

    const terroristMatch = line.match(/Team playing "TERRORIST":\s*(.+)$/);
    if (terroristMatch) {
      terroristTeam = terroristMatch[1].trim();
    }
  }

  const nameParts = [terroristTeam, ctTeam].filter(Boolean);
  const baseName =
    nameParts.length === 2 ? `${nameParts[0]} vs ${nameParts[1]}` : id;
  const name = map ? `${baseName} (${map})` : baseName;

  return {
    id,
    name,
    sourceFile: fileName,
    map,
    teams: {
      ct: ctTeam,
      terrorist: terroristTeam,
    },
    totalLines: lines.filter(Boolean).length,
  };
}

async function loadMatchDataIntoMemory() {
  const matchDataDir = path.resolve(__dirname, "../assets/match-data");
  const files = await fs.readdir(matchDataDir);
  const matchLogFiles = files.filter((file) =>
    file.toLowerCase().endsWith(".txt"),
  );

  parsedMatches.length = 0;

  for (const fileName of matchLogFiles) {
    const filePath = path.join(matchDataDir, fileName);
    const rawLog = await fs.readFile(filePath, "utf-8");
    const parsed = parseMatchLog(fileName, rawLog);
    parsedMatches.push(parsed);
  }
}

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
    matches: parsedMatches.map((match) => ({
      id: match.id,
      name: match.name,
      map: match.map ?? "unknown",
      teams: [match.teams.ct ?? "unknown", match.teams.terrorist ?? "unknown"],
    })),
  };

  res.json(payload);
});

async function startServer() {
  await loadMatchDataIntoMemory();
  console.log(
    `Loaded ${parsedMatches.length} parsed match file(s) into memory.`,
  );

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
