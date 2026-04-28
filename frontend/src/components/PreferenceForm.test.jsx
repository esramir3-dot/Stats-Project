import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PreferenceForm from "./PreferenceForm.jsx";

describe("PreferenceForm", () => {
  test("populates fields from expanded scenario presets and exposes wider ranges", () => {
    const onSubmit = vi.fn();
    render(
      <PreferenceForm
        loading={false}
        onSubmit={onSubmit}
        scenarios={[
          {
            name: "Big grocery trip / stocked dorm",
            dietary_need: "no restriction",
            available_ingredients: ["rice", "tofu", "edamame"],
            available_equipment: ["rice cooker", "air fryer", "mini fridge"],
            time_minutes: 120,
            budget: 40
          }
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText("Scenario"), {
      target: { value: "Big grocery trip / stocked dorm" }
    });

    expect(screen.getByLabelText("Dietary need")).toHaveValue("no restriction");
    expect(screen.getByText("rice")).toBeInTheDocument();
    expect(screen.getByText("tofu")).toBeInTheDocument();
    expect(screen.getByText("edamame")).toBeInTheDocument();
    expect(screen.getByText("Time limit: 120 min")).toBeInTheDocument();
    expect(screen.getByText("Budget: $40.00")).toBeInTheDocument();
    expect(screen.getByLabelText("rice cooker")).toBeChecked();
    expect(screen.getByLabelText("air fryer")).toBeChecked();

    expect(screen.getByLabelText(/Time limit/)).toHaveAttribute("max", "120");
    expect(screen.getByLabelText(/Budget/)).toHaveAttribute("max", "40");
  });

  test("parses receipt text into removable ingredient chips", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ingredients: ["rice", "black beans", "greek yogurt"]
      })
    });

    render(
      <PreferenceForm loading={false} onSubmit={vi.fn()} scenarios={[]} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Paste\/upload receipt/i }));
    fireEvent.change(screen.getByLabelText("Receipt text"), {
      target: {
        value: "Campus Market\nRice 4.99\nBlack Beans 1.29\nGreek Yogurt 5.49"
      }
    });
    fireEvent.click(screen.getByRole("button", { name: /Parse receipt/i }));

    expect(await screen.findByText("greek yogurt")).toBeInTheDocument();
    expect(screen.getByText("black beans")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Remove black beans"));

    await waitFor(() => {
      expect(screen.queryByText("black beans")).not.toBeInTheDocument();
    });

    global.fetch = originalFetch;
  });

  test("adds suggested ingredients as chips", () => {
    render(
      <PreferenceForm
        loading={false}
        onSubmit={vi.fn()}
        scenarios={[
          {
            name: "Custom dorm profile",
            dietary_need: "no restriction",
            available_ingredients: [],
            available_equipment: ["microwave"],
            time_minutes: 20,
            budget: 8
          }
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add tuna" }));

    expect(screen.getByText("tuna")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Added tuna" })).toBeDisabled();
  });

  test("autocompletes catalog ingredients and keeps custom entry", () => {
    render(
      <PreferenceForm
        ingredientCatalog={[
          {
            name: "black beans",
            category: "beans",
            aliases: ["black bean"]
          },
          {
            name: "ramen noodles",
            category: "noodles",
            aliases: ["instant ramen"]
          }
        ]}
        loading={false}
        onSubmit={vi.fn()}
        scenarios={[
          {
            name: "Custom dorm profile",
            dietary_need: "no restriction",
            available_ingredients: [],
            available_equipment: ["microwave"],
            time_minutes: 20,
            budget: 8
          }
        ]}
      />
    );

    const input = screen.getByLabelText("Add ingredients");
    fireEvent.change(input, { target: { value: "black bean" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: /black beans/i }));

    expect(screen.getByText("black beans")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "instant ramen" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("ramen noodles")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "tajin" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("tajin")).toBeInTheDocument();
  });

  test("adds and submits disliked ingredient chips", () => {
    const onSubmit = vi.fn();
    render(
      <PreferenceForm
        loading={false}
        onSubmit={onSubmit}
        scenarios={[
          {
            name: "Custom dorm profile",
            dietary_need: "vegetarian",
            available_ingredients: ["bread"],
            available_equipment: ["none"],
            time_minutes: 20,
            budget: 8
          }
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText("Add disliked ingredients"), {
      target: { value: "peanut butter" }
    });
    fireEvent.keyDown(screen.getByLabelText("Add disliked ingredients"), {
      key: "Enter"
    });

    expect(screen.getByText("peanut butter")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Find dorm meals" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        dislikedIngredients: ["peanut butter"]
      })
    );

    fireEvent.click(screen.getByLabelText("Remove disliked peanut butter"));

    expect(screen.queryByText("peanut butter")).not.toBeInTheDocument();
  });
});
