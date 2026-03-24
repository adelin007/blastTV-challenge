import { AppRoutes } from "./routes/AppRoutes";
import { MainNav } from "./components/MainNav";

export function App() {
  return (
    <main className="container">
      <MainNav />
      <AppRoutes />
    </main>
  );
}
