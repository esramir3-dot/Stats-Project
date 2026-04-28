import { Clock, DollarSign, Refrigerator, Salad } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage({ recipeCount, restaurantCount, scenarioCount }) {
  return (
    <section className="home-layout">
      <div className="hero-band">
        <div className="hero-copy">
          <div className="hero-brand-lockup">
            <span className="hero-brand-mark">
              <img
                alt="DormEats logo"
                className="hero-brand-mark-image"
                src="/dormeats-mark.png"
              />
            </span>
            <span className="hero-phase-label">DormEats Phase 3</span>
          </div>
          <h1>Dorm-friendly meals for tight weeks and tiny kitchens.</h1>
          <p>
            DormEats ranks recipes against dietary needs, pantry ingredients,
            equipment, time, and budget, then keeps a local restaurant backup ready.
          </p>
          <Link className="primary-button as-link" to="/preferences">
            Build my meal plan
          </Link>
        </div>
        <div className="hero-logo-panel">
          <img
            alt="DormEats logo"
            className="hero-logo"
            src="/dormeats-logo.png"
          />
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <Salad size={22} />
          <span>Seeded recipes</span>
          <strong>{recipeCount}</strong>
        </article>
        <article className="metric-card">
          <Refrigerator size={22} />
          <span>Preset profiles</span>
          <strong>{scenarioCount}</strong>
        </article>
        <article className="metric-card">
          <Clock size={22} />
          <span>Fastest meal</span>
          <strong>5 min</strong>
        </article>
        <article className="metric-card">
          <DollarSign size={22} />
          <span>Fallback spots</span>
          <strong>{restaurantCount}</strong>
        </article>
      </div>
    </section>
  );
}
