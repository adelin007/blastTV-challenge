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
    <section className="card">
      <h2>API health</h2>
      {healthQuery.isLoading && <p>Loading...</p>}
      {healthQuery.isError && <p>Failed to connect to API.</p>}
      {healthQuery.data && (
        <pre>{JSON.stringify(healthQuery.data, null, 2)}</pre>
      )}
    </section>
  );
}
