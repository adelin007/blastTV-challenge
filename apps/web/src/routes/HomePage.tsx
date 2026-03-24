import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  Cs2MatchesResponse,
  MatchPlayerStatsResponse,
  MatchRoundScoresResponse,
} from "shared-types";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function fetchCs2Matches(): Promise<Cs2MatchesResponse> {
  const response = await fetch(`${apiUrl}/matches`);

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }

  return response.json() as Promise<Cs2MatchesResponse>;
}

async function fetchRoundScores(
  matchId: string,
): Promise<MatchRoundScoresResponse> {
  const response = await fetch(`${apiUrl}/matches/${matchId}/round-scores`);

  if (!response.ok) {
    throw new Error("Failed to fetch round scores");
  }

  return response.json() as Promise<MatchRoundScoresResponse>;
}

async function fetchPlayerStats(
  matchId: string,
): Promise<MatchPlayerStatsResponse> {
  const response = await fetch(`${apiUrl}/matches/${matchId}/player-stats`);

  if (!response.ok) {
    throw new Error("Failed to fetch player stats");
  }

  return response.json() as Promise<MatchPlayerStatsResponse>;
}

export function HomePage() {
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");

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
      <h2 className="text-xl font-semibold">Home</h2>
      <p className="mt-2 text-slate-700">Client-side routing is enabled.</p>
      <p className="mt-1 text-slate-700">
        Choose a CS2 match from the API-backed dropdown.
      </p>

      {matchesQuery.isLoading && (
        <p className="mt-4 text-slate-700">Loading matches...</p>
      )}

      {matchesQuery.isError && (
        <p className="mt-4 text-red-600">Failed to load matches.</p>
      )}

      {matchesQuery.data && (
        <div className="mt-4">
          <label
            htmlFor="cs2-match"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            CS2 match
          </label>
          <select
            id="cs2-match"
            value={selectedMatchId}
            onChange={(event) => setSelectedMatchId(event.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select a match</option>
            {matchesQuery.data.matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.name}
              </option>
            ))}
          </select>

          {selectedMatch && (
            <div>
              <p className="mt-2 text-sm text-slate-600">
                Selected match:{" "}
                <span className="font-mono">{selectedMatch.name}</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Map: <span className="font-mono">{selectedMatch.map}</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Teams:{" "}
                <span className="font-mono">
                  {selectedMatch.teams.map((team) => team.name).join(" vs ")}
                </span>
              </p>
              <div className="mt-2 space-y-2">
                {selectedMatch.teams.map((team) => (
                  <div
                    key={team.name}
                    className="rounded border border-slate-200 bg-slate-50 p-2"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      {team.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Players:{" "}
                      {team.players.map((player) => player.name).join(", ") ||
                        "unknown"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Round scores
                  </h3>
                  {roundScoresQuery.isLoading && (
                    <p className="mt-2 text-sm text-slate-600">Loading...</p>
                  )}
                  {roundScoresQuery.isError && (
                    <p className="mt-2 text-sm text-red-600">
                      Failed to load round scores.
                    </p>
                  )}
                  {roundScoresQuery.data && (
                    <>
                      <p className="mt-2 text-sm text-slate-700">
                        Rounds parsed:{" "}
                        {roundScoresQuery.data.roundScores.length}
                      </p>
                      {latestRound && (
                        <>
                          <p className="mt-1 text-sm text-slate-700">
                            Final score: {finalScoreLabel}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            End winner team:{" "}
                            <span className="font-medium">
                              {endWinnerTeam ?? "Draw"}
                            </span>
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>

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
              </div>
            </div>
          )}

          {!selectedMatch && selectedMatchId && (
            <div className="mt-4 rounded-md bg-yellow-50 p-3">
              <p className="text-sm text-yellow-700">
                Match with id{" "}
                <span className="font-mono">{selectedMatchId}</span> not found.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
