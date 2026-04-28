const {
  canonicalizeIngredient,
  getIngredientCatalog,
  ingredientMatches,
  searchIngredientCatalog
} = require("../src/services/ingredientCatalog");

describe("ingredient catalog", () => {
  test("ships with a large dorm-friendly ingredient catalog", () => {
    const catalog = getIngredientCatalog();
    const names = new Set(catalog.map((entry) => entry.name));

    expect(catalog.length).toBeGreaterThanOrEqual(1000);
    expect(names.size).toBe(catalog.length);
    [
      "ramen noodles",
      "mac and cheese",
      "tortilla",
      "salsa",
      "canned tuna",
      "egg",
      "frozen vegetables",
      "chicken nuggets",
      "oatmeal",
      "peanut butter"
    ].forEach((ingredient) => expect(names.has(ingredient)).toBe(true));
  });

  test("normalizes common ingredient aliases", () => {
    expect(canonicalizeIngredient("black bean")).toBe("black beans");
    expect(canonicalizeIngredient("instant ramen")).toBe("ramen noodles");
    expect(canonicalizeIngredient("mac n cheese")).toBe("mac and cheese");
    expect(ingredientMatches("ramen noodles", "instant ramen")).toBe(true);
    expect(ingredientMatches("black beans", "black bean")).toBe(true);
  });

  test("searches by aliases for autocomplete", () => {
    const blackBeanResults = searchIngredientCatalog("black bean", 5);
    const ramenResults = searchIngredientCatalog("instant ramen", 5);

    expect(blackBeanResults[0].name).toBe("black beans");
    expect(ramenResults[0].name).toBe("ramen noodles");
  });
});
