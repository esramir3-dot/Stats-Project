import { ClipboardList, Home, NotebookPen, Utensils } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="top-nav">
      <NavLink className="nav-brand" to="/">
        <span className="brand-mark-frame">
          <img
            alt="DormEats logo"
            className="brand-logo-mark"
            src="/dormeats-mark.png"
          />
        </span>
        <span>DormEats</span>
      </NavLink>

      <nav aria-label="Main navigation">
        <NavLink to="/">
          <Home size={18} />
          Home
        </NavLink>
        <NavLink to="/preferences">
          <ClipboardList size={18} />
          Preferences
        </NavLink>
        <NavLink to="/my-recipes">
          <NotebookPen size={18} />
          My Recipes
        </NavLink>
        <NavLink to="/recommendations">
          <Utensils size={18} />
          Recommendations
        </NavLink>
      </nav>
    </header>
  );
}
