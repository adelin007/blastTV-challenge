import { useQuery } from "@tanstack/react-query";
import { fetchMatchInsights } from "../api/queries";
import { useApplicationContext } from "../contexts/ApplicationContext";

export const MatchOverallStats = () => {
  const { selectedMatchId } = useApplicationContext();

  const {
    data: matchInsights,
    isLoading: isMatchInsightsLoading,
    isError: isMatchInsightsError,
  } = useQuery({
    queryKey: ["match-insights", selectedMatchId],
    queryFn: () => fetchMatchInsights(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-900">Player stats</h3>
      {isMatchInsightsLoading && (
        <p className="mt-2 text-sm text-slate-600">Loading...</p>
      )}
      {isMatchInsightsError && (
        <p className="mt-2 text-sm text-red-600">
          Failed to load match insights.
        </p>
      )}
      {matchInsights && (
        <>
          <div className="mt-3 space-y-4">
            {matchInsights.playerStatsByTeam.map((teamGroup) => {
              const { teamName, isWinner, players } = teamGroup;

              return (
                <section
                  key={teamName}
                  className="overflow-hidden rounded-md border border-slate-200 bg-white"
                >
                  <div
                    className={`px-3 py-2 text-sm font-semibold ${
                      isWinner
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {teamName}
                    {isWinner && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Winner
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">
                            Player
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            K
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            D
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            HS%
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            K/D
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player) => (
                          <tr
                            key={player.playerId}
                            className="border-t border-slate-100"
                          >
                            <td className="px-3 py-2 text-slate-800">
                              {player.player}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700">
                              {player.kills}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700">
                              {player.deaths}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700">
                              {player.hsPercentage}%
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700">
                              {player.kdRatio}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
