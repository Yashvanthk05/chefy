import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import json

# 1. Load and preprocess the dataset
def load_and_preprocess_data(file_path):
    """Load and preprocess the Indian food dataset"""
    # Load dataset (assumes CSV format from Kaggle)
    df = pd.read_csv(file_path)
    
    # Clean and preprocess ingredients
    # Assuming ingredients are in a column called 'ingredients'
    # If ingredients are in a different format, adjust this preprocessing
    df['ingredients_cleaned'] = df['ingredients'].str.lower()
    
    # Handle missing values if any
    df = df.dropna(subset=['name', 'ingredients_cleaned'])
    
    return df

# 2. Create ingredient-based vectorization
def create_ingredient_vectors(df):
    """Create binary vectors representing presence of ingredients in recipes"""
    # Create a bag of words representation of ingredients
    vectorizer = CountVectorizer(tokenizer=lambda x: x.split(','), binary=True)
    ingredient_matrix = vectorizer.fit_transform(df['ingredients_cleaned'])
    
    # Get feature names (ingredients)
    ingredients = vectorizer.get_feature_names_out()
    
    return ingredient_matrix, vectorizer, ingredients

# 3. Recommendation function
def get_recommendations(detected_ingredients, df, vectorizer, top_n=5):
    """Get top recipe recommendations based on detected ingredients"""
    # Convert detected ingredients to a string
    detected_str = ", ".join(detected_ingredients).lower()
    
    # Vectorize the detected ingredients
    detected_vector = vectorizer.transform([detected_str])
    
    # Calculate similarity scores
    similarity_scores = cosine_similarity(detected_vector, 
                                          vectorizer.transform(df['ingredients_cleaned']))
    
    # Get indices of top matches
    indices = similarity_scores[0].argsort()[::-1][:top_n]
    
    # Return recommended recipes
    recommendations = df.iloc[indices][['name', 'ingredients', 'region', 'description']]
    
    return recommendations.to_dict(orient='records')

# 4. Train and save the model
def train_and_save_model(data_path, model_output_path):
    """Train the recommendation model and save components for inference"""
    # Load and preprocess data
    df = load_and_preprocess_data(data_path)
    
    # Create ingredient vectors
    _, vectorizer, _ = create_ingredient_vectors(df)
    
    # Save model components
    model_data = {
        'vectorizer': vectorizer,
        'recipes_data': df.to_dict(orient='records')
    }
    
    # Save using joblib
    joblib.dump(model_data, model_output_path)
    
    # Also save a JSON version of the recipes for JavaScript consumption
    with open(model_output_path.replace('.pkl', '.json'), 'w') as f:
        json.dump({
            'recipes': df[['name', 'ingredients', 'region', 'description']].to_dict(orient='records')
        }, f)
    
    print(f"Model saved to {model_output_path}")
    print(f"Recipe data saved to {model_output_path.replace('.pkl', '.json')}")
    
    return model_data

# 5. Inference function
def recommend_recipes(detected_ingredients, model_data, top_n=5):
    """Recommend recipes based on detected ingredients using the trained model"""
    # Extract components from model data
    vectorizer = model_data['vectorizer']
    df = pd.DataFrame(model_data['recipes_data'])
    
    # Get recommendations
    recommendations = get_recommendations(detected_ingredients, df, vectorizer, top_n)
    
    return recommendations

# Example usage for training
if __name__ == "__main__":
    # Update this path to your Kaggle dataset location
    data_path = "cuisines.csv"
    model_output_path = "indian_food_recommender_model.pkl"
    
    # Train and save the model
    model_data = train_and_save_model(data_path, model_output_path)
    
    # Example inference
    detected_ingredients = ['tomato', 'onion', 'potato']
    recommendations = recommend_recipes(detected_ingredients, model_data)
    
    print("\nTop recommendations for", detected_ingredients)
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['name']} - {rec['description']}")
        print(f"   Ingredients: {rec['ingredients']}")
        print()