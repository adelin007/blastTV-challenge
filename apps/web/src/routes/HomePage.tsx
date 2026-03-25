import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  Cs2MatchesResponse,
  MatchPlayerStatsResponse,
  MatchRoundScoresResponse,
} from "shared-types";
import {
  useApplicationContext,
  useApplicationDispatchContext,
} from "../contexts/ApplicationContext";
import {
  fetchCs2Matches,
  fetchPlayerStats,
  fetchRoundScores,
} from "../api/queries";
import MatchResultsHeader from "../components/MatchResultsHeader";
import { MatchOverallStats } from "../components/MatchOverallStats";

export function HomePage() {
  const { selectedMatchId } = useApplicationContext();
  const { setSelectedMatchId } = useApplicationDispatchContext();

  const matchesQuery = useQuery({
    queryKey: ["cs2-matches"],
    queryFn: fetchCs2Matches,
  });

  const selectedMatch = matchesQuery.data?.matches.find(
    (match) => match.id === selectedMatchId,
  );

  const roundScoresQuery = useQuery({
    queryKey: ["round-scores", selectedMatchId],
    queryFn: () => fetchRoundScores(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });

  const playerStatsQuery = useQuery({
    queryKey: ["player-stats", selectedMatchId],
    queryFn: () => fetchPlayerStats(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });

  const latestRound = roundScoresQuery.data?.roundScores.at(-1);
  const topPlayers = playerStatsQuery.data?.playerStats ?? [];
  const finalScoreLabel = latestRound
    ? `${latestRound.ctTeamName ?? "CT"} ${latestRound.ctScore} - ${latestRound.terroristScore} ${latestRound.terroristTeamName ?? "T"}`
    : null;
  const endWinnerTeam = latestRound?.winnerTeamName ?? null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <MatchResultsHeader />
      {selectedMatchId && <MatchOverallStats />}

      <div>
        {selectedMatch && (
          <div>
            {/* <div className="mt-4 grid gap-4 lg:grid-cols-2">
                

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Top players
                  </h3>
                  {playerStatsQuery.isLoading && (
                    <p className="mt-2 text-sm text-slate-600">Loading...</p>
                  )}
                  {playerStatsQuery.isError && (
                    <p className="mt-2 text-sm text-red-600">
                      Failed to load player stats.
                    </p>
                  )}
                  {playerStatsQuery.data && (
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {topPlayers.map((player) => (
                        <li
                          key={player.playerId}
                          className="flex items-center justify-between rounded bg-white px-2 py-1"
                        >
                          <span className="font-medium">{player.player}</span>
                          <span className="text-slate-500">
                            {player.kills}/{player.deaths} (HS:{" "}
                            {player.headshots}, K/D: {player.kdRatio})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div> */}
          </div>
        )}

        {!selectedMatch && selectedMatchId && (
          <div className="mt-4 rounded-md bg-yellow-50 p-3">
            <p className="text-sm text-yellow-700">
              Match with id <span className="font-mono">{selectedMatchId}</span>{" "}
              not found.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
