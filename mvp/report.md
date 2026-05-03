# DormEats MVP Report

## 1. Executive Summary

DormEats is an AI-assisted dorm meal planning web app for college students who have limited time, limited kitchen equipment, limited grocery budgets, and incomplete pantry ingredients. The core goal of the MVP is to help a student quickly answer the question: “What can I realistically make right now with what I have?”

Our Phase 3 MVP turns the earlier Phase 2 prototype into a full-stack web application with a React frontend and an Express backend. A user enters dietary restrictions, pantry ingredients, available equipment, time limit, and budget, and the system returns ranked meal recommendations, missing grocery items, cooking instructions, and restaurant fallback suggestions when pantry options are weak.

The MVP demonstrates that the idea is technically feasible and useful in a realistic student setting. The current system works as a local demo web app with seeded recipe and ingredient data. It is not yet a production-ready consumer product, but it provides a functional end-to-end proof of concept.

## 2. User and Use Case

### Target User
The primary user is a college student living in a dorm or apartment with:
- a small or inconsistent food supply
- limited cooking tools
- limited time between classes or work
- a tight weekly budget
- dietary restrictions or preferences

### Core Problem
Students often know they need to eat cheaply and quickly, but they do not know what meals fit their current ingredients, dietary needs, equipment, and schedule. Existing recipe sites usually assume a full kitchen and a larger pantry, which makes them less useful in realistic dorm conditions.

### Main Use Case
A student opens DormEats and enters:
- dietary preference: vegetarian
- pantry items: rice, beans, tortilla
- equipment: microwave
- time: 10–15 minutes
- budget: $8

The app returns a ranked set of meal options that match those constraints as closely as possible, shows which items are missing, and gives simple preparation steps. If the pantry options are poor, the app can also suggest fallback restaurant options from local seeded data.

## 3. System Design

DormEats is implemented as a full-stack web application.

### Architecture
- **Frontend:** React-based web interface for user inputs and results display
- **Backend:** Express API for recommendation logic, recipe lookup, substitution handling, and restaurant fallback
- **Data Layer:** Local seeded JSON-style data for recipes, ingredients, substitutions, and restaurants
- **Persistence:** Local browser storage for some user-side state such as pantry or saved preferences

### High-Level Flow
1. User enters dietary needs, ingredients, equipment, budget, and time constraints in the frontend.
2. Frontend sends the request to the backend API.
3. Backend filters and scores candidate recipes.
4. Backend returns ranked meal recommendations with:
   - pantry match strength
   - missing ingredients
   - step-by-step instructions
   - substitution suggestions when available
   - restaurant fallback options if needed
5. Frontend renders the results in an accessible web interface.

### ASCII Architecture Diagram
```text
User
  |
  v
React Frontend
  |
  v
Express API Backend
  |
  +--> Recipe dataset
  +--> Ingredient catalog
  +--> Substitution data
  +--> Restaurant fallback data
  |
  v
Ranked response returned to frontend
