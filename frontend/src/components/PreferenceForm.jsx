import { Clock, DollarSign, Plus, Refrigerator, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import IngredientManager from "./IngredientManager.jsx";

const EQUIPMENT_OPTIONS = [
  "none",
  "microwave",
  "mini fridge",
  "hot plate",
  "pan",
  "kettle",
  "toaster",
  "blender",
  "rice cooker",
  "air fryer"
];
const DIETARY_OPTIONS = [
  "vegan",
  "vegetarian",
  "halal",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "high-protein",
  "low-cost/no preference",
  "no restriction"
];

function profileFromScenario(scenario) {
  return {
    name: scenario?.name || "My dorm meal plan",
    dietaryNeed: scenario?.dietary_need || "no restriction",
    availableIngredients: scenario?.available_ingredients || [
      "rice",
      "black beans",
      "frozen vegetables",
      "egg"
    ],
    availableEquipment: scenario?.available_equipment || ["microwave", "mini fridge"],
    dislikedIngredients: scenario?.disliked_ingredients || [],
    timeMinutes: scenario?.time_minutes || 20,
    budget: scenario?.budget || 8
  };
}

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeList(existing, additions) {
  const seen = new Set(existing.map((item) => item.toLowerCase()));
  const merged = [...existing];

  additions.forEach((item) => {
    const normalized = item.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(normalized);
  });

  return merged;
}

export default function PreferenceForm({
  scenarios,
  ingredientCatalog = [],
  onSubmit,
  loading
}) {
  const [selectedScenario, setSelectedScenario] = useState("Custom dorm profile");
  const [form, setForm] = useState(profileFromScenario());
  const [dislikedInput, setDislikedInput] = useState("");

  useEffect(() => {
    const scenario = scenarios.find((item) => item.name === selectedScenario);
    setForm(profileFromScenario(scenario));
  }, [scenarios, selectedScenario]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function updateIngredients(availableIngredients) {
    setForm((current) => ({
      ...current,
      availableIngredients
    }));
  }

  function addDislikedIngredients(rawValue) {
    const additions = splitList(rawValue);
    if (additions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      dislikedIngredients: mergeList(current.dislikedIngredients, additions)
    }));
    setDislikedInput("");
  }

  function removeDislikedIngredient(item) {
    setForm((current) => ({
      ...current,
      dislikedIngredients: current.dislikedIngredients.filter(
        (ingredient) => ingredient.toLowerCase() !== item.toLowerCase()
      )
    }));
  }

  function handleDislikedKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addDislikedIngredients(dislikedInput);
    }
  }

  function toggleEquipment(item) {
    setForm((current) => {
      const set = new Set(current.availableEquipment);
      if (set.has(item)) {
        set.delete(item);
      } else {
        set.add(item);
      }
      return {
        ...current,
        availableEquipment: [...set]
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      timeMinutes: Number(form.timeMinutes),
      budget: Number(form.budget),
      availableIngredients: form.availableIngredients
    });
  }

  return (
    <form className="preference-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Scenario
          <select
            onChange={(event) => setSelectedScenario(event.target.value)}
            value={selectedScenario}
          >
            {!scenarios.some((scenario) => scenario.name === "Custom dorm profile") && (
              <option value="Custom dorm profile">Custom dorm profile</option>
            )}
            {scenarios.map((scenario) => (
              <option key={scenario.name} value={scenario.name}>
                {scenario.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Profile name
          <input
            name="name"
            onChange={updateField}
            required
            type="text"
            value={form.name}
          />
        </label>
      </div>

      <div className="form-grid single-field-grid">
        <label>
          Dietary need
          <select
            name="dietaryNeed"
            onChange={updateField}
            required
            value={form.dietaryNeed}
          >
            {DIETARY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <IngredientManager
        catalog={ingredientCatalog}
        ingredients={form.availableIngredients}
        onChange={updateIngredients}
      />

      <section className="disliked-manager">
        <div>
          <p className="eyebrow">Avoid</p>
          <h2>Disliked ingredients</h2>
          <p className="quiet-copy">
            DormEats will try to swap these out or down-rank recipes that rely on them.
          </p>
        </div>
        <div className="ingredient-entry-row">
          <label>
            Add disliked ingredients
            <input
              onChange={(event) => setDislikedInput(event.target.value)}
              onKeyDown={handleDislikedKeyDown}
              placeholder="peanut butter, mushrooms, tuna"
              type="text"
              value={dislikedInput}
            />
          </label>
          <button
            className="secondary-button"
            onClick={() => addDislikedIngredients(dislikedInput)}
            type="button"
          >
            <Plus size={17} />
            Add
          </button>
        </div>
        <div className="ingredient-chip-list" aria-label="Disliked ingredients">
          {form.dislikedIngredients.length === 0 ? (
            <p className="quiet-copy">No disliked ingredients added.</p>
          ) : (
            form.dislikedIngredients.map((item) => (
              <span className="ingredient-chip dislike-chip" key={item}>
                {item}
                <button
                  aria-label={`Remove disliked ${item}`}
                  onClick={() => removeDislikedIngredient(item)}
                  type="button"
                >
                  <X size={15} />
                </button>
              </span>
            ))
          )}
        </div>
      </section>

      <fieldset>
        <legend>
          <Refrigerator size={18} />
          Equipment
        </legend>
        <div className="chip-grid">
          {EQUIPMENT_OPTIONS.map((item) => (
            <label className="choice-chip" key={item}>
              <input
                checked={form.availableEquipment.includes(item)}
                onChange={() => toggleEquipment(item)}
                type="checkbox"
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="range-grid">
        <label>
          <span>
            <Clock size={18} />
            Time limit: {form.timeMinutes} min
          </span>
          <input
            max="120"
            min="5"
            name="timeMinutes"
            onChange={updateField}
            type="range"
            value={form.timeMinutes}
          />
          <div className="range-scale">
            <span>5 min</span>
            <span>120 min</span>
          </div>
        </label>

        <label>
          <span>
            <DollarSign size={18} />
            Budget: ${Number(form.budget).toFixed(2)}
          </span>
          <input
            max="40"
            min="1"
            name="budget"
            onChange={updateField}
            step="0.25"
            type="range"
            value={form.budget}
          />
          <div className="range-scale">
            <span>$1</span>
            <span>$40</span>
          </div>
        </label>
      </div>

      <button className="primary-button" disabled={loading} type="submit">
        <Sparkles size={18} />
        {loading ? "Finding meals..." : "Find dorm meals"}
      </button>
    </form>
  );
}
