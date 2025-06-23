export default function MealPlanner({ meals, onRemoveFood, onClearMeal, targetCalories }) {
    const mealTypes = [
      { id: 'breakfast', name: 'Breakfast', targetPct: 0.25 },
      { id: 'lunch', name: 'Lunch', targetPct: 0.35 },
      { id: 'dinner', name: 'Dinner', targetPct: 0.30 },
      { id: 'snacks', name: 'Snacks', targetPct: 0.10 }
    ];
  
    const getMealCalories = (mealItems) => {
      return mealItems.reduce((sum, item) => sum + item.calories, 0);
    };
  
    return (
      <div className="space-y-6">
        <h2 className="text-2xl text-neutral-400 font-bold">Your Meal Plan</h2>
        
        {mealTypes.map(meal => {
          const mealCalories = getMealCalories(meals[meal.id]);
          const targetMealCalories = targetCalories * meal.targetPct;
          const caloriePercentage = targetMealCalories > 0 
            ? Math.min(100, (mealCalories / targetMealCalories) * 100) 
            : 0;
          
          return (
            <div key={meal.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg  text-neutral-500 font-semibold">{meal.name}</h3>
                <div className="text-sm">
                  <span className={mealCalories > targetMealCalories ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {Math.round(mealCalories)} 
                  </span>
                  <span className="text-gray-500">
                    /{Math.round(targetMealCalories)} cal
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className={`h-2.5 rounded-full ${
                    caloriePercentage > 100 
                      ? 'bg-red-500' 
                      : caloriePercentage > 85 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${caloriePercentage}%` }}
                ></div>
              </div>
              
              {meals[meal.id].length > 0 ? (
                <div className="space-y-2">
                  {meals[meal.id].map((food, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100">
                      <div>
                        <p className=" text-neutral-500 font-medium">{food.name}</p>
                        <p className="text-sm text-gray-500">
                          {food.calories} cal • P: {food.protein_g}g • C: {food.carbohydrates_total_g}g • F: {food.fat_total_g}g
                        </p>
                      </div>
                      <button 
                        onClick={() => onRemoveFood(meal.id, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => onClearMeal(meal.id)}
                    className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Clear all items
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p>No foods added to {meal.name.toLowerCase()} yet</p>
                  <p className="text-sm">Search foods and add them to your meal plan</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }