import { useQuery } from "@tanstack/react-query";
import type { HealthResponse } from "shared-types";

async function fetchHealth(): Promise<HealthResponse> {
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
  const response = await fetch(`${apiUrl}/health`);

  if (!response.ok) {
    throw new Error("Failed to fetch API health status");
  }

  return response.json() as Promise<HealthResponse>;
}

export function HealthPage() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold">API health</h2>
      {healthQuery.isLoading && (
        <p className="mt-2 text-slate-700">Loading...</p>
      )}
      {healthQuery.isError && (
        <p className="mt-2 text-red-600">Failed to connect to API.</p>
      )}
      {healthQuery.data && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-slate-200">
          {JSON.stringify(healthQuery.data, null, 2)}
        </pre>
      )}
    </section>
  );
}
