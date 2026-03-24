import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Cs2MatchesResponse } from "shared-types";

async function fetchCs2Matches(): Promise<Cs2MatchesResponse> {
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
  const response = await fetch(`${apiUrl}/matches`);

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }

  return response.json() as Promise<Cs2MatchesResponse>;
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
                  {selectedMatch.teams.join(" vs ")}
                </span>
              </p>
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
