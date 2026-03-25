import {
  Cs2MatchesResponse,
  MatchInsights,
  MatchPlayerStatsResponse,
  MatchRoundScoresResponse,
} from "shared-types";
import { apiUrl } from "../constants/general";

export async function fetchCs2Matches(): Promise<Cs2MatchesResponse> {
  const response = await fetch(`${apiUrl}/matches`);

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }

  return response.json() as Promise<Cs2MatchesResponse>;
}

export async function fetchRoundScores(
  matchId: string,
): Promise<MatchRoundScoresResponse> {
  const response = await fetch(`${apiUrl}/matches/${matchId}/round-scores`);

  if (!response.ok) {
    throw new Error("Failed to fetch round scores");
  }

  return response.json() as Promise<MatchRoundScoresResponse>;
}

export async function fetchMatchInsights(
  matchId: string,
): Promise<MatchInsights> {
  const response = await fetch(`${apiUrl}/matches/${matchId}/insights`);

  if (!response.ok) {
    throw new Error("Failed to fetch match insights");
  }

  return response.json() as Promise<MatchInsights>;
}
