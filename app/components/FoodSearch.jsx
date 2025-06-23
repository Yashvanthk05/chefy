import { useState } from 'react';

export default function FoodSearch({ onAddFood }) {
  const [query, setQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('serving');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
    const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
      headers: { 'X-Api-Key': 'hI1UDNZKvMl8LM5wUBRzmQ==MS1TVJa8uG4ajSZm' }
    });
    const data = await response.json();
      if (response.ok) {
        setSearchResults(data.items);
      } else {
        setError(data.message || 'Error fetching nutrition data');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to connect to nutrition API');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFood = (food, mealType) => {
    onAddFood(food, mealType);
    // Optional: Clear search results after adding
    // setSearchResults([]);
    // setQuery('');
  };

  return (
    <div>
      <h2 className="text-xl text-neutral-400 font-bold mb-4">Search Foods</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. apple, chicken breast, pasta"
              className="w-full text-neutral-600 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value)))}
                min="0.1"
                step="0.1"
                className="text-neutral-600 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 border text-neutral-600 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="serving">serving</option>
                <option value="g">grams</option>
                <option value="oz">ounces</option>
                <option value="cup">cup</option>
                <option value="tbsp">tablespoon</option>
                <option value="tsp">teaspoon</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search Food'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div>
          <h3 className="font-medium  text-neutral-600 mb-2">Results:</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {searchResults.map((food, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <p className="text-neutral-500 font-medium">{food.name} ({food.serving_size_g}g{food.serving_unit ? ' ' + food.serving_unit : ''})</p>
                <p className="text-sm text-gray-600">{food.calories} calories</p>
                <div className="text-xs text-gray-500 mt-1">
                  Protein: {food.protein_g}g • Carbs: {food.carbohydrates_total_g}g • Fat: {food.fat_total_g}g
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
                    <button
                      key={meal}
                      onClick={() => handleAddFood(food, meal)}
                      className="text-xs py-1 px-2 bg-green-100 hover:bg-green-200 text-green-800 rounded transition duration-200"
                    >
                      Add to {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}