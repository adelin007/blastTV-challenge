import { useQuery } from "@tanstack/react-query";
import { Skull, Bomb, Clock, CircleQuestionMark } from "lucide-react";
import { UserRound } from "lucide-react";
import { fetchMatchInsights, fetchRoundScores } from "../api/queries";
import { useApplicationContext } from "../contexts/ApplicationContext";
import { RoundScore } from "shared-types";
import { DEFAULT_PLAYERS_PER_TEAM } from "../constants/general";

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

  const { data: matchInsights } = useQuery({
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
                      <RoundPlayersItem
                        overallWinnerTeam={overallWinnerTeam}
                        roundItem={roundItem}
                        overallOutcome="winning"
                      />
                      <div className="flex items-center justify-center content-center">
                        <RoundScoreItem
                          overallWinnerTeam={overallWinnerTeam}
                          roundItem={roundItem}
                          overallOutcome="winning"
                        />
                        <div className="flex w-[100px] rounded-full items-center justify-center border border-slate-200 bg-white px-3 py-2 text-sm text-green-700">
                          <RoundEndReasonIcon
                            roundEndReason={roundItem.roundEndReason}
                          />
                        </div>
                        <RoundScoreItem
                          overallWinnerTeam={overallWinnerTeam}
                          roundItem={roundItem}
                          overallOutcome="losing"
                        />
                      </div>

                      <RoundPlayersItem
                        overallWinnerTeam={overallWinnerTeam}
                        roundItem={roundItem}
                        overallOutcome="losing"
                      />
                    </div>
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
      className={`flex w-12 h-12 items-center justify-center border border-slate-200 rounded ${
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

interface RoundPlayersItemProps {
  roundItem: Pick<
    RoundScore,
    | "ctScore"
    | "terroristScore"
    | "ctTeamName"
    | "winnerTeamName"
    | "winner"
    | "ctPlayersAlive"
    | "terroristPlayersAlive"
  >;
  overallWinnerTeam: string | null | undefined;
  overallOutcome: "winning" | "losing";
}
const RoundPlayersItem = ({
  roundItem,
  overallWinnerTeam,
  overallOutcome,
}: RoundPlayersItemProps) => {
  const isRoundWinnerOverallWinner =
    roundItem.winnerTeamName === overallWinnerTeam;

  const isRoundWinnerCT = roundItem.winner === "CT";

  const getPlayersAlive = () => {
    if (overallOutcome === "winning") {
      if (isRoundWinnerOverallWinner) {
        return isRoundWinnerCT
          ? roundItem.ctPlayersAlive
          : roundItem.terroristPlayersAlive;
      } else {
        return !isRoundWinnerCT
          ? roundItem.ctPlayersAlive
          : roundItem.terroristPlayersAlive;
      }
    } else {
      if (isRoundWinnerOverallWinner) {
        return !isRoundWinnerCT
          ? roundItem.ctPlayersAlive
          : roundItem.terroristPlayersAlive;
      } else {
        return isRoundWinnerCT
          ? roundItem.ctPlayersAlive
          : roundItem.terroristPlayersAlive;
      }
    }
  };

  const playersAlive = getPlayersAlive();

  return (
    <div
      className={`flex items-center ${overallOutcome === "winning" ? "mr-4" : "ml-4"}`}
    >
      {Array.from({ length: DEFAULT_PLAYERS_PER_TEAM }).map((_, index) => {
        if (index < playersAlive) {
          return <UserRound key={index} className={`h-6 w-6 text-green-700`} />;
        } else {
          return <UserRound key={index} className={`h-6 w-6 text-gray-300`} />;
        }
      })}
    </div>
  );
};

export const RoundEndReasonIcon = ({
  roundEndReason,
}: {
  roundEndReason: RoundScore["roundEndReason"];
}) => {
  switch (roundEndReason) {
    case "bomb_defused":
      return (
        <div className="flex flex-col items-center">
          <Bomb className="h-6 w-6 text-gray-300" />
          <span className="text-xs text-gray-500 text-center">
            Bomb defused
          </span>
        </div>
      );
    case "bomb_exploded":
      return (
        <div className="flex flex-col items-center">
          <Bomb className="h-6 w-6 text-gray-300" />
          <span className="text-xs text-gray-500 text-center">
            Bomb exploded
          </span>
        </div>
      );
    case "elimination":
      return (
        <div className="flex flex-col items-center">
          <Skull className="h-6 w-6 text-gray-300" />
          <span className="text-xs text-gray-500">Elimination</span>
        </div>
      );
    case "time_ran_out":
      return (
        <div className="flex flex-col items-center">
          <Clock className="h-6 w-6 text-gray-300" />
          <span className="text-xs text-gray-500 text-center">
            Time ran out
          </span>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center">
          <CircleQuestionMark className="h-6 w-6 text-gray-300" />
          <span className="text-xs text-gray-500">Unknown</span>
        </div>
      );
  }
};
