# DormEats Phase 2 Report

## Objective and current MVP definition

DormEats is an AI-assisted meal planning tool for college students with limited time, budget, ingredients, and cooking equipment. The Phase 1 MVP promise was:

> A user can enter dietary restrictions, available ingredients, and time constraints, and our system returns dorm-friendly meal suggestions with step-by-step instructions.

For Phase 2, we narrowed that MVP into a concrete offline prototype that can already:

- accept a user profile with dietary need, ingredients, equipment, time limit, and budget
- return ranked meal suggestions from a structured recipe set
- identify missing grocery items
- suggest nearby-style restaurant fallbacks from a local backup dataset

## What has been built so far

We implemented a runnable Python prototype in `phase2/demo.py` and structured datasets in `phase2/data/`.

The current pipeline is:

1. Read a user scenario.
2. Filter recipes by dietary compatibility.
3. Filter recipes by available equipment so the result stays dorm-realistic.
4. Score remaining recipes using ingredient overlap, time fit, and estimated cost.
5. Return ranked recommendations with missing grocery items and step-by-step instructions.
6. Show a local restaurant backup recommendation when the user wants another option.

This is not the final product, but it is a meaningful MVP slice because it exercises the main decision logic behind DormEats instead of only showing mockups.

## Technical approach

The technical approach for Phase 2 is a lightweight recommendation pipeline rather than a full LLM product.

### Why we chose this scope

The biggest Phase 2 bottleneck is not interface polish; it is proving that DormEats can make useful suggestions under realistic dorm constraints. Before adding a chatbot interface or external APIs, we needed a reliable recommendation core that we could test and debug locally.

### Current system design

- **Recipe store:** JSON dataset of dorm-friendly meals with dietary tags, ingredients, equipment, time, cost, and instructions
- **Restaurant backup store:** small local dataset representing the fallback plan mentioned in Phase 1 risk analysis
- **Ranking logic:** simple weighted score using ingredient overlap, time fit, and budget fit
- **Benchmark harness:** scripted evaluation over representative user scenarios

### Main technical risks being addressed

1. **Dorm realism:** many recipe datasets assume a full kitchen, so we added an equipment filter and short-time recipes.
2. **Cold-start usefulness:** students often have only a few ingredients, so we rank by overlap and expose the missing grocery gap.
3. **API dependency risk:** because Yelp/Google Places access may be limited, we added a static restaurant dataset as an immediate backup path.

## Evidence of progress

### Running prototype

The repo now includes a reproducible demo:

```bash
cd phase2
python3 demo.py
```

This prints recommendations for three representative student scenarios:

- exam-week vegan student
- halal student with only a microwave
- gluten-free student with almost no groceries

### Benchmark evidence

We also created a simple comparison script:

```bash
cd phase2
python3 evaluate.py
```

The benchmark result is saved in `phase2/artifacts/benchmark.md`.

Our baseline is intentionally weak: it only filters by dietary tag and time. The improved version adds equipment checking, ingredient overlap, and budget awareness. This matters because a dorm-useful system should not recommend meals that technically fit a diet but require unavailable equipment or too many missing items.

### What currently works

- dorm-friendly filtering by equipment and dietary need
- ranking based on realistic constraints
- grocery-gap output
- local restaurant backup path
- reproducible benchmark script

### What does not yet work

- live Yelp/Google Maps integration
- USDA-based nutrition scoring
- LLM-generated conversational responses
- learned ranking from user feedback
- Streamlit or Gradio chat interface

## Current limitations and open risks

1. **Small dataset size:** the current recipe and restaurant data are hand-curated and too small for a production-like evaluation.
2. **No real nutrition modeling yet:** we are not yet using USDA nutrition data, so “healthy” recommendations are only indirectly approximated.
3. **No user feedback loop:** the Phase 1 concept included learning from feedback over time, but the current prototype is still static.
4. **No user interviews logged in-repo yet:** the guideline encourages validating with real users, and that still needs to be documented more formally.

## Plan for Phase 3

Before the final MVP submission, we plan to:

1. Expand the recipe dataset using Hugging Face or Kaggle sources and keep only dorm-feasible recipes.
2. Add nutrition features from USDA FoodData Central.
3. Build a basic chat-style interface in Streamlit or Gradio.
4. Replace the placeholder restaurant backup with real API-based search when credentials are available.
5. Add at least a small user evaluation with a few realistic dorm scenarios and short qualitative feedback.

## Summary

Phase 2 demonstrates substantial progress because DormEats now has a functioning recommendation engine, a reproducible benchmark script, and concrete artifacts in the repo. The system is still narrow, but the core MVP logic is no longer only a proposal; it is implemented and testable.
