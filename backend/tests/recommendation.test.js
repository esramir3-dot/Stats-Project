const {
  equipmentMatch,
  isOpenDietaryNeed,
  recommendMeals,
  recommendRestaurants,
  scoreRecipe
} = require("../src/services/recommendationService");
const {
  addImportedRecipes,
  resetImportedRecipes
} = require("../src/services/dataStore");
const {
  findPantrySubstitute,
  inferIngredientImportance
} = require("../src/services/substitutionService");

afterEach(() => {
  resetImportedRecipes();
});

describe("DormEats recommendation service", () => {
  test("preserves the Phase 2 top recipe results for benchmark scenarios", () => {
    const vegan = recommendMeals({
      dietaryNeed: "vegan",
      availableIngredients: ["tortilla", "hummus", "spinach", "cucumber"],
      availableEquipment: ["none", "microwave"],
      timeMinutes: 10,
      budget: 5
    });
    const halal = recommendMeals({
      dietaryNeed: "halal",
      availableIngredients: ["rice", "black beans", "frozen vegetables", "egg"],
      availableEquipment: ["microwave"],
      timeMinutes: 15,
      budget: 6
    });
    const glutenFree = recommendMeals({
      dietaryNeed: "gluten-free",
      availableIngredients: ["potato"],
      availableEquipment: ["microwave"],
      timeMinutes: 15,
      budget: 6
    });

    expect(vegan.recommendations[0].recipe.name).toBe("No-Cook Hummus Wrap");
    expect(halal.recommendations[0].recipe.name).toBe("Microwave Veggie Rice Bowl");
    expect(glutenFree.recommendations[0].recipe.name).toBe("Gluten-Free Tuna Potato Bowl");
  });

  test("requires recipe equipment to be available while always allowing none", () => {
    expect(
      equipmentMatch(
        { equipment: ["none"] },
        ["microwave"]
      )
    ).toBe(true);
    expect(
      equipmentMatch(
        { equipment: ["pan", "microwave"] },
        ["microwave"]
      )
    ).toBe(false);
  });

  test("scores ingredient readiness as the dominant factor", () => {
    const recipe = {
      ingredients: ["rice", "black beans", "frozen vegetables", "soy sauce", "egg"],
      time_minutes: 12,
      estimated_cost: 4.5
    };

    const result = scoreRecipe(recipe, {
      availableIngredients: ["rice", "black beans", "frozen vegetables", "egg"],
      timeMinutes: 15,
      budget: 6
    });

    expect(result.score).toBe(0.554);
    expect(result.breakdown.ingredientOverlap).toBe(0.8);
    expect(result.breakdown.matchedCount).toBe(4);
    expect(result.breakdown.missingCount).toBe(1);
    expect(result.breakdown.readiness).toBe("almost");
    expect(result.readiness.label).toBe("Almost there");
    expect(result.breakdown.timeFit).toBe(0.2);
    expect(result.breakdown.budgetFit).toBe(1);
  });

  test("returns detailed ranking explanations and fit flags", () => {
    const result = recommendMeals({
      dietaryNeed: "vegan",
      availableIngredients: ["tortilla", "hummus", "spinach", "cucumber"],
      availableEquipment: ["none", "microwave"],
      timeMinutes: 10,
      budget: 5
    });
    const top = result.recommendations[0];

    expect(top.explanation).toContain("Ingredient match: 4 of 5");
    expect(top.explanation).toContain("Missing items: 1");
    expect(top.explanation).toContain("Dietary match: yes");
    expect(top.explanation).toContain("Equipment match: yes");
    expect(top.explanation).toContain("Time fit: yes");
    expect(top.explanation).toContain("Budget fit: yes");
    expect(top.scoreBreakdown).toMatchObject({
      dietaryMatch: true,
      equipmentMatch: true,
      timeFits: true,
      budgetFits: true
    });
  });

  test("ranks pantry matches above zero-match recipes even when both fit time and budget", () => {
    const result = recommendMeals({
      dietaryNeed: "vegetarian",
      availableIngredients: ["oats", "milk", "banana", "peanut butter", "honey"],
      availableEquipment: ["microwave", "none"],
      timeMinutes: 120,
      budget: 40,
      topK: 250
    });

    const names = result.recommendations.map((item) => item.recipe.name);
    const pantryReadyIndex = names.indexOf("Peanut Butter Banana Oats");
    const zeroMatchIndex = names.indexOf("Microwave Veggie Rice Bowl");
    const zeroMatch = result.recommendations[zeroMatchIndex];

    expect(pantryReadyIndex).toBeGreaterThanOrEqual(0);
    expect(zeroMatchIndex).toBeGreaterThanOrEqual(0);
    expect(pantryReadyIndex).toBeLessThan(zeroMatchIndex);
    expect(result.recommendations[pantryReadyIndex].readiness.label).toBe(
      "Ready to make"
    );
    expect(zeroMatch.readiness.label).toBe("Backup idea");
  });

  test("sorts restaurant fallback by price then distance", () => {
    const restaurants = recommendRestaurants({
      dietaryNeed: "halal",
      timeMinutes: 10,
      budget: 5
    });

    expect(restaurants.map((restaurant) => restaurant.name)).toEqual([
      "Budget Burrito",
      "Campus Halal Grill"
    ]);
  });

  test("ranks restaurant fallback by budget fit for open preference searches", () => {
    const restaurants = recommendRestaurants({
      dietaryNeed: "no restriction",
      timeMinutes: 10,
      budget: 4
    }, { restaurantTopK: 3 });

    expect(restaurants[0].price_level).toBe(1);
    expect(restaurants[0].budgetFit).toBe(1);
    expect(
      restaurants.findIndex((restaurant) => restaurant.budgetFit === 0)
    ).toBeGreaterThan(0);
    expect(restaurants[0].fallbackReason).toContain("Works for no restriction searches");
    expect(restaurants[0].fallbackReason).toContain("fits a $4.00 budget");
  });

  test("handles open dietary options without requiring a matching tag", () => {
    expect(isOpenDietaryNeed("no restriction")).toBe(true);
    expect(isOpenDietaryNeed("low-cost/no preference")).toBe(true);

    const result = recommendMeals({
      dietaryNeed: "no restriction",
      availableIngredients: ["tuna", "crackers", "mayo", "pickle relish"],
      availableEquipment: ["none"],
      timeMinutes: 5,
      budget: 4
    });

    expect(result.recommendations[0].recipe.name).toBe("No-Cook Tuna Cracker Stack");
  });

  test("supports expanded equipment and wider time and budget ranges", () => {
    const result = recommendMeals({
      dietaryNeed: "no restriction",
      availableIngredients: [
        "rice",
        "tofu",
        "edamame",
        "broccoli",
        "soy sauce",
        "sesame oil"
      ],
      availableEquipment: [
        "microwave",
        "mini fridge",
        "hot plate",
        "pan",
        "rice cooker",
        "air fryer",
        "blender",
        "kettle",
        "toaster"
      ],
      timeMinutes: 120,
      budget: 40
    });

    expect(result.recommendations[0].recipe.name).toBe("Stocked Dorm Stir-Fry Night");
    expect(result.recommendations[0].scoreBreakdown.timeFit).toBeGreaterThan(0.5);
    expect(result.recommendations[0].scoreBreakdown.budgetFit).toBe(1);
    expect(result.recommendations[0].readiness.label).toBe("Ready to make");
  });

  test("matches new dietary tags such as dairy-free and high-protein", () => {
    const dairyFree = recommendMeals({
      dietaryNeed: "dairy-free",
      availableIngredients: ["rice", "lentils", "vegetable broth", "frozen vegetables", "cumin"],
      availableEquipment: ["rice cooker"],
      timeMinutes: 90,
      budget: 12
    });
    const highProtein = recommendMeals({
      dietaryNeed: "high-protein",
      availableIngredients: ["protein powder", "milk", "berries", "banana", "ice"],
      availableEquipment: ["blender", "mini fridge"],
      timeMinutes: 10,
      budget: 8
    });

    expect(dairyFree.recommendations[0].recipe.name).toBe(
      "Dairy-Free Rice Cooker Lentil Pilaf"
    );
    expect(highProtein.recommendations[0].recipe.name).toBe(
      "Blender Berry Protein Smoothie"
    );
  });

  test("uses catalog aliases when recommending ramen, pasta, and taco meals", () => {
    const ramen = recommendMeals({
      dietaryNeed: "no restriction",
      availableIngredients: [
        "instant ramen",
        "egg",
        "soy sauce",
        "frozen veggies",
        "green onions",
        "spinach"
      ],
      availableEquipment: ["kettle", "microwave"],
      timeMinutes: 20,
      budget: 8,
      topK: 10
    });
    const pasta = recommendMeals({
      dietaryNeed: "no restriction",
      availableIngredients: [
        "spaghetti",
        "egg",
        "marinara",
        "spinach",
        "parmesan"
      ],
      availableEquipment: ["microwave"],
      timeMinutes: 20,
      budget: 10,
      topK: 10
    });
    const taco = recommendMeals({
      dietaryNeed: "vegetarian",
      availableIngredients: [
        "tortillas",
        "black bean",
        "salsa",
        "lettuce",
        "taco seasoning"
      ],
      availableEquipment: ["none"],
      timeMinutes: 15,
      budget: 6,
      topK: 10
    });

    expect(
      ramen.recommendations.some(
        (item) => /ramen/i.test(item.recipe.name) && item.missingItems.length === 0
      )
    ).toBe(true);
    expect(
      pasta.recommendations.some(
        (item) => /pasta/i.test(item.recipe.name) && item.missingItems.length === 0
      )
    ).toBe(true);
    expect(
      taco.recommendations.some(
        (item) => /taco/i.test(item.recipe.name) && item.missingItems.length === 0
      )
    ).toBe(true);
  });

  test("suggests pantry substitutions and ranks a tortilla recipe better when bread is available", () => {
    addImportedRecipes([
      {
        name: "Test Tortilla Cheese Fold",
        dietary_tags: ["vegetarian", "halal"],
        ingredients: ["tortilla", "cheese"],
        equipment: ["none"],
        time_minutes: 5,
        estimated_cost: 2.5,
        instructions: ["Fold cheese into the tortilla."]
      },
      {
        name: "Test Zero Match Snack Bowl",
        dietary_tags: ["vegetarian", "halal"],
        ingredients: ["rice", "black beans"],
        equipment: ["none"],
        time_minutes: 5,
        estimated_cost: 2.5,
        instructions: ["Combine rice and beans."]
      }
    ]);

    const result = recommendMeals({
      dietaryNeed: "vegetarian",
      availableIngredients: ["bread", "cheese"],
      availableEquipment: ["none"],
      timeMinutes: 15,
      budget: 8,
      topK: 250
    });
    const names = result.recommendations.map((item) => item.recipe.name);
    const tortillaMeal = result.recommendations.find(
      (item) => item.recipe.name === "Test Tortilla Cheese Fold"
    );
    const zeroMatchMeal = result.recommendations.find(
      (item) => item.recipe.name === "Test Zero Match Snack Bowl"
    );

    expect(findPantrySubstitute("tortilla", ["bread"])).toMatchObject({
      ingredient: "bread"
    });
    expect(tortillaMeal.missingItems).toEqual([]);
    expect(tortillaMeal.substitutions[0]).toMatchObject({
      ingredient: "tortilla",
      substitute: "bread",
      label: "Use what you have",
      countsAsGrocery: false
    });
    expect(tortillaMeal.readiness.label).toBe("Ready to make");
    expect(names.indexOf(tortillaMeal.recipe.name)).toBeLessThan(
      names.indexOf(zeroMatchMeal.recipe.name)
    );
  });

  test("omits optional missing ingredients instead of adding them to the grocery list", () => {
    addImportedRecipes([
      {
        name: "Test Rice With Sesame Garnish",
        dietary_tags: ["vegan", "vegetarian", "halal"],
        ingredients: ["rice", "sesame seeds"],
        equipment: ["none"],
        time_minutes: 5,
        estimated_cost: 1.5,
        instructions: ["Serve rice with garnish."]
      }
    ]);

    const result = recommendMeals({
      dietaryNeed: "vegan",
      availableIngredients: ["rice"],
      availableEquipment: ["none"],
      timeMinutes: 10,
      budget: 4,
      topK: 250
    });
    const recipe = result.recommendations.find(
      (item) => item.recipe.name === "Test Rice With Sesame Garnish"
    );

    expect(inferIngredientImportance(recipe.recipe, "sesame seeds")).toBe("optional");
    expect(recipe.missingItems).toEqual([]);
    expect(recipe.omittableItems).toEqual(["sesame seeds"]);
    expect(recipe.substitutions[0]).toMatchObject({
      ingredient: "sesame seeds",
      label: "Can omit",
      countsAsGrocery: false
    });
  });

  test("substitutes or penalizes disliked ingredients", () => {
    addImportedRecipes([
      {
        name: "Test Peanut Butter Toast",
        dietary_tags: ["vegetarian", "halal"],
        ingredients: ["bread", "peanut butter"],
        equipment: ["none"],
        time_minutes: 4,
        estimated_cost: 2,
        instructions: ["Spread peanut butter on bread."]
      }
    ]);

    const substituted = recommendMeals({
      dietaryNeed: "vegetarian",
      availableIngredients: ["bread", "sunflower butter"],
      dislikedIngredients: ["peanut butter"],
      availableEquipment: ["none"],
      timeMinutes: 10,
      budget: 4,
      topK: 250
    }).recommendations.find(
      (item) => item.recipe.name === "Test Peanut Butter Toast"
    );
    const dislikedScore = scoreRecipe(
      {
        ingredients: ["bread", "peanut butter"],
        time_minutes: 4,
        estimated_cost: 2
      },
      {
        availableIngredients: ["bread", "peanut butter"],
        dislikedIngredients: ["peanut butter"],
        timeMinutes: 10,
        budget: 4
      }
    );
    const neutralScore = scoreRecipe(
      {
        ingredients: ["bread", "peanut butter"],
        time_minutes: 4,
        estimated_cost: 2
      },
      {
        availableIngredients: ["bread", "peanut butter"],
        timeMinutes: 10,
        budget: 4
      }
    );

    expect(substituted.missingItems).toEqual([]);
    expect(substituted.substitutions[0]).toMatchObject({
      ingredient: "peanut butter",
      substitute: "sunflower butter",
      isDisliked: true,
      label: "Use what you have"
    });
    expect(dislikedScore.breakdown.unresolvedDislikedCount).toBe(1);
    expect(dislikedScore.score).toBeLessThan(neutralScore.score);
  });
});
