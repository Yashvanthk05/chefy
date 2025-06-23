import { useState, useEffect } from 'react';

export default function BMICalculator({ user, onUserUpdate }) {
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    calculateBMI();
  }, [formData.weight, formData.height]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'height' || name === 'age' || name === 'targetCalories' 
        ? parseFloat(value) 
        : value
    }));
  };

  const calculateBMI = () => {
    if (formData.weight > 0 && formData.height > 0) {
      const heightInMeters = formData.height / 100;
      const bmi = formData.weight / (heightInMeters * heightInMeters);
      
      let bmiCategory = '';
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal weight';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';

      setFormData(prev => ({ ...prev, bmi: bmi.toFixed(1), bmiCategory }));
    }
  };

  const calculateTDEE = () => {
    // Mifflin-St Jeor Equation for BMR
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5;
    } else {
      bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age - 161;
    }

    // Apply activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const tdee = Math.round(bmr * activityMultipliers[formData.activityLevel]);
    return tdee;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const suggestedCalories = calculateTDEE();
    
    setFormData(prev => ({ 
      ...prev, 
      targetCalories: prev.targetCalories || suggestedCalories 
    }));
    
    onUserUpdate(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900">Profile & BMI Calculator</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              className="mt-1 text-neutral-900 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="20"
              max="300"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-900">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height || ''}
              onChange={handleChange}
              className="mt-1 text-neutral-900 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="100"
              max="250"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              className="mt-1 text-neutral-900 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="16"
              max="100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="mt-1 text-neutral-900 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Activity Level</label>
            <select
              name="activityLevel"
              value={formData.activityLevel || ''}
              onChange={handleChange}
              className="mt-1 block p-2 text-neutral-900 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="veryActive">Very Active (hard exercise & physical job)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Daily Calories</label>
            <input
              type="number"
              name="targetCalories"
              value={formData.targetCalories || ''}
              onChange={handleChange}
              className="mt-1 block w-full text-neutral-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1000"
              max="5000"
              placeholder={calculateTDEE()}
            />
            <p className="text-sm text-gray-500 mt-1">
              Suggested: {calculateTDEE()} calories
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="text-lg text-neutral-900 font-semibold">Your BMI Results</h3>
          {formData.bmi ? (
            <div className="flex items-center mt-2">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                {formData.bmi}
              </div>
              <div className="ml-4">
                <p className="font-medium text-lg text-neutral-900">{formData.bmiCategory}</p>
                <p className="text-sm text-gray-600">
                  Normal BMI range: 18.5 - 24.9
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Enter your weight and height to calculate BMI</p>
          )}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}