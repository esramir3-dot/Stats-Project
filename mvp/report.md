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

The core problem is not just finding recipes. The real problem is finding meals that are actually realistic given the student’s current situation. A student may only have a microwave, a few ingredients left in their room, and less than fifteen minutes before class. Traditional recipe sites are often not useful in those conditions because they assume more ingredients, more equipment, and more flexibility than the student has.

A typical DormEats scenario is a student who enters:
- a dietary need such as vegetarian, halal, or gluten-free
- ingredients currently on hand
- available equipment such as microwave, pan, or no-cook only
- a time limit
- a budget cap

The system then returns the best meal options available under those constraints. This makes the app practical for real dorm life rather than idealized cooking situations.

One example scenario is a student who enters vegetarian as the dietary preference, rice, beans, and tortillas as current ingredients, microwave as the available equipment, 10 to 15 minutes as the time limit, and $8 as the budget. In that case, the system should prioritize simple, cheap, dorm-friendly meals that use those ingredients heavily and avoid suggesting unrealistic full-kitchen meals.

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
