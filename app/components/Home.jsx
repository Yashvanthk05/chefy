"use client"
import { useState } from 'react';
import Head from 'next/head';
import BMICalculator from './BMICalculator';
import FoodSearch from './FoodSearch';
import MealPlanner from './MealPlanner';
import DietSummary from './DietSummary';

export default function Home() {
  const [user, setUser] = useState({
    weight: 70,
    height: 170,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    targetCalories: 2000,
    bmi: null,
    bmiCategory: '',
  });

  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  const [activeTab, setActiveTab] = useState('calculator');

  const handleUserUpdate = (newUserData) => {
    setUser({ ...user, ...newUserData });
  };

  const addFoodToMeal = (food, mealType) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: [...prevMeals[mealType], food]
    }));
  };

  const removeFoodFromMeal = (mealType, index) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter((_, i) => i !== index)
    }));
  };

  const clearMeal = (mealType) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: []
    }));
  };

  const getTotalNutrition = () => {
    const allFoods = [
      ...meals.breakfast,
      ...meals.lunch,
      ...meals.dinner,
      ...meals.snacks
    ];

    return allFoods.reduce((total, food) => {
      return {
        calories: total.calories + food.calories,
        protein_g: total.protein_g + food.protein_g,
        fat_total_g: total.fat_total_g + food.fat_total_g,
        carbohydrates_total_g: total.carbohydrates_total_g + food.carbohydrates_total_g,
        fiber_g: total.fiber_g + (food.fiber_g || 0),
        sugar_g: total.sugar_g + (food.sugar_g || 0)
      };
    }, {
      calories: 0,
      protein_g: 0,
      fat_total_g: 0,
      carbohydrates_total_g: 0,
      fiber_g: 0,
      sugar_g: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Diet Planner</title>
        <meta name="description" content="AI-powered diet planner" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-blue-400 text-white p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">AI Diet Planner</h1>
          <p className="mt-2">Create your personalized meal plan based on your goals</p>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex space-x-2 mb-6 border-b">
          <button 
            className={`py-2 px-4 ${activeTab === 'calculator' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('calculator')}
          >
            Profile & BMI
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'planner' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('planner')}
          >
            Meal Planner
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('summary')}
          >
            Diet Summary
          </button>
        </div>

        {activeTab === 'calculator' && (
          <BMICalculator user={user} onUserUpdate={handleUserUpdate} />
        )}

        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
              <FoodSearch onAddFood={addFoodToMeal} />
            </div>
            <div className="md:col-span-2">
              <MealPlanner 
                meals={meals} 
                onRemoveFood={removeFoodFromMeal} 
                onClearMeal={clearMeal}
                targetCalories={user.targetCalories}
              />
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <DietSummary 
            meals={meals} 
            nutritionTotals={getTotalNutrition()} 
            targetCalories={user.targetCalories}
            bmi={user.bmi}
            bmiCategory={user.bmiCategory}
          />
        )}
      </main>
    </div>
  );
}
