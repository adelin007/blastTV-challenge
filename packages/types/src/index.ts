export interface HealthResponse {
  status: "ok" | "error";
  service: string;
  timestamp: string;
}

export interface Cs2Match {
  id: string;
  name: string;
}

export interface Cs2MatchesResponse {
  matches: Cs2Match[];
}
