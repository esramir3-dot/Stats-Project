const { getRecipes, resetImportedRecipes } = require("../src/services/dataStore");
const {
  createRecipe,
  importRecipes,
  parseCsvRecipes,
  validateRecipeImport
} = require("../src/services/recipeImportService");

afterEach(() => {
  resetImportedRecipes();
});

describe("DormEats expanded recipe data", () => {
  test("ships with 500+ dorm-friendly seeded recipes across requested coverage", () => {
    const recipes = getRecipes();
    const names = recipes.map((recipe) => recipe.name);
    const equipment = new Set(recipes.flatMap((recipe) => recipe.equipment));
    const tags = new Set(recipes.flatMap((recipe) => recipe.dietary_tags));

    expect(recipes.length).toBeGreaterThanOrEqual(500);
    expect(new Set(names).size).toBe(names.length);
    expect(names.slice(0, 8)).toEqual([
      "Microwave Veggie Rice Bowl",
      "No-Cook Hummus Wrap",
      "Dorm Chicken Quesadilla",
      "Peanut Butter Banana Oats",
      "Gluten-Free Tuna Potato Bowl",
      "Quick Tofu Noodles",
      "Yogurt Berry Parfait",
      "Chickpea Salad Bowl"
    ]);
    expect(Math.max(...recipes.map((recipe) => recipe.time_minutes))).toBe(120);
    expect(Math.max(...recipes.map((recipe) => recipe.estimated_cost))).toBeGreaterThan(35);
    expect(Math.min(...recipes.map((recipe) => recipe.time_minutes))).toBeLessThanOrEqual(5);
    expect(Math.min(...recipes.map((recipe) => recipe.estimated_cost))).toBeLessThan(5);
    expect(recipes.some((recipe) => recipe.time_minutes < 10)).toBe(true);
    expect(recipes.some((recipe) => recipe.time_minutes >= 10 && recipe.time_minutes <= 30)).toBe(true);
    expect(recipes.some((recipe) => recipe.time_minutes > 30 && recipe.time_minutes <= 60)).toBe(true);
    expect(recipes.some((recipe) => recipe.time_minutes > 60 && recipe.time_minutes <= 120)).toBe(true);
    expect(recipes.some((recipe) => recipe.estimated_cost < 5)).toBe(true);
    expect(recipes.some((recipe) => recipe.estimated_cost >= 5 && recipe.estimated_cost <= 10)).toBe(true);
    expect(recipes.some((recipe) => recipe.estimated_cost > 10 && recipe.estimated_cost <= 20)).toBe(true);
    expect(recipes.some((recipe) => recipe.estimated_cost > 20 && recipe.estimated_cost <= 40)).toBe(true);
    recipes.forEach((recipe) => {
      expect(recipe.name).toBeTruthy();
      expect(recipe.dietary_tags.length).toBeGreaterThan(0);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.equipment.length).toBeGreaterThan(0);
      expect(recipe.instructions.length).toBeGreaterThan(0);
      expect(Number.isFinite(recipe.time_minutes)).toBe(true);
      expect(Number.isFinite(recipe.estimated_cost)).toBe(true);
    });
    [
      "none",
      "microwave",
      "kettle",
      "toaster",
      "hot plate",
      "pan",
      "blender",
      "rice cooker",
      "air fryer",
      "mini fridge"
    ].forEach((item) => expect(equipment.has(item)).toBe(true));
    [
      "vegan",
      "vegetarian",
      "halal",
      "gluten-free",
      "dairy-free",
      "nut-free",
      "high-protein",
      "no restriction"
    ].forEach((tag) => expect(tags.has(tag)).toBe(true));
  });
});

describe("recipe import service", () => {
  test("creates a single normalized user recipe", () => {
    const result = createRecipe({
      name: "Single User Microwave Taco Bowl",
      dietaryTags: ["halal", "high-protein"],
      ingredients: "rice; black beans; salsa; cooked chicken",
      equipment: "microwave",
      timeMinutes: 9,
      estimatedCost: "$6.25",
      instructions: "Warm rice and beans;Top with chicken and salsa",
      notes: "Student-created bowl"
    });

    expect(result.recipe).toMatchObject({
      name: "Single User Microwave Taco Bowl",
      source: "user",
      dietary_tags: ["halal", "high-protein"],
      ingredients: ["rice", "black beans", "salsa", "cooked chicken"],
      equipment: ["microwave"],
      time_minutes: 9,
      estimated_cost: 6.25,
      instructions: ["Warm rice and beans", "Top with chicken and salsa"]
    });
    expect(getRecipes().some((recipe) => recipe.name === result.recipe.name)).toBe(true);
  });

  test("imports valid JSON recipes into the in-memory recipe store", () => {
    const result = importRecipes({
      recipes: [
        {
          name: "Imported Toaster Banana Pocket",
          dietary_tags: ["vegan", "vegetarian", "halal"],
          ingredients: ["pita", "banana", "sunflower butter"],
          equipment: ["toaster"],
          time_minutes: 6,
          estimated_cost: 3.25,
          instructions: ["Fill pita.", "Toast until warm."]
        }
      ]
    });

    expect(result.importedCount).toBe(1);
    expect(result.recipes[0].source).toBe("user");
    expect(getRecipes().some((recipe) => recipe.name === "Imported Toaster Banana Pocket")).toBe(true);
  });

  test("parses CSV recipes that use semicolon-separated list fields", () => {
    const recipes = parseCsvRecipes(
      [
        "name,dietary_tags,ingredients,equipment,time_minutes,estimated_cost,instructions,notes",
        "\"CSV Kettle Lentil Cup\",\"vegan;halal;dairy-free\",\"lentils;rice;spinach\",\"kettle\",20,4.25,\"Pour hot water;Cover until soft\",\"Shelf-stable import example\""
      ].join("\n")
    );

    expect(recipes[0]).toMatchObject({
      name: "CSV Kettle Lentil Cup",
      dietary_tags: "vegan;halal;dairy-free",
      ingredients: "lentils;rice;spinach",
      equipment: "kettle"
    });

    const result = importRecipes({ recipes });
    expect(result.recipes[0].dietary_tags).toEqual([
      "vegan",
      "halal",
      "dairy-free"
    ]);
    expect(result.recipes[0].instructions).toEqual([
      "Pour hot water",
      "Cover until soft"
    ]);
  });

  test("rejects invalid or duplicate imported recipes", () => {
    expect(() =>
      validateRecipeImport({
        recipes: [
          {
            name: "Microwave Veggie Rice Bowl",
            dietary_tags: ["vegetarian"],
            ingredients: ["rice"],
            equipment: ["microwave"],
            time_minutes: 12,
            estimated_cost: 4,
            instructions: ["Heat."]
          }
        ]
      })
    ).toThrow("Invalid recipe import.");

    expect(() =>
      validateRecipeImport({
        recipes: [
          {
            name: "Too Long Pasta",
            dietary_tags: ["vegetarian"],
            ingredients: ["pasta"],
            equipment: ["hot plate"],
            time_minutes: 150,
            estimated_cost: 5,
            instructions: ["Cook."]
          }
        ]
      })
    ).toThrow("Invalid recipe import.");
  });
});
