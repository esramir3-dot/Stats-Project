import { useNavigate } from "react-router-dom";
import PreferenceForm from "../components/PreferenceForm.jsx";

export default function PreferencesPage({
  scenarios,
  ingredientCatalog = [],
  onSubmit,
  loading,
  error
}) {
  const navigate = useNavigate();

  async function handleSubmit(profile) {
    await onSubmit(profile);
    navigate("/recommendations");
  }

  return (
    <section className="page-layout">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1>Build a dorm meal profile</h1>
        </div>
      </div>

      <section className="content-panel">
        {error && <p className="form-error">{error}</p>}
        <PreferenceForm
          ingredientCatalog={ingredientCatalog}
          loading={loading}
          onSubmit={handleSubmit}
          scenarios={scenarios}
        />
      </section>
    </section>
  );
}
