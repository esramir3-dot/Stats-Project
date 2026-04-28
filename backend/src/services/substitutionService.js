const {
  canonicalizeIngredient,
  ingredientMatches,
  normalizeIngredientList
} = require("./ingredientCatalog");

const IMPORTANCE = {
  ESSENTIAL: "essential",
  HELPFUL: "helpful",
  OPTIONAL: "optional"
};

const SUBSTITUTION_MAP = {
  milk: [
    {
      ingredient: "oat milk",
      note: "Keeps the recipe creamy with a mild oat flavor."
    },
    {
      ingredient: "almond milk",
      note: "Works well in oats, smoothies, cereal, and sauces."
    },
    {
      ingredient: "soy milk",
      note: "Adds protein and keeps a similar texture."
    },
    {
      ingredient: "water",
      note: "Works in oatmeal, ramen, and batters; the result will be less creamy."
    }
  ],
  yogurt: [
    {
      ingredient: "sour cream",
      note: "Keeps the tangy, creamy texture."
    },
    {
      ingredient: "cottage cheese",
      note: "Use as-is or mash for a thicker, protein-rich swap."
    },
    {
      ingredient: "blended tofu",
      note: "Good dairy-free creamy swap when blended smooth."
    },
    {
      ingredient: "greek yogurt",
      note: "Thicker and higher protein than regular yogurt."
    }
  ],
  "greek yogurt": [
    {
      ingredient: "yogurt",
      note: "Slightly thinner, but still creamy and tangy."
    },
    {
      ingredient: "cottage cheese",
      note: "Mash or blend for a high-protein creamy swap."
    },
    {
      ingredient: "blended tofu",
      note: "Good dairy-free substitute with a neutral flavor."
    }
  ],
  rice: [
    {
      ingredient: "pasta",
      note: "Turns the bowl into more of a pasta meal."
    },
    {
      ingredient: "quinoa",
      note: "Adds a nuttier flavor and more protein."
    },
    {
      ingredient: "ramen noodles",
      note: "Faster and softer; reduce added salt if using the seasoning packet."
    },
    {
      ingredient: "couscous",
      note: "Quick kettle-friendly swap with a similar base role."
    }
  ],
  tortilla: [
    {
      ingredient: "bread",
      note: "Use bread instead; it becomes more like a sandwich or toast."
    },
    {
      ingredient: "pita",
      note: "Use pita instead; it holds fillings well."
    },
    {
      ingredient: "lettuce",
      note: "Use lettuce as a lighter wrap; it will be less filling."
    }
  ],
  bread: [
    {
      ingredient: "tortilla",
      note: "Wrap the fillings instead of making toast or a sandwich."
    },
    {
      ingredient: "pita",
      note: "Pita works well for pockets and quick melts."
    },
    {
      ingredient: "rice cakes",
      note: "Use for a crunchy open-face version."
    }
  ],
  pita: [
    {
      ingredient: "tortilla",
      note: "Roll the fillings into a wrap."
    },
    {
      ingredient: "bread",
      note: "Make it as a sandwich or toast."
    }
  ],
  beans: [
    {
      ingredient: "lentils",
      note: "Similar plant protein with a softer texture."
    },
    {
      ingredient: "chickpeas",
      note: "Keeps the meal hearty with a firmer bite."
    },
    {
      ingredient: "tofu",
      note: "Good protein swap, especially for bowls and stir-fries."
    }
  ],
  "black beans": [
    {
      ingredient: "lentils",
      note: "Softer but still filling and budget-friendly."
    },
    {
      ingredient: "chickpeas",
      note: "Milder flavor with a firmer texture."
    },
    {
      ingredient: "tofu",
      note: "Use cubed tofu for protein if beans are not available."
    }
  ],
  egg: [
    {
      ingredient: "tofu",
      note: "Crumble tofu for scrambles or bowls."
    },
    {
      ingredient: "yogurt",
      note: "Works as a binder in some batters, but changes flavor."
    },
    {
      ingredient: "banana",
      note: "Good binder for sweet oats or mug cakes."
    },
    {
      ingredient: "applesauce",
      note: "Good binder for sweet microwave bakes."
    }
  ],
  cheese: [
    {
      ingredient: "nutritional yeast",
      note: "Adds a savory, cheesy flavor without melting."
    },
    {
      ingredient: "hummus",
      note: "Adds creaminess and protein, but the flavor becomes tangier."
    },
    {
      ingredient: "avocado",
      note: "Adds creamy richness instead of a melty texture."
    }
  ],
  "soy sauce": [
    {
      ingredient: "salt",
      note: "Use salt instead; flavor will be simpler."
    },
    {
      ingredient: "teriyaki sauce",
      note: "Use less because it is sweeter than soy sauce."
    },
    {
      ingredient: "coconut aminos",
      note: "Similar salty-sweet flavor and often gluten-free."
    }
  ],
  "peanut butter": [
    {
      ingredient: "sunflower butter",
      note: "Closest nut-free dorm swap with a similar texture."
    },
    {
      ingredient: "almond butter",
      note: "Similar texture with a nuttier flavor."
    },
    {
      ingredient: "tahini",
      note: "Creamy and savory; best in wraps, sauces, and bowls."
    }
  ],
  "frozen vegetables": [
    {
      ingredient: "canned vegetables",
      note: "Drain well; texture will be softer."
    },
    {
      ingredient: "fresh vegetables",
      note: "Chop small so they cook quickly."
    },
    {
      ingredient: "spinach",
      note: "Wilts quickly and works in bowls, noodles, and eggs."
    }
  ],
  vegetables: [
    {
      ingredient: "frozen vegetables",
      note: "Quick microwave-friendly vegetable swap."
    },
    {
      ingredient: "canned vegetables",
      note: "Drain before adding so the meal does not get watery."
    },
    {
      ingredient: "spinach",
      note: "Adds greens with almost no prep."
    }
  ],
  mayo: [
    {
      ingredient: "yogurt",
      note: "Tangier and lighter, but still creamy."
    },
    {
      ingredient: "hummus",
      note: "Adds creaminess and more flavor."
    },
    {
      ingredient: "avocado",
      note: "Creamy swap for wraps and sandwiches."
    }
  ],
  butter: [
    {
      ingredient: "olive oil",
      note: "Works for cooking and savory recipes, but tastes less rich."
    },
    {
      ingredient: "vegetable oil",
      note: "Neutral cooking swap for pans and air fryers."
    },
    {
      ingredient: "coconut oil",
      note: "Good in sweet recipes, with a light coconut flavor."
    }
  ],
  "tomato sauce": [
    {
      ingredient: "salsa",
      note: "Adds more texture and spice."
    },
    {
      ingredient: "canned tomatoes",
      note: "Season with salt or herbs if available."
    }
  ],
  pasta: [
    {
      ingredient: "rice",
      note: "Turns the recipe into a rice bowl."
    },
    {
      ingredient: "ramen noodles",
      note: "Cooks faster and gives a softer noodle texture."
    },
    {
      ingredient: "couscous",
      note: "Good kettle-friendly base."
    }
  ]
};

const OPTIONAL_INGREDIENT_PATTERNS = [
  /\boptional\b/,
  /\bgarnish\b/,
  /\bcilantro\b/,
  /\bparsley\b/,
  /\bscallions?\b/,
  /\bgreen onions?\b/,
  /\bsesame seeds?\b/,
  /\bchili flakes?\b/,
  /\bred pepper flakes?\b/,
  /\bhot sauce\b/,
  /\blime\b/,
  /\blemon\b/,
  /\bpepper\b/,
  /\bcinnamon\b/,
  /\bsprinkles?\b/
];

const HELPFUL_INGREDIENT_PATTERNS = [
  /\bsalt\b/,
  /\bseasoning\b/,
  /\bspices?\b/,
  /\bgarlic powder\b/,
  /\bonion powder\b/,
  /\bcumin\b/,
  /\bpaprika\b/,
  /\bolive oil\b/,
  /\bvegetable oil\b/,
  /\bhoney\b/,
  /\bsyrup\b/
];

function normalizeTerm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ");
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

function ingredientName(ingredient) {
  if (ingredient && typeof ingredient === "object") {
    return String(ingredient.name || ingredient.ingredient || "").trim();
  }

  return String(ingredient || "").trim();
}

function ingredientTokens(value) {
  return normalizeTerm(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function termMatches(candidate, target) {
  const candidateTerm = normalizeTerm(candidate);
  const targetTerm = normalizeTerm(target);
  const candidateCanonical = canonicalizeIngredient(candidateTerm);
  const targetCanonical = canonicalizeIngredient(targetTerm);

  if (!candidateTerm || !targetTerm) {
    return false;
  }

  if (candidateTerm === targetTerm || candidateCanonical === targetCanonical) {
    return true;
  }

  const candidateTokens = new Set(ingredientTokens(candidateTerm));
  const targetTokens = ingredientTokens(targetTerm);

  if (targetTokens.length === 0) {
    return false;
  }

  return targetTokens.every((token) => candidateTokens.has(token));
}

function findPantryItem(pantry, target) {
  return normalizeList(pantry).find(
    (item) => ingredientMatches(item, target) || termMatches(item, target)
  );
}

function getSubstitutionOptions(ingredient) {
  const term = normalizeTerm(ingredient);
  const direct = SUBSTITUTION_MAP[term];

  if (direct) {
    return direct;
  }

  const matchedKey = Object.keys(SUBSTITUTION_MAP).find(
    (key) => termMatches(term, key) || termMatches(key, term)
  );

  return matchedKey ? SUBSTITUTION_MAP[matchedKey] : [];
}

function findPantrySubstitute(ingredient, pantry, dislikedIngredients = []) {
  const disliked = normalizeList(dislikedIngredients).map(normalizeTerm);
  const options = getSubstitutionOptions(ingredient);

  for (const option of options) {
    const pantryItem = findPantryItem(pantry, option.ingredient);
    if (!pantryItem) {
      continue;
    }

    if (disliked.some((item) => termMatches(pantryItem, item))) {
      continue;
    }

    return {
      ingredient: pantryItem,
      note: option.note,
      replaces: ingredientName(ingredient)
    };
  }

  return null;
}

function explicitImportance(recipe, ingredient) {
  const name = ingredientName(ingredient);
  const normalizedName = normalizeTerm(name);

  if (ingredient && typeof ingredient === "object" && ingredient.importance) {
    return normalizeTerm(ingredient.importance);
  }

  const metadata = recipe.ingredient_importance || recipe.ingredientImportance;
  if (metadata && typeof metadata === "object") {
    const direct = metadata[name] || metadata[normalizedName];
    if (direct) {
      return normalizeTerm(direct);
    }
  }

  return "";
}

function inferIngredientImportance(recipe, ingredient) {
  const explicit = explicitImportance(recipe, ingredient);

  if (Object.values(IMPORTANCE).includes(explicit)) {
    return explicit;
  }

  const name = ingredientName(ingredient);

  if (OPTIONAL_INGREDIENT_PATTERNS.some((pattern) => pattern.test(name))) {
    return IMPORTANCE.OPTIONAL;
  }

  if (HELPFUL_INGREDIENT_PATTERNS.some((pattern) => pattern.test(name))) {
    return IMPORTANCE.HELPFUL;
  }

  return IMPORTANCE.ESSENTIAL;
}

function isDislikedIngredient(ingredient, dislikedIngredients = []) {
  const name = ingredientName(ingredient);
  return normalizeList(dislikedIngredients).some((disliked) =>
    termMatches(name, disliked)
  );
}

function analyzeIngredientCoverage(recipe, profile = {}) {
  const availableIngredients = normalizeIngredientList(profile.availableIngredients);
  const dislikedIngredients = normalizeIngredientList(profile.dislikedIngredients);
  const matchedItems = [];
  const rawMissingItems = [];
  const groceryMissingItems = [];
  const substitutions = [];
  const substitutedItems = [];
  const omittableItems = [];
  const dislikedItems = [];

  recipe.ingredients.forEach((rawIngredient) => {
    const ingredient = ingredientName(rawIngredient);
    const importance = inferIngredientImportance(recipe, rawIngredient);
    const directMatch = findPantryItem(availableIngredients, ingredient);
    const disliked = isDislikedIngredient(ingredient, dislikedIngredients);

    if (directMatch && !disliked) {
      matchedItems.push(ingredient);
      return;
    }

    if (!directMatch) {
      rawMissingItems.push(ingredient);
    }

    if (disliked) {
      dislikedItems.push(ingredient);
    }

    const substitute = findPantrySubstitute(
      ingredient,
      availableIngredients,
      dislikedIngredients
    );
    const canOmit = importance === IMPORTANCE.OPTIONAL;

    if (substitute) {
      substitutedItems.push(ingredient);
      substitutions.push({
        ingredient,
        importance,
        status: disliked ? "disliked_substituted" : "substituted",
        label: "Use what you have",
        substitute: substitute.ingredient,
        countsAsGrocery: false,
        isDisliked: disliked,
        note: `Use ${substitute.ingredient} instead of ${ingredient}. ${substitute.note}`
      });
      return;
    }

    if (canOmit) {
      omittableItems.push(ingredient);
      substitutions.push({
        ingredient,
        importance,
        status: disliked ? "disliked_omittable" : "omittable",
        label: "Can omit",
        countsAsGrocery: false,
        isDisliked: disliked,
        note: `${ingredient} is optional here, so you can leave it out.`
      });
      return;
    }

    if (!directMatch || disliked) {
      groceryMissingItems.push(ingredient);
      substitutions.push({
        ingredient,
        importance,
        status: disliked ? "disliked_need_substitute" : "need_to_buy",
        label: "Need to buy",
        countsAsGrocery: true,
        isDisliked: disliked,
        note: disliked
          ? `${ingredient} is marked as disliked and no pantry substitute was found.`
          : `${ingredient} is ${importance} for this recipe and no pantry substitute was found.`
      });
    }
  });

  return {
    matchedItems,
    rawMissingItems,
    groceryMissingItems,
    substitutions,
    substitutedItems,
    omittableItems,
    dislikedItems,
    totalIngredients: recipe.ingredients.length,
    effectiveCoveredCount:
      matchedItems.length + substitutedItems.length + omittableItems.length,
    dislikedUnresolvedCount: substitutions.filter(
      (item) => item.isDisliked && item.countsAsGrocery
    ).length
  };
}

module.exports = {
  IMPORTANCE,
  SUBSTITUTION_MAP,
  analyzeIngredientCoverage,
  findPantrySubstitute,
  getSubstitutionOptions,
  inferIngredientImportance,
  ingredientName,
  normalizeList,
  normalizeTerm,
  termMatches
};
