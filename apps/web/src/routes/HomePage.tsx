import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useApplicationContext,
  useApplicationDispatchContext,
} from "../contexts/ApplicationContext";
import { fetchCs2Matches, fetchRoundScores } from "../api/queries";
import MatchResultsHeader from "../components/MatchResultsHeader";
import { MatchOverallStats } from "../components/MatchOverallStats";
import { MatchRoundsStats } from "../components/MatchRoundsStats";

type HomeTab = "scoreboard" | "rounds";

export function HomePage() {
  const { selectedMatchId } = useApplicationContext();
  const [activeTab, setActiveTab] = useState<HomeTab>("scoreboard");

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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <MatchResultsHeader />
      {selectedMatchId && (
        <div className="mt-4">
          <div className="mb-3 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("scoreboard")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "scoreboard"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Scoreboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rounds")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "rounds"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rounds
            </button>
          </div>

          {activeTab === "scoreboard" && <MatchOverallStats />}

          {activeTab === "rounds" && <MatchRoundsStats />}
        </div>
      )}

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
    </div>
  );
}
