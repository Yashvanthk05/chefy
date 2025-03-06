import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
import re

class FoodRecommender:
    def __init__(self):
        self.df = None
        self.ingredients_matrix = None
        self.vectorizer = None
        
    def load_data(self, filepath):
        """Load the Indian food dataset"""
        self.df = pd.read_csv(filepath)
        self.df['ingredients_list'] = self.df['ingredients'].apply(lambda x: re.split(r',\s*', x.lower()))
        return self.df
    
    def create_ingredient_matrix(self):
        """Create a matrix of dishes and their ingredients"""
        ingredients_text = self.df['ingredients'].str.lower()
        
        self.vectorizer = CountVectorizer()
        self.ingredients_matrix = self.vectorizer.fit_transform(ingredients_text)
        
        return self.ingredients_matrix
    
    def get_ingredient_names(self):
        """Get the list of all ingredients in the dataset"""
        return self.vectorizer.get_feature_names_out()
    
    def recommend_dishes(self, available_ingredients, top_n=5):
        """Recommend dishes based on available ingredients"""
        if not isinstance(available_ingredients, list):
            available_ingredients = [available_ingredients]
        
        available_ingredients = [ing.lower() for ing in available_ingredients]
        
        user_vector = np.zeros((1, len(self.vectorizer.get_feature_names_out())))
        
        for ingredient in available_ingredients:
            if ingredient in self.vectorizer.vocabulary_:
                idx = self.vectorizer.vocabulary_[ingredient]
                user_vector[0, idx] = 1
        
        similarities = cosine_similarity(user_vector, self.ingredients_matrix).flatten()
        
        top_indices = similarities.argsort()[-top_n:][::-1]
        recommendations = []
        for idx in top_indices:
            dish_name = self.df.iloc[idx]['name']
            dish_ingredients = self.df.iloc[idx]['ingredients_list']
            matching_count = sum(1 for ing in available_ingredients if any(ing in dish_ing for dish_ing in dish_ingredients))
            total_required = len(dish_ingredients)
            missing_ingredients = [ing for ing in dish_ingredients if not any(avail_ing in ing for avail_ing in available_ingredients)]
            
            recommendations.append({
                'name': dish_name,
                'similarity_score': similarities[idx],
                'ingredients': dish_ingredients,
                'matching_ingredients': matching_count,
                'total_ingredients': total_required,
                'missing_ingredients': missing_ingredients
            })
        
        return recommendations
    
    def save_model(self, filepath="food_recommender_model.pkl"):
        """Save the trained model as a pickle file"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'vectorizer': self.vectorizer,
                'df': self.df[['name', 'ingredients', 'ingredients_list']]
            }, f)
        
    def load_model(self, filepath="food_recommender_model.pkl"):
        """Load the trained model from a pickle file"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.vectorizer = data['vectorizer']
            self.df = data['df']
            ingredients_text = self.df['ingredients'].str.lower()
            self.ingredients_matrix = self.vectorizer.transform(ingredients_text)

def train_model(data_path):
    recommender = FoodRecommender()
    recommender.load_data(data_path)
    recommender.create_ingredient_matrix()
    recommender.save_model()
    return recommender

if __name__ == "__main__":
    model_path = "food_recommender_model.pkl"
    
    if not os.path.exists(model_path):
        print("Training model...")
        recommender = train_model("cuisines.csv")
    else:
        print("Loading existing model...")
        recommender = FoodRecommender()
        recommender.load_model(model_path)
    
    test_ingredients = ["rice", "tomato", "onion", "chili"]
    recommendations = recommender.recommend_dishes(test_ingredients)
    
    print(f"\nTop 5 recommended dishes based on: {test_ingredients}")
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['name']} (Score: {rec['similarity_score']:.2f})")
        print(f"   Matching: {rec['matching_ingredients']}/{rec['total_ingredients']} ingredients")
        if rec['missing_ingredients']:
            print(f"   Missing: {', '.join(rec['missing_ingredients'])}")
        print()