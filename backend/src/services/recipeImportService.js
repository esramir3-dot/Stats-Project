const { addImportedRecipes, getRecipes } = require("./dataStore");
const { badRequest } = require("../utils/httpError");
const { canonicalizeIngredient } = require("./ingredientCatalog");

const CSV_FIELDS = [
  "name",
  "dietary_tags",
  "ingredients",
  "equipment",
  "time_minutes",
  "estimated_cost",
  "instructions",
  "notes"
];

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return String(item.name || item.ingredient || "").trim();
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeImportance(value) {
  const allowed = new Set(["essential", "helpful", "optional"]);
  const normalized = String(value || "").trim().toLowerCase();
  return allowed.has(normalized) ? normalized : "";
}

function normalizeIngredientImportance(rawRecipe) {
  const ingredientImportance = {};

  if (Array.isArray(rawRecipe.ingredients)) {
    rawRecipe.ingredients.forEach((item) => {
      if (!item || typeof item !== "object") {
        return;
      }

      const name = String(item.name || item.ingredient || "").trim();
      const importance = normalizeImportance(item.importance);
      if (name && importance) {
        ingredientImportance[name] = importance;
      }
    });
  }

  const rawMap =
    rawRecipe.ingredient_importance || rawRecipe.ingredientImportance || {};
  if (rawMap && typeof rawMap === "object" && !Array.isArray(rawMap)) {
    Object.entries(rawMap).forEach(([name, importance]) => {
      const normalizedImportance = normalizeImportance(importance);
      if (String(name).trim() && normalizedImportance) {
        ingredientImportance[String(name).trim()] = normalizedImportance;
      }
    });
  }

  return ingredientImportance;
}

function parseNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value.replace(/[$,]/g, "").trim());
  }

  return Number.NaN;
}

function validateRecipe(rawRecipe, index = 0) {
  const label = `Recipe ${index + 1}`;
  const errors = [];
  const name = String(rawRecipe.name || "").trim();
  const dietaryTags = normalizeList(rawRecipe.dietary_tags ?? rawRecipe.dietaryTags);
  const ingredients = normalizeList(rawRecipe.ingredients).map(canonicalizeIngredient);
  const ingredientImportance = normalizeIngredientImportance(rawRecipe);
  const equipment = normalizeList(rawRecipe.equipment);
  const instructions = normalizeList(rawRecipe.instructions);
  const timeMinutes = parseNumber(rawRecipe.time_minutes ?? rawRecipe.timeMinutes);
  const estimatedCost = parseNumber(rawRecipe.estimated_cost ?? rawRecipe.estimatedCost);
  const notes = rawRecipe.notes ? String(rawRecipe.notes).trim() : undefined;

  if (!name) {
    errors.push(`${label}: name is required.`);
  }
  if (dietaryTags.length === 0) {
    errors.push(`${label}: dietary_tags must include at least one tag.`);
  }
  if (ingredients.length === 0) {
    errors.push(`${label}: ingredients must include at least one item.`);
  }
  if (equipment.length === 0) {
    errors.push(`${label}: equipment must include at least one item, such as none.`);
  }
  if (instructions.length === 0) {
    errors.push(`${label}: instructions must include at least one step.`);
  }
  if (!Number.isFinite(timeMinutes) || timeMinutes <= 0 || timeMinutes > 120) {
    errors.push(`${label}: time_minutes must be between 1 and 120.`);
  }
  if (!Number.isFinite(estimatedCost) || estimatedCost < 0 || estimatedCost > 40) {
    errors.push(`${label}: estimated_cost must be between 0 and 40.`);
  }

  return {
    errors,
    recipe: {
      name,
      dietary_tags: dietaryTags,
      ingredients,
      equipment,
      time_minutes: timeMinutes,
      estimated_cost: estimatedCost,
      instructions,
      source: "user",
      ...(Object.keys(ingredientImportance).length > 0
        ? { ingredient_importance: ingredientImportance }
        : {}),
      ...(notes ? { notes } : {})
    }
  };
}

function parseCsv(csvText) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === "\"" && inQuotes && nextChar === "\"") {
      field += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field.trim());
      field = "";
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function parseCsvRecipes(csvText) {
  const rows = parseCsv(String(csvText || ""));
  if (rows.length < 2) {
    throw badRequest("CSV recipe import requires a header row and at least one recipe.");
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const missingFields = CSV_FIELDS.filter(
    (field) => field !== "notes" && !headers.includes(field)
  );

  if (missingFields.length > 0) {
    throw badRequest("CSV recipe import is missing required columns.", missingFields);
  }

  return rows.slice(1).map((row) =>
    headers.reduce((recipe, header, index) => {
      recipe[header] = row[index] || "";
      return recipe;
    }, {})
  );
}

function recipesFromPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.recipes)) {
    return payload.recipes;
  }

  if (payload.csvText || payload.csv) {
    return parseCsvRecipes(payload.csvText || payload.csv);
  }

  throw badRequest(
    "Recipe import requires a recipes array or csvText string.",
    ["Accepted JSON shape: { recipes: [...] }", "Accepted CSV shape: { csvText: \"...\" }"]
  );
}

function validateRecipeImport(payload) {
  const rawRecipes = recipesFromPayload(payload || {});
  if (rawRecipes.length === 0) {
    throw badRequest("Recipe import must include at least one recipe.");
  }

  const seedNames = new Set(getRecipes().map((recipe) => recipe.name.toLowerCase()));
  const seenNames = new Set();
  const errors = [];
  const recipes = [];

  rawRecipes.forEach((rawRecipe, index) => {
    const result = validateRecipe(rawRecipe, index);
    const nameKey = result.recipe.name.toLowerCase();

    if (nameKey && seedNames.has(nameKey)) {
      result.errors.push(`Recipe ${index + 1}: "${result.recipe.name}" already exists.`);
    }
    if (nameKey && seenNames.has(nameKey)) {
      result.errors.push(`Recipe ${index + 1}: "${result.recipe.name}" is duplicated in this import.`);
    }

    seenNames.add(nameKey);
    errors.push(...result.errors);
    recipes.push(result.recipe);
  });

  if (errors.length > 0) {
    throw badRequest("Invalid recipe import.", errors);
  }

  return recipes;
}

function validateSingleRecipe(payload) {
  const result = validateRecipe(payload || {}, 0);
  const nameKey = result.recipe.name.toLowerCase();
  const existingNames = new Set(getRecipes().map((recipe) => recipe.name.toLowerCase()));

  if (nameKey && existingNames.has(nameKey)) {
    result.errors.push(`Recipe 1: "${result.recipe.name}" already exists.`);
  }

  if (result.errors.length > 0) {
    throw badRequest("Invalid recipe.", result.errors);
  }

  return result.recipe;
}

function createRecipe(payload) {
  const recipe = validateSingleRecipe(payload);
  addImportedRecipes([recipe]);

  return {
    recipe
  };
}

function importRecipes(payload) {
  const recipes = validateRecipeImport(payload);
  addImportedRecipes(recipes);

  return {
    importedCount: recipes.length,
    recipes
  };
}

module.exports = {
  CSV_FIELDS,
  createRecipe,
  importRecipes,
  parseCsvRecipes,
  validateRecipe,
  validateRecipeImport,
  validateSingleRecipe
};
