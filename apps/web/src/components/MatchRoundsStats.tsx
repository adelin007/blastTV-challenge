import { useQuery } from "@tanstack/react-query";
import { Skull } from "lucide-react";
import { UserRound } from "lucide-react";
import { fetchMatchInsights, fetchRoundScores } from "../api/queries";
import { useApplicationContext } from "../contexts/ApplicationContext";
import { RoundScore } from "shared-types";

export const MatchRoundsStats = () => {
  const { selectedMatchId } = useApplicationContext();
  const {
    data: roundScoresData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["round-scores", selectedMatchId],
    queryFn: () => fetchRoundScores(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });

  const {
    data: matchInsights,
    isLoading: isMatchInsightsLoading,
    isError: isMatchInsightsError,
  } = useQuery({
    queryKey: ["match-insights", selectedMatchId],
    queryFn: () => fetchMatchInsights(selectedMatchId),
    enabled: Boolean(selectedMatchId),
  });

  const overallWinnerTeam = matchInsights?.winnerTeamName;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-900">Rounds</h3>

      {isLoading && (
        <p className="mt-2 text-sm text-slate-600">Loading rounds...</p>
      )}

      {isError && (
        <p className="mt-2 text-sm text-red-600">
          Failed to load round scores.
        </p>
      )}
      {roundScoresData && (
        <div className="mt-3 overflow-x-auto">
          {roundScoresData.roundScores.map((roundItem) => {
            return (
              <div>
                <div
                  key={roundItem.round}
                  className="flex flex-col items-center px-3 py-2"
                >
                  <div className="flex text-center">
                    Round {roundItem.round}
                  </div>
                  <div className="flex">
                    <div className="flex">
                      <div className="flex items-center mr-4">
                        <UserRound className="h-6 w-6 text-gray-300" />
                        <UserRound className="h-6 w-6 text-gray-300" />
                        <UserRound className="h-6 w-6 text-gray-300" />
                        <UserRound className="h-6 w-6 text-green-700" />
                        <UserRound className="h-6 w-6 text-green-700" />
                      </div>
                      <div className="flex">
                        <RoundScoreItem
                          overallWinnerTeam={overallWinnerTeam}
                          roundItem={roundItem}
                          overallOutcome="winning"
                        />
                        <div className="flex flex-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-green-700">
                          <Skull className="h-10 w-10 text-gray-300" />
                        </div>
                        <RoundScoreItem
                          overallWinnerTeam={overallWinnerTeam}
                          roundItem={roundItem}
                          overallOutcome="losing"
                        />
                      </div>

                      <div className="flex items-center ml-4">
                        <UserRound className="h-6 w-6 text-gray-300" />
                        <UserRound className="h-6 w-6 text-gray-300" />
                        <UserRound className="h-6 w-6 text-gray-300" />
                        <UserRound className="h-6 w-6 text-gray-300" />
                        <UserRound className="h-6 w-6 text-green-700" />
                      </div>
                    </div>

                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface RoundScoreItemProps {
  roundItem: Pick<
    RoundScore,
    "ctScore" | "terroristScore" | "ctTeamName" | "winnerTeamName" | "winner"
  >;
  overallWinnerTeam: string | null | undefined;
  overallOutcome: "winning" | "losing";
}
const RoundScoreItem = ({
  roundItem,
  overallWinnerTeam,
  overallOutcome,
}: RoundScoreItemProps) => {
  const isRoundWinnerOverallWinner =
    roundItem.winnerTeamName === overallWinnerTeam;

  const isRoundWinnerCT = roundItem.winner === "CT";

  const getScore = () => {
    if (overallOutcome === "winning") {
      if (isRoundWinnerOverallWinner) {
        return isRoundWinnerCT ? roundItem.ctScore : roundItem.terroristScore;
      } else {
        return !isRoundWinnerCT ? roundItem.ctScore : roundItem.terroristScore;
      }
    } else {
      if (isRoundWinnerOverallWinner) {
        return !isRoundWinnerCT ? roundItem.ctScore : roundItem.terroristScore;
      } else {
        return isRoundWinnerCT ? roundItem.ctScore : roundItem.terroristScore;
      }
    }
  };

  const getWinnerTeamRoundRole = () => {
    if (overallOutcome === "winning") {
      if (isRoundWinnerOverallWinner) {
        return isRoundWinnerCT ? "CT" : "TERRORIST";
      } else {
        return !isRoundWinnerCT ? "CT" : "TERRORIST";
      }
    } else {
      if (isRoundWinnerOverallWinner) {
        return !isRoundWinnerCT ? "CT" : "TERRORIST";
      } else {
        return isRoundWinnerCT ? "CT" : "TERRORIST";
      }
    }
  };

  const score = getScore();
  const winnerTeamRoundRole = getWinnerTeamRoundRole();

  return (
    <div
      className={`flex w-12 items-center justify-center border border-slate-200 rounded ${
        overallOutcome === "winning" ? "mr-2" : "ml-2"
      }`}
      style={
        winnerTeamRoundRole === "CT"
          ? {
              backgroundColor: "#4A90E2",
              borderColor: "#4A90E2",
            }
          : {
              backgroundColor: "#F5A623",
              borderColor: "#F5A623",
            }
      }
    >
      <p className="">{score}</p>
    </div>
  );
};
