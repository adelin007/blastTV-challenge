import { NavLink } from "react-router-dom";

export function MainNav() {
  return (
    <nav className="nav">
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/health">Health</NavLink>
    </nav>
  );
}
