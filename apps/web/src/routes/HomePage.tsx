export function HomePage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold">Home</h2>
      <p className="mt-2 text-slate-700">Client-side routing is enabled.</p>
      <p className="mt-1 text-slate-700">
        Open the health page to fetch API status with TanStack Query.
      </p>
    </section>
  );
}
