const express = require("express");
const {
  createRecipe,
  createRecommendations,
  importRecipes,
  listIngredientCatalog,
  listRecipes,
  listRestaurants,
  listScenarios,
  parseReceipt
} = require("../controllers/dormEatsController");

const router = express.Router();

router.get("/recipes", listRecipes);
router.post("/recipes", createRecipe);
router.post("/recipes/import", importRecipes);
router.get("/restaurants", listRestaurants);
router.get("/scenarios", listScenarios);
router.get("/ingredients/catalog", listIngredientCatalog);
router.post("/recommendations", createRecommendations);
router.post("/ingredients/parse-receipt", parseReceipt);

module.exports = router;
