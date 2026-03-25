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
  roundEndReason:
    | "bomb_defused"
    | "bomb_exploded"
    | "elimination"
    | "time_ran_out"
    | "unknown";
  ctPlayersAlive: number;
  terroristPlayersAlive: number;
}

export interface PlayerStats {
  playerId: string;
  player: string;
  teamName: string;
  kills: number;
  deaths: number;
  headshots: number;
  hsPercentage: number;
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
  playerStatsByTeam: TeamPlayerStatsGroup[];
  totalRounds: number;
  winnerTeamName: string | null;
  loserTeamName: string | null;
  winnerScore: number;
  loserScore: number;
}

export interface TeamPlayerStatsGroup {
  teamName: string;
  isWinner: boolean;
  players: PlayerStats[];
}

export interface MatchPlayerStatsResponse {
  matchId: string;
  playerStats: PlayerStats[];
}
