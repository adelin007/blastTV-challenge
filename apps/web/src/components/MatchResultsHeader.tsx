import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import {
  fetchCs2Matches,
  fetchMatchInsights,
  fetchRoundScores,
} from "../api/queries";
import {
  useApplicationContext,
  useApplicationDispatchContext,
} from "../contexts/ApplicationContext";

const MatchResultsHeader = () => {
  const { selectedMatchId } = useApplicationContext();
  const { setSelectedMatchId } = useApplicationDispatchContext();

  const {
    data: matchesData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["cs2-matches"],
    queryFn: fetchCs2Matches,
  });

  const { data: matchInsights } = useQuery({
    queryKey: ["match-insights", selectedMatchId],
    queryFn: () => fetchMatchInsights(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });

  const selectedMatch = matchesData?.matches.find(
    (match) => match.id === selectedMatchId,
  );

  return (
    <div className="mb-4 rounded-xl bg-cover bg-center bg-no-repeat p-4">
      {isLoading && <p className="mt-4 text-slate-700">Loading matches...</p>}

      {isError && <p className="mt-4 text-red-600">Failed to load matches.</p>}

      {matchesData?.matches && (
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
            {matchesData.matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMatch && (
        <div
          className="rounded-lg"
          style={{
            backgroundImage:
              'linear-gradient(rgba(248, 250, 252, 0.59), rgba(248, 250, 252, 0.78)), url("https://static.csstats.gg/images/maps/screenshots/cs2/de_nuke_1_png.jpg")',
          }}
        >
          {/* <p className="mt-2 text-sm text-slate-600">
            <span className="font-mono">{selectedMatch.name}</span>
          </p> */}
          <p className="mt-2 ml-2 text-sm text-slate-600">
            Map: <span className="font-mono">{selectedMatch.map}</span>
          </p>
          {/* <p className="mt-2 text-sm text-slate-600">
            Teams:{" "}
            <span className="font-mono">
              {selectedMatch.teams.map((team) => team.name).join(" vs ")}
            </span>
          </p> */}

          {matchInsights && (
            <div
              className="mt-4 rounded-lg p-3 flex"
              // style={{
              //   backgroundImage:
              //     'linear-gradient(rgba(248, 250, 252, 0.59), rgba(248, 250, 252, 0.68)), url("https://static.csstats.gg/images/maps/screenshots/cs2/de_nuke_1_png.jpg")',
              // }}
            >
              <div className="flex-1 justify-items-center content-center">
                <p className="text-sm text-slate-700">
                  <span className="font-mono text-green-700 text-2xl">
                    {matchInsights?.winnerTeamName ?? "Draw"}
                  </span>
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center gap-10">
                <div className="flex flex-col items-center">
                  <Trophy className="h-6 w-6 text-green-700" />
                  <span className="mt-1 text-4xl font-bold text-green-700">
                    {matchInsights.winnerScore}
                  </span>
                </div>

                <div className="flex flex-col items-center pt-7">
                  <span className="text-4xl font-bold text-red-700">
                    {matchInsights.loserScore}
                  </span>
                </div>
              </div>
              <div className="flex-1 justify-items-center content-center">
                <p className="text-sm text-slate-700">
                  <span className="font-mono text-red-700 text-2xl">
                    {matchInsights?.loserTeamName ?? "Draw"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* <div className="mt-2 space-y-2">
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
          </div> */}
        </div>
      )}
    </div>
  );
};

export default MatchResultsHeader;
