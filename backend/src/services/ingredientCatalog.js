const EXPLICIT_ALIASES = {
  "almond milk": ["almond beverage"],
  "black beans": ["black bean", "blackbean", "black beans can", "canned black bean"],
  bread: ["sandwich bread", "white bread", "wheat bread"],
  "canned tuna": ["tuna can", "tuna packet", "tuna pouch"],
  "chicken nuggets": ["nuggets", "frozen chicken nuggets"],
  "cooked chicken": ["rotisserie chicken", "shredded chicken", "chicken breast"],
  "corn tortillas": ["corn tortilla"],
  crackers: ["cracker"],
  egg: ["eggs"],
  "frozen vegetables": ["frozen veggies", "mixed vegetables", "mixed veggies"],
  "green onion": ["green onions", "scallion", "scallions"],
  "greek yogurt": ["Greek yoghurt", "plain greek yogurt"],
  hummus: ["humus"],
  "instant noodles": ["instant noodle"],
  "mac and cheese": ["macaroni and cheese", "mac n cheese", "boxed mac and cheese"],
  mayo: ["mayonnaise"],
  milk: ["dairy milk"],
  oatmeal: ["oats", "instant oats", "rolled oats"],
  pasta: ["noodles", "spaghetti", "small pasta"],
  "peanut butter": ["pb", "peanut spread"],
  "pinto beans": ["pinto bean"],
  "ramen noodles": ["ramen", "instant ramen", "ramen noodle", "instant ramen noodles"],
  rice: ["white rice", "brown rice", "instant rice"],
  salsa: ["jar salsa"],
  "soy sauce": ["soya sauce"],
  tortilla: ["tortillas", "flour tortilla", "flour tortillas", "wrap"],
  "tortilla chips": ["chips", "corn chips"],
  tuna: ["canned tuna", "tuna packet", "tuna pouch"],
  yogurt: ["yoghurt"]
};

const CATEGORY_ITEMS = {
  grains: [
    "rice",
    "microwave rice",
    "sushi rice",
    "jasmine rice",
    "basmati rice",
    "brown rice",
    "quinoa",
    "couscous",
    "bulgur",
    "barley",
    "farro",
    "oatmeal",
    "steel cut oats",
    "quinoa flakes",
    "instant grits",
    "instant mashed potatoes",
    "polenta",
    "rice cakes",
    "rice crackers",
    "granola",
    "cereal",
    "corn flakes",
    "cheerios",
    "protein cereal"
  ],
  noodles: [
    "ramen noodles",
    "instant noodles",
    "rice noodles",
    "vermicelli noodles",
    "macaroni",
    "mac and cheese",
    "pasta",
    "spaghetti",
    "penne",
    "rotini",
    "fettuccine",
    "angel hair pasta",
    "tortellini",
    "ravioli",
    "gnocchi",
    "udon noodles",
    "soba noodles",
    "lo mein noodles",
    "egg noodles",
    "cooked noodles",
    "cooked pasta"
  ],
  breads: [
    "bread",
    "whole wheat bread",
    "sourdough bread",
    "bagel",
    "bagel thin",
    "english muffin",
    "pita",
    "flatbread",
    "naan",
    "tortilla",
    "corn tortillas",
    "taco shells",
    "tostada shells",
    "buns",
    "burger buns",
    "hot dog buns",
    "waffles",
    "pancakes",
    "protein pancakes",
    "crackers",
    "whole grain crackers",
    "pretzels",
    "tortilla chips",
    "pita chips"
  ],
  beans: [
    "black beans",
    "pinto beans",
    "kidney beans",
    "white beans",
    "garbanzo beans",
    "chickpeas",
    "lentils",
    "red lentils",
    "cooked lentils",
    "refried beans",
    "baked beans",
    "split peas",
    "edamame",
    "black eyed peas",
    "navy beans",
    "cannellini beans",
    "great northern beans",
    "bean dip",
    "vegan chili",
    "chili beans"
  ],
  proteins: [
    "egg",
    "hard boiled eggs",
    "tofu",
    "silken tofu",
    "tempeh",
    "paneer",
    "cooked chicken",
    "chicken strips",
    "chicken thighs",
    "chicken nuggets",
    "ground turkey",
    "cooked turkey",
    "turkey slices",
    "turkey sausage",
    "turkey patty",
    "turkey meatballs",
    "deli turkey",
    "tuna",
    "canned tuna",
    "salmon",
    "cooked salmon",
    "smoked salmon",
    "salmon fillet",
    "shrimp",
    "steak strips",
    "beef strips",
    "falafel",
    "falafel mix",
    "protein powder",
    "plant protein powder",
    "veggie burger",
    "meatless crumbles",
    "seitan",
    "hummus"
  ],
  dairy: [
    "milk",
    "oat milk",
    "almond milk",
    "soy milk",
    "coconut milk",
    "coconut milk powder",
    "oat milk powder",
    "cheese",
    "cheddar",
    "mozzarella",
    "vegan mozzarella",
    "swiss cheese",
    "parmesan",
    "feta",
    "cream cheese",
    "ricotta",
    "brie",
    "halloumi",
    "cheese cubes",
    "cheese sauce",
    "cheddar powder",
    "milk powder",
    "yogurt",
    "greek yogurt",
    "cottage cheese",
    "sour cream",
    "butter"
  ],
  produce: [
    "apple",
    "banana",
    "berries",
    "strawberries",
    "blueberries",
    "raspberries",
    "blackberries",
    "grapes",
    "pear",
    "orange",
    "pineapple",
    "mango",
    "frozen mango",
    "watermelon",
    "dates",
    "raisins",
    "avocado",
    "spinach",
    "romaine",
    "lettuce",
    "slaw mix",
    "cucumber",
    "carrot",
    "baby carrots",
    "celery",
    "tomato",
    "tomatoes",
    "bell pepper",
    "frozen peppers",
    "onion",
    "green onion",
    "broccoli",
    "cauliflower",
    "green beans",
    "peas",
    "frozen peas",
    "corn",
    "zucchini",
    "eggplant",
    "mushrooms",
    "baby potatoes",
    "potato",
    "sweet potato",
    "cilantro",
    "parsley",
    "basil",
    "mint",
    "dill",
    "ginger",
    "garlic",
    "lime",
    "lemon"
  ],
  sauces: [
    "soy sauce",
    "tamari",
    "teriyaki sauce",
    "coconut aminos",
    "salsa",
    "green enchilada sauce",
    "pizza sauce",
    "marinara",
    "tomato sauce",
    "tomato paste",
    "tomato soup",
    "pesto",
    "basil pesto",
    "bbq sauce",
    "buffalo sauce",
    "hot sauce",
    "sriracha",
    "ketchup",
    "mustard",
    "honey mustard",
    "mayo",
    "caesar dressing",
    "vegan ranch",
    "tahini",
    "tahini sauce",
    "peanut sauce",
    "peanut butter",
    "sunflower butter",
    "almond butter",
    "pickle relish",
    "cranberry sauce",
    "balsamic glaze",
    "olive oil",
    "vegetable oil",
    "sesame oil",
    "coconut oil",
    "lemon juice",
    "lime juice",
    "rice vinegar",
    "maple syrup",
    "honey"
  ],
  spices: [
    "salt",
    "black pepper",
    "lemon pepper",
    "garlic powder",
    "onion powder",
    "cumin",
    "paprika",
    "chili powder",
    "curry powder",
    "taco seasoning",
    "fajita seasoning",
    "biryani spice",
    "shawarma spice",
    "cajun seasoning",
    "italian seasoning",
    "oregano",
    "turmeric",
    "garam masala",
    "cinnamon",
    "cardamom",
    "ginger paste",
    "red pepper flakes",
    "sesame seeds",
    "chia seeds",
    "hemp seeds",
    "pumpkin seeds",
    "cocoa powder",
    "nutritional yeast",
    "bouillon",
    "vegetable bouillon",
    "pho broth powder",
    "miso paste"
  ],
  convenience: [
    "frozen vegetables",
    "canned vegetables",
    "fresh vegetables",
    "frozen broccoli",
    "frozen corn",
    "frozen spinach",
    "frozen berries",
    "frozen fruit",
    "frozen waffles",
    "frozen pizza",
    "pizza rolls",
    "frozen burrito",
    "breakfast burrito",
    "frozen fries",
    "sweet potato fries",
    "frozen dumplings",
    "instant ramen cup",
    "cup noodles",
    "rice packets",
    "soup mix",
    "split pea soup mix",
    "trail mix",
    "granola bars",
    "protein bars",
    "popcorn",
    "chips",
    "pickles",
    "olives",
    "nori",
    "kimchi",
    "fried onions",
    "jarred jalapenos",
    "jalapenos"
  ]
};

const FORM_PREFIXES = {
  produce: ["fresh", "frozen", "canned", "diced", "sliced", "chopped"],
  proteins: ["cooked", "grilled", "frozen", "canned", "deli", "shredded"],
  beans: ["canned", "dry", "seasoned", "low sodium"],
  grains: ["instant", "microwave", "quick", "whole grain"],
  noodles: ["instant", "microwave", "whole wheat"],
  breads: ["whole wheat", "mini", "toasted"],
  sauces: ["spicy", "mild", "low sodium"],
  dairy: ["shredded", "sliced", "low fat", "plain"],
  convenience: ["frozen", "mini", "family size"],
  spices: ["ground", "dried"]
};

const FLAVORS = [
  "buffalo",
  "bbq",
  "teriyaki",
  "sweet chili",
  "garlic herb",
  "lemon pepper",
  "taco",
  "ranch",
  "chipotle",
  "thai peanut",
  "curry",
  "honey mustard",
  "sriracha",
  "korean bbq",
  "cajun",
  "italian",
  "everything bagel",
  "cinnamon",
  "vanilla",
  "chocolate"
];

const SNACK_BASES = [
  "chips",
  "pretzels",
  "crackers",
  "popcorn",
  "granola bars",
  "protein bars",
  "rice cakes",
  "trail mix",
  "cereal cups",
  "fruit cups",
  "applesauce cups",
  "pudding cups",
  "yogurt cups",
  "cheese sticks",
  "beef jerky",
  "turkey jerky",
  "seaweed snacks",
  "nut mix",
  "sunflower seeds",
  "pumpkin seeds"
];

function normalizeIngredientInput(value) {
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

function titleCase(value) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function addEntry(entries, index, name, category, aliases = []) {
  const cleanName = normalizeIngredientInput(name);
  if (!cleanName || index.has(cleanName)) {
    return;
  }

  const aliasSet = new Set([
    ...(EXPLICIT_ALIASES[cleanName] || []),
    ...aliases,
    singularize(cleanName)
  ]);

  entries.push({
    name: cleanName,
    displayName: titleCase(cleanName),
    category,
    aliases: [...aliasSet]
      .map(normalizeIngredientInput)
      .filter((alias) => alias && alias !== cleanName)
      .sort()
  });
  index.add(cleanName);
}

function buildIngredientCatalog() {
  const entries = [];
  const index = new Set();

  Object.entries(CATEGORY_ITEMS).forEach(([category, items]) => {
    items.forEach((item) => addEntry(entries, index, item, category));

    const prefixes = FORM_PREFIXES[category] || [];
    prefixes.forEach((prefix) => {
      items.forEach((item) => {
        const name = `${prefix} ${item}`;
        addEntry(entries, index, name, category, [item]);
      });
    });
  });

  FLAVORS.forEach((flavor) => {
    [...SNACK_BASES, "ramen noodles", "mac and cheese", "rice cakes", "crackers"].forEach(
      (base) => addEntry(entries, index, `${flavor} ${base}`, "flavored foods", [base])
    );
  });

  CATEGORY_ITEMS.proteins.forEach((protein) => {
    CATEGORY_ITEMS.sauces.slice(0, 24).forEach((sauce) => {
      addEntry(entries, index, `${sauce} ${protein}`, "prepared proteins", [
        protein,
        sauce
      ]);
    });
  });

  CATEGORY_ITEMS.produce.forEach((produce) => {
    ["salad mix", "snack pack", "steam bag", "stir fry mix"].forEach((form) => {
      addEntry(entries, index, `${produce} ${form}`, "produce", [produce]);
    });
  });

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

let cachedCatalog;
let cachedAliasIndex;
let cachedEntryIndex;

function getIngredientCatalog() {
  if (!cachedCatalog) {
    cachedCatalog = buildIngredientCatalog();
  }

  return cachedCatalog;
}

function getAliasIndex() {
  if (!cachedAliasIndex) {
    cachedAliasIndex = new Map();
    const setAlias = (alias, canonicalName) => {
      const normalizedAlias = normalizeIngredientInput(alias);
      if (normalizedAlias && !cachedAliasIndex.has(normalizedAlias)) {
        cachedAliasIndex.set(normalizedAlias, canonicalName);
      }
    };

    const catalog = getIngredientCatalog();

    catalog.forEach((entry) => {
      setAlias(entry.name, entry.name);
      setAlias(singularize(normalizeIngredientInput(entry.name)), entry.name);
    });

    catalog.forEach((entry) => {
      entry.aliases.forEach((alias) => {
        setAlias(alias, entry.name);
        setAlias(singularize(normalizeIngredientInput(alias)), entry.name);
      });
    });
  }

  return cachedAliasIndex;
}

function canonicalizeIngredient(value) {
  const normalized = normalizeIngredientInput(value);
  if (!normalized) {
    return "";
  }

  const aliasIndex = getAliasIndex();
  return (
    aliasIndex.get(normalized) ||
    aliasIndex.get(singularize(normalized)) ||
    normalized
  );
}

function ingredientMatches(left, right) {
  const leftNormalized = normalizeIngredientInput(left);
  const rightNormalized = normalizeIngredientInput(right);
  const leftCanonical = canonicalizeIngredient(left);
  const rightCanonical = canonicalizeIngredient(right);

  if (!leftNormalized || !rightNormalized) {
    return false;
  }

  if (leftCanonical === rightCanonical) {
    return true;
  }

  if (!cachedEntryIndex) {
    cachedEntryIndex = new Map(
      getIngredientCatalog().map((entry) => [entry.name, entry])
    );
  }

  const leftEntry = cachedEntryIndex.get(leftCanonical);
  const rightEntry = cachedEntryIndex.get(rightCanonical);

  return Boolean(
    leftEntry?.aliases.includes(rightNormalized) ||
      leftEntry?.aliases.includes(rightCanonical) ||
      rightEntry?.aliases.includes(leftNormalized) ||
      rightEntry?.aliases.includes(leftCanonical)
  );
}

function normalizeIngredientList(values) {
  if (Array.isArray(values)) {
    return values
      .flatMap((value) => String(value).split(","))
      .map(canonicalizeIngredient)
      .filter(Boolean);
  }

  if (typeof values === "string") {
    return values
      .split(",")
      .map(canonicalizeIngredient)
      .filter(Boolean);
  }

  return [];
}

function searchIngredientCatalog(query = "", limit = 20) {
  const normalizedQuery = normalizeIngredientInput(query);
  const maxResults = Math.max(1, Math.min(Number(limit) || 20, 100));
  const catalog = getIngredientCatalog();

  if (!normalizedQuery) {
    return catalog.slice(0, maxResults);
  }

  return catalog
    .map((entry) => {
      const haystack = [entry.name, ...entry.aliases];
      let score = 0;

      haystack.forEach((value) => {
        if (value === normalizedQuery) {
          score = Math.max(score, 100);
        } else if (value.startsWith(normalizedQuery)) {
          score = Math.max(score, 80);
        } else if (value.includes(normalizedQuery)) {
          score = Math.max(score, 50);
        }
      });

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, maxResults)
    .map((item) => item.entry);
}

module.exports = {
  canonicalizeIngredient,
  getIngredientCatalog,
  ingredientMatches,
  normalizeIngredientInput,
  normalizeIngredientList,
  searchIngredientCatalog,
  singularize
};
