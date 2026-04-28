import { fireEvent, render, screen, within } from "@testing-library/react";
import RecommendationResults from "./RecommendationResults.jsx";

describe("RecommendationResults", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders ranked meal details and restaurant fallback", () => {
    const onAddIngredient = vi.fn();
    render(
      <RecommendationResults
        onAddIngredient={onAddIngredient}
        result={{
          profile: {
            name: "Exam week vegan student",
            dietaryNeed: "vegan",
            timeMinutes: 10,
            budget: 5
          },
          recommendations: [
            {
              rank: 1,
              score: 0.558,
              readiness: {
                key: "almost",
                label: "Almost there"
              },
              explanation:
                "You have 4 of 5 ingredients and only need carrot. Ranked here because Ingredient match: 4 of 5; Missing items: 1; Dietary match: yes; Equipment match: yes; Time fit: yes (8/10 min); Budget fit: yes ($3.75/$5.00).",
              scoreBreakdown: {
                matchedCount: 4,
                missingCount: 1,
                rawMissingCount: 1,
                effectiveMatchedCount: 4,
                totalIngredientCount: 5,
                substitutedCount: 1,
                omittableCount: 1,
                dislikedIngredientCount: 0,
                dietaryMatch: true,
                equipmentMatch: true,
                ingredientOverlap: 0.8,
                timeFit: 0.2,
                budgetFit: 1,
                timeFits: true,
                budgetFits: true
              },
              matchedIngredients: ["tortilla", "hummus", "spinach", "cucumber"],
              missingItems: ["carrot"],
              substitutions: [
                {
                  ingredient: "tortilla",
                  label: "Use what you have",
                  substitute: "bread",
                  status: "substituted",
                  note: "Use bread instead of tortilla. It becomes more like a sandwich.",
                  countsAsGrocery: false
                },
                {
                  ingredient: "cilantro",
                  label: "Can omit",
                  status: "omittable",
                  note: "cilantro is optional here, so you can leave it out.",
                  countsAsGrocery: false
                },
                {
                  ingredient: "carrot",
                  label: "Need to buy",
                  status: "need_to_buy",
                  note: "carrot is essential for this recipe and no pantry substitute was found.",
                  countsAsGrocery: true
                }
              ],
              recipe: {
                name: "No-Cook Hummus Wrap",
                source: "user",
                dietary_tags: ["vegan", "halal"],
                ingredients: ["tortilla", "hummus", "spinach", "cucumber", "carrot"],
                equipment: ["none"],
                time_minutes: 8,
                estimated_cost: 3.75,
                instructions: [
                  "Spread hummus over the tortilla.",
                  "Add spinach, cucumber, and shredded carrot."
                ]
              }
            }
          ],
          restaurants: [
            {
              name: "Green Leaf Cafe",
              distance_miles: 0.6,
              price_level: 2,
              dietary_tags: ["vegan"],
              fallbackReason: "Matches vegan, fits a $5.00 budget, and is 0.6 miles away.",
              top_items: ["Protein salad", "Veggie wrap"]
            }
          ]
        }}
      />
    );

    expect(screen.getByText("No-Cook Hummus Wrap")).toBeInTheDocument();
    expect(screen.getByText("Custom recipe")).toBeInTheDocument();
    expect(screen.getAllByText("Almost there").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("carrot").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Ranked here because Ingredient match: 4 of 5/)
    ).toBeInTheDocument();
    expect(screen.getByText("Why this ranked here")).toBeInTheDocument();
    expect(screen.getAllByText("Substitutions").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Use what you have")).toBeInTheDocument();
    expect(screen.getByText("Use bread instead")).toBeInTheDocument();
    expect(screen.getByText("Can omit")).toBeInTheDocument();
    expect(screen.getByText("Need to buy")).toBeInTheDocument();
    expect(screen.getByText("Ingredient match")).toBeInTheDocument();
    expect(screen.getByText("4/5 (4 direct)")).toBeInTheDocument();
    expect(screen.getByText("Dietary match")).toBeInTheDocument();
    expect(screen.getByText("Equipment match")).toBeInTheDocument();
    expect(screen.getByText("Spread hummus over the tortilla.")).toBeInTheDocument();
    expect(screen.getByText("Green Leaf Cafe")).toBeInTheDocument();
    expect(screen.getByText(/Matches vegan/)).toBeInTheDocument();
    expect(screen.getByText(/Dietary and allergy guidance/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "I have carrot" }));
    expect(onAddIngredient).toHaveBeenCalledWith("carrot");
  });

  test("uses strict filters, dedupes grocery list items, and saves favorites", () => {
    render(
      <RecommendationResults
        result={{
          profile: {
            name: "Dorm profile",
            dietaryNeed: "vegetarian",
            timeMinutes: 60,
            budget: 20
          },
          recommendations: [
            {
              rank: 1,
              score: 0.99,
              readiness: { key: "ready", label: "Ready to make" },
              explanation: "You already have all required ingredients.",
              scoreBreakdown: {
                matchedCount: 2,
                missingCount: 0,
                ingredientOverlap: 1,
                timeFit: 1,
                budgetFit: 1,
                dietaryMatch: true,
                equipmentMatch: true
              },
              matchedIngredients: ["oats", "milk"],
              missingItems: [],
              recipe: {
                name: "Ready Oats",
                dietary_tags: ["vegetarian"],
                ingredients: ["oats", "milk"],
                equipment: ["microwave"],
                time_minutes: 5,
                estimated_cost: 2,
                instructions: ["Microwave oats."]
              }
            },
            {
              rank: 2,
              score: 0.62,
              readiness: { key: "almost", label: "Almost there" },
              explanation: "You have 3 of 5 ingredients.",
              scoreBreakdown: {
                matchedCount: 3,
                missingCount: 2,
                ingredientOverlap: 0.6,
                timeFit: 0.7,
                budgetFit: 1,
                dietaryMatch: true,
                equipmentMatch: true
              },
              matchedIngredients: ["pasta", "tomato sauce", "cheese"],
              missingItems: ["rice", "carrot"],
              recipe: {
                name: "Almost Pasta",
                dietary_tags: ["vegetarian"],
                ingredients: ["pasta", "tomato sauce", "cheese", "rice", "carrot"],
                equipment: ["microwave"],
                time_minutes: 12,
                estimated_cost: 5,
                instructions: ["Warm sauce."]
              }
            },
            {
              rank: 3,
              score: 0,
              readiness: { key: "backup", label: "Backup idea" },
              explanation: "Backup idea.",
              scoreBreakdown: {
                matchedCount: 0,
                missingCount: 3,
                ingredientOverlap: 0,
                timeFit: 0.9,
                budgetFit: 1,
                dietaryMatch: true,
                equipmentMatch: true
              },
              matchedIngredients: [],
              missingItems: ["rice", "black beans", "salsa"],
              recipe: {
                name: "Backup Bowl",
                dietary_tags: ["vegetarian"],
                ingredients: ["rice", "black beans", "salsa"],
                equipment: ["microwave"],
                time_minutes: 10,
                estimated_cost: 4,
                instructions: ["Warm ingredients."]
              }
            }
          ],
          restaurants: []
        }}
      />
    );

    const groceryPanel = screen.getByRole("heading", {
      name: "Combined grocery list"
    }).closest("section");

    expect(within(groceryPanel).getByText("rice")).toBeInTheDocument();
    expect(within(groceryPanel).getByText("2 meals")).toBeInTheDocument();
    expect(screen.getByText("Combined grocery list")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Only show meals missing 2 or fewer items"
      })
    );

    expect(screen.getByText("Ready Oats")).toBeInTheDocument();
    expect(screen.getByText("Almost Pasta")).toBeInTheDocument();
    expect(screen.queryByText("Backup Bowl")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Only show meals missing 2 or fewer items"
      })
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Include grocery-trip ideas" }));

    expect(screen.getByText("Ready Oats")).toBeInTheDocument();
    expect(screen.getByText("Almost Pasta")).toBeInTheDocument();
    expect(screen.queryByText("Backup Bowl")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Only show meals I can make now" })
    );

    expect(screen.getByText("Ready Oats")).toBeInTheDocument();
    expect(screen.queryByText("Almost Pasta")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Save meal"));

    expect(screen.getAllByText("Ready Oats").length).toBeGreaterThanOrEqual(1);
    expect(
      JSON.parse(localStorage.getItem("dormeats-favorite-meals"))["Ready Oats"]
    ).toBeTruthy();
  });
});
