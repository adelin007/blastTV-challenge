import type { PlayerStats, RoundScore } from "shared-types";

export type MatchLogSource = {
  id: string;
  logLines: string[];
  teams: {
    ct: string | null;
    terrorist: string | null;
  };
};

type MutablePlayerStats = {
  playerId: string;
  player: string;
  kills: number;
  deaths: number;
  headshots: number;
};

// does not take into account overtime
const HALF_ROUNDS_COUNT = 15;

const CT_SCORE_REGEX = /Team "CT" scored "(\d+)" with "\d+" players/;
const T_SCORE_REGEX = /Team "TERRORIST" scored "(\d+)" with "\d+" players/;
const KILL_REGEX =
  /"(.+?)<\d+><([^>]*)><([^>]*)>".* killed "(.+?)<\d+><([^>]*)><([^>]*)>".* with "([^"]+)"(.*)$/;

function isLikelyPlayer(name: string) {
  return name.length > 0 && name !== "World";
}

function getStablePlayerId(rawPlayerId: string, playerName: string) {
  const normalized = rawPlayerId.trim();

  if (normalized && normalized !== "BOT") {
    return normalized;
  }

  return `player:${playerName.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

function getTeamsForRound(match: MatchLogSource, round: number) {
  const initialCt = match.teams.ct;
  const initialT = match.teams.terrorist;

  if (round <= HALF_ROUNDS_COUNT) {
    return {
      ctTeamName: initialCt,
      terroristTeamName: initialT,
    };
  }

  return {
    ctTeamName: initialT,
    terroristTeamName: initialCt,
  };
}

export function getRoundScores(match: MatchLogSource): RoundScore[] {
  const rounds: RoundScore[] = [];
  let pendingCtScore: number | null = null;
  let pendingTerroristScore: number | null = null;
  let previousCtScore = 0;
  let previousTerroristScore = 0;

  for (const line of match.logLines) {
    const ctMatch = line.match(CT_SCORE_REGEX);
    if (ctMatch) {
      pendingCtScore = Number(ctMatch[1]);
    }

    const terroristMatch = line.match(T_SCORE_REGEX);
    if (terroristMatch) {
      pendingTerroristScore = Number(terroristMatch[1]);
    }

    if (pendingCtScore !== null && pendingTerroristScore !== null) {
      const ctDelta = pendingCtScore - previousCtScore;
      const terroristDelta = pendingTerroristScore - previousTerroristScore;

      const winner: RoundScore["winner"] =
        ctDelta > terroristDelta
          ? "CT"
          : terroristDelta > ctDelta
            ? "TERRORIST"
            : "draw";

      const round = rounds.length + 1;
      const { ctTeamName, terroristTeamName } = getTeamsForRound(match, round);

      const winnerTeamName =
        winner === "CT"
          ? ctTeamName
          : winner === "TERRORIST"
            ? terroristTeamName
            : null;

      rounds.push({
        round,
        ctScore: pendingCtScore,
        terroristScore: pendingTerroristScore,
        winner,
        ctTeamName,
        terroristTeamName,
        winnerTeamName,
      });

      previousCtScore = pendingCtScore;
      previousTerroristScore = pendingTerroristScore;
      pendingCtScore = null;
      pendingTerroristScore = null;
    }
  }

  return rounds;
}

export function getPlayerStats(match: MatchLogSource): PlayerStats[] {
  const players = new Map<string, MutablePlayerStats>();

  const ensurePlayer = (playerId: string, name: string): MutablePlayerStats => {
    const existing = players.get(playerId);
    if (existing) {
      if (!existing.player && name) {
        existing.player = name;
      }

      return existing;
    }

    const created: MutablePlayerStats = {
      playerId,
      player: name,
      kills: 0,
      deaths: 0,
      headshots: 0,
    };

    players.set(playerId, created);
    return created;
  };

  const handleKillLine = (line: string) => {
    const killMatch = line.match(KILL_REGEX);
    if (!killMatch) {
      return;
    }

    const killerName = killMatch[1].trim();
    const killerId = getStablePlayerId(killMatch[2], killerName);
    const killerTeam = killMatch[3].trim();
    const victimName = killMatch[4].trim();
    const victimId = getStablePlayerId(killMatch[5], victimName);
    const victimTeam = killMatch[6].trim();
    const extraFlags = killMatch[8] ?? "";

    if (!isLikelyPlayer(killerName) || !isLikelyPlayer(victimName)) {
      return;
    }

    if (killerTeam === victimTeam && killerTeam !== "") {
      return;
    }

    const killer = ensurePlayer(killerId, killerName);
    const victim = ensurePlayer(victimId, victimName);

    killer.kills += 1;
    victim.deaths += 1;

    if (extraFlags.includes("headshot")) {
      killer.headshots += 1;
    }
  };

  match.logLines.forEach(handleKillLine);

  return [...players.values()]
    .map((player) => ({
      ...player,
      kdRatio:
        player.deaths === 0
          ? player.kills
          : Number((player.kills / player.deaths).toFixed(2)),
    }))
    .sort(
      (a, b) =>
        b.kills - a.kills ||
        a.deaths - b.deaths ||
        a.player.localeCompare(b.player),
    );
}

export function getTopPlayers(match: MatchLogSource, limit = 5): PlayerStats[] {
  return getPlayerStats(match).slice(0, Math.max(0, limit));
}

export function getMatchInsights(match: MatchLogSource) {
  const roundScores = getRoundScores(match);
  const playerStats = getPlayerStats(match);

  return {
    roundScores,
    playerStats,
    totalRounds: roundScores.length,
    topPlayers: playerStats.slice(0, 5),
  };
}

export const matchAnalytics = {
  getRoundScores,
  getPlayerStats,
  getTopPlayers,
  getMatchInsights,
};
