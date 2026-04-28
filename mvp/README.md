# DormEats MVP Demo Instructions

## Overview

DormEats is a full-stack web application that helps college students plan meals based on dietary restrictions, available ingredients, equipment, time constraints, and budget.

## Setup

Clone the repository (or open the project folder), then install dependencies:

```bash
npm install
```

## Run the application

```bash
npm run dev
```

## Access the app

Frontend:
http://localhost:5173

Backend health check:
http://localhost:4000/api/health

## How to use

1. Go to the **Preferences** page.
2. Enter:

   * Dietary need (e.g. vegetarian, vegan, halal)
   * Ingredients on hand (use autocomplete or manual entry)
   * Equipment (microwave, pan, etc.)
   * Time limit
   * Budget
3. Click **Find dorm meals**.

## Expected behavior

* Ranked meal recommendations
* Ingredient match prioritization
* Missing grocery items
* Step-by-step instructions
* Substitutions (if implemented)
* Restaurant fallback suggestions

## Example scenario

Try:

* Diet: vegetarian
* Ingredients: rice, beans, tortilla
* Equipment: microwave
* Time: 10–15 minutes
* Budget: $8

## Tests

Run:

```bash
npm test
```

## Build

Run:

```bash
npm run build
```

## Notes

* The app uses a local dataset of recipes and ingredients.
* Some features like nutrition APIs or restaurant APIs are simulated with local data.
* Pantry and saved recipes use localStorage and reset on refresh or server restart.
