const { getRecipes, getRestaurants, getScenarios } = require("../services/dataStore");
const {
  getIngredientCatalog,
  searchIngredientCatalog
} = require("../services/ingredientCatalog");
const { buildRecommendationResponse } = require("../services/recommendationService");
const { parseReceiptResponse } = require("../services/receiptParser");
const {
  createRecipe: createRecipeFromPayload,
  importRecipes: importRecipesFromPayload
} = require("../services/recipeImportService");

function listRecipes(_req, res) {
  res.json({ recipes: getRecipes() });
}

function listRestaurants(_req, res) {
  res.json({ restaurants: getRestaurants() });
}

function listScenarios(_req, res) {
  res.json({ scenarios: getScenarios() });
}

function listIngredientCatalog(req, res) {
  const q = req.query.q || "";
  const limit = req.query.limit;
  const ingredients = q
    ? searchIngredientCatalog(q, limit || 25)
    : getIngredientCatalog();

  res.json({
    count: ingredients.length,
    totalCount: getIngredientCatalog().length,
    ingredients
  });
}

function createRecommendations(req, res, next) {
  try {
    const result = buildRecommendationResponse(req.body, {
      topK: req.body.topK,
      restaurantTopK: req.body.restaurantTopK
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function parseReceipt(req, res, next) {
  try {
    res.json(parseReceiptResponse(req.body.receiptText || req.body.text || ""));
  } catch (error) {
    next(error);
  }
}

function importRecipes(req, res, next) {
  try {
    res.status(201).json(importRecipesFromPayload(req.body));
  } catch (error) {
    next(error);
  }
}

function createRecipe(req, res, next) {
  try {
    res.status(201).json(createRecipeFromPayload(req.body));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRecipe,
  createRecommendations,
  listIngredientCatalog,
  importRecipes,
  listRecipes,
  listRestaurants,
  listScenarios,
  parseReceipt
};
