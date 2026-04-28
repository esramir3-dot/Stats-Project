function recipeKey(name) {
  return String(name || "").trim().toLowerCase();
}

function buildSteps(family, variant) {
  if (variant.instructions) {
    return variant.instructions;
  }

  const ingredientText = variant.ingredients.join(", ");

  const stepsByFamily = {
    noCook: [
      `Gather ${ingredientText}.`,
      "Slice, drain, or rinse anything that needs quick prep.",
      "Layer everything in a bowl, wrap, plate, or container and season to taste."
    ],
    microwave: [
      `Add ${ingredientText} to a microwave-safe bowl or mug as appropriate.`,
      "Microwave in short bursts, stirring between rounds so it heats evenly.",
      "Let it stand for one minute, then add any cold toppings and serve."
    ],
    kettle: [
      `Place the dry or shelf-stable ingredients for ${variant.shortName} in a heat-safe bowl.`,
      "Pour hot kettle water over the ingredients and cover until softened.",
      "Stir in the seasonings and toppings before eating."
    ],
    toaster: [
      "Toast the bread, bagel, waffle, or pita until crisp.",
      `Add ${ingredientText} in layers so the sturdy ingredients sit on the bottom.`,
      "Warm briefly if needed, then slice or fold for an easy dorm meal."
    ],
    hotPlate: [
      "Warm a lightly oiled pan on the hot plate.",
      `Cook ${ingredientText} in stages, starting with the firmest ingredients.`,
      "Season, turn off the hot plate, and serve from the pan or over the base."
    ],
    blender: [
      `Add ${ingredientText} to the blender with the liquid first.`,
      "Blend until smooth, pausing to scrape the sides if needed.",
      "Pour into a cup or bowl and add toppings if included."
    ],
    riceCooker: [
      `Add ${ingredientText} to the rice cooker insert with the needed water or broth.`,
      "Run the cook cycle and keep the lid closed until the cycle finishes.",
      "Rest for five minutes, fluff or stir, and portion leftovers safely."
    ],
    airFryer: [
      `Toss ${ingredientText} with seasoning in a bowl or container.`,
      "Air fry in a single layer, shaking the basket halfway through.",
      "Check that proteins are hot through, then plate with the sauce or side."
    ],
    fridgePantry: [
      `Pull ${ingredientText} from the mini fridge or pantry.`,
      "Slice, drain, or portion ingredients into a plate, jar, or container.",
      "Chill, pack, or eat immediately depending on the meal."
    ]
  };

  return stepsByFamily[family] || stepsByFamily.noCook;
}

function buildRecipe(family, defaults, variant) {
  return {
    name: variant.name,
    dietary_tags: variant.tags,
    ingredients: variant.ingredients,
    equipment: variant.equipment || defaults.equipment,
    time_minutes: variant.time,
    estimated_cost: variant.cost,
    instructions: buildSteps(family, variant),
    notes: variant.notes || defaults.notes
  };
}

const RECIPE_FAMILIES = [
  {
    family: "noCook",
    defaults: {
      equipment: ["none"],
      notes: "No stove, oven, or shared kitchen required."
    },
    variants: [
      ["No-Cook Avocado White Bean Pita", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["pita", "white beans", "avocado", "lemon juice", "spinach"], 8, 5.25],
      ["No-Cook Buffalo Chickpea Lettuce Cups", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["chickpeas", "lettuce", "buffalo sauce", "celery", "tortilla chips"], 9, 4.9],
      ["No-Cook Turkey Cheddar Rollups", ["halal", "high-protein", "nut-free", "no restriction"], ["turkey slices", "cheddar", "tortilla", "spinach", "mustard"], 7, 6.75],
      ["No-Cook Peanut Sesame Noodle Cup", ["vegan", "vegetarian", "dairy-free", "halal"], ["cooked noodles", "peanut butter", "soy sauce", "cucumber", "sesame seeds"], 8, 4.5],
      ["No-Cook Cottage Cheese Tomato Bowl", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["cottage cheese", "tomato", "cucumber", "black pepper", "crackers"], 6, 5.8],
      ["No-Cook Lentil Tabouli Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["cooked lentils", "parsley", "cucumber", "tomato", "lemon juice"], 10, 6.4],
      ["No-Cook Smoked Salmon Cucumber Stack", ["gluten-free", "dairy-free", "nut-free", "high-protein", "no restriction"], ["smoked salmon", "cucumber", "rice cakes", "cream cheese", "dill"], 9, 11.5],
      ["No-Cook Apple Cheddar Protein Plate", ["vegetarian", "halal", "nut-free"], ["apple", "cheddar", "whole grain crackers", "hard boiled eggs", "grapes"], 7, 7.25],
      ["No-Cook Vegan Sushi Snack Wrap", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["nori", "microwave rice", "avocado", "cucumber", "soy sauce"], 10, 6.9],
      ["No-Cook Black Bean Corn Salad Jar", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free", "low-cost"], ["black beans", "corn", "salsa", "lime", "lettuce"], 8, 3.95],
      ["No-Cook Greek Tuna Cucumber Boats", ["halal", "gluten-free", "high-protein", "nut-free"], ["tuna", "cucumber", "greek yogurt", "olives", "lemon pepper"], 9, 6.25],
      ["No-Cook Sunflower Butter Banana Wrap", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["tortilla", "sunflower butter", "banana", "chia seeds", "cinnamon"], 6, 3.6],
      ["No-Cook Caprese Pesto Pita", ["vegetarian", "halal", "nut-free"], ["pita", "mozzarella", "tomato", "basil pesto", "spinach"], 8, 7.4],
      ["No-Cook Edamame Rice Cracker Bento", ["vegan", "vegetarian", "halal", "dairy-free", "gluten-free"], ["edamame", "rice crackers", "carrots", "hummus", "grapes"], 7, 6.8],
      ["No-Cook Chicken Caesar Wrap", ["halal", "high-protein", "nut-free", "no restriction"], ["cooked chicken", "tortilla", "romaine", "caesar dressing", "parmesan"], 8, 8.6],
      ["No-Cook Mango Black Bean Tostadas", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["tostada shells", "black beans", "mango", "lime", "cilantro"], 10, 5.75],
      ["No-Cook Yogurt Trail Mix Bowl", ["vegetarian", "halal", "high-protein"], ["greek yogurt", "granola", "berries", "pumpkin seeds", "honey"], 5, 5.95],
      ["No-Cook Pantry Nacho Plate", ["vegetarian", "halal", "gluten-free", "nut-free", "low-cost"], ["tortilla chips", "refried beans", "salsa", "cheese", "jalapenos"], 6, 4.75]
    ]
  },
  {
    family: "microwave",
    defaults: {
      equipment: ["microwave"],
      notes: "Uses a microwave-safe bowl or mug for a fast dorm meal."
    },
    variants: [
      ["Microwave Kimchi Rice Egg Bowl", ["vegetarian", "halal", "gluten-free", "high-protein"], ["rice", "kimchi", "egg", "green onion", "sesame oil"], 11, 5.25],
      ["Microwave BBQ Chicken Corn Bowl", ["halal", "gluten-free", "high-protein", "nut-free"], ["microwave rice", "cooked chicken", "corn", "bbq sauce", "cheddar"], 10, 7.9],
      ["Microwave Broccoli Cheddar Mug Pasta", ["vegetarian", "halal", "nut-free"], ["small pasta", "broccoli", "cheddar", "milk", "garlic powder"], 12, 5.4],
      ["Microwave Chickpea Coconut Curry", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free"], ["chickpeas", "coconut milk", "curry powder", "spinach", "microwave rice"], 14, 7.25],
      ["Microwave Turkey Chili Cup", ["halal", "gluten-free", "dairy-free", "nut-free", "high-protein"], ["cooked turkey", "kidney beans", "tomatoes", "chili powder", "corn"], 13, 8.5],
      ["Microwave Spinach Feta Egg Mug", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["eggs", "spinach", "feta", "milk", "black pepper"], 6, 4.6],
      ["Microwave Vegan Chili Mac", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["macaroni", "vegan chili", "tomatoes", "nutritional yeast", "hot sauce"], 14, 6.75],
      ["Microwave Miso Salmon Rice Bowl", ["halal", "gluten-free", "dairy-free", "high-protein", "no restriction"], ["cooked salmon", "microwave rice", "miso paste", "cucumber", "nori"], 9, 12.4],
      ["Microwave Sweet Potato Taco Bowl", ["vegetarian", "halal", "gluten-free", "nut-free"], ["sweet potato", "pinto beans", "salsa", "cheddar", "lettuce"], 13, 5.6],
      ["Microwave Pizza Tortilla Melt", ["vegetarian", "halal", "nut-free"], ["tortilla", "pizza sauce", "mozzarella", "bell pepper", "olives"], 7, 4.9],
      ["Microwave Tofu Teriyaki Rice", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["tofu", "microwave rice", "teriyaki sauce", "broccoli", "sesame seeds"], 12, 7.8],
      ["Microwave Lemon Pepper Tuna Rice", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["tuna", "microwave rice", "peas", "lemon pepper", "olive oil"], 8, 5.2],
      ["Microwave Cinnamon Pear Oats", ["vegetarian", "halal", "nut-free", "low-cost"], ["oats", "milk", "pear", "cinnamon", "maple syrup"], 6, 3.1],
      ["Microwave Green Enchilada Beans", ["vegetarian", "halal", "gluten-free", "nut-free"], ["pinto beans", "green enchilada sauce", "cheese", "corn", "tortilla chips"], 10, 5.4],
      ["Microwave Thai Basil Tofu Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["tofu", "microwave rice", "basil", "soy sauce", "frozen peppers"], 13, 8.4],
      ["Microwave Shrimp Grits Cup", ["halal", "gluten-free", "high-protein", "nut-free"], ["instant grits", "shrimp", "cheddar", "green onion", "hot sauce"], 12, 9.8],
      ["Microwave Lentil Sloppy Joe Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["cooked lentils", "tomato sauce", "bbq sauce", "pickle relish", "bun"], 9, 5.25],
      ["Microwave Pesto Ravioli Bowl", ["vegetarian", "halal", "nut-free", "no restriction"], ["ravioli", "pesto", "spinach", "parmesan", "tomatoes"], 15, 8.9]
    ]
  },
  {
    family: "kettle",
    defaults: {
      equipment: ["kettle"],
      notes: "Just add hot water from a kettle and cover until ready."
    },
    variants: [
      ["Kettle Lemon Couscous Cup", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free", "low-cost"], ["couscous", "chickpeas", "lemon juice", "parsley", "olive oil"], 10, 3.85],
      ["Kettle Miso Mushroom Noodles", ["vegan", "vegetarian", "halal", "dairy-free"], ["ramen noodles", "miso paste", "mushrooms", "spinach", "green onion"], 9, 4.8],
      ["Kettle Peanut Lime Rice Noodles", ["vegan", "vegetarian", "halal", "dairy-free"], ["rice noodles", "peanut butter", "lime", "soy sauce", "carrot"], 12, 4.6],
      ["Kettle Tomato Lentil Soup Cup", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["red lentils", "tomato paste", "vegetable bouillon", "spinach", "cumin"], 18, 4.2],
      ["Kettle Savory Oat Egg Bowl", ["vegetarian", "halal", "high-protein", "low-cost"], ["instant oats", "egg", "soy sauce", "green onion", "spinach"], 10, 3.4],
      ["Kettle Coconut Curry Noodle Cup", ["vegan", "vegetarian", "halal", "dairy-free"], ["rice noodles", "coconut milk powder", "curry powder", "peas", "tofu"], 13, 6.2],
      ["Kettle Garlic Herb Instant Mash Bowl", ["vegetarian", "halal", "gluten-free", "nut-free"], ["instant mashed potatoes", "cheese", "peas", "garlic powder", "black pepper"], 7, 3.75],
      ["Kettle Black Bean Couscous Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["couscous", "black beans", "salsa", "corn", "lime"], 11, 4.3],
      ["Kettle Sesame Edamame Ramen", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["ramen noodles", "edamame", "sesame oil", "soy sauce", "nori"], 10, 5.5],
      ["Kettle Chicken Pho Cup", ["halal", "dairy-free", "high-protein", "nut-free", "no restriction"], ["rice noodles", "cooked chicken", "pho broth powder", "bean sprouts", "cilantro"], 14, 7.4],
      ["Kettle White Bean Pesto Couscous", ["vegetarian", "halal", "nut-free"], ["couscous", "white beans", "pesto", "tomato", "parmesan"], 12, 6.2],
      ["Kettle Ginger Tofu Soup", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free"], ["tofu", "rice noodles", "ginger paste", "spinach", "tamari"], 13, 6.8],
      ["Kettle Cinnamon Date Quinoa Flakes", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["quinoa flakes", "dates", "cinnamon", "oat milk powder", "chia seeds"], 8, 4.9],
      ["Kettle Spicy Tuna Noodle Bowl", ["halal", "dairy-free", "high-protein", "nut-free"], ["ramen noodles", "tuna", "sriracha", "green onion", "sesame oil"], 9, 4.75],
      ["Kettle Split Pea Soup Cup", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["split pea soup mix", "carrots", "bouillon", "black pepper", "olive oil"], 20, 4.4],
      ["Kettle Mediterranean Bulgur Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["bulgur", "chickpeas", "tomato", "cucumber", "lemon juice"], 15, 5.2],
      ["Kettle Cheesy Broccoli Rice Cup", ["vegetarian", "halal", "gluten-free", "nut-free"], ["instant rice", "broccoli", "cheddar powder", "milk powder", "black pepper"], 9, 3.95],
      ["Kettle Harira Noodle Soup", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["vermicelli noodles", "lentils", "tomato paste", "chickpeas", "cinnamon"], 18, 5.4]
    ]
  },
  {
    family: "toaster",
    defaults: {
      equipment: ["toaster"],
      notes: "Uses a toaster for texture without needing an oven."
    },
    variants: [
      ["Toaster Apple Cheddar Waffle Sandwich", ["vegetarian", "halal", "nut-free"], ["waffles", "apple", "cheddar", "honey mustard", "spinach"], 9, 5.6],
      ["Toaster Hummus Veggie Pita Melt", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["pita", "hummus", "bell pepper", "spinach", "cucumber"], 8, 4.95],
      ["Toaster Tuna Cheddar English Muffin", ["halal", "high-protein", "nut-free"], ["english muffin", "tuna", "cheddar", "mayo", "pickle relish"], 10, 5.75],
      ["Toaster Peanut Banana Waffle", ["vegetarian", "halal"], ["waffles", "peanut butter", "banana", "honey", "chia seeds"], 7, 3.95],
      ["Toaster Egg Salsa Bagel", ["vegetarian", "halal", "high-protein", "nut-free"], ["bagel", "egg", "salsa", "cheese", "spinach"], 12, 5.4],
      ["Toaster Vegan Pizza Pita", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["pita", "pizza sauce", "vegan mozzarella", "olives", "oregano"], 10, 6.2],
      ["Toaster Turkey Cranberry Sandwich", ["halal", "high-protein", "nut-free", "no restriction"], ["bread", "turkey slices", "cranberry sauce", "cream cheese", "lettuce"], 8, 7.6],
      ["Toaster Ricotta Berry Toast", ["vegetarian", "halal", "nut-free"], ["bread", "ricotta", "berries", "honey", "lemon zest"], 6, 5.2],
      ["Toaster Avocado Chickpea Toast", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["bread", "avocado", "chickpeas", "lemon juice", "red pepper flakes"], 9, 5.9],
      ["Toaster Chicken Pesto Flatbread", ["halal", "high-protein", "no restriction"], ["flatbread", "cooked chicken", "pesto", "mozzarella", "tomato"], 12, 8.75],
      ["Toaster Cinnamon Yogurt Bagel", ["vegetarian", "halal", "nut-free"], ["bagel", "greek yogurt", "cinnamon", "apple", "honey"], 7, 4.8],
      ["Toaster Black Bean Quesa-Pita", ["vegetarian", "halal", "nut-free"], ["pita", "black beans", "cheese", "salsa", "corn"], 11, 5.1],
      ["Toaster Smoked Salmon Bagel Thin", ["high-protein", "nut-free", "no restriction"], ["bagel thin", "smoked salmon", "cream cheese", "cucumber", "dill"], 8, 11.2],
      ["Toaster Tomato Mozzarella Pocket", ["vegetarian", "halal", "nut-free"], ["pita", "mozzarella", "tomato", "basil", "balsamic glaze"], 10, 6.5],
      ["Toaster Sunflower Butter Berry Toast", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["bread", "sunflower butter", "berries", "maple syrup", "hemp seeds"], 6, 5.25],
      ["Toaster Eggplant Marinara Flatbread", ["vegetarian", "halal", "nut-free"], ["flatbread", "roasted eggplant", "marinara", "mozzarella", "parmesan"], 13, 8.4],
      ["Toaster Breakfast Bean Toast", ["vegetarian", "halal", "high-protein", "nut-free"], ["bread", "baked beans", "egg", "hot sauce", "green onion"], 11, 4.9],
      ["Toaster Pear Brie Sandwich", ["vegetarian", "halal", "nut-free", "no restriction"], ["bread", "brie", "pear", "spinach", "honey"], 9, 7.8]
    ]
  },
  {
    family: "hotPlate",
    defaults: {
      equipment: ["hot plate", "pan"],
      notes: "A single-pan recipe for dorms that allow hot plates."
    },
    variants: [
      ["Hot Plate Black Bean Breakfast Tacos", ["vegetarian", "halal", "gluten-free", "nut-free"], ["corn tortillas", "black beans", "eggs", "salsa", "avocado"], 18, 6.25],
      ["Hot Plate Garlic Tofu Broccoli", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["tofu", "broccoli", "garlic", "soy sauce", "rice"], 24, 8.6],
      ["Hot Plate Chicken Shawarma Rice", ["halal", "gluten-free", "dairy-free", "nut-free", "high-protein"], ["cooked chicken", "rice", "cucumber", "shawarma spice", "tahini sauce"], 22, 9.8],
      ["Hot Plate Turkey Spinach Pasta", ["halal", "high-protein", "nut-free", "no restriction"], ["ground turkey", "pasta", "spinach", "marinara", "parmesan"], 28, 11.4],
      ["Hot Plate Lentil Sloppy Joes", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["lentils", "tomato sauce", "bbq sauce", "buns", "pickles"], 30, 7.2],
      ["Hot Plate Halloumi Veggie Skillet", ["vegetarian", "halal", "gluten-free", "nut-free"], ["halloumi", "zucchini", "tomatoes", "olive oil", "rice"], 25, 12.2],
      ["Hot Plate Shrimp Taco Rice", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["shrimp", "rice", "taco seasoning", "corn", "lime"], 22, 12.6],
      ["Hot Plate Mushroom Swiss Melt", ["vegetarian", "halal", "nut-free"], ["bread", "mushrooms", "swiss cheese", "spinach", "butter"], 16, 6.7],
      ["Hot Plate Chickpea Tomato Stew", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["chickpeas", "tomatoes", "spinach", "cumin", "rice"], 32, 7.4],
      ["Hot Plate Peanut Tofu Stir Fry", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["tofu", "peanut butter", "frozen vegetables", "soy sauce", "ramen noodles"], 25, 7.8],
      ["Hot Plate Egg Fried Quinoa", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["quinoa", "eggs", "peas", "carrots", "tamari"], 20, 6.9],
      ["Hot Plate Steak Pepper Rice", ["halal", "gluten-free", "dairy-free", "nut-free", "high-protein", "no restriction"], ["steak strips", "bell pepper", "rice", "soy sauce", "green onion"], 27, 16.8],
      ["Hot Plate Vegan Fajita Bowl", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["bell pepper", "onion", "black beans", "rice", "fajita seasoning"], 23, 6.4],
      ["Hot Plate Salmon Teriyaki Noodles", ["halal", "dairy-free", "high-protein", "no restriction"], ["salmon", "ramen noodles", "teriyaki sauce", "broccoli", "sesame seeds"], 28, 15.5],
      ["Hot Plate Paneer Curry Rice", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["paneer", "curry sauce", "rice", "peas", "spinach"], 26, 11.8],
      ["Hot Plate Sausage Pepper Hash", ["halal", "gluten-free", "dairy-free", "nut-free", "high-protein"], ["turkey sausage", "baby potatoes", "bell pepper", "onion", "paprika"], 34, 10.9],
      ["Hot Plate Vegan Pancake Plate", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["pancake mix", "oat milk", "banana", "maple syrup", "berries"], 20, 5.8],
      ["Hot Plate Lemon Herb Chicken Couscous", ["halal", "dairy-free", "high-protein", "nut-free"], ["cooked chicken", "couscous", "lemon juice", "zucchini", "olive oil"], 21, 9.2],
      ["Hot Plate Tofu Scramble Burrito", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free", "high-protein"], ["tofu", "tortilla", "turmeric", "spinach", "salsa"], 18, 6.3],
      ["Hot Plate Greek Turkey Meatball Skillet", ["halal", "high-protein", "nut-free", "no restriction"], ["turkey meatballs", "tomato", "rice", "feta", "oregano"], 30, 13.6]
    ]
  },
  {
    family: "blender",
    defaults: {
      equipment: ["blender", "mini fridge"],
      notes: "Built for a compact personal blender and a mini fridge."
    },
    variants: [
      ["Blender Chocolate Banana Protein Shake", ["vegetarian", "halal", "gluten-free", "high-protein"], ["protein powder", "banana", "milk", "cocoa powder", "ice"], 5, 5.8],
      ["Blender Vegan Green Mango Smoothie", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["spinach", "mango", "banana", "oat milk", "chia seeds"], 6, 6.4],
      ["Blender Strawberry Cheesecake Smoothie", ["vegetarian", "halal", "gluten-free", "nut-free"], ["strawberries", "greek yogurt", "cream cheese", "milk", "honey"], 6, 6.9],
      ["Blender Peanut Butter Mocha Shake", ["vegetarian", "halal", "high-protein"], ["protein powder", "peanut butter", "cold brew", "milk", "banana"], 5, 6.2],
      ["Blender Tropical Tofu Smoothie", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "high-protein"], ["silken tofu", "pineapple", "mango", "coconut milk", "lime"], 7, 7.8],
      ["Blender Avocado Lime Soup", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["avocado", "cucumber", "lime", "cilantro", "vegetable broth"], 8, 7.2],
      ["Blender Blueberry Oat Breakfast", ["vegetarian", "halal", "nut-free"], ["blueberries", "oats", "milk", "greek yogurt", "maple syrup"], 6, 5.7],
      ["Blender Tahini Chickpea Dressing Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["tahini", "chickpeas", "lemon juice", "rice", "cucumber"], 9, 6.8],
      ["Blender Pumpkin Pie Smoothie", ["vegetarian", "halal", "gluten-free", "nut-free"], ["pumpkin puree", "milk", "banana", "cinnamon", "greek yogurt"], 6, 5.5],
      ["Blender Berry Spinach Protein Bowl", ["vegetarian", "halal", "gluten-free", "high-protein"], ["protein powder", "berries", "spinach", "milk", "granola"], 7, 7.4],
      ["Blender Vegan Peanut Satay Sauce Noodles", ["vegan", "vegetarian", "halal", "dairy-free"], ["peanut butter", "soy sauce", "lime", "rice noodles", "carrot"], 10, 5.6],
      ["Blender Watermelon Mint Cooler Plate", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["watermelon", "mint", "lime", "cucumber", "feta"], 7, 6.3],
      ["Blender Espresso Date Shake", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["dates", "espresso", "oat milk", "banana", "cinnamon"], 5, 5.9],
      ["Blender Savory Tomato Gazpacho Cup", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["tomato", "cucumber", "bell pepper", "olive oil", "bread"], 9, 6.7],
      ["Blender Pineapple Cottage Protein Cup", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["cottage cheese", "pineapple", "milk", "honey", "ice"], 6, 6.8],
      ["Blender Chocolate Cherry Oat Bowl", ["vegetarian", "halal", "nut-free"], ["cherries", "oats", "milk", "cocoa powder", "chia seeds"], 8, 6.2],
      ["Blender Vegan Caesar Chickpea Wrap", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["chickpeas", "lemon juice", "tahini", "romaine", "tortilla"], 10, 6.4],
      ["Blender Almond Joy Smoothie", ["vegetarian", "halal", "gluten-free"], ["almond butter", "coconut milk", "banana", "cocoa powder", "protein powder"], 6, 7.5]
    ]
  },
  {
    family: "riceCooker",
    defaults: {
      equipment: ["rice cooker"],
      notes: "Hands-off recipe for a small dorm rice cooker."
    },
    variants: [
      ["Rice Cooker Ginger Scallion Chicken", ["halal", "gluten-free", "dairy-free", "nut-free", "high-protein"], ["rice", "cooked chicken", "ginger", "green onion", "tamari"], 45, 9.8],
      ["Rice Cooker Vegan Jambalaya", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["rice", "kidney beans", "tomatoes", "bell pepper", "cajun seasoning"], 60, 8.2],
      ["Rice Cooker Chickpea Biryani", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["rice", "chickpeas", "biryani spice", "peas", "fried onions"], 55, 8.6],
      ["Rice Cooker Quinoa Taco Bowls", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["quinoa", "black beans", "corn", "taco seasoning", "salsa"], 42, 7.9],
      ["Rice Cooker Salmon Dill Rice", ["halal", "gluten-free", "high-protein", "no restriction"], ["rice", "cooked salmon", "dill", "peas", "lemon juice"], 40, 13.8],
      ["Rice Cooker Coconut Lentil Dal", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["red lentils", "coconut milk", "rice", "curry powder", "spinach"], 50, 8.4],
      ["Rice Cooker Mushroom Barley Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["barley", "mushrooms", "vegetable broth", "spinach", "soy sauce"], 70, 7.6],
      ["Rice Cooker Turkey Taco Rice", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["rice", "cooked turkey", "black beans", "corn", "taco seasoning"], 45, 10.5],
      ["Rice Cooker Breakfast Apple Oats", ["vegetarian", "halal", "nut-free", "low-cost"], ["steel cut oats", "apple", "milk", "cinnamon", "raisins"], 65, 4.8],
      ["Rice Cooker Tofu Peanut Rice", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["rice", "tofu", "peanut sauce", "broccoli", "carrots"], 48, 9.2],
      ["Rice Cooker Greek Lemon Chickpeas", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["rice", "chickpeas", "lemon juice", "oregano", "spinach"], 43, 6.8],
      ["Rice Cooker Chicken Congee", ["halal", "dairy-free", "high-protein", "nut-free"], ["rice", "cooked chicken", "ginger", "green onion", "broth"], 90, 8.9],
      ["Rice Cooker Ratatouille Rice", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["rice", "zucchini", "tomatoes", "eggplant", "italian seasoning"], 58, 8.1],
      ["Rice Cooker Edamame Sushi Rice Bowl", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free"], ["sushi rice", "edamame", "nori", "cucumber", "rice vinegar"], 45, 8.7],
      ["Rice Cooker Paneer Pea Pulao", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["rice", "paneer", "peas", "garam masala", "onion flakes"], 50, 10.8],
      ["Rice Cooker White Bean Tomato Risotto", ["vegetarian", "halal", "gluten-free", "nut-free"], ["arborio rice", "white beans", "tomatoes", "parmesan", "vegetable broth"], 55, 9.7],
      ["Rice Cooker Long Simmer Bean Pot", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["pinto beans", "rice", "tomatoes", "cumin", "bell pepper"], 120, 7.5],
      ["Rice Cooker Shrimp Cilantro Lime Rice", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["rice", "shrimp", "cilantro", "lime", "corn"], 42, 13.2]
    ]
  },
  {
    family: "airFryer",
    defaults: {
      equipment: ["air fryer"],
      notes: "Crispy dorm meal for students with a compact air fryer."
    },
    variants: [
      ["Air Fryer Buffalo Cauliflower Wraps", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["cauliflower", "buffalo sauce", "tortilla", "lettuce", "vegan ranch"], 24, 7.2],
      ["Air Fryer Chicken Shawarma Plate", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["chicken strips", "shawarma spice", "rice", "cucumber", "tahini sauce"], 28, 13.5],
      ["Air Fryer Tofu Broccoli Rice", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["tofu", "broccoli", "rice", "teriyaki sauce", "sesame oil"], 25, 8.9],
      ["Air Fryer Falafel Pita Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["falafel mix", "pita", "lettuce", "tomato", "tahini"], 22, 7.8],
      ["Air Fryer Turkey Burger Bowl", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["turkey patty", "sweet potato fries", "lettuce", "pickles", "ketchup"], 26, 11.2],
      ["Air Fryer Salmon Teriyaki Plate", ["halal", "gluten-free", "dairy-free", "high-protein", "no restriction"], ["salmon fillet", "teriyaki sauce", "green beans", "rice", "sesame seeds"], 30, 16.5],
      ["Air Fryer Chickpea Potato Curry Bites", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["chickpeas", "baby potatoes", "curry powder", "olive oil", "spinach"], 28, 6.9],
      ["Air Fryer Pizza Tortilla Chips", ["vegetarian", "halal", "nut-free"], ["tortilla", "pizza sauce", "mozzarella", "bell pepper", "oregano"], 12, 5.4],
      ["Air Fryer Lemon Pepper Shrimp Basket", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["shrimp", "baby potatoes", "zucchini", "lemon pepper", "olive oil"], 24, 14.8],
      ["Air Fryer Crispy Halloumi Salad", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["halloumi", "lettuce", "tomato", "cucumber", "balsamic glaze"], 16, 10.6],
      ["Air Fryer BBQ Tempeh Bowl", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["tempeh", "bbq sauce", "corn", "rice", "slaw mix"], 23, 9.4],
      ["Air Fryer Breakfast Potato Egg Bowl", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["baby potatoes", "eggs", "spinach", "cheddar", "hot sauce"], 22, 6.8],
      ["Air Fryer Garlic Parmesan Gnocchi", ["vegetarian", "halal", "nut-free"], ["gnocchi", "parmesan", "garlic powder", "spinach", "marinara"], 18, 8.2],
      ["Air Fryer Vegan Taquitos", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["corn tortillas", "black beans", "sweet potato", "salsa", "avocado"], 26, 7.6],
      ["Air Fryer Pesto Chicken Naan", ["halal", "high-protein", "no restriction"], ["naan", "cooked chicken", "pesto", "mozzarella", "tomato"], 15, 11.8],
      ["Air Fryer Miso Eggplant Rice", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["eggplant", "miso paste", "rice", "green onion", "sesame oil"], 27, 8.7],
      ["Air Fryer Cinnamon Apple Chips Yogurt", ["vegetarian", "halal", "gluten-free", "nut-free"], ["apple", "cinnamon", "greek yogurt", "honey", "granola"], 20, 5.9],
      ["Air Fryer Steak Potato Dinner", ["halal", "gluten-free", "dairy-free", "high-protein", "no restriction"], ["steak strips", "baby potatoes", "green beans", "olive oil", "garlic powder"], 32, 20.5]
    ]
  },
  {
    family: "fridgePantry",
    defaults: {
      equipment: ["mini fridge"],
      notes: "Uses mini-fridge staples and pantry items with almost no cleanup."
    },
    variants: [
      ["Mini Fridge Overnight Mango Chia", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["chia seeds", "oat milk", "mango", "maple syrup", "coconut flakes"], 5, 5.6],
      ["Mini Fridge Egg Salad Rice Cakes", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["hard boiled eggs", "rice cakes", "greek yogurt", "mustard", "celery"], 8, 5.4],
      ["Mini Fridge Turkey Hummus Bento", ["halal", "high-protein", "nut-free"], ["turkey slices", "hummus", "carrots", "pita", "grapes"], 7, 8.2],
      ["Mini Fridge Vegan Protein Pudding", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free"], ["silken tofu", "cocoa powder", "maple syrup", "berries", "chia seeds"], 8, 6.7],
      ["Mini Fridge Caprese Tortellini Cup", ["vegetarian", "halal", "nut-free"], ["cooked tortellini", "mozzarella", "tomato", "basil", "balsamic glaze"], 9, 8.5],
      ["Mini Fridge Chicken Salad Lettuce Cups", ["halal", "gluten-free", "high-protein", "nut-free"], ["cooked chicken", "lettuce", "greek yogurt", "grapes", "celery"], 10, 8.9],
      ["Mini Fridge Vegan Snack Box", ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"], ["hummus", "pretzels", "carrots", "apple", "pumpkin seeds"], 6, 6.2],
      ["Mini Fridge Cottage Cheese Salsa Bowl", ["vegetarian", "halal", "gluten-free", "high-protein", "nut-free"], ["cottage cheese", "salsa", "corn", "green onion", "tortilla chips"], 5, 4.8],
      ["Mini Fridge Smoked Turkey Pickle Rolls", ["halal", "gluten-free", "high-protein", "nut-free", "no restriction"], ["turkey slices", "pickles", "cream cheese", "spinach", "crackers"], 8, 7.2],
      ["Mini Fridge Edamame Noodle Salad", ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"], ["cooked noodles", "edamame", "cucumber", "soy sauce", "sesame oil"], 10, 7.4],
      ["Mini Fridge Yogurt Cereal Parfait", ["vegetarian", "halal", "nut-free", "low-cost"], ["greek yogurt", "cereal", "banana", "honey", "cinnamon"], 5, 3.8],
      ["Mini Fridge Bean Dip Layer Cups", ["vegetarian", "halal", "gluten-free", "nut-free"], ["refried beans", "salsa", "greek yogurt", "cheese", "lettuce"], 8, 5.2],
      ["Mini Fridge Tuna Pasta Salad", ["halal", "high-protein", "nut-free"], ["cooked pasta", "tuna", "peas", "mayo", "lemon pepper"], 10, 6.4],
      ["Mini Fridge Vegan Greek Bowl", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["chickpeas", "cucumber", "tomato", "olives", "rice"], 9, 6.9],
      ["Mini Fridge Protein Pancake Jar", ["vegetarian", "halal", "high-protein", "nut-free"], ["protein pancakes", "greek yogurt", "berries", "maple syrup", "chia seeds"], 7, 7.5],
      ["Mini Fridge No-Cook Pesto Chicken Pasta", ["halal", "high-protein", "no restriction"], ["cooked pasta", "cooked chicken", "pesto", "tomato", "parmesan"], 9, 9.4],
      ["Mini Fridge Apple Tuna Crunch Box", ["halal", "gluten-free", "dairy-free", "high-protein", "nut-free"], ["tuna", "apple", "celery", "rice crackers", "mustard"], 8, 5.8],
      ["Mini Fridge Mediterranean Lentil Jar", ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free", "nut-free"], ["cooked lentils", "cucumber", "tomato", "tahini", "lemon juice"], 9, 6.6]
    ]
  }
];

const COLLEGE_PROTEINS = [
  {
    label: "Tofu",
    ingredient: "tofu",
    tags: ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"],
    cost: 2.25
  },
  {
    label: "Chickpea",
    ingredient: "chickpeas",
    tags: ["vegan", "vegetarian", "halal", "dairy-free", "nut-free"],
    cost: 1.5
  },
  {
    label: "Black Bean",
    ingredient: "black beans",
    tags: ["vegan", "vegetarian", "halal", "dairy-free", "nut-free", "low-cost"],
    cost: 1.25
  },
  {
    label: "Egg",
    ingredient: "egg",
    tags: ["vegetarian", "halal", "high-protein", "nut-free"],
    cost: 1.2
  },
  {
    label: "Tuna",
    ingredient: "tuna",
    tags: ["halal", "high-protein", "dairy-free", "nut-free"],
    cost: 2.1
  },
  {
    label: "Chicken",
    ingredient: "cooked chicken",
    tags: ["halal", "high-protein", "nut-free"],
    cost: 3.25
  },
  {
    label: "Turkey",
    ingredient: "turkey slices",
    tags: ["halal", "high-protein", "nut-free"],
    cost: 3.1
  },
  {
    label: "Shrimp",
    ingredient: "shrimp",
    tags: ["halal", "high-protein", "dairy-free", "nut-free"],
    cost: 4.4
  },
  {
    label: "Salmon",
    ingredient: "cooked salmon",
    tags: ["halal", "high-protein", "nut-free"],
    cost: 5.2
  },
  {
    label: "Tempeh",
    ingredient: "tempeh",
    tags: ["vegan", "vegetarian", "halal", "dairy-free", "high-protein"],
    cost: 2.8
  }
];

const COLLEGE_FLAVORS = [
  { label: "Soy Ginger", sauce: "soy sauce", accent: "ginger" },
  { label: "Teriyaki", sauce: "teriyaki sauce", accent: "green onion" },
  { label: "Buffalo", sauce: "buffalo sauce", accent: "celery" },
  { label: "BBQ", sauce: "bbq sauce", accent: "corn" },
  { label: "Taco", sauce: "salsa", accent: "taco seasoning" },
  { label: "Curry", sauce: "curry powder", accent: "spinach" },
  { label: "Lemon Pepper", sauce: "lemon pepper", accent: "green beans" },
  { label: "Pesto", sauce: "pesto", accent: "tomato" },
  { label: "Marinara", sauce: "marinara", accent: "spinach" },
  { label: "Sriracha", sauce: "sriracha", accent: "cucumber" },
  { label: "Peanut Lime", sauce: "peanut butter", accent: "lime" },
  { label: "Miso", sauce: "miso paste", accent: "nori" }
];

const COLLEGE_FRUITS = [
  "banana",
  "apple",
  "berries",
  "strawberries",
  "blueberries",
  "mango",
  "pineapple",
  "pear",
  "dates",
  "frozen mango"
];

function uniqueTags(tags) {
  return [...new Set(tags)];
}

function recipeTags(protein, extras = []) {
  const tags = uniqueTags([...protein.tags, ...extras]);
  if (!tags.includes("no restriction")) {
    tags.push("no restriction");
  }
  return tags;
}

function collegeCost(baseCost, protein, extra = 0) {
  return Number(Math.min(baseCost + protein.cost + extra, 39.75).toFixed(2));
}

function addCollegeRecipe(recipes, blockedNames, family, variant) {
  if (blockedNames.has(recipeKey(variant.name))) {
    return;
  }

  blockedNames.add(recipeKey(variant.name));
  recipes.push(
    buildRecipe(family, { equipment: variant.equipment, notes: variant.notes }, variant)
  );
}

function generatedCollegeRecipeExpansion(existingNames = []) {
  const blockedNames = new Set(existingNames.map(recipeKey));
  const recipes = [];

  const mealGroups = [
    {
      family: "kettle",
      equipment: ["kettle"],
      count: 44,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Ramen Bowl`,
          tags: recipeTags(protein, ["low-cost"]),
          ingredients: [
            "ramen noodles",
            protein.ingredient,
            flavor.sauce,
            "frozen vegetables",
            flavor.accent
          ],
          time: 9 + (protein.label.length % 4),
          cost: collegeCost(1.4, protein, 0.75),
          notes: "A fast ramen variation built from common dorm pantry items."
        };
      }
    },
    {
      family: "microwave",
      equipment: ["microwave"],
      count: 42,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Pasta Cup`,
          tags: recipeTags(protein),
          ingredients: [
            "pasta",
            protein.ingredient,
            ["Pesto", "Marinara"].includes(flavor.label) ? flavor.sauce : "marinara",
            "spinach",
            protein.tags.includes("vegan") ? "nutritional yeast" : "parmesan"
          ],
          time: 11 + (flavor.label.length % 6),
          cost: collegeCost(2.2, protein, 1.1),
          notes: "Microwave pasta meal for a bowl, mug, or storage container."
        };
      }
    },
    {
      family: "microwave",
      equipment: ["microwave"],
      count: 42,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Rice Bowl`,
          tags: recipeTags(protein, ["gluten-free"]),
          ingredients: [
            "rice",
            protein.ingredient,
            flavor.sauce,
            "frozen vegetables",
            flavor.accent
          ],
          time: 10 + (flavor.label.length % 7),
          cost: collegeCost(1.8, protein, 1),
          notes: "Uses microwave rice or leftover rice with a protein and sauce."
        };
      }
    },
    {
      family: "noCook",
      equipment: ["none"],
      count: 36,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Taco Kit`,
          tags: recipeTags(protein),
          ingredients: [
            "tortilla",
            protein.ingredient,
            "salsa",
            "lettuce",
            "taco seasoning"
          ],
          time: 8 + (protein.label.length % 4),
          cost: collegeCost(2.1, protein, 0.8),
          notes: "A no-cook taco setup that works with pantry and fridge staples."
        };
      }
    },
    {
      family: "microwave",
      equipment: ["microwave"],
      count: 36,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Quesadilla`,
          tags: recipeTags(protein),
          ingredients: [
            "tortilla",
            protein.ingredient,
            protein.tags.includes("vegan") ? "vegan mozzarella" : "cheese",
            "salsa",
            "spinach"
          ],
          time: 9 + (flavor.label.length % 5),
          cost: collegeCost(2.3, protein, 1.25),
          notes: "Melts in the microwave or can be crisped in a pan if available."
        };
      }
    },
    {
      family: "noCook",
      equipment: ["none", "mini fridge"],
      count: 36,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Wrap`,
          tags: recipeTags(protein),
          ingredients: [
            "tortilla",
            protein.ingredient,
            flavor.sauce,
            "romaine",
            "cucumber"
          ],
          time: 7 + (flavor.label.length % 5),
          cost: collegeCost(2, protein, 0.95),
          notes: "A roll-up meal for packed lunches or late-night study breaks."
        };
      }
    },
    {
      family: "toaster",
      equipment: ["toaster"],
      count: 32,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Toasted Sandwich`,
          tags: recipeTags(protein),
          ingredients: [
            "bread",
            protein.ingredient,
            flavor.sauce,
            protein.tags.includes("vegan") ? "hummus" : "cheese",
            "spinach"
          ],
          time: 8 + (protein.label.length % 5),
          cost: collegeCost(2.4, protein, 1),
          notes: "A toaster-friendly sandwich with a warm filling."
        };
      }
    },
    {
      family: "fridgePantry",
      equipment: ["mini fridge"],
      count: 30,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Salad Box`,
          tags: recipeTags(protein, ["gluten-free"]),
          ingredients: [
            "romaine",
            protein.ingredient,
            "cucumber",
            "tomato",
            flavor.sauce
          ],
          time: 8 + (flavor.label.length % 4),
          cost: collegeCost(3.2, protein, 1.1),
          notes: "A mini-fridge salad box with enough protein to feel like dinner."
        };
      }
    },
    {
      family: "blender",
      equipment: ["blender", "mini fridge"],
      count: 34,
      build(flavor, protein, index) {
        const fruit = COLLEGE_FRUITS[index % COLLEGE_FRUITS.length];
        return {
          name: `${fruit.split(" ").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")} ${protein.label} Smoothie`,
          tags: recipeTags(
            protein.label === "Tofu" || protein.label === "Tempeh"
              ? protein
              : {
                  ...protein,
                  tags: ["vegetarian", "halal", "gluten-free", "high-protein"]
                }
          ),
          ingredients: [
            fruit,
            protein.label === "Tofu" ? "silken tofu" : "protein powder",
            protein.tags.includes("vegan") ? "oat milk" : "milk",
            "ice",
            flavor.label === "Peanut Lime" ? "peanut butter" : "chia seeds"
          ],
          time: 5 + (index % 4),
          cost: collegeCost(3, protein, 1.2),
          notes: "Built for a personal blender and a mini fridge."
        };
      }
    },
    {
      family: "microwave",
      equipment: ["microwave"],
      count: 30,
      build(flavor, protein, index) {
        const fruit = COLLEGE_FRUITS[index % COLLEGE_FRUITS.length];
        return {
          name: `${flavor.label} ${fruit.split(" ").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")} Oatmeal Bowl`,
          tags: ["vegetarian", "halal", "low-cost", "no restriction"],
          ingredients: [
            "oatmeal",
            fruit,
            "milk",
            flavor.label === "Peanut Lime" ? "peanut butter" : "cinnamon",
            "honey"
          ],
          time: 5 + (index % 5),
          cost: Number((2.1 + (index % 5) * 0.28).toFixed(2)),
          notes: "Cheap breakfast or study snack that works in one microwave bowl."
        };
      }
    },
    {
      family: "microwave",
      equipment: ["microwave"],
      count: 28,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Mug Meal`,
          tags: recipeTags(protein),
          ingredients: [
            protein.ingredient,
            "egg",
            "cheese",
            "spinach",
            flavor.sauce
          ],
          time: 6 + (protein.label.length % 6),
          cost: collegeCost(2, protein, 0.85),
          notes: "A single-mug microwave meal for fast cleanup."
        };
      }
    },
    {
      family: "airFryer",
      equipment: ["air fryer"],
      count: 42,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Air Fryer Plate`,
          tags: recipeTags(protein),
          ingredients: [
            protein.ingredient,
            "baby potatoes",
            "green beans",
            flavor.sauce,
            "olive oil"
          ],
          time: 20 + (flavor.label.length % 13),
          cost: collegeCost(4.5, protein, 2.5),
          notes: "A crisp air-fryer meal for dorms that allow compact appliances."
        };
      }
    },
    {
      family: "hotPlate",
      equipment: ["hot plate", "pan"],
      count: 42,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Hot Plate Skillet`,
          tags: recipeTags(protein),
          ingredients: [
            protein.ingredient,
            "rice",
            "bell pepper",
            flavor.sauce,
            "onion"
          ],
          time: 18 + (flavor.label.length % 16),
          cost: collegeCost(3.8, protein, 1.6),
          notes: "One-pan hot plate dinner for students with more cooking access."
        };
      }
    },
    {
      family: "fridgePantry",
      equipment: ["none", "mini fridge"],
      count: 28,
      build(flavor, protein) {
        return {
          name: `${flavor.label} ${protein.label} Snack Box`,
          tags: recipeTags(protein),
          ingredients: [
            protein.ingredient,
            "crackers",
            "grapes",
            flavor.sauce,
            protein.tags.includes("vegan") ? "hummus" : "cheese cubes"
          ],
          time: 6 + (protein.label.length % 5),
          cost: collegeCost(3.1, protein, 1.2),
          notes: "A no-cook box for grazing during long study sessions."
        };
      }
    }
  ];

  mealGroups.forEach((group) => {
    let created = 0;
    let index = 0;

    while (created < group.count) {
      const flavor = COLLEGE_FLAVORS[index % COLLEGE_FLAVORS.length];
      const protein =
        COLLEGE_PROTEINS[Math.floor(index / COLLEGE_FLAVORS.length) % COLLEGE_PROTEINS.length];
      const variant = {
        ...group.build(flavor, protein, index),
        equipment: group.equipment
      };
      const before = recipes.length;

      addCollegeRecipe(recipes, blockedNames, group.family, variant);
      if (recipes.length > before) {
        created += 1;
      }
      index += 1;
    }
  });

  return recipes;
}

function generatedRecipeSeed(existingNames = []) {
  const blockedNames = new Set(existingNames.map(recipeKey));
  const generated = [];

  RECIPE_FAMILIES.forEach(({ family, defaults, variants }) => {
    variants.forEach(([name, tags, ingredients, time, cost, equipment]) => {
      if (blockedNames.has(recipeKey(name))) {
        return;
      }

      blockedNames.add(recipeKey(name));
      generated.push(
        buildRecipe(family, defaults, {
          name,
          shortName: name,
          tags,
          ingredients,
          time,
          cost,
          equipment
        })
      );
    });
  });

  return [
    ...generated,
    ...generatedCollegeRecipeExpansion([
      ...existingNames,
      ...generated.map((recipe) => recipe.name)
    ])
  ];
}

module.exports = {
  generatedRecipeSeed
};
