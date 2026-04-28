const request = require("supertest");
const app = require("../src/app");
const { resetImportedRecipes } = require("../src/services/dataStore");

afterEach(() => {
  resetImportedRecipes();
});

describe("DormEats API", () => {
  test("responds to health checks", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "dormeats-api" });
  });

  test("returns seeded recipes and restaurants", async () => {
    const recipes = await request(app).get("/api/recipes");
    const restaurants = await request(app).get("/api/restaurants");

    expect(recipes.status).toBe(200);
    expect(recipes.body.recipes.length).toBeGreaterThanOrEqual(500);
    expect(restaurants.status).toBe(200);
    expect(restaurants.body.restaurants.length).toBeGreaterThan(0);
  });

  test("returns a large ingredient autocomplete catalog", async () => {
    const response = await request(app).get("/api/ingredients/catalog");
    const searchResponse = await request(app).get(
      "/api/ingredients/catalog?q=black%20be&limit=5"
    );

    expect(response.status).toBe(200);
    expect(response.body.totalCount).toBeGreaterThanOrEqual(1000);
    expect(response.body.ingredients.length).toBeGreaterThanOrEqual(1000);
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.ingredients[0].name).toBe("black beans");
  });

  test("creates recommendations from a dorm profile", async () => {
    const response = await request(app)
      .post("/api/recommendations")
      .send({
        name: "Exam week vegan student",
        dietaryNeed: "vegan",
        availableIngredients: ["tortilla", "hummus", "spinach", "cucumber"],
        availableEquipment: ["none", "microwave"],
        timeMinutes: 10,
        budget: 5
      });

    expect(response.status).toBe(200);
    expect(response.body.recommendations[0].recipe.name).toBe(
      "No-Cook Hummus Wrap"
    );
    expect(response.body.recommendations[0].missingItems).toEqual(["carrot"]);
    expect(response.body.restaurants.map((restaurant) => restaurant.name)).toContain(
      "Green Leaf Cafe"
    );
  });

  test("accepts wide time and budget values with expanded equipment", async () => {
    const response = await request(app)
      .post("/api/recommendations")
      .send({
        name: "Big grocery trip / stocked dorm",
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

    expect(response.status).toBe(200);
    expect(response.body.profile.timeMinutes).toBe(120);
    expect(response.body.profile.budget).toBe(40);
    expect(response.body.recommendations[0].recipe.name).toBe(
      "Stocked Dorm Stir-Fry Night"
    );
  });

  test("validates malformed recommendation requests", async () => {
    const response = await request(app).post("/api/recommendations").send({
      dietaryNeed: "vegan",
      budget: -1
    });

    expect(response.status).toBe(400);
    expect(response.body.error.details).toContain(
      "timeMinutes must be a positive number."
    );
  });

  test("parses receipt text into ingredient candidates", async () => {
    const response = await request(app)
      .post("/api/ingredients/parse-receipt")
      .send({
        receiptText: "STORE 123\nRice 4.99\nBlack Beans Can 1.29\nTAX 0.52\nTOTAL 6.80"
      });

    expect(response.status).toBe(200);
    expect(response.body.ingredients).toEqual(["rice", "black beans"]);
  });

  test("imports local development recipes and makes them recommendable", async () => {
    const importResponse = await request(app)
      .post("/api/recipes/import")
      .send({
        recipes: [
          {
            name: "API Imported Toaster Banana Pocket",
            dietary_tags: ["vegan", "vegetarian", "halal"],
            ingredients: ["pita", "banana", "sunflower butter"],
            equipment: ["toaster"],
            time_minutes: 6,
            estimated_cost: 3.25,
            instructions: ["Fill pita.", "Toast until warm."]
          }
        ]
      });

    expect(importResponse.status).toBe(201);
    expect(importResponse.body.importedCount).toBe(1);
    expect(importResponse.body.recipes[0].source).toBe("user");

    const recommendationResponse = await request(app)
      .post("/api/recommendations")
      .send({
        dietaryNeed: "vegan",
        availableIngredients: ["pita", "banana", "sunflower butter"],
        availableEquipment: ["toaster"],
        timeMinutes: 10,
        budget: 5,
        topK: 1
      });

    expect(recommendationResponse.status).toBe(200);
    expect(recommendationResponse.body.recommendations[0].recipe.name).toBe(
      "API Imported Toaster Banana Pocket"
    );
    expect(recommendationResponse.body.recommendations[0].recipe.source).toBe("user");
  });

  test("creates a single custom recipe and validates malformed recipes", async () => {
    const createResponse = await request(app)
      .post("/api/recipes")
      .send({
        name: "API Custom Rice Cake Stack",
        dietary_tags: ["vegetarian", "halal", "gluten-free"],
        ingredients: ["rice cakes", "hummus", "cucumber"],
        equipment: ["none"],
        time_minutes: 5,
        estimated_cost: 3.5,
        instructions: ["Spread hummus.", "Add cucumber slices."]
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.recipe.source).toBe("user");

    const recommendationResponse = await request(app)
      .post("/api/recommendations")
      .send({
        dietaryNeed: "vegetarian",
        availableIngredients: ["rice cakes", "hummus", "cucumber"],
        availableEquipment: ["none"],
        timeMinutes: 10,
        budget: 5,
        topK: 1
      });

    expect(recommendationResponse.body.recommendations[0].recipe.name).toBe(
      "API Custom Rice Cake Stack"
    );
    expect(recommendationResponse.body.recommendations[0].readiness.label).toBe(
      "Ready to make"
    );

    const badResponse = await request(app).post("/api/recipes").send({
      name: "",
      ingredients: []
    });

    expect(badResponse.status).toBe(400);
    expect(badResponse.body.error.message).toBe("Invalid recipe.");
  });
});
