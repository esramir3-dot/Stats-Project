const { getRecipes, getRestaurants } = require("./dataStore");
const {
  canonicalizeIngredient,
  ingredientMatches,
  normalizeIngredientList
} = require("./ingredientCatalog");
const {
  analyzeIngredientCoverage,
  ingredientName
} = require("./substitutionService");

const SCORE_WEIGHTS = {
  ingredientOverlap: 0.8,
  timeFit: 0.08,
  budgetFit: 0.08,
  readiness: 0.04
};

const READINESS = {
  READY: {
    key: "ready",
    label: "Ready to make",
    sortRank: 0
  },
  ALMOST: {
    key: "almost",
    label: "Almost there",
    sortRank: 1
  },
  NEEDS_GROCERIES: {
    key: "needs_groceries",
    label: "Needs groceries",
    sortRank: 2
  },
  BACKUP: {
    key: "backup",
    label: "Backup idea",
    sortRank: 3
  }
};

function normalizeTerm(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeList(values) {
  if (Array.isArray(values)) {
    return values
      .flatMap((value) => String(value).split(","))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (typeof values === "string") {
    return values
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
}

function isOpenDietaryNeed(dietaryNeed) {
  return [
    "no restriction",
    "no restrictions",
    "none",
    "no preference",
    "low-cost/no preference"
  ].includes(normalizeTerm(dietaryNeed));
}

function dietaryMatch(recipe, dietaryNeed) {
  if (isOpenDietaryNeed(dietaryNeed)) {
    return true;
  }

  const desired = normalizeTerm(dietaryNeed);
  return recipe.dietary_tags.some((tag) => normalizeTerm(tag) === desired);
}

function equipmentMatch(recipe, availableEquipment) {
  const available = new Set(normalizeList(availableEquipment).map(normalizeTerm));
  available.add("none");

  return recipe.equipment.every((item) => available.has(normalizeTerm(item)));
}

function ingredientOverlap(recipe, availableIngredients) {
  const available = normalizeIngredientList(availableIngredients);
  const ingredients = recipe.ingredients.map((ingredient) =>
    canonicalizeIngredient(ingredientName(ingredient))
  );
  const matchedCount = ingredients.filter((ingredient) =>
    available.some((availableIngredient) =>
      ingredientMatches(availableIngredient, ingredient)
    )
  ).length;

  return matchedCount / Math.max(ingredients.length, 1);
}

function matchedIngredients(recipe, availableIngredients) {
  const available = normalizeIngredientList(availableIngredients);
  return recipe.ingredients
    .map(ingredientName)
    .filter((ingredient) =>
      available.some((availableIngredient) =>
        ingredientMatches(availableIngredient, ingredient)
      )
    );
}

function missingIngredients(recipe, availableIngredients) {
  const available = normalizeIngredientList(availableIngredients);
  return recipe.ingredients
    .map(ingredientName)
    .filter(
      (ingredient) =>
        !available.some((availableIngredient) =>
          ingredientMatches(availableIngredient, ingredient)
        )
    );
}

function round(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function readinessFor({ matchedCount, missingCount }) {
  if (matchedCount === 0) {
    return READINESS.BACKUP;
  }

  if (missingCount === 0) {
    return READINESS.READY;
  }

  if (missingCount <= 2) {
    return READINESS.ALMOST;
  }

  return READINESS.NEEDS_GROCERIES;
}

function scoreRecipe(recipe, profile) {
  const coverage = analyzeIngredientCoverage(recipe, profile);
  const matchedItems = coverage.matchedItems;
  const missingItems = coverage.groceryMissingItems;
  const overlap = coverage.effectiveCoveredCount / Math.max(recipe.ingredients.length, 1);
  const directOverlap = matchedItems.length / Math.max(recipe.ingredients.length, 1);
  const timeScore = Math.max(
    0,
    1 - recipe.time_minutes / Math.max(Number(profile.timeMinutes) || 1, 1)
  );
  const budgetScore =
    recipe.estimated_cost <= Number(profile.budget || 0) ? 1.0 : -0.5;
  const readiness = readinessFor({
    matchedCount: matchedItems.length,
    missingCount: missingItems.length
  });
  const readinessScore = [1, 0.65, 0.25, -0.7][readiness.sortRank];
  const missingPenalty = Math.min(missingItems.length * 0.08, 0.4);
  const rawMissingPenalty = Math.min(
    Math.max(coverage.rawMissingItems.length - missingItems.length, 0) * 0.02,
    0.08
  );
  const dislikedPenalty = Math.min(coverage.dislikedUnresolvedCount * 0.25, 0.5);
  const zeroMatchPenalty = coverage.effectiveCoveredCount === 0 ? 0.35 : 0;
  const score =
    overlap ** 2 * SCORE_WEIGHTS.ingredientOverlap +
    timeScore * SCORE_WEIGHTS.timeFit +
    budgetScore * SCORE_WEIGHTS.budgetFit +
    readinessScore * SCORE_WEIGHTS.readiness -
    missingPenalty -
    rawMissingPenalty -
    dislikedPenalty -
    zeroMatchPenalty;

  return {
    score: round(clamp(score)),
    breakdown: {
      ingredientOverlap: round(overlap),
      directIngredientOverlap: round(directOverlap),
      matchedCount: matchedItems.length,
      missingCount: missingItems.length,
      rawMissingCount: coverage.rawMissingItems.length,
      effectiveMatchedCount: coverage.effectiveCoveredCount,
      substitutedCount: coverage.substitutedItems.length,
      omittableCount: coverage.omittableItems.length,
      dislikedIngredientCount: coverage.dislikedItems.length,
      unresolvedDislikedCount: coverage.dislikedUnresolvedCount,
      totalIngredientCount: coverage.totalIngredients,
      timeFit: round(timeScore),
      budgetFit: budgetScore,
      readiness: readiness.key,
      readinessLabel: readiness.label,
      weights: SCORE_WEIGHTS
    },
    readiness
  };
}

function formatList(items) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function explainRecommendation(recipe, scoreDetails, matchedItems, missingItems, profile) {
  const totalIngredients =
    scoreDetails.breakdown.totalIngredientCount || recipe.ingredients.length;
  const matchedCount = matchedItems.length;
  const missingCount = missingItems.length;
  const effectiveMatchedCount =
    scoreDetails.breakdown.effectiveMatchedCount ?? matchedCount;
  const substitutionCount = scoreDetails.breakdown.substitutedCount || 0;
  const omittableCount = scoreDetails.breakdown.omittableCount || 0;
  const dislikedCount = scoreDetails.breakdown.dislikedIngredientCount || 0;
  const readiness = scoreDetails.readiness.key;
  const timeFits = recipe.time_minutes <= profile.timeMinutes;
  const budgetFits = recipe.estimated_cost <= profile.budget;
  const timeText = `${recipe.time_minutes} minutes`;
  const fitDetails = [
    `Ingredient match: ${effectiveMatchedCount} of ${totalIngredients}`,
    `Missing items: ${missingCount}`,
    "Dietary match: yes",
    "Equipment match: yes",
    `Time fit: ${timeFits ? "yes" : "no"} (${recipe.time_minutes}/${profile.timeMinutes} min)`,
    `Budget fit: ${budgetFits ? "yes" : "no"} (${formatMoney(recipe.estimated_cost)}/${formatMoney(profile.budget)})`
  ].join("; ");

  let readinessText;

  if (readiness === READINESS.READY.key) {
    if (substitutionCount > 0 || omittableCount > 0) {
      const coverageParts = [];
      if (substitutionCount > 0) {
        coverageParts.push(`${substitutionCount} pantry substitution${substitutionCount === 1 ? "" : "s"}`);
      }
      if (omittableCount > 0) {
        coverageParts.push(`${omittableCount} optional omission${omittableCount === 1 ? "" : "s"}`);
      }
      readinessText = `You can make this with what you have using ${formatList(coverageParts)}. It takes ${timeText}.`;
    } else {
      readinessText = `You already have all required ingredients. It takes ${timeText}.`;
    }
  } else if (readiness === READINESS.ALMOST.key) {
    readinessText = `You have ${effectiveMatchedCount} of ${totalIngredients} ingredients covered and only need ${formatList(missingItems)}.`;
  } else if (readiness === READINESS.BACKUP.key) {
    readinessText = `Backup idea: it matches your dietary and equipment filters, but you do not currently have the main ingredients.`;
  } else {
    readinessText = `You have ${effectiveMatchedCount} of ${totalIngredients} ingredients covered, but still need ${missingCount} grocery items: ${formatList(missingItems)}.`;
  }

  if (dislikedCount > 0) {
    readinessText += ` It also checks ${dislikedCount} disliked ingredient${dislikedCount === 1 ? "" : "s"} for swaps or omissions.`;
  }

  return `${readinessText} Ranked here because ${fitDetails}.`;
}

function normalizeProfile(input = {}) {
  const dietaryNeed = input.dietaryNeed || input.dietary_need || "";
  const availableIngredients =
    input.availableIngredients || input.available_ingredients || input.ingredients || [];
  const availableEquipment =
    input.availableEquipment || input.available_equipment || input.equipment || [];
  const timeMinutes =
    input.timeMinutes || input.time_minutes || input.timeLimit || input.time_limit;
  const budget = input.budget;
  const dislikedIngredients =
    input.dislikedIngredients || input.disliked_ingredients || input.dislikes || [];

  return {
    name: input.name || "DormEats user",
    dietaryNeed: String(dietaryNeed).trim(),
    availableIngredients: normalizeIngredientList(availableIngredients),
    availableEquipment: normalizeList(availableEquipment),
    dislikedIngredients: normalizeList(dislikedIngredients),
    timeMinutes: Number(timeMinutes),
    budget: Number(budget),
    location: input.location || "",
    preference: input.preference || ""
  };
}

function validateProfile(profile) {
  const errors = [];

  if (!profile.dietaryNeed) {
    errors.push("dietaryNeed is required.");
  }
  if (!Number.isFinite(profile.timeMinutes) || profile.timeMinutes <= 0) {
    errors.push("timeMinutes must be a positive number.");
  }
  if (!Number.isFinite(profile.budget) || profile.budget < 0) {
    errors.push("budget must be a non-negative number.");
  }

  return errors;
}

function recommendMeals(profileInput, options = {}) {
  const profile = normalizeProfile(profileInput);
  const topK = Number(options.topK || profileInput.topK || 6);
  const candidates = getRecipes()
    .filter((recipe) => dietaryMatch(recipe, profile.dietaryNeed))
    .filter((recipe) => equipmentMatch(recipe, profile.availableEquipment))
    .map((recipe) => {
      const scoreDetails = scoreRecipe(recipe, profile);
      const coverage = analyzeIngredientCoverage(recipe, profile);
      const missingItems = coverage.groceryMissingItems;
      const matchedItems = coverage.matchedItems;

      return {
        recipe,
        score: scoreDetails.score,
        scoreBreakdown: {
          ...scoreDetails.breakdown,
          dietaryMatch: true,
          equipmentMatch: true,
          timeFits: recipe.time_minutes <= profile.timeMinutes,
          budgetFits: recipe.estimated_cost <= profile.budget,
          timeLimit: profile.timeMinutes,
          budgetLimit: profile.budget
        },
        readiness: {
          key: scoreDetails.readiness.key,
          label: scoreDetails.readiness.label,
          sortRank: scoreDetails.readiness.sortRank
        },
        matchedIngredients: matchedItems,
        missingItems,
        rawMissingItems: coverage.rawMissingItems,
        substitutions: coverage.substitutions,
        substitutedItems: coverage.substitutedItems,
        omittableItems: coverage.omittableItems,
        dislikedIngredients: coverage.dislikedItems,
        explanation: explainRecommendation(
          recipe,
          scoreDetails,
          matchedItems,
          missingItems,
          profile
        )
      };
    })
    .sort((a, b) => {
      if (a.readiness.sortRank !== b.readiness.sortRank) {
        return a.readiness.sortRank - b.readiness.sortRank;
      }
      if (a.missingItems.length !== b.missingItems.length) {
        return a.missingItems.length - b.missingItems.length;
      }
      if (
        a.scoreBreakdown.unresolvedDislikedCount !==
        b.scoreBreakdown.unresolvedDislikedCount
      ) {
        return (
          a.scoreBreakdown.unresolvedDislikedCount -
          b.scoreBreakdown.unresolvedDislikedCount
        );
      }
      if (
        a.scoreBreakdown.ingredientOverlap !== b.scoreBreakdown.ingredientOverlap
      ) {
        return (
          b.scoreBreakdown.ingredientOverlap - a.scoreBreakdown.ingredientOverlap
        );
      }
      if (
        a.scoreBreakdown.directIngredientOverlap !==
        b.scoreBreakdown.directIngredientOverlap
      ) {
        return (
          b.scoreBreakdown.directIngredientOverlap -
          a.scoreBreakdown.directIngredientOverlap
        );
      }
      if (a.scoreBreakdown.timeFit !== b.scoreBreakdown.timeFit) {
        return b.scoreBreakdown.timeFit - a.scoreBreakdown.timeFit;
      }
      if (a.scoreBreakdown.budgetFit !== b.scoreBreakdown.budgetFit) {
        return b.scoreBreakdown.budgetFit - a.scoreBreakdown.budgetFit;
      }
      return b.score - a.score;
    })
    .slice(0, topK)
    .map((item, index) => ({
      rank: index + 1,
      ...item
    }));

  return {
    profile,
    recommendations: candidates
  };
}

function recommendRestaurants(profileInput, options = {}) {
  const profile = normalizeProfile(profileInput);
  const topK = Number(options.restaurantTopK || profileInput.restaurantTopK || 2);
  const priceLimit = profile.budget <= 5 ? 1 : profile.budget <= 12 ? 2 : 3;
  const openDietaryNeed = isOpenDietaryNeed(profile.dietaryNeed);

  const ranked = getRestaurants()
    .map((restaurant) => {
      const dietaryMatchScore = openDietaryNeed
        ? 0.7
        : restaurant.dietary_tags.some(
            (tag) => normalizeTerm(tag) === normalizeTerm(profile.dietaryNeed)
          )
        ? 1
        : 0;
      const budgetFit = restaurant.price_level <= priceLimit ? 1 : 0;
      const distanceFit = Math.max(0, 1 - restaurant.distance_miles / 2);
      const score = dietaryMatchScore * 0.6 + budgetFit * 0.3 + distanceFit * 0.1;
      const dietaryReason = openDietaryNeed
        ? "Works for no restriction searches"
        : `Matches ${profile.dietaryNeed}`;
      const budgetReason =
        budgetFit === 1
          ? `fits a ${formatMoney(profile.budget)} budget`
          : `may stretch a ${formatMoney(profile.budget)} budget`;

      return {
        ...restaurant,
        fallbackScore: round(score),
        budgetFit,
        dietaryMatch: dietaryMatchScore > 0,
        fallbackReason: `${dietaryReason}, ${budgetReason}, and is ${restaurant.distance_miles} miles away.`
      };
    })
    .filter((restaurant) => openDietaryNeed || restaurant.dietaryMatch);

  return ranked
    .sort((a, b) => {
      if (a.budgetFit !== b.budgetFit) {
        return b.budgetFit - a.budgetFit;
      }
      if (a.fallbackScore !== b.fallbackScore) {
        return b.fallbackScore - a.fallbackScore;
      }
      if (a.price_level !== b.price_level) {
        return a.price_level - b.price_level;
      }
      return a.distance_miles - b.distance_miles;
    })
    .slice(0, topK);
}

function buildRecommendationResponse(profileInput, options = {}) {
  const profile = normalizeProfile(profileInput);
  const errors = validateProfile(profile);

  if (errors.length > 0) {
    const error = new Error("Invalid recommendation request.");
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  const { recommendations } = recommendMeals(profile, options);
  return {
    profile,
    recommendations,
    restaurants: recommendRestaurants(profile, options)
  };
}

module.exports = {
  buildRecommendationResponse,
  dietaryMatch,
  equipmentMatch,
  formatList,
  ingredientOverlap,
  isOpenDietaryNeed,
  matchedIngredients,
  missingIngredients,
  normalizeProfile,
  recommendMeals,
  recommendRestaurants,
  readinessFor,
  scoreRecipe
};
