from __future__ import annotations

import json
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).parent / "data"


def load_json(filename: str) -> list[dict[str, Any]]:
    with (DATA_DIR / filename).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def dietary_match(recipe: dict[str, Any], dietary_need: str) -> bool:
    return dietary_need.lower() in {tag.lower() for tag in recipe["dietary_tags"]}


def equipment_match(recipe: dict[str, Any], available_equipment: list[str]) -> bool:
    available = {item.lower() for item in available_equipment}
    needed = {item.lower() for item in recipe["equipment"]}
    return needed.issubset(available.union({"none"}))


def ingredient_overlap(recipe: dict[str, Any], available_ingredients: list[str]) -> float:
    available = {item.lower() for item in available_ingredients}
    ingredients = {item.lower() for item in recipe["ingredients"]}
    return len(available.intersection(ingredients)) / max(len(ingredients), 1)


def score_recipe(recipe: dict[str, Any], profile: dict[str, Any]) -> float:
    overlap = ingredient_overlap(recipe, profile["available_ingredients"])
    time_score = max(0.0, 1 - (recipe["time_minutes"] / max(profile["time_minutes"], 1)))
    budget_score = 1.0 if recipe["estimated_cost"] <= profile["budget"] else -0.5
    # Ingredient overlap is weighted highest because dorm users care most about
    # whether they can make the meal with what they already have.
    return round((overlap * 0.65) + (time_score * 0.15) + (budget_score * 0.20), 3)


def missing_ingredients(recipe: dict[str, Any], available_ingredients: list[str]) -> list[str]:
    available = {item.lower() for item in available_ingredients}
    return [item for item in recipe["ingredients"] if item.lower() not in available]


def recommend_meals(profile: dict[str, Any], top_k: int = 3) -> list[dict[str, Any]]:
    recipes = load_json("recipes.json")
    candidates: list[dict[str, Any]] = []
    for recipe in recipes:
        if not dietary_match(recipe, profile["dietary_need"]):
            continue
        if not equipment_match(recipe, profile["available_equipment"]):
            continue
        candidates.append(
            {
                "recipe": recipe,
                "score": score_recipe(recipe, profile),
                "missing_items": missing_ingredients(recipe, profile["available_ingredients"]),
            }
        )
    return sorted(candidates, key=lambda item: item["score"], reverse=True)[:top_k]


def recommend_restaurants(profile: dict[str, Any], top_k: int = 2) -> list[dict[str, Any]]:
    restaurants = load_json("restaurants.json")
    matches = [
        restaurant
        for restaurant in restaurants
        if profile["dietary_need"].lower()
        in {tag.lower() for tag in restaurant["dietary_tags"]}
    ]
    return sorted(matches, key=lambda item: (item["price_level"], item["distance_miles"]))[:top_k]


def naive_baseline(profile: dict[str, Any]) -> list[str]:
    recipes = load_json("recipes.json")
    matches = []
    for recipe in recipes:
        if dietary_match(recipe, profile["dietary_need"]) and recipe["time_minutes"] <= profile["time_minutes"]:
            matches.append(recipe["name"])
    return matches[:3]


def format_recommendation(profile: dict[str, Any]) -> str:
    lines = [
        f"DormEats recommendation for: {profile['name']}",
        f"Dietary need: {profile['dietary_need']}",
        f"Time available: {profile['time_minutes']} minutes",
        f"Budget: ${profile['budget']:.2f}",
        "",
        "Top meal suggestions:",
    ]

    meals = recommend_meals(profile)
    if not meals:
        lines.append("- No recipe matches yet; restaurant backup is recommended.")
    for index, item in enumerate(meals, start=1):
        recipe = item["recipe"]
        lines.extend(
            [
                f"{index}. {recipe['name']} (score={item['score']}, cost=${recipe['estimated_cost']:.2f}, time={recipe['time_minutes']} min)",
                f"   Missing items: {', '.join(item['missing_items']) or 'none'}",
                f"   Instructions: {' '.join(recipe['instructions'])}",
            ]
        )

    lines.append("")
    lines.append("Restaurant backup:")
    for restaurant in recommend_restaurants(profile):
        lines.append(
            f"- {restaurant['name']} ({restaurant['distance_miles']} miles, price level {restaurant['price_level']}): "
            f"{', '.join(restaurant['top_items'])}"
        )

    return "\n".join(lines)


if __name__ == "__main__":
    scenarios = load_json("scenarios.json")
    for scenario in scenarios:
        print(format_recommendation(scenario))
        print("\n" + "=" * 80 + "\n")
