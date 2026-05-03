# DormEats MVP Report
MAE 301
DormEats - Group 13  
Shobhita Tripathi - stripa37@asu.edu  
Ernesto Ramirez - esramir3@asu.edu  
Robert Schaffer - rjschaff@asu.edu  
Ashden Austin - apausti3@asu.edu  

GitHub link: https://github.com/esramir3-dot/Stats-Project

## 1. Executive Summary

DormEats is an AI-assisted meal planning web application designed to help college students make realistic meal decisions when they have limited time, money, ingredients, and cooking equipment. Many students living in dorms or small apartments struggle to cook consistently because most recipe tools assume a full kitchen, a larger grocery supply, and more time than students actually have. As a result, students often skip meals, repeat the same low-quality food choices, or spend too much money on takeout.

The goal of DormEats is to simplify that decision-making process. A user enters dietary restrictions, available ingredients, available equipment, time limit, and budget, and the system returns ranked dorm-friendly meal suggestions. The app also identifies missing ingredients, provides step-by-step instructions, and offers restaurant fallback suggestions when a student does not have enough supplies to cook.

In Phase 2, the project demonstrated the recommendation logic through a working Python prototype. In Phase 3, that prototype was expanded into a full-stack MVP with a frontend and backend, creating a more complete end-user experience. The current MVP demonstrates that the idea is technically feasible, useful in realistic student scenarios, and capable of functioning as an actual product demo rather than only a script-based prototype.

## 2. User and Use Case

The main user for DormEats is a college student living in a dorm, apartment, or other limited cooking environment. This user often has a small pantry, only a few pieces of cooking equipment, a low budget, and a limited amount of time between classes, work, or studying.

The core problem is not just “finding recipes.” The real problem is finding meals that are actually realistic given the student’s current situation. A student may only have a microwave, a few ingredients left in their room, and less than fifteen minutes before class. Traditional recipe sites are often not useful in those conditions because they assume more ingredients, more equipment, and more flexibility than the student has.

A typical DormEats scenario is a student who enters:
- a dietary need such as vegetarian, halal, or gluten-free
- ingredients currently on hand
- available equipment such as microwave, pan, or no-cook only
- a time limit
- a budget cap

The system then returns the best meal options available under those constraints. This makes the app practical for real dorm life rather than idealized cooking situations.

## 3. System Design

DormEats is implemented as a full-stack web application. The frontend allows users to enter their preferences and constraints, while the backend processes those inputs and returns ranked recommendations.

The system has four main parts:
1. a frontend user interface
2. a backend API
3. local recipe and restaurant datasets
4. recommendation and filtering logic

The frontend is responsible for collecting user inputs and displaying meal results in a structured way. The backend handles recommendation generation, recipe filtering, ranking, grocery-gap output, and restaurant fallback suggestions.

At a high level, the system works as follows:
1. the user enters dietary restrictions, available ingredients, available equipment, time limit, and budget
2. the frontend sends this information to the backend
3. the backend filters recipes by dietary compatibility and equipment constraints
4. the remaining recipes are ranked based on ingredient overlap, time fit, and budget fit
5. the backend returns ranked meal suggestions, missing ingredients, and fallback suggestions
6. the frontend displays the results to the user

This design improves on the Phase 2 prototype by turning the recommendation engine into a complete product workflow that can be interacted with directly through a web app.

## 4. Data

The MVP uses small local datasets for recipes, ingredients, substitutions, and restaurant fallback options. These datasets were chosen to keep the system reliable and manageable during development.

The recipe dataset includes structured information such as:
- dietary tags
- ingredient lists
- required equipment
- estimated cooking time
- estimated cost
- step-by-step instructions

The restaurant dataset provides fallback meal options for situations where cooking recommendations are weak or when the user does not have enough ingredients to make a meal.

Local data was used instead of live APIs because it made the MVP easier to test, easier to reproduce, and more stable during development. It also allowed the team to focus on proving that the recommendation logic works before taking on the extra complexity of external integrations.

A major limitation of the current data is that it is still relatively small and hand-built. It works well for demonstration and realistic scenario testing, but it is not yet broad enough to support a large or highly diverse user base.

## 5. Models and Technical Approach

DormEats uses a lightweight AI-assisted recommendation approach rather than a fully trained machine learning model or a chatbot system. This was a deliberate choice. The main technical challenge in this project was not language generation, but making useful recommendations under realistic dorm constraints.

The baseline system was intentionally simple. It only filtered meals by a small number of constraints, such as dietary restrictions and time limit. That baseline often produced weak recommendations because it ignored important factors such as available equipment, ingredient overlap, and affordability.

The improved system added more realistic ranking logic, including:
- dietary compatibility
- equipment compatibility
- ingredient overlap
- time fit
- budget fit

This made the recommendations much more useful because the system could now prioritize meals that were not only technically valid, but actually realistic for a student to make.

The final Phase 3 MVP keeps this logic at the core of the system, but places it inside a full-stack application. In that sense, the technical contribution of Phase 3 is both the recommendation logic itself and the delivery of that logic through a web interface and backend API.

## 6. Evaluation

The evaluation of DormEats focuses on whether the system produces useful recommendations in realistic dorm-life situations. Since this MVP is primarily a recommendation workflow rather than a trained predictive model, the most important evaluation criteria are relevance, practicality, and reproducibility.

During testing, the system was run on representative user scenarios, including:
- an exam-week vegan student
- a halal student with only a microwave
- a gluten-free student with very limited ingredients

These cases were useful because they tested different combinations of dietary restrictions, equipment limitations, and pantry shortages. The improved recommendation system performed better than the weak baseline because it accounted for more of the real-world constraints that matter in dorm cooking.

For example, the system was able to recommend:
- a no-cook hummus wrap for a vegan student
- a microwave veggie rice bowl for a halal student with microwave-only access
- a gluten-free tuna potato bowl for a student with very limited groceries

These results show that the system can adapt recommendations based on realistic changes in user context.

Phase 3 also improves evaluation in a practical sense by making the product easier to demonstrate. Instead of relying only on a script, the project can now be tested through a web interface, which makes the user experience and technical functionality easier to evaluate together.

## 7. Limitations and Risks

Although the MVP is functional, several important limitations remain.

First, the recipe and restaurant datasets are still small and hand-built. They are enough for a course MVP, but not enough for broader deployment.

Second, the system does not yet use live nutrition information or live restaurant APIs. This means the healthfulness and freshness of recommendations are limited by the local data currently stored in the project.

Third, the recommendation logic is still largely rule-based. It does not yet learn from user behavior over time, and it does not include deeper personalization beyond the direct constraints entered by the user.

Fourth, the MVP is still a demo-level product rather than a production-ready application. It demonstrates the concept clearly, but additional work would be needed in deployment, reliability, user accounts, and larger-scale data coverage.

These limitations matter because the long-term value of DormEats depends not only on whether the app works, but on whether it can scale to more users, more recipes, and more realistic food situations.

## 8. Next Steps

With additional time, the next development steps would be:

- expand the recipe dataset using larger public sources such as Kaggle or Hugging Face
- integrate nutrition information from USDA FoodData Central
- improve the quality of substitution and affordability logic
- connect the restaurant fallback system to live APIs such as Yelp or Google Places
- collect real student feedback and use it to improve recommendation quality
- add stronger personalization features
- improve deployment and hosting so the MVP can be shared more reliably

These next steps would move DormEats from a strong course MVP toward a more complete and realistic student product.

## 9. Reproducibility and Demo Instructions

The full MVP is included in the GitHub repository. The repository contains the frontend, backend, and project documentation.

To run the project locally from the repository root:

```bash
npm install
npm run dev
## 4. Data

DormEats uses local seeded datasets for recipes, ingredients, substitutions, and restaurant fallback suggestions. Each recipe entry includes dietary tags, ingredients, required equipment, estimated cooking time, estimated cost, and preparation steps. We used local structured data for the MVP so the app would be reproducible and easy to test without depending on external APIs.

The main limitation of the current data is size. The datasets are useful for demonstration and realistic dorm-style scenarios, but they are still too small for broader deployment.

## 5. Models and Technical Approach

DormEats uses a lightweight recommendation approach rather than a trained machine learning model. The main technical goal of the project was to generate useful recommendations under realistic dorm constraints, not to build a chatbot or large prediction model.

The backend filters recipes based on dietary restrictions and equipment compatibility, then ranks valid candidates using ingredient overlap, time fit, and budget fit. This improves on a weaker baseline approach that only filtered a small number of constraints and often produced unrealistic recommendations.

## 6. Evaluation

We evaluated the MVP using realistic dorm-life scenarios with different combinations of dietary needs, pantry limitations, equipment restrictions, and budget constraints. The main evaluation question was whether the app could produce meal suggestions that were both valid and realistic for a student to make.

For example, a student with vegetarian preferences, rice, beans, tortillas, microwave access, and a small budget should receive simple meal options that strongly match those inputs rather than generic recipes. In testing, the app successfully returned ranked recommendations, missing grocery items, and fallback suggestions, showing that the full workflow functions end to end.

## 7. Limitations and Risks

Although the MVP works, it still has important limitations. The recipe and restaurant datasets are locally seeded and relatively small. Budget and time estimates are simplified, and the system does not yet use live nutrition or restaurant APIs. The recommendation logic is helpful, but it is still mostly rule-based and does not yet learn from user feedback over time.

These limitations mean the project is best understood as a functional MVP and proof of concept rather than a production-ready consumer app.

## 8. Next Steps

With more time, the next improvements would be expanding the recipe dataset, integrating nutrition information, improving substitution logic, adding stronger personalization, and replacing static restaurant fallback suggestions with live API-based results. A more permanent deployment setup would also make the project easier to share and evaluate.

## 9. Reproducibility and Demo Instructions

The MVP can be run from the repository root with:

```bash
npm install
npm run dev
