import {
  CheckCircle2,
  Clock,
  DollarSign,
  Heart,
  ListChecks,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Utensils
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FAVORITES_KEY = "dormeats-favorite-meals";
const READINESS_SORT_RANK = {
  ready: 0,
  almost: 1,
  needs_groceries: 2,
  backup: 3
};

function Tags({ items, tone = "neutral" }) {
  return (
    <div className="tag-row">
      {items.map((item) => (
        <span className={`tag ${tone}`} key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

const SECTIONS = [
  {
    key: "ready",
    title: "Ready to make",
    matches: (item) => fallbackReadiness(item).key === "ready"
  },
  {
    key: "almost",
    title: "Almost there",
    matches: (item) => fallbackReadiness(item).key === "almost"
  },
  {
    key: "needs",
    title: "Needs groceries / backup ideas",
    matches: (item) =>
      ["needs_groceries", "backup"].includes(fallbackReadiness(item).key)
  }
];

function fallbackReadiness(item) {
  if (item.readiness) {
    return {
      ...item.readiness,
      sortRank:
        item.readiness.sortRank ?? READINESS_SORT_RANK[item.readiness.key] ?? 99
    };
  }

  if (item.matchedIngredients.length === 0) {
    return { key: "backup", label: "Backup idea", sortRank: 3 };
  }

  if (item.missingItems.length === 0) {
    return { key: "ready", label: "Ready to make", sortRank: 0 };
  }

  if (item.missingItems.length <= 2) {
    return { key: "almost", label: "Almost there", sortRank: 1 };
  }

  return { key: "needs_groceries", label: "Needs groceries", sortRank: 2 };
}

function fitDetails(item) {
  const breakdown = item.scoreBreakdown || {};
  const totalIngredients =
    breakdown.totalIngredientCount ||
    breakdown.matchedCount + breakdown.missingCount ||
    item.recipe.ingredients?.length ||
    0;
  const matchedCount = breakdown.matchedCount ?? item.matchedIngredients.length;
  const effectiveMatchedCount = breakdown.effectiveMatchedCount ?? matchedCount;
  const missingCount = breakdown.missingCount ?? item.missingItems.length;
  const hasCoverageHelp =
    (breakdown.substitutedCount || 0) > 0 || (breakdown.omittableCount || 0) > 0;
  const timeFits =
    breakdown.timeFits ?? (breakdown.timeFit !== undefined ? breakdown.timeFit > 0 : true);
  const budgetFits =
    breakdown.budgetFits ?? (breakdown.budgetFit !== undefined ? breakdown.budgetFit > 0 : true);

  return [
    {
      label: "Ingredient match",
      value: hasCoverageHelp
        ? `${effectiveMatchedCount}/${totalIngredients} (${matchedCount} direct)`
        : `${matchedCount}/${totalIngredients}`
    },
    {
      label: "Missing items",
      value: String(missingCount)
    },
    {
      label: "Dietary match",
      value: breakdown.dietaryMatch === false ? "No" : "Yes"
    },
    {
      label: "Equipment match",
      value: breakdown.equipmentMatch === false ? "No" : "Yes"
    },
    {
      label: "Time fit",
      value: timeFits ? "Yes" : "No"
    },
    {
      label: "Budget fit",
      value: budgetFits ? "Yes" : "No"
    },
    {
      label: "Substitutions",
      value: String(breakdown.substitutedCount || 0)
    },
    {
      label: "Optional omissions",
      value: String(breakdown.omittableCount || 0)
    },
    {
      label: "Disliked items",
      value: String(breakdown.dislikedIngredientCount || 0)
    }
  ];
}

function isGroceryTripIdea(item) {
  return item.missingItems.length > 2 || item.matchedIngredients.length === 0;
}

function sortForDisplay(items) {
  return [...items].sort((a, b) => {
    const readinessA = fallbackReadiness(a).sortRank ?? 99;
    const readinessB = fallbackReadiness(b).sortRank ?? 99;
    const overlapA = a.scoreBreakdown?.ingredientOverlap ?? 0;
    const overlapB = b.scoreBreakdown?.ingredientOverlap ?? 0;
    const directOverlapA = a.scoreBreakdown?.directIngredientOverlap ?? overlapA;
    const directOverlapB = b.scoreBreakdown?.directIngredientOverlap ?? overlapB;
    const timeFitA = a.scoreBreakdown?.timeFit ?? 0;
    const timeFitB = b.scoreBreakdown?.timeFit ?? 0;
    const budgetFitA = a.scoreBreakdown?.budgetFit ?? 0;
    const budgetFitB = b.scoreBreakdown?.budgetFit ?? 0;

    if (readinessA !== readinessB) {
      return readinessA - readinessB;
    }
    if (a.missingItems.length !== b.missingItems.length) {
      return a.missingItems.length - b.missingItems.length;
    }
    if (overlapA !== overlapB) {
      return overlapB - overlapA;
    }
    if (directOverlapA !== directOverlapB) {
      return directOverlapB - directOverlapA;
    }
    if (timeFitA !== timeFitB) {
      return timeFitB - timeFitA;
    }
    if (budgetFitA !== budgetFitB) {
      return budgetFitB - budgetFitA;
    }
    return b.score - a.score;
  });
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
  } catch (_error) {
    return {};
  }
}

function substitutionTone(item) {
  if (item.label === "Use what you have") {
    return "use";
  }
  if (item.label === "Can omit") {
    return "omit";
  }
  return "buy";
}

function RecommendationCard({
  item,
  isFavorite,
  onMarkIngredientAvailable,
  onToggleFavorite,
  refreshLoading
}) {
  const readiness = fallbackReadiness(item);

  return (
    <article className="meal-card">
      <div className="meal-card-header">
        <span className="rank-badge">#{item.rank}</span>
        <div>
          <div className="badge-row">
            <span className={`readiness-badge ${readiness.key}`}>
              {readiness.label}
            </span>
            {item.recipe.source === "user" && (
              <span className="custom-recipe-badge">Custom recipe</span>
            )}
          </div>
          <h2>{item.recipe.name}</h2>
          <Tags items={item.recipe.dietary_tags} tone="fresh" />
        </div>
        <button
          className={isFavorite ? "favorite-button active" : "favorite-button"}
          onClick={() => onToggleFavorite(item)}
          title={isFavorite ? "Remove from saved meals" : "Save meal"}
          type="button"
        >
          <Heart fill={isFavorite ? "currentColor" : "none"} size={18} />
        </button>
      </div>

      <div className="meal-metrics">
        <span>
          <Clock size={17} />
          {item.recipe.time_minutes} min
        </span>
        <span>
          <DollarSign size={17} />
          {item.recipe.estimated_cost.toFixed(2)}
        </span>
        <span>
          <ListChecks size={17} />
          score {item.score}
        </span>
      </div>

      <div className="detail-block">
        <h3>Equipment</h3>
        <Tags items={item.recipe.equipment} />
      </div>

      <div className="detail-block">
        <h3>Matched ingredients</h3>
        {item.matchedIngredients.length ? (
          <Tags items={item.matchedIngredients} tone="fresh" />
        ) : (
          <p className="quiet-copy">No pantry matches yet.</p>
        )}
      </div>

      <div className="detail-block">
        <h3>Missing grocery items</h3>
        {item.missingItems.length ? (
          <div className="missing-chip-list">
            {item.missingItems.map((ingredient) => (
              <span className="missing-chip" key={ingredient}>
                {ingredient}
                {onMarkIngredientAvailable && (
                  <button
                    aria-label={`I have ${ingredient}`}
                    disabled={refreshLoading}
                    onClick={() => onMarkIngredientAvailable(ingredient)}
                    type="button"
                  >
                    <Plus size={14} />
                    I have this
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="ready-line">
            <CheckCircle2 size={17} />
            Ready with what you have.
          </p>
        )}
      </div>

      {item.substitutions?.length > 0 && (
        <div className="detail-block substitution-block">
          <h3>Substitutions</h3>
          <div className="substitution-list">
            {item.substitutions.map((substitution) => (
              <div
                className={`substitution-card ${substitutionTone(substitution)}`}
                key={`${substitution.ingredient}-${substitution.status}`}
              >
                <div>
                  <span className="substitution-label">
                    {substitution.label}
                  </span>
                  <strong>{substitution.ingredient}</strong>
                  {substitution.substitute && (
                    <small>Use {substitution.substitute} instead</small>
                  )}
                  {substitution.isDisliked && (
                    <small>Marked as disliked</small>
                  )}
                </div>
                <p>{substitution.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="score-note">{item.explanation}</p>

      <div className="detail-block">
        <h3>Why this ranked here</h3>
        <dl className="rank-factor-grid">
          {fitDetails(item).map((detail) => (
            <div key={detail.label}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="detail-block">
        <h3>Steps</h3>
        <ol className="steps-list">
          {item.recipe.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </article>
  );
}

export default function RecommendationResults({
  onAddIngredient,
  refreshLoading = false,
  result
}) {
  const [strictFilters, setStrictFilters] = useState({
    makeNowOnly: false,
    missingTwoOnly: false,
    includeGroceryTrip: true
  });
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const filteredRecommendations = useMemo(() => {
    if (!result) {
      return [];
    }

    return sortForDisplay(
      result.recommendations.filter((item) => {
        if (strictFilters.makeNowOnly && item.missingItems.length !== 0) {
          return false;
        }

        if (
          strictFilters.missingTwoOnly &&
          (item.matchedIngredients.length === 0 || item.missingItems.length > 2)
        ) {
          return false;
        }

        if (!strictFilters.includeGroceryTrip && isGroceryTripIdea(item)) {
          return false;
        }

        return true;
      })
    );
  }, [result, strictFilters]);

  const groceryList = useMemo(() => {
    const groceries = new Map();

    filteredRecommendations.forEach((item) => {
      item.missingItems.forEach((ingredient) => {
        const current = groceries.get(ingredient) || {
          ingredient,
          count: 0,
          recipes: []
        };
        current.count += 1;
        current.recipes.push(item.recipe.name);
        groceries.set(ingredient, current);
      });
    });

    return [...groceries.values()].sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.ingredient.localeCompare(b.ingredient);
    });
  }, [filteredRecommendations]);

  function toggleFavorite(item) {
    setFavorites((current) => {
      const next = { ...current };
      if (next[item.recipe.name]) {
        delete next[item.recipe.name];
        return next;
      }

      next[item.recipe.name] = {
        name: item.recipe.name,
        timeMinutes: item.recipe.time_minutes,
        estimatedCost: item.recipe.estimated_cost,
        readiness: fallbackReadiness(item).label,
        dietaryTags: item.recipe.dietary_tags
      };
      return next;
    });
  }

  function updateStrictFilter(name) {
    setStrictFilters((current) => ({
      ...current,
      [name]: !current[name]
    }));
  }

  if (!result) {
    return (
      <section className="empty-panel">
        <Utensils size={32} />
        <h2>No recommendations yet</h2>
        <p>Set a dorm profile to see pantry-first DormEats recommendations.</p>
      </section>
    );
  }

  return (
    <section className="recommendation-results">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Meal plan</p>
          <h1>{result.profile.name}</h1>
        </div>
        <div className="profile-summary">
          <span>{result.profile.dietaryNeed}</span>
          <span>{result.profile.timeMinutes} min</span>
          <span>${result.profile.budget.toFixed(2)}</span>
        </div>
      </div>

      <section className="result-tools">
        <div className="strict-filter-panel">
          <h2>Strict filters</h2>
          <div className="strict-toggle-list">
            <label className="strict-toggle">
              <input
                checked={strictFilters.makeNowOnly}
                onChange={() => updateStrictFilter("makeNowOnly")}
                type="checkbox"
              />
              Only show meals I can make now
            </label>
            <label className="strict-toggle">
              <input
                checked={strictFilters.missingTwoOnly}
                onChange={() => updateStrictFilter("missingTwoOnly")}
                type="checkbox"
              />
              Only show meals missing 2 or fewer items
            </label>
            <label className="strict-toggle">
              <input
                checked={strictFilters.includeGroceryTrip}
                onChange={() => updateStrictFilter("includeGroceryTrip")}
                type="checkbox"
              />
              Include grocery-trip ideas
            </label>
          </div>
        </div>

        <div className="saved-meals-panel">
          <h2>Saved meals</h2>
          {Object.keys(favorites).length === 0 ? (
            <p className="quiet-copy">Save meals with the heart button.</p>
          ) : (
            <div className="saved-meal-list">
              {Object.values(favorites).map((favorite) => (
                <span className="saved-meal" key={favorite.name}>
                  {favorite.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {filteredRecommendations.length === 0 ? (
        <section className="empty-panel">
          <ShoppingBasket size={32} />
          <h2>No meals match this filter</h2>
          <p>Try a wider filter or add more ingredients from a receipt.</p>
        </section>
      ) : (
        <div className="sectioned-meals">
          {SECTIONS.map((section) => {
            const sectionItems = filteredRecommendations.filter(section.matches);
            if (sectionItems.length === 0) {
              return null;
            }

            return (
              <section className="recommendation-section" key={section.key}>
                <h2>{section.title}</h2>
                <div className="meal-grid">
                  {sectionItems.map((item) => (
                    <RecommendationCard
                      isFavorite={Boolean(favorites[item.recipe.name])}
                      item={item}
                      key={item.recipe.name}
                      onMarkIngredientAvailable={onAddIngredient}
                      onToggleFavorite={toggleFavorite}
                      refreshLoading={refreshLoading}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <section className="grocery-list-panel">
        <div>
          <p className="eyebrow">Shopping</p>
          <h2>
            <ShoppingCart size={20} />
            Combined grocery list
          </h2>
        </div>
        {groceryList.length === 0 ? (
          <p className="ready-line">
            <CheckCircle2 size={17} />
            No groceries needed for the current filter.
          </p>
        ) : (
          <div className="grocery-chip-list">
            {groceryList.map((item) => (
              <span className="grocery-chip" key={item.ingredient}>
                {item.ingredient}
                <small>{item.count} meal{item.count === 1 ? "" : "s"}</small>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="fallback-panel">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Fallback</p>
            <h2>Nearby-style restaurant options</h2>
          </div>
        </div>
        <div className="restaurant-grid">
          {result.restaurants.map((restaurant) => (
            <article className="restaurant-card" key={restaurant.name}>
              <h3>{restaurant.name}</h3>
              <p>
                {restaurant.distance_miles} miles · price level{" "}
                {restaurant.price_level}
              </p>
              <Tags items={restaurant.dietary_tags} tone="fresh" />
              {restaurant.fallbackReason && (
                <p className="score-note">{restaurant.fallbackReason}</p>
              )}
              <p className="quiet-copy">{restaurant.top_items.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="safety-note">
        <ShieldCheck size={18} />
        <p>
          Dietary and allergy guidance is based on recipe tags and fallback tags.
          Verify ingredient labels, restaurant details, and cross-contact risks before eating.
        </p>
      </section>
    </section>
  );
}
