import { FileText, Plus, ReceiptText, X } from "lucide-react";
import { useMemo, useState } from "react";
import { dormEatsApi } from "../services/api.js";

const SUGGESTED_INGREDIENTS = [
  "rice",
  "black beans",
  "egg",
  "frozen vegetables",
  "tortilla",
  "hummus",
  "spinach",
  "greek yogurt",
  "tuna",
  "ramen noodles",
  "tofu",
  "cheese",
  "salsa",
  "banana",
  "oats",
  "chickpeas"
];

function splitIngredients(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeInput(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularize(value) {
  return value
    .split(" ")
    .map((word) => {
      if (word.endsWith("ies") && word.length > 4) {
        return `${word.slice(0, -3)}y`;
      }
      if (word.endsWith("es") && word.length > 3) {
        return word.slice(0, -2);
      }
      if (word.endsWith("s") && word.length > 3) {
        return word.slice(0, -1);
      }
      return word;
    })
    .join(" ");
}

function catalogLookup(catalog) {
  const lookup = new Map();

  catalog.forEach((entry) => {
    const name = entry.name || entry;
    const normalizedName = normalizeInput(name);
    lookup.set(normalizedName, name);
    lookup.set(singularize(normalizedName), name);
    (entry.aliases || []).forEach((alias) => {
      const normalizedAlias = normalizeInput(alias);
      lookup.set(normalizedAlias, name);
      lookup.set(singularize(normalizedAlias), name);
    });
  });

  return lookup;
}

function canonicalizeIngredient(value, lookup) {
  const normalized = normalizeInput(value);
  if (!normalized) {
    return "";
  }

  return lookup.get(normalized) || lookup.get(singularize(normalized)) || normalized;
}

function searchCatalog(catalog, value, selectedIngredients) {
  const query = normalizeInput(value);
  if (!query) {
    return [];
  }

  const selected = new Set(selectedIngredients.map((item) => normalizeInput(item)));

  return catalog
    .map((entry) => {
      const name = entry.name || entry;
      const candidates = [name, ...(entry.aliases || [])].map(normalizeInput);
      let score = 0;

      candidates.forEach((candidate) => {
        if (candidate === query) {
          score = Math.max(score, 100);
        } else if (candidate.startsWith(query)) {
          score = Math.max(score, 80);
        } else if (candidate.includes(query)) {
          score = Math.max(score, 50);
        }
      });

      return { ...entry, name, score };
    })
    .filter((entry) => entry.score > 0 && !selected.has(normalizeInput(entry.name)))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 8);
}

function mergeIngredients(existing, additions, lookup = new Map()) {
  const seen = new Set(existing.map((item) => item.toLowerCase()));
  const merged = [...existing];

  additions.forEach((item) => {
    const normalized = canonicalizeIngredient(item, lookup);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(normalized);
  });

  return merged;
}

export default function IngredientManager({ catalog = [], ingredients, onChange }) {
  const [mode, setMode] = useState("manual");
  const [ingredientInput, setIngredientInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [receiptText, setReceiptText] = useState("");
  const [parseError, setParseError] = useState("");
  const [parsing, setParsing] = useState(false);
  const lookup = useMemo(() => catalogLookup(catalog), [catalog]);
  const autocompleteOptions = useMemo(
    () => searchCatalog(catalog, ingredientInput, ingredients),
    [catalog, ingredientInput, ingredients]
  );

  function addIngredients(rawValue) {
    const nextIngredients = splitIngredients(rawValue);
    if (nextIngredients.length === 0) {
      return;
    }

    onChange(mergeIngredients(ingredients, nextIngredients, lookup));
    setIngredientInput("");
    setHighlightedIndex(0);
  }

  function selectIngredient(item) {
    onChange(mergeIngredients(ingredients, [item], lookup));
    setIngredientInput("");
    setHighlightedIndex(0);
  }

  function removeIngredient(item) {
    onChange(
      ingredients.filter(
        (ingredient) => ingredient.toLowerCase() !== item.toLowerCase()
      )
    );
  }

  function handleManualKeyDown(event) {
    if (event.key === "ArrowDown" && autocompleteOptions.length > 0) {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % autocompleteOptions.length);
      return;
    }

    if (event.key === "ArrowUp" && autocompleteOptions.length > 0) {
      event.preventDefault();
      setHighlightedIndex(
        (current) => (current - 1 + autocompleteOptions.length) % autocompleteOptions.length
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (autocompleteOptions.length > 0 && ingredientInput.trim() && !ingredientInput.includes(",")) {
        selectIngredient(autocompleteOptions[highlightedIndex]?.name);
        return;
      }
      addIngredients(ingredientInput);
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!/\.(txt|csv)$/i.test(file.name)) {
      setParseError("Use a .txt or .csv receipt file for now.");
      return;
    }

    setReceiptText(await file.text());
    setParseError("");
  }

  async function parseReceipt() {
    setParsing(true);
    setParseError("");

    try {
      const response = await dormEatsApi.parseReceipt(receiptText);
      if (!response.ingredients.length) {
        setParseError("No grocery items were found. Try deleting store totals or payment lines.");
        return;
      }
      onChange(mergeIngredients(ingredients, response.ingredients, lookup));
    } catch (error) {
      setParseError(error.message);
    } finally {
      setParsing(false);
    }
  }

  return (
    <section className="ingredient-manager">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">Pantry</p>
          <h2>Ingredients on hand</h2>
        </div>
      </div>

      <div className="segmented-control" aria-label="Ingredient input mode">
        <button
          className={mode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
          type="button"
        >
          <Plus size={17} />
          Type ingredients
        </button>
        <button
          className={mode === "receipt" ? "active" : ""}
          onClick={() => setMode("receipt")}
          type="button"
        >
          <ReceiptText size={17} />
          Paste/upload receipt
        </button>
      </div>

      {mode === "manual" ? (
        <div className="ingredient-entry-row autocomplete-entry-row">
          <div className="autocomplete-field">
            <label>
              Add ingredients
              <input
                aria-autocomplete="list"
                aria-controls="ingredient-autocomplete-list"
                aria-expanded={autocompleteOptions.length > 0}
                onChange={(event) => {
                  setIngredientInput(event.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleManualKeyDown}
                placeholder="Start typing an ingredient"
                role="combobox"
                type="text"
                value={ingredientInput}
              />
            </label>
            <p className="quiet-copy autocomplete-help">
              Start typing an ingredient, then select it from the list. Press Enter to add a custom item.
            </p>
            {autocompleteOptions.length > 0 && (
              <div
                className="autocomplete-list"
                id="ingredient-autocomplete-list"
                role="listbox"
              >
                {autocompleteOptions.map((option, index) => (
                  <button
                    aria-selected={index === highlightedIndex}
                    className={index === highlightedIndex ? "active" : ""}
                    key={option.name}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectIngredient(option.name);
                    }}
                    role="option"
                    type="button"
                  >
                    <span>{option.name}</span>
                    <small>{option.category}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="secondary-button"
            onClick={() => addIngredients(ingredientInput)}
            type="button"
          >
            <Plus size={17} />
            Add
          </button>
        </div>
      ) : (
        <div className="receipt-panel">
          <label>
            Receipt text
            <textarea
              onChange={(event) => setReceiptText(event.target.value)}
              placeholder={"Paste grocery receipt text here:\nRice 4.99\nBlack beans 1.29\nFrozen vegetables 3.49"}
              rows={8}
              value={receiptText}
            />
          </label>
          <div className="receipt-actions">
            <label className="file-drop">
              <FileText size={18} />
              Upload .txt or .csv receipt
              <input accept=".txt,.csv,text/plain,text/csv" onChange={handleFileChange} type="file" />
            </label>
            <button
              className="primary-button"
              disabled={parsing || !receiptText.trim()}
              onClick={parseReceipt}
              type="button"
            >
              <ReceiptText size={17} />
              {parsing ? "Parsing..." : "Parse receipt"}
            </button>
          </div>
          <p className="quiet-copy">
            Paste receipt text or upload a text receipt for now. Image and PDF receipt parsing is not enabled.
          </p>
          {parseError && <p className="form-error">{parseError}</p>}
        </div>
      )}

      <div className="ingredient-chip-list" aria-label="Selected ingredients">
        {ingredients.length === 0 ? (
          <p className="quiet-copy">No ingredients added yet.</p>
        ) : (
          ingredients.map((item) => (
            <span className="ingredient-chip" key={item}>
              {item}
              <button
                aria-label={`Remove ${item}`}
                onClick={() => removeIngredient(item)}
                type="button"
              >
                <X size={15} />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="suggestion-panel">
        <h3>Suggested ingredients</h3>
        <div className="suggestion-chip-list">
          {SUGGESTED_INGREDIENTS.map((item) => {
            const selected = ingredients.some(
              (ingredient) => ingredient.toLowerCase() === item.toLowerCase()
            );

            return (
              <button
                className={selected ? "suggestion-chip selected" : "suggestion-chip"}
                disabled={selected}
                key={item}
                onClick={() => onChange(mergeIngredients(ingredients, [item], lookup))}
                type="button"
              >
                {selected ? "Added" : "Add"} {item}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
