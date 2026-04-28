import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MyRecipesPage, { CUSTOM_RECIPES_KEY } from "./MyRecipesPage.jsx";

describe("MyRecipesPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("validates and creates a custom recipe with ingredient chips", async () => {
    const onRecipesChanged = vi.fn();
    const createdRecipe = {
      name: "Custom Test Rice Stack",
      dietary_tags: ["vegetarian", "halal"],
      ingredients: ["rice cakes", "hummus", "cucumber"],
      equipment: ["none"],
      time_minutes: 5,
      estimated_cost: 3.5,
      instructions: ["Spread hummus.", "Add cucumber."],
      source: "user"
    };
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ recipe: createdRecipe })
    });

    render(<MyRecipesPage onRecipesChanged={onRecipesChanged} />);

    fireEvent.click(screen.getByRole("button", { name: /Save custom recipe/i }));
    expect(screen.getByText("Recipe: name is required.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Recipe name"), {
      target: { value: "Custom Test Rice Stack" }
    });
    fireEvent.click(screen.getByLabelText("vegetarian"));
    fireEvent.click(screen.getByLabelText("halal"));
    fireEvent.change(screen.getByLabelText("Add ingredients"), {
      target: { value: "rice cakes, hummus, cucumber" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.change(screen.getByLabelText("Step-by-step instructions"), {
      target: { value: "Spread hummus.\nAdd cucumber." }
    });
    fireEvent.click(screen.getByRole("button", { name: /Save custom recipe/i }));

    expect(await screen.findByText(/was added to DormEats/)).toBeInTheDocument();
    expect(onRecipesChanged).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY))[0]).toMatchObject({
      name: "Custom Test Rice Stack",
      source: "user"
    });

    global.fetch = originalFetch;
  });

  test("previews and imports recipes from a JSON file", async () => {
    const importedRecipe = {
      name: "Imported Browser Smoothie",
      dietary_tags: ["vegetarian", "high-protein"],
      ingredients: ["milk", "banana", "protein powder"],
      equipment: ["blender"],
      time_minutes: 6,
      estimated_cost: 5.5,
      instructions: ["Blend everything."],
      source: "user"
    };
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        importedCount: 1,
        recipes: [importedRecipe]
      })
    });

    render(<MyRecipesPage onRecipesChanged={vi.fn()} />);

    const file = new File(
      [
        JSON.stringify({
          recipes: [importedRecipe]
        })
      ],
      "recipes.json",
      { type: "application/json" }
    );

    fireEvent.change(screen.getByLabelText(/Choose .json or .csv file/i), {
      target: { files: [file] }
    });

    expect(await screen.findByText("Imported Browser Smoothie")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Import previewed recipes/i }));

    await waitFor(() => {
      expect(screen.getByText("1 recipe imported.")).toBeInTheDocument();
    });
    expect(JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY))[0].name).toBe(
      "Imported Browser Smoothie"
    );

    global.fetch = originalFetch;
  });
});
