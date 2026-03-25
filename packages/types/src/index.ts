export interface HealthResponse {
  status: "ok" | "error";
  service: string;
  timestamp: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  name: string;
  players: Player[];
}

export interface Cs2Match {
  id: string;
  name: string;
  map: string;
  teams: Team[];
}

export interface Cs2MatchesResponse {
  matches: Cs2Match[];
}

export interface RoundScore {
  round: number;
  ctScore: number;
  terroristScore: number;
  winner: "CT" | "TERRORIST" | "draw";
  ctTeamName: string | null;
  terroristTeamName: string | null;
  winnerTeamName: string | null;
}

export interface PlayerStats {
  playerId: string;
  player: string;
  kills: number;
  deaths: number;
  headshots: number;
  kdRatio: number;
}

export interface MatchRoundScoresResponse {
  matchId: string;
  roundScores: RoundScore[];
}

export interface MatchInsights {
  matchId: string;
  roundScores: RoundScore[];
  playerStats: PlayerStats[];
  totalRounds: number;
  winnerTeamName: string | null;
  loserTeamName: string | null;
  winnerScore: number;
  loserScore: number;
}

export interface MatchPlayerStatsResponse {
  matchId: string;
  playerStats: PlayerStats[];
}
