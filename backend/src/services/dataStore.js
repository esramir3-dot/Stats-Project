const fs = require("fs");
const path = require("path");
const { generatedRecipeSeed } = require("./expandedRecipeSeed");

const DATA_DIR = path.join(__dirname, "../../../phase2/data");
const importedRecipes = [];
let cachedSeedRecipes;

function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getRecipes() {
  if (!cachedSeedRecipes) {
    const curatedRecipes = readJson("recipes.json");
    cachedSeedRecipes = [
      ...curatedRecipes,
      ...generatedRecipeSeed(curatedRecipes.map((recipe) => recipe.name))
    ];
  }

  return [...cachedSeedRecipes, ...importedRecipes];
}

function getRestaurants() {
  return readJson("restaurants.json");
}

function getScenarios() {
  return readJson("scenarios.json");
}

function addImportedRecipes(recipes) {
  importedRecipes.push(...recipes);
  return [...importedRecipes];
}

function resetImportedRecipes() {
  importedRecipes.length = 0;
}

module.exports = {
  addImportedRecipes,
  getRecipes,
  getRestaurants,
  getScenarios,
  resetImportedRecipes
};
