export default function DietSummary({ meals, nutritionTotals, targetCalories, bmi, bmiCategory }) {
    // Calculate macronutrient percentages
    const proteinCalories = nutritionTotals.protein_g * 4;
    const carbCalories = nutritionTotals.carbohydrates_total_g * 4;
    const fatCalories = nutritionTotals.fat_total_g * 9;
    const totalCalories = nutritionTotals.calories;

    const proteinPct = totalCalories ? Math.round((proteinCalories / totalCalories) * 100) : 0;
    const carbPct = totalCalories ? Math.round((carbCalories / totalCalories) * 100) : 0;
    const fatPct = totalCalories ? Math.round((fatCalories / totalCalories) * 100) : 0;

    // Calculate calorie goal progress
    const goalProgress = targetCalories ? Math.min(100, (totalCalories / targetCalories) * 100) : 0;

    // Get all foods from all meals
    const allFoodItems = Object.values(meals).flat();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-neutral-600">Diet Summary</h2>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-neutral-500">Calorie Goal Progress</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Current</span>
                            <span className="text-sm text-gray-600">Target</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div
                                className={`h-4 rounded-full ${goalProgress > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${goalProgress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                            <span>{Math.round(totalCalories)} calories</span>
                            <span>{targetCalories} calories</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-neutral-500">Macronutrient Distribution</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="w-full h-4 bg-blue-100 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full"
                                        style={{ width: `${proteinPct}%` }}
                                    ></div>
                                </div>
                                <p className="mt-1 font-medium text-blue-500">{proteinPct}%</p>
                                <p className="text-sm text-gray-600">Protein</p>
                                <p className="text-xs">{Math.round(nutritionTotals.protein_g)}g</p>
                            </div>

                            <div className="text-center">
                                <div className="w-full h-4 bg-green-100 rounded-full overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full"
                                        style={{ width: `${carbPct}%` }}
                                    ></div>
                                </div>
                                <p className="mt-1 font-medium text-green-500">{carbPct}%</p>
                                <p className="text-sm text-gray-600">Carbs</p>
                                <p className="text-xs">{Math.round(nutritionTotals.carbohydrates_total_g)}g</p>
                            </div>

                            <div className="text-center">
                                <div className="w-full h-4 bg-yellow-100 rounded-full overflow-hidden">
                                    <div
                                        className="bg-yellow-500 h-full"
                                        style={{ width: `${fatPct}%` }}
                                    ></div>
                                </div>
                                <p className="mt-1 font-medium text-yellow-500">{fatPct}%</p>
                                <p className="text-sm text-gray-600">Fat</p>
                                <p className="text-xs">{Math.round(nutritionTotals.fat_total_g)}g</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-neutral-500">Additional Nutrients</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-gray-50 rounded-md text-center">
                                <p className="text-lg font-semibold text-neutral-600">{Math.round(nutritionTotals.fiber_g)}g</p>
                                <p className="text-sm text-gray-600">Fiber</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-md text-center">
                                <p className="text-lg font-semibold text-neutral-600">{Math.round(nutritionTotals.sugar_g)}g</p>
                                <p className="text-sm text-gray-600 ">Sugar</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-md text-center">
                                <p className="text-lg font-semibold text-neutral-600">{bmi || '-'}</p>
                                <p className="text-sm text-gray-600">BMI</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-md text-center">
                                <p className="text-lg font-semibold text-neutral-600">{targetCalories - Math.round(totalCalories)}</p>
                                <p className="text-sm text-gray-600">Remaining Cal</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-neutral-600">Meal Distribution</h3>
                    <div className="space-y-4">
                        {Object.entries(meals).map(([mealType, foods]) => {
                            const mealCalories = foods.reduce((sum, food) => sum + food.calories, 0);
                            return (
                                <div key={mealType} className="p-4 bg-gray-50 rounded-md">
                                    <h4 className="text-md font-semibold mb-2 text-neutral-600">{mealType}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{mealCalories} calories</p>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {foods.map((food, index) => (
                                            <li key={index}>{food.name} - {food.calories} cal</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 ">All Food Items</h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                    {allFoodItems.map((food, index) => (
                        <li key={index}>{food.name} - {food.calories} cal</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}