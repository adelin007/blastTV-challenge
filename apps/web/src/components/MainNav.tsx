import { NavLink } from "react-router-dom";

const baseLinkClass =
  "rounded-full border px-3 py-1.5 text-sm transition-colors";

function getLinkClass(isActive: boolean) {
  return `${baseLinkClass} ${
    isActive
      ? "border-blue-300 bg-blue-50 text-blue-700"
      : "border-slate-300 text-slate-700 hover:bg-slate-100"
  }`;
}

export function MainNav() {
  return (
    <nav className="mb-4 flex gap-3">
      <NavLink to="/" end className={({ isActive }) => getLinkClass(isActive)}>
        Home
      </NavLink>
      <NavLink
        to="/health"
        className={({ isActive }) => getLinkClass(isActive)}
      >
        Health
      </NavLink>
    </nav>
  );
}
