'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [fileData, setFileData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const canvasRef = useRef(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState("manual");

  // Calorie info state
  const [calorieIngredient, setCalorieIngredient] = useState("");
  const [calorieData, setCalorieData] = useState(null);
  const [calorieLoading, setCalorieLoading] = useState(false);
  const [calorieError, setCalorieError] = useState(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('https://chefy-backend-w1q8.onrender.com/ingredients');
        if (!response.ok) {
          throw new Error('Failed to fetch ingredients');
        }
        const data = await response.json();
        setAvailableIngredients(data.ingredients);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchIngredients();
  }, []);

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIngredient = (ingredient) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setSearchTerm("");
  };

  const removeIngredient = (ingredient) => {
    setSelectedIngredients(selectedIngredients.filter(item => item !== ingredient));
  };

  const addCustomIngredient = () => {
    if (searchTerm.trim() !== "" && !selectedIngredients.includes(searchTerm.trim())) {
      setSelectedIngredients([...selectedIngredients, searchTerm.trim()]);
      setSearchTerm("");
    }
  };

  const getRecommendations = async () => {
    if (selectedIngredients.length === 0) {
      setError("Please select at least one ingredient");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://chefy-backend-w1q8.onrender.com/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: selectedIngredients }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadImageBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const loadImageByteArray = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const byteArray = Array.from(new Uint8Array(arrayBuffer));
        resolve(byteArray);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileData(file);
      setImageUrl(URL.createObjectURL(file));
      try {
        setImageLoading(true);
        const base64Image = await loadImageBase64(file);
        
        const response = await axios({
          method: "POST",
          url: "https://detect.roboflow.com/chefy/1",
          params: {
            api_key: "6QDWXughPtJg42hJHXaE"
          },
          data: base64Image,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });
        setPredictions(response.data.predictions);
        
        if (response.data.predictions && response.data.predictions.length > 0) {
          const detectedIngredients = response.data.predictions.map(pred => pred.class.toLowerCase());
          const uniqueDetectedIngredients = [...new Set(detectedIngredients)];
          
          const newIngredients = uniqueDetectedIngredients.filter(
            ing => !selectedIngredients.includes(ing)
          );
          
          if (newIngredients.length > 0) {
            setSelectedIngredients([...selectedIngredients, ...newIngredients]);
          }
        }
        
        setImageLoading(false);
      } catch (error) {
        setImageError(error.message);
        setImageLoading(false);
      }
    }
  };

  useEffect(() => {
    if (imageUrl && predictions && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = new Image();
      
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        
        ctx.drawImage(image, 0, 0);
        
        predictions.forEach(pred => {
          const x = pred.x - (pred.width / 2);
          const y = pred.y - (pred.height / 2);
          
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, pred.width, pred.height);
          
          ctx.fillStyle = '#00000';
          ctx.font = '16px Arial';
          ctx.fillText(
            `${pred.class} ${(pred.confidence * 100).toFixed(1)}%`,
            x, y - 5
          );
        });
      };
      
      image.src = imageUrl;
    }
  }, [imageUrl, predictions]);

  const fetchCalorieInfo = async () => {
    if (calorieIngredient.trim() === "") {
      setCalorieError("Please enter an ingredient");
      return;
    }

    setCalorieLoading(true);
    setCalorieError(null);

    try {
      const response = await axios.get(`https://api.calorieninjas.com/v1/nutrition?query=${calorieIngredient}`, {
        headers: {
          'X-Api-Key': 'hI1UDNZKvMl8LM5wUBRzmQ==MS1TVJa8uG4ajSZm'
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('No calorie information found for the ingredient');
      }

      setCalorieData(response.data.items[0]);
    } catch (error) {
      setCalorieError(error.message);
    } finally {
      setCalorieLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <h1 className="text-2xl bg-blue-500 p-6 -m-4 font-bold text-center text-white mb-6">Chefy<br/>Indian Food Recommendation System</h1>
      
      {/* Tab navigation */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 ${activeTab === "manual" ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab("manual")}
        >
          Manual Selection
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "image" ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab("image")}
        >
          Image Detection
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "calorie" ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab("calorie")}
        >
          Calorie Info
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className="mb-8">
        {/* Manual ingredient selection */}
        {activeTab === "manual" && (
          <>
            <h2 className="text-black text-xl font-semibold mb-4">Select Your Ingredients</h2>
            
            <div className="flex mb-4">
              <input
                type="text"
                className="text-black flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search or type ingredient"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomIngredient()}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
                onClick={addCustomIngredient}
              >
                Add
              </button>
            </div>
            
            {searchTerm && (
              <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded">
                {filteredIngredients.length > 0 ? (
                  filteredIngredients.slice(0, 10).map((ingredient, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-gray-400 border-b border-gray-100"
                      onClick={() => addIngredient(ingredient)}
                    >
                      {ingredient}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No matching ingredients. You can add your own.</div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Image detection */}
        {activeTab === "image" && (
          <>
            <h2 className="text-black text-xl font-semibold mb-4">Detect Ingredients from Image</h2>
            <div className="mb-4">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="mb-4" 
              />
            </div>
            
            {imageLoading && (
              <div className="text-center py-4">
                <p>Processing image...</p>
              </div>
            )}
            
            {imageError && (
              <div className="text-red-500 py-2">
                Error: {imageError}
              </div>
            )}
            
            {imageUrl && (
              <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                <canvas 
                  ref={canvasRef}
                  className="max-w-full h-auto"
                />
                {predictions && predictions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium">Detected Ingredients:</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[...new Set(predictions.map(p => p.class))].map((ingredient, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {activeTab === "calorie" && (
          <>
            <h2 className="text-black text-xl font-semibold mb-4">Calorie Calculator</h2>
            <div className="flex mb-4">
              <input
                type="text"
                className="text-black flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ingredient"
                value={calorieIngredient}
                onChange={(e) => setCalorieIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchCalorieInfo()}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
                onClick={fetchCalorieInfo}
              >
                Get Calories
              </button>
            </div>

            {calorieLoading && (
              <div className="text-center py-4">
                <p>Fetching calorie information...</p>
              </div>
            )}

            {calorieError && (
              <div className="text-red-500 py-2">
                Error: {calorieError}
              </div>
            )}

            {calorieData && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800">{calorieData.name}</h3>
                <p className="text-sm text-gray-600">Calories: {calorieData.calories} kcal</p>
                <p className="text-sm text-gray-600">Serving Size: {calorieData.serving_size_g} g</p>
                <p className="text-sm text-gray-600">Protein: {calorieData.protein_g} g</p>
                <p className="text-sm text-gray-600">Fat: {calorieData.fat_total_g} g</p>
                <p className="text-sm text-gray-600">Carbohydrates: {calorieData.carbohydrates_total_g} g</p>
              </div>
            )}
          </>
        )}
        
        {/* Selected ingredients section - Always visible */}
        {(activeTab === "manual" || activeTab === "image") && (
          <div className="mt-4">
            <h3 className="text-black font-medium mb-2">Selected Ingredients:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedIngredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span>{ingredient}</span>
                  <button
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => removeIngredient(ingredient)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedIngredients.length === 0 && (
                <div className="text-gray-500">No ingredients selected yet</div>
              )}
            </div>
            
            <button
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition disabled:bg-gray-400"
              onClick={getRecommendations}
              disabled={selectedIngredients.length === 0 || loading}
            >
              {loading ? "Finding Recommendations..." : "Get Food Recommendations"}
            </button>
            
            {error && <div className="mt-2 text-red-500">{error}</div>}
          </div>
        )}
      </div>
      
      {/* Recommendations display */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-black text-xl font-semibold mb-4">Top 5 Recommended Dishes</h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-800">{rec.name}</h3>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Match: {(rec.similarity_score * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ingredients Match:</span> {rec.matching_ingredients} of {rec.total_ingredients}
                  </p>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Ingredients:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.ingredients.map((ing, i) => (
                        <span 
                          key={i} 
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedIngredients.some(si => ing.includes(si))
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {rec.missing_ingredients.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Missing Ingredients:</p>
                      <p className="text-sm text-gray-600">{rec.missing_ingredients.join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;