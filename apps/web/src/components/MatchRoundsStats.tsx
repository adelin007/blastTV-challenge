import { useQuery } from "@tanstack/react-query";
import { fetchRoundScores } from "../api/queries";
import { useApplicationContext } from "../contexts/ApplicationContext";

export const MatchRoundsStats = () => {
  const { selectedMatchId } = useApplicationContext();
  const roundScoresQuery = useQuery({
    queryKey: ["round-scores", selectedMatchId],
    queryFn: () => fetchRoundScores(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-900">Rounds</h3>

      {roundScoresQuery.isLoading && (
        <p className="mt-2 text-sm text-slate-600">Loading rounds...</p>
      )}

      {roundScoresQuery.isError && (
        <p className="mt-2 text-sm text-red-600">
          Failed to load round scores.
        </p>
      )}

      {roundScoresQuery.data && (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Round</th>
                <th className="px-3 py-2 text-left font-medium">Winner</th>
                <th className="px-3 py-2 text-right font-medium">CT</th>
                <th className="px-3 py-2 text-right font-medium">T</th>
              </tr>
            </thead>
            <tbody>
              {roundScoresQuery.data.roundScores.map((round) => (
                <tr
                  key={round.round}
                  className="border-t border-slate-200 bg-white"
                >
                  <td className="px-3 py-2 text-slate-800">{round.round}</td>
                  <td className="px-3 py-2 text-slate-800">
                    {round.winnerTeamName ?? "Draw"}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">
                    {round.ctScore}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">
                    {round.terroristScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
