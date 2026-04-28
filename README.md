# DormEats Phase 3

DormEats is an AI-assisted dorm meal planning tool for college students with limited time, budget, ingredients, and cooking equipment.

This Phase 3 implementation turns the Phase 2 Python prototype in `phase2/` into a full-stack web app. The original Phase 2 report, demo, evaluation script, seed data, and benchmark artifacts remain preserved.

## Project Structure

```text
backend/                 Express API for recipes, restaurants, and recommendations
frontend/                React DormEats web app
phase2/                  Original Python prototype and benchmark artifacts
Dockerfile               Production app image
docker-compose.yml       Local production-style app runner
.github/workflows/ci.yml GitHub Actions test/build workflow
```

## Phase 2 Logic Preserved

The JavaScript backend ports the recommender from `phase2/demo.py`:

- filter recipes by dietary tag
- filter recipes by available equipment, with `none` always allowed
- score recipes with pantry ingredient match as the strongest factor
- strongly down-rank recipes with no pantry matches or many missing groceries
- use a local ingredient substitution map to cover missing or disliked ingredients with pantry swaps when possible
- infer ingredient importance as `essential`, `helpful`, or `optional`; optional missing items can be omitted instead of added to the grocery list
- label recipes as `Ready to make`, `Almost there`, `Needs groceries`, or `Backup idea`
- explain each rank with ingredient match count, missing item count, dietary match, equipment match, time fit, and budget fit
- return ranked meal recommendations
- show matched ingredients and missing grocery items
- show step-by-step recipe instructions
- return local restaurant fallback recommendations

The Phase 3 UI supports dietary needs such as vegan, vegetarian, halal, gluten-free, dairy-free, nut-free, high-protein, low-cost/no preference, and no restriction. It also supports no-equipment recipes plus microwave, mini fridge, hot plate, pan, kettle, toaster, blender, rice cooker, and air fryer workflows. Time can be set from 5 to 120 minutes, and budget can be set from $1 to $40.

Additional Phase 3 UI features:

- ingredient autocomplete backed by a local 1,000+ item dorm-food catalog
- ingredient chips with manual add/remove controls and custom ingredient entry
- disliked ingredient chips so DormEats can suggest swaps or down-rank recipes that rely on them
- suggested ingredient chips for common dorm groceries
- local text/CSV receipt parsing into editable ingredient chips
- strict filters for make-now meals, recipes missing two or fewer items, and grocery-trip ideas
- one-click `I have this` actions on missing grocery chips that add the item to the pantry and refresh recommendations
- `My Recipes` page for manually creating custom recipes or importing JSON/CSV recipe files
- custom recipes are marked with a `Custom recipe` badge in recommendations
- combined grocery list generated from missing ingredients
- substitution cards labeled `Use what you have`, `Can omit`, or `Need to buy`
- saved meals/favorites stored in browser `localStorage`
- restaurant fallback ranking that considers dietary fit, budget fit, price level, and distance
- safety copy reminding users to verify dietary and allergy details against labels and restaurant information

Seed data is loaded from:

- `phase2/data/recipes.json`
- `backend/src/services/expandedRecipeSeed.js`
- `phase2/data/restaurants.json`
- `phase2/data/scenarios.json`

The local recipe seed now includes 500+ dorm-friendly recipes. The original Phase 2 recipes remain at the top of `phase2/data/recipes.json`; the backend then appends deterministic generated expansions from `expandedRecipeSeed.js` so the app has a large demo catalog without depending on an external recipe API. The catalog includes no-cook, microwave, kettle, toaster, hot plate, pan, blender, rice cooker, air fryer, mini-fridge, ramen variations, pasta dishes, tacos, burrito-style bowls, quesadillas, sandwiches, wraps, salads, oatmeal bowls, smoothies, mug meals, and pantry ideas. Recipes span quick five-minute snacks, hands-off meal prep up to 120 minutes, cheap meals under $5, mid-range meals, and grocery-trip meals up to the $40 app budget range.

## Ingredient Catalog And Autocomplete

DormEats includes a local generated ingredient catalog in `backend/src/services/ingredientCatalog.js`. It currently produces 1,000+ common dorm and college food items across pantry staples, frozen foods, canned foods, snacks, sauces, spices, proteins, dairy, dairy alternatives, grains, breads, noodles, produce, breakfast foods, and convenience foods.

The preferences form uses this catalog for autocomplete. Start typing in `Ingredients on hand`, choose a suggestion with the mouse or keyboard, and the selected ingredient becomes a removable chip. Press Enter when no suggestion fits to add a custom ingredient.

The same catalog powers alias normalization for recommendation matching, receipt parsing, recipe import normalization, and substitutions. For example, `black bean` maps to `black beans`, `instant ramen` maps to `ramen noodles`, and `mac n cheese` maps to `mac and cheese`. To add more ingredients later, extend the category arrays or `EXPLICIT_ALIASES` in `ingredientCatalog.js`; generated variants are built from those source lists.

## Ingredient Substitutions

DormEats uses a local, expandable substitution knowledge base in `backend/src/services/substitutionService.js`. It includes common dorm-friendly swaps such as milk to oat milk, tortilla to bread or pita, rice to ramen or couscous, beans to lentils or tofu, soy sauce to salt or coconut aminos, and peanut butter to sunflower butter.

For each recommendation, the backend checks missing and disliked ingredients against the user's pantry. A missing ingredient covered by a pantry substitute does not count as a grocery item. Optional ingredients can be omitted. Essential ingredients with no pantry substitute stay in the combined grocery list. Recipes with pantry substitutions rank higher than recipes that require more shopping.

## Requirements

- Node.js 20+
- npm 10+

MongoDB is not required. `DATASTORE=memory` loads the Phase 2 JSON data plus the local generated recipe expansion so the app works immediately.

## Environment

Copy the example file if you want local env files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Variables:

```bash
PORT=4000
CORS_ORIGIN=http://localhost:5173
DATASTORE=memory
VITE_API_URL=http://localhost:4000/api
```

## Install

```bash
npm install
```

The root package uses npm workspaces and installs both `backend/` and `frontend/`.

## Development

Run backend and frontend together:

```bash
npm run dev
```

Or run each side separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

## API

- `GET /api/health`
- `GET /api/recipes`
- `POST /api/recipes`
- `GET /api/restaurants`
- `GET /api/scenarios`
- `GET /api/ingredients/catalog`
- `POST /api/recipes/import`
- `POST /api/ingredients/parse-receipt`
- `POST /api/recommendations`

Receipt parsing is local and text-based. Paste receipt text or upload a `.txt`/`.csv` receipt in the UI; image and PDF receipt parsing are intentionally not enabled.

Example recommendation request:

```bash
curl -X POST http://localhost:4000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Exam week vegan student",
    "dietaryNeed": "vegan",
    "availableIngredients": ["tortilla", "hummus", "spinach", "cucumber"],
    "dislikedIngredients": ["peanut butter"],
    "availableEquipment": ["none", "microwave"],
    "timeMinutes": 10,
    "budget": 5
  }'
```

Example receipt parsing request:

```bash
curl -X POST http://localhost:4000/api/ingredients/parse-receipt \
  -H "Content-Type: application/json" \
  -d '{"receiptText":"Rice 4.99\nBlack Beans Can 1.29\nGreek Yogurt 5.49\nTOTAL 11.77"}'
```

### Custom Recipes And Import

Use the `My Recipes` page in the app to create recipes manually or preview and import `.json` / `.csv` recipe files. Custom recipes are validated by the backend, normalized into the same recipe shape as seeded recipes, marked with `source: "user"`, and added to the same recommendation pool. In memory mode, server-side custom recipes reset when the backend restarts. The browser also stores custom recipes in `localStorage` and attempts to restore them to the backend on app load.

Single recipe API format:

```bash
curl -X POST http://localhost:4000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Microwave Taco Bowl",
    "dietary_tags": ["halal", "high-protein"],
    "ingredients": ["rice", "black beans", "salsa", "cooked chicken"],
    "equipment": ["microwave"],
    "ingredient_importance": {
      "salsa": "helpful"
    },
    "time_minutes": 9,
    "estimated_cost": 6.25,
    "instructions": ["Warm rice and beans.", "Top with chicken and salsa."],
    "notes": "Fast after class."
  }'
```

JSON format:

```bash
curl -X POST http://localhost:4000/api/recipes/import \
  -H "Content-Type: application/json" \
  -d '{
    "recipes": [
      {
        "name": "Imported Toaster Banana Pocket",
        "dietary_tags": ["vegan", "vegetarian", "halal"],
        "ingredients": ["pita", "banana", "sunflower butter"],
        "equipment": ["toaster"],
        "ingredient_importance": {
          "sunflower butter": "essential"
        },
        "time_minutes": 6,
        "estimated_cost": 3.25,
        "instructions": ["Fill pita.", "Toast until warm."],
        "notes": "Simple toaster recipe import example."
      }
    ]
  }'
```

CSV format:

```bash
curl -X POST http://localhost:4000/api/recipes/import \
  -H "Content-Type: application/json" \
  -d '{
    "csvText": "name,dietary_tags,ingredients,equipment,time_minutes,estimated_cost,instructions,notes\nCSV Kettle Lentil Cup,vegan;halal;dairy-free,lentils;rice;spinach,kettle,20,4.25,Pour hot water;Cover until soft,Shelf-stable import example"
  }'
```

CSV list fields use semicolons, for example `vegan;halal`, `rice;beans`, and `Cook rice;Add toppings`.

JSON recipe imports may include an optional `ingredient_importance` object with ingredient names mapped to `essential`, `helpful`, or `optional`. You can also send ingredient objects such as `{ "name": "cilantro", "importance": "optional" }`; the backend stores the ingredient name and preserves the importance metadata.

External recipe search is not connected in Phase 3 because the app must work without paid APIs. A future integration could add a separate provider module that maps API results into the same recipe shape above, then feeds those normalized recipes through the existing validation and recommendation service.

## Tests

```bash
npm test
```

Backend tests cover recommendation scoring and API behavior. Frontend tests cover rendering ranked DormEats results.

## Production Build

```bash
npm run build
NODE_ENV=production npm start
```

In production mode, Express serves the compiled React app from `frontend/dist`.

## Docker

```bash
docker compose up --build
```

The production app is available at `http://localhost:4000`.
