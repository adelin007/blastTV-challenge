import { AppRoutes } from "./routes/AppRoutes";
import { MainNav } from "./components/MainNav";

export function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <MainNav />
        <AppRoutes />
      </div>
    </main>
  );
}
