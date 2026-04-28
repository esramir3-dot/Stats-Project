# DormEats MVP Report

## Executive Summary

DormEats is a full-stack AI-assisted meal planning application designed to help college students make better food decisions under constraints such as limited time, budget, ingredients, and cooking equipment. The system takes user inputs and returns ranked dorm-friendly meal recommendations with instructions, grocery gaps, and fallback restaurant options.

## User & Use Case

The primary user is a college student living in a dorm or small apartment. These users often lack time, money, and resources to cook efficiently. DormEats helps by suggesting realistic meals based on what they already have and what they can access.

Example use case:
A student inputs dietary preferences, available ingredients, and time constraints. DormEats recommends meals they can realistically cook, minimizing waste and cost.

## System Design

The system consists of:

* React frontend (user interface)
* Node.js/Express backend (API)
* Local JSON data for recipes, ingredients, and restaurants

Data flow:
User input → API request → recommendation logic → ranked results → UI display

## Data

The MVP uses:

* A locally expanded dataset of 200+ dorm-friendly recipes
* Ingredient catalog with autocomplete support
* Local restaurant fallback dataset

External sources (planned but not fully integrated):

* USDA FoodData Central (nutrition)
* Yelp/Google Maps APIs (restaurants)

## Models / Recommendation Logic

The recommendation system is rule-based and uses:

* Dietary filtering
* Equipment compatibility filtering
* Ingredient overlap scoring
* Time constraint scoring
* Budget constraint scoring

Additional features:

* Grocery gap detection
* Substitution logic (if implemented)
* Ingredient normalization and autocomplete

## Evaluation

The system was tested using realistic scenarios:

1. Vegan student during exam week
2. Halal student with only a microwave
3. Student with minimal ingredients

Results:

* Recommendations prioritized feasible meals
* Ingredient overlap improved practicality
* Grocery gap feature helped reduce unnecessary purchases

## Limitations & Risks

* Uses local datasets rather than real-time APIs
* Nutrition data is estimated or limited
* Not fully conversational (form-based UI instead of chat)
* Substitution logic is rule-based, not learned
* No persistent database (uses memory/localStorage)

## Next Steps

With more time, we would:

* Integrate USDA nutrition API
* Add Yelp/Google Maps live restaurant data
* Implement a chat-style AI interface
* Improve personalization with user feedback
* Add full meal planning and calorie tracking

## Conclusion

DormEats successfully demonstrates a working MVP that aligns with the original project vision. It provides a practical and user-focused solution to a common problem faced by college students, while also showcasing meaningful technical implementation of an AI-assisted recommendation system.
