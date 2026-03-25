import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import type { Cs2MatchesResponse, HealthResponse, Player } from "shared-types";
import { matchAnalytics } from "./matchAnalytics";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());

type ParsedMatch = {
  id: string;
  name: string;
  sourceFile: string;
  logLines: string[];
  map: string | null;
  teams: {
    ct: string | null;
    terrorist: string | null;
  };
  playersBySide: {
    CT: Player[];
    TERRORIST: Player[];
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
  const ctPlayers = new Map<string, Player>();
  const terroristPlayers = new Map<string, Player>();
  let lastMatchStartIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].includes('World triggered "Match_Start"')) {
      lastMatchStartIndex = index;
    }
  }

  const effectiveLines =
    lastMatchStartIndex >= 0 ? lines.slice(lastMatchStartIndex) : lines;

  const getPlayerId = (rawPlayerId: string, playerName: string) => {
    const normalized = rawPlayerId.trim();
    if (normalized && normalized !== "BOT") {
      return normalized;
    }

    return `player:${playerName.trim().toLowerCase().replace(/\s+/g, "-")}`;
  };

  const TEAM_SWITCH_REGEX =
    /"(.+?)<\d+><([^>]*)>" switched from team <[^>]*> to <(CT|TERRORIST)>/;

  for (const line of effectiveLines) {
    const mapMatch = line.match(/World triggered "Match_Start" on "([^"]+)"/);
    if (mapMatch) {
      map = mapMatch[1];
    }

    const ctMatch = line.match(/Team playing "CT":\s*(.+)$/);
    if (ctMatch && ctTeam === null) {
      ctTeam = ctMatch[1].trim();
    }

    const terroristMatch = line.match(/Team playing "TERRORIST":\s*(.+)$/);
    if (terroristMatch && terroristTeam === null) {
      terroristTeam = terroristMatch[1].trim();
    }

    const playerSwitchMatch = line.match(TEAM_SWITCH_REGEX);
    if (playerSwitchMatch) {
      const playerName = playerSwitchMatch[1].trim();
      const playerId = getPlayerId(playerSwitchMatch[2], playerName);
      const side = playerSwitchMatch[3] as "CT" | "TERRORIST";
      const player: Player = {
        id: playerId,
        name: playerName,
      };

      if (side === "CT") {
        if (!terroristPlayers.has(playerId)) {
          ctPlayers.set(playerId, player);
        }
      } else if (!ctPlayers.has(playerId)) {
        terroristPlayers.set(playerId, player);
      }
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
    logLines: effectiveLines,
    map,
    teams: {
      ct: ctTeam,
      terrorist: terroristTeam,
    },
    playersBySide: {
      CT: [...ctPlayers.values()],
      TERRORIST: [...terroristPlayers.values()],
    },
    totalLines: effectiveLines.filter(Boolean).length,
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
      teams: [
        {
          name: match.teams.ct ?? "unknown",
          side: "CT",
          players: match.playersBySide.CT,
        },
        {
          name: match.teams.terrorist ?? "unknown",
          side: "TERRORIST",
          players: match.playersBySide.TERRORIST,
        },
      ],
    })),
  };

  res.json(payload);
});

function getMatchById(id: string) {
  return parsedMatches.find((match) => match.id === id);
}

app.get("/matches/:id/round-scores", (req, res) => {
  const match = getMatchById(req.params.id);
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json({
    matchId: match.id,
    roundScores: matchAnalytics.getRoundScores(match),
  });
});

app.get("/matches/:id/player-stats", (req, res) => {
  const match = getMatchById(req.params.id);
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json({
    matchId: match.id,
    playerStats: matchAnalytics.getPlayerStats(match),
  });
});

app.get("/matches/:id/insights", (req, res) => {
  const match = getMatchById(req.params.id);
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json({
    ...matchAnalytics.getMatchInsights(match),
  });
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
