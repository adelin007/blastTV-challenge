import { useQuery } from "@tanstack/react-query";
import { fetchRoundScores } from "../api/queries";
import {
  useApplicationContext,
  useApplicationDispatchContext,
} from "../contexts/ApplicationContext";

export const MatchOverallStats = () => {
  const { selectedMatchId } = useApplicationContext();
  const { setSelectedMatchId } = useApplicationDispatchContext();

  const roundScoresQuery = useQuery({
    queryKey: ["round-scores", selectedMatchId],
    queryFn: () => fetchRoundScores(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });

  const latestRound = roundScoresQuery.data?.roundScores.at(-1);
  const finalScoreLabel = latestRound
    ? `${latestRound.ctTeamName ?? "CT"} ${latestRound.ctScore} - ${latestRound.terroristScore} ${latestRound.terroristTeamName ?? "T"}`
    : null;
  const endWinnerTeam = latestRound?.winnerTeamName ?? null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-900">Round scores</h3>
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
            Rounds parsed: {roundScoresQuery.data.roundScores.length}
          </p>
          {latestRound && (
            <>
              <p className="mt-1 text-sm text-slate-700">
                Final score: {finalScoreLabel}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                End winner team:{" "}
                <span className="font-medium">{endWinnerTeam ?? "Draw"}</span>
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};
