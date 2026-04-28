import { Link } from "react-router-dom";
import RecommendationResults from "../components/RecommendationResults.jsx";

export default function RecommendationsPage({ loading, onAddIngredient, result }) {
  return (
    <section className="page-layout">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h1>Ranked dorm meals</h1>
        </div>
        <Link className="secondary-button" to="/preferences">
          Adjust profile
        </Link>
      </div>

      <RecommendationResults
        onAddIngredient={onAddIngredient}
        refreshLoading={loading}
        result={result}
      />
    </section>
  );
}
