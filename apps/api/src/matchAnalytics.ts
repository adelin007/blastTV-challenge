import type {
  PlayerStats,
  RoundScore,
  MatchInsights,
  TeamPlayerStatsGroup,
} from "shared-types";

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
const TEAM_SWITCH_REGEX =
  /"(.+?)<\d+><([^>]*)>" switched from team <[^>]*> to <(CT|TERRORIST)>/;
const ROUND_START_REGEX = /World triggered "Round_Start"/;
const ROUND_END_NOTICE_REGEX =
  /Team "(CT|TERRORIST)" triggered "(SFUI_Notice_[^"]+)"/;
const BOMB_PLANTED_REGEX = /triggered "Planted_The_Bomb"/;

const CT_SIDE = "CT";
const TERRORIST_SIDE = "TERRORIST";
type Side = typeof CT_SIDE | typeof TERRORIST_SIDE;
const DEFAULT_PLAYERS_PER_TEAM = 5;

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

function getTeamNameForSide(match: MatchLogSource, round: number, side: Side) {
  const { ctTeamName, terroristTeamName } = getTeamsForRound(match, round);
  return side === CT_SIDE ? ctTeamName : terroristTeamName;
}

function getSide(value: string): Side | null {
  if (value === CT_SIDE || value === TERRORIST_SIDE) {
    return value;
  }

  return null;
}

export function getRoundScores(match: MatchLogSource): RoundScore[] {
  const rounds: RoundScore[] = [];
  let pendingCtScore: number | null = null;
  let pendingTerroristScore: number | null = null;
  let previousCtScore = 0;
  let previousTerroristScore = 0;

  const currentCtPlayers = new Set<string>();
  const currentTerroristPlayers = new Set<string>();
  let aliveCtPlayers = new Set<string>();
  let aliveTerroristPlayers = new Set<string>();
  let roundEndReason: RoundScore["roundEndReason"] = "unknown";
  let bombPlantedThisRound = false;

  const startRoundAliveTracking = () => {
    aliveCtPlayers = new Set(currentCtPlayers);
    aliveTerroristPlayers = new Set(currentTerroristPlayers);
  };

  const getAliveCounts = () => ({
    ct:
      aliveCtPlayers.size > 0
        ? aliveCtPlayers.size
        : currentCtPlayers.size > 0
          ? currentCtPlayers.size
          : DEFAULT_PLAYERS_PER_TEAM,
    terrorist:
      aliveTerroristPlayers.size > 0
        ? aliveTerroristPlayers.size
        : currentTerroristPlayers.size > 0
          ? currentTerroristPlayers.size
          : DEFAULT_PLAYERS_PER_TEAM,
  });

  for (const line of match.logLines) {
    const switchMatch = line.match(TEAM_SWITCH_REGEX);
    if (switchMatch) {
      const playerName = switchMatch[1].trim();
      const playerId = getStablePlayerId(switchMatch[2], playerName);
      const side = switchMatch[3] as Side;

      currentCtPlayers.delete(playerId);
      currentTerroristPlayers.delete(playerId);

      if (side === CT_SIDE) {
        currentCtPlayers.add(playerId);
      } else {
        currentTerroristPlayers.add(playerId);
      }
    }

    if (ROUND_START_REGEX.test(line)) {
      startRoundAliveTracking();
      roundEndReason = "unknown";
      bombPlantedThisRound = false;
    }

    if (BOMB_PLANTED_REGEX.test(line)) {
      bombPlantedThisRound = true;
    }

    const killMatch = line.match(KILL_REGEX);
    if (killMatch) {
      const victimName = killMatch[4].trim();
      const victimId = getStablePlayerId(killMatch[5], victimName);
      const victimSide = getSide(killMatch[6].trim());

      if (victimSide === CT_SIDE) {
        aliveCtPlayers.delete(victimId);
      }

      if (victimSide === TERRORIST_SIDE) {
        aliveTerroristPlayers.delete(victimId);
      }
    }

    const roundEndNoticeMatch = line.match(ROUND_END_NOTICE_REGEX);
    if (roundEndNoticeMatch) {
      const notice = roundEndNoticeMatch[2];

      if (notice.includes("Bomb_Defused")) {
        roundEndReason = "bomb_defused";
      } else if (notice.includes("Target_Bombed")) {
        roundEndReason = "bomb_exploded";
      }
    }

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

      const aliveCounts = getAliveCounts();
      const effectiveRoundEndReason: RoundScore["roundEndReason"] =
        roundEndReason !== "unknown"
          ? roundEndReason
          : aliveCounts.ct === 0 || aliveCounts.terrorist === 0
            ? "elimination"
            : winner === "CT" && !bombPlantedThisRound
              ? "time_ran_out"
              : "unknown";

      rounds.push({
        round,
        ctScore: pendingCtScore,
        terroristScore: pendingTerroristScore,
        winner,
        ctTeamName,
        terroristTeamName,
        winnerTeamName,
        roundEndReason: effectiveRoundEndReason,
        ctPlayersAlive: aliveCounts.ct,
        terroristPlayersAlive: aliveCounts.terrorist,
      });

      previousCtScore = pendingCtScore;
      previousTerroristScore = pendingTerroristScore;
      pendingCtScore = null;
      pendingTerroristScore = null;
      roundEndReason = "unknown";
      bombPlantedThisRound = false;
    }
  }

  return rounds.sort((a, b) => a.round - b.round);
}

export function getPlayerStats(match: MatchLogSource): PlayerStats[] {
  const players = new Map<string, MutablePlayerStats>();
  const playerTeamCounts = new Map<string, Map<string, number>>();

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

  const addTeamObservation = (playerId: string, teamName: string | null) => {
    if (!teamName) {
      return;
    }

    const counts = playerTeamCounts.get(playerId) ?? new Map<string, number>();
    counts.set(teamName, (counts.get(teamName) ?? 0) + 1);
    playerTeamCounts.set(playerId, counts);
  };

  const handleKillLine = (line: string, round: number) => {
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

    const killerSide = getSide(killerTeam);
    const victimSide = getSide(victimTeam);

    if (killerSide) {
      addTeamObservation(
        killerId,
        getTeamNameForSide(match, round, killerSide),
      );
    }

    if (victimSide) {
      addTeamObservation(
        victimId,
        getTeamNameForSide(match, round, victimSide),
      );
    }

    killer.kills += 1;
    victim.deaths += 1;

    if (extraFlags.includes("headshot")) {
      killer.headshots += 1;
    }
  };

  let currentRound = 1;
  let pendingCtScore: number | null = null;
  let pendingTerroristScore: number | null = null;

  for (const line of match.logLines) {
    handleKillLine(line, currentRound);

    const ctMatch = line.match(CT_SCORE_REGEX);
    if (ctMatch) {
      pendingCtScore = Number(ctMatch[1]);
    }

    const terroristMatch = line.match(T_SCORE_REGEX);
    if (terroristMatch) {
      pendingTerroristScore = Number(terroristMatch[1]);
    }

    if (pendingCtScore !== null && pendingTerroristScore !== null) {
      currentRound += 1;
      pendingCtScore = null;
      pendingTerroristScore = null;
    }
  }

  const playersWithTeams = [...players.values()].map((player) => {
    const teamCounts = playerTeamCounts.get(player.playerId);
    const teamName =
      !teamCounts || teamCounts.size === 0
        ? "Unknown"
        : [...teamCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

    return {
      ...player,
      teamName,
    };
  });

  return playersWithTeams
    .map((player) => ({
      ...player,
      hsPercentage:
        player.kills === 0
          ? 0
          : Number(((player.headshots / player.kills) * 100).toFixed(1)),
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

export function getMatchInsights(match: MatchLogSource): MatchInsights {
  const roundScores = getRoundScores(match);
  const playerStats = getPlayerStats(match);
  const winnerTeamName = getOverallWinnerTeam(roundScores);
  const loserTeamName = getOverallLoserTeam(roundScores);
  const playerStatsByTeam = getPlayerStatsByTeam(
    playerStats,
    winnerTeamName,
    loserTeamName,
  );

  return {
    matchId: match.id,
    roundScores,
    playerStats,
    playerStatsByTeam,
    totalRounds: roundScores.length,
    winnerTeamName,
    loserTeamName,
    winnerScore: getOverallWinnerScore(roundScores),
    loserScore: getOverallLoserScore(roundScores),
  };
}

const getOverallWinnerTeam = (roundScores: RoundScore[]) => {
  const finalRound = roundScores.at(-1);
  if (!finalRound) {
    return null;
  }

  if (finalRound.ctScore > finalRound.terroristScore) {
    return finalRound.ctTeamName ?? null;
  }

  if (finalRound.terroristScore > finalRound.ctScore) {
    return finalRound.terroristTeamName ?? null;
  }

  return null;
};

const getOverallLoserTeam = (roundScores: RoundScore[]) => {
  const finalRound = roundScores.at(-1);
  if (!finalRound) {
    return null;
  }

  if (finalRound.ctScore > finalRound.terroristScore) {
    return finalRound.terroristTeamName ?? null;
  }

  if (finalRound.terroristScore > finalRound.ctScore) {
    return finalRound.ctTeamName ?? null;
  }

  return null;
};

const getOverallWinnerScore = (roundScores: RoundScore[]) => {
  const finalRound = roundScores.at(-1);
  if (!finalRound) {
    return 0;
  }

  return Math.max(finalRound.ctScore, finalRound.terroristScore);
};

const getOverallLoserScore = (roundScores: RoundScore[]) => {
  const finalRound = roundScores.at(-1);
  if (!finalRound) {
    return 0;
  }

  return Math.min(finalRound.ctScore, finalRound.terroristScore);
};

const getPlayerStatsByTeam = (
  playerStats: PlayerStats[],
  winnerTeamName: string | null,
  loserTeamName: string | null,
): TeamPlayerStatsGroup[] => {
  const groupedByTeam = new Map<string, PlayerStats[]>();

  for (const player of playerStats) {
    const teamPlayers = groupedByTeam.get(player.teamName) ?? [];
    teamPlayers.push(player);
    groupedByTeam.set(player.teamName, teamPlayers);
  }

  const orderedTeams = [
    winnerTeamName,
    loserTeamName,
    ...groupedByTeam.keys(),
  ].filter((teamName, index, array): teamName is string => {
    if (!teamName) {
      return false;
    }

    return array.indexOf(teamName) === index;
  });

  return orderedTeams.map((teamName) => ({
    teamName,
    isWinner: teamName === winnerTeamName,
    players: groupedByTeam.get(teamName) ?? [],
  }));
};

export const matchAnalytics = {
  getRoundScores,
  getPlayerStats,
  getTopPlayers,
  getMatchInsights,
};
