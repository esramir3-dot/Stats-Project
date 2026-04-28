import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./pages/HomePage.jsx";
import MyRecipesPage, { CUSTOM_RECIPES_KEY } from "./pages/MyRecipesPage.jsx";
import PreferencesPage from "./pages/PreferencesPage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";
import { dormEatsApi } from "./services/api.js";

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [ingredientCatalog, setIngredientCatalog] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function refreshRecipes() {
    const recipeResponse = await dormEatsApi.recipes();
    setRecipes(recipeResponse.recipes);
    return recipeResponse.recipes;
  }

  useEffect(() => {
    try {
      const savedRecipes = JSON.parse(
        localStorage.getItem(CUSTOM_RECIPES_KEY) || "[]"
      );

      Promise.allSettled(
        savedRecipes.map((recipe) => dormEatsApi.createRecipe(recipe))
      )
        .then(() =>
          Promise.all([
            dormEatsApi.recipes(),
            dormEatsApi.restaurants(),
            dormEatsApi.scenarios(),
            dormEatsApi.ingredientCatalog()
          ])
        )
        .then(([
          recipeResponse,
          restaurantResponse,
          scenarioResponse,
          ingredientResponse
        ]) => {
          setRecipes(recipeResponse.recipes);
          setRestaurants(restaurantResponse.restaurants);
          setScenarios(scenarioResponse.scenarios);
          setIngredientCatalog(ingredientResponse.ingredients);
        })
        .catch((error) => setLoadError(error.message));
    } catch (error) {
      setLoadError(error.message);
    }
  }, []);

  async function handleProfileSubmit(profile) {
    setLoading(true);
    setLoadError("");
    try {
      const response = await dormEatsApi.recommendations({
        ...profile,
        topK: 12,
        restaurantTopK: 4
      });
      setResult(response);
      return response;
    } catch (error) {
      setLoadError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleMissingIngredientAdded(ingredient) {
    if (!result?.profile) {
      return;
    }

    const normalized = ingredient.trim();
    const existingIngredients = result.profile.availableIngredients || [];
    const alreadyAdded = existingIngredients.some(
      (item) => item.toLowerCase() === normalized.toLowerCase()
    );

    if (!normalized || alreadyAdded) {
      return;
    }

    try {
      await handleProfileSubmit({
        ...result.profile,
        availableIngredients: [...existingIngredients, normalized]
      });
    } catch (_error) {
      // handleProfileSubmit already exposes the error in the page banner.
    }
  }

  return (
    <>
      <NavBar />
      <main className="app-shell">
        {loadError && <p className="form-error global-error">{loadError}</p>}
        <Routes>
          <Route
            element={
              <HomePage
                recipeCount={recipes.length}
                restaurantCount={restaurants.length}
                scenarioCount={scenarios.length}
              />
            }
            path="/"
          />
          <Route
            element={<MyRecipesPage onRecipesChanged={refreshRecipes} />}
            path="/my-recipes"
          />
          <Route
            element={
              <PreferencesPage
                error={loadError}
                ingredientCatalog={ingredientCatalog}
                loading={loading}
                onSubmit={handleProfileSubmit}
                scenarios={scenarios}
              />
            }
            path="/preferences"
          />
          <Route
            element={
              <RecommendationsPage
                loading={loading}
                onAddIngredient={handleMissingIngredientAdded}
                result={result}
              />
            }
            path="/recommendations"
          />
        </Routes>
      </main>
    </>
  );
}
