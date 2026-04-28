import { FileUp, Plus, Save, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { dormEatsApi } from "../services/api.js";

export const CUSTOM_RECIPES_KEY = "dormeats-custom-recipes";

const DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "halal",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "high-protein",
  "no restriction"
];

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

function emptyRecipe() {
  return {
    name: "",
    dietary_tags: [],
    ingredients: [],
    equipment: ["none"],
    time_minutes: 15,
    estimated_cost: 5,
    instructions: [],
    notes: ""
  };
}

function splitList(value) {
  return String(value || "")
    .split(/[,;\n|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeUnique(existing, additions) {
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

function loadCustomRecipes() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY)) || [];
  } catch (_error) {
    return [];
  }
}

export function saveCustomRecipes(recipes) {
  localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
}

export function rememberCustomRecipes(newRecipes) {
  const existing = loadCustomRecipes();
  const byName = new Map(existing.map((recipe) => [recipe.name.toLowerCase(), recipe]));

  newRecipes.forEach((recipe) => {
    byName.set(recipe.name.toLowerCase(), recipe);
  });

  const nextRecipes = [...byName.values()];
  saveCustomRecipes(nextRecipes);
  return nextRecipes;
}

function parseCsv(csvText) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === "\"" && inQuotes && nextChar === "\"") {
      field += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field.trim());
      field = "";
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function recipesFromCsv(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new Error("CSV needs a header row and at least one recipe.");
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows.slice(1).map((row) =>
    headers.reduce((recipe, header, index) => {
      recipe[header] = row[index] || "";
      return recipe;
    }, {})
  );
}

function readFileText(file) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read recipe file."));
    reader.readAsText(file);
  });
}

function normalizeRecipe(rawRecipe) {
  const timeValue = rawRecipe.time_minutes ?? rawRecipe.timeMinutes;
  const costValue = rawRecipe.estimated_cost ?? rawRecipe.estimatedCost;

  return {
    name: String(rawRecipe.name || "").trim(),
    dietary_tags: splitList(rawRecipe.dietary_tags ?? rawRecipe.dietaryTags),
    ingredients: splitList(rawRecipe.ingredients),
    equipment: splitList(rawRecipe.equipment),
    time_minutes: Number(timeValue),
    estimated_cost: Number(String(costValue ?? "").replace("$", "")),
    instructions: splitList(rawRecipe.instructions),
    notes: String(rawRecipe.notes || "").trim(),
    source: "user"
  };
}

function validateRecipe(recipe, label = "Recipe") {
  const errors = [];

  if (!recipe.name) {
    errors.push(`${label}: name is required.`);
  }
  if (recipe.dietary_tags.length === 0) {
    errors.push(`${label}: add at least one dietary tag.`);
  }
  if (recipe.ingredients.length === 0) {
    errors.push(`${label}: add at least one ingredient.`);
  }
  if (recipe.equipment.length === 0) {
    errors.push(`${label}: add at least one equipment item.`);
  }
  if (!Number.isFinite(recipe.time_minutes) || recipe.time_minutes <= 0 || recipe.time_minutes > 120) {
    errors.push(`${label}: time must be between 1 and 120 minutes.`);
  }
  if (!Number.isFinite(recipe.estimated_cost) || recipe.estimated_cost < 0 || recipe.estimated_cost > 40) {
    errors.push(`${label}: cost must be between $0 and $40.`);
  }
  if (recipe.instructions.length === 0) {
    errors.push(`${label}: add at least one instruction step.`);
  }

  return errors;
}

function ChipList({ items, onRemove }) {
  if (items.length === 0) {
    return <p className="quiet-copy">None added yet.</p>;
  }

  return (
    <div className="ingredient-chip-list">
      {items.map((item) => (
        <span className="ingredient-chip" key={item}>
          {item}
          <button
            aria-label={`Remove ${item}`}
            onClick={() => onRemove(item)}
            type="button"
          >
            <X size={15} />
          </button>
        </span>
      ))}
    </div>
  );
}

function ChipInput({ label, onAdd, placeholder }) {
  const [value, setValue] = useState("");

  function addValue() {
    onAdd(splitList(value));
    setValue("");
  }

  return (
    <div className="ingredient-entry-row">
      <label>
        {label}
        <input
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      </label>
      <button className="secondary-button" onClick={addValue} type="button">
        <Plus size={17} />
        Add
      </button>
    </div>
  );
}

export default function MyRecipesPage({ onRecipesChanged }) {
  const [recipe, setRecipe] = useState(emptyRecipe);
  const [manualMessage, setManualMessage] = useState("");
  const [manualErrors, setManualErrors] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [previewRecipes, setPreviewRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState(loadCustomRecipes);

  const previewValidation = useMemo(
    () => previewRecipes.flatMap((item, index) => validateRecipe(item, `Recipe ${index + 1}`)),
    [previewRecipes]
  );

  function updateRecipeField(event) {
    const { name, value } = event.target;
    setRecipe((current) => ({
      ...current,
      [name]: value
    }));
  }

  function toggleListValue(field, item) {
    setRecipe((current) => {
      const exists = current[field].some(
        (value) => value.toLowerCase() === item.toLowerCase()
      );
      return {
        ...current,
        [field]: exists
          ? current[field].filter((value) => value.toLowerCase() !== item.toLowerCase())
          : [...current[field], item]
      };
    });
  }

  function addListValues(field, values) {
    setRecipe((current) => ({
      ...current,
      [field]: mergeUnique(current[field], values)
    }));
  }

  function removeListValue(field, item) {
    setRecipe((current) => ({
      ...current,
      [field]: current[field].filter(
        (value) => value.toLowerCase() !== item.toLowerCase()
      )
    }));
  }

  function instructionText() {
    return recipe.instructions.join("\n");
  }

  async function handleManualSubmit(event) {
    event.preventDefault();
    setManualMessage("");
    setManualErrors([]);

    const normalized = normalizeRecipe(recipe);
    const errors = validateRecipe(normalized);
    if (errors.length > 0) {
      setManualErrors(errors);
      return;
    }

    try {
      const response = await dormEatsApi.createRecipe(normalized);
      const nextSaved = rememberCustomRecipes([response.recipe]);
      setSavedRecipes(nextSaved);
      setRecipe(emptyRecipe());
      setManualMessage(`${response.recipe.name} was added to DormEats.`);
      onRecipesChanged?.();
    } catch (error) {
      setManualErrors([error.message]);
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    setPreviewRecipes([]);
    setImportErrors([]);
    setImportMessage("");

    if (!file) {
      return;
    }

    try {
      const text = await readFileText(file);
      let rawRecipes;
      if (/\.json$/i.test(file.name)) {
        const parsed = JSON.parse(text);
        rawRecipes = parsed.recipes || parsed;
      } else {
        rawRecipes = recipesFromCsv(text);
      }
      if (!Array.isArray(rawRecipes)) {
        throw new Error("JSON import must be an array or an object with a recipes array.");
      }
      setPreviewRecipes(rawRecipes.map(normalizeRecipe));
    } catch (error) {
      setImportErrors([error.message]);
    } finally {
      event.target.value = "";
    }
  }

  async function handleImport() {
    setImportErrors([]);
    setImportMessage("");

    if (previewValidation.length > 0) {
      setImportErrors(previewValidation);
      return;
    }

    try {
      const response = await dormEatsApi.importRecipes({ recipes: previewRecipes });
      const nextSaved = rememberCustomRecipes(response.recipes);
      setSavedRecipes(nextSaved);
      setPreviewRecipes([]);
      setImportMessage(`${response.importedCount} recipe${response.importedCount === 1 ? "" : "s"} imported.`);
      onRecipesChanged?.();
    } catch (error) {
      setImportErrors([error.message]);
    }
  }

  return (
    <section className="page-layout my-recipes-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">My Recipes</p>
          <h1>Add custom dorm meals</h1>
        </div>
      </div>

      <section className="content-panel">
        <form className="recipe-builder-form" onSubmit={handleManualSubmit}>
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Manual entry</p>
              <h2>Create a recipe</h2>
            </div>
          </div>

          {manualErrors.length > 0 && (
            <div className="form-error">
              {manualErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
          {manualMessage && <p className="form-success">{manualMessage}</p>}

          <div className="form-grid">
            <label>
              Recipe name
              <input
                name="name"
                onChange={updateRecipeField}
                type="text"
                value={recipe.name}
              />
            </label>
            <label>
              Estimated time: {recipe.time_minutes} min
              <input
                max="120"
                min="1"
                name="time_minutes"
                onChange={updateRecipeField}
                type="range"
                value={recipe.time_minutes}
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Estimated cost
              <input
                max="40"
                min="0"
                name="estimated_cost"
                onChange={updateRecipeField}
                step="0.25"
                type="number"
                value={recipe.estimated_cost}
              />
            </label>
            <label>
              Notes
              <input
                name="notes"
                onChange={updateRecipeField}
                placeholder="Why this works well in a dorm"
                type="text"
                value={recipe.notes}
              />
            </label>
          </div>

          <fieldset>
            <legend>Dietary tags</legend>
            <div className="chip-grid">
              {DIETARY_TAGS.map((tag) => (
                <label className="choice-chip" key={tag}>
                  <input
                    checked={recipe.dietary_tags.includes(tag)}
                    onChange={() => toggleListValue("dietary_tags", tag)}
                    type="checkbox"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Required equipment</legend>
            <div className="chip-grid">
              {EQUIPMENT_OPTIONS.map((item) => (
                <label className="choice-chip" key={item}>
                  <input
                    checked={recipe.equipment.includes(item)}
                    onChange={() => toggleListValue("equipment", item)}
                    type="checkbox"
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>

          <section className="recipe-chip-section">
            <ChipInput
              label="Add ingredients"
              onAdd={(values) => addListValues("ingredients", values)}
              placeholder="rice, black beans, salsa"
            />
            <ChipList
              items={recipe.ingredients}
              onRemove={(item) => removeListValue("ingredients", item)}
            />
          </section>

          <label>
            Step-by-step instructions
            <textarea
              onChange={(event) =>
                setRecipe((current) => ({
                  ...current,
                  instructions: event.target.value
                    .split("\n")
                    .map((step) => step.trim())
                    .filter(Boolean)
                }))
              }
              placeholder={"Warm rice.\nAdd beans and salsa.\nTop with cheese."}
              rows={5}
              value={instructionText()}
            />
          </label>

          <button className="primary-button" type="submit">
            <Save size={18} />
            Save custom recipe
          </button>
        </form>
      </section>

      <section className="content-panel import-panel">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Import</p>
            <h2>Upload JSON or CSV recipes</h2>
          </div>
        </div>

        <label className="file-drop">
          <FileUp size={18} />
          Choose .json or .csv file
          <input accept=".json,.csv,application/json,text/csv" onChange={handleFileChange} type="file" />
        </label>
        <p className="quiet-copy">
          Preview recipes before importing. CSV list fields use semicolons, such as
          vegan;halal or rice;beans;salsa.
        </p>

        {importErrors.length > 0 && (
          <div className="form-error">
            {importErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        {importMessage && <p className="form-success">{importMessage}</p>}

        {previewRecipes.length > 0 && (
          <div className="recipe-preview-panel">
            <h3>Preview</h3>
            <div className="recipe-preview-list">
              {previewRecipes.map((item) => (
                <article className="recipe-preview-card" key={item.name}>
                  <h4>{item.name || "Untitled recipe"}</h4>
                  <p>
                    {item.time_minutes || 0} min · $
                    {Number(item.estimated_cost || 0).toFixed(2)}
                  </p>
                  <p className="quiet-copy">{item.ingredients.join(", ")}</p>
                </article>
              ))}
            </div>
            {previewValidation.length > 0 && (
              <div className="form-error">
                {previewValidation.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
            <button
              className="primary-button"
              disabled={previewValidation.length > 0}
              onClick={handleImport}
              type="button"
            >
              <Upload size={18} />
              Import previewed recipes
            </button>
          </div>
        )}
      </section>

      <section className="content-panel saved-custom-recipes">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Saved locally</p>
            <h2>Custom recipes in this browser</h2>
          </div>
        </div>
        {savedRecipes.length === 0 ? (
          <p className="quiet-copy">No custom recipes saved yet.</p>
        ) : (
          <div className="recipe-preview-list">
            {savedRecipes.map((item) => (
              <article className="recipe-preview-card" key={item.name}>
                <h4>{item.name}</h4>
                <p>
                  {item.time_minutes} min · ${Number(item.estimated_cost).toFixed(2)}
                </p>
                <p className="quiet-copy">{item.dietary_tags.join(", ")}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
