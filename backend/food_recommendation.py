import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

def load_dataset(csv_path):
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=['TranslatedIngredients'])  # Drop rows with missing ingredients
    return df

def recommend_recipes(df, available_ingredients):
    df['IngredientMatchCount'] = df['TranslatedIngredients'].apply(
        lambda x: sum(ing in available_ingredients for ing in x.split(', '))
    )
    top_recipes = df.sort_values(by='IngredientMatchCount', ascending=False).head(5)
    return top_recipes[['TranslatedRecipeName', 'TranslatedIngredients']].to_dict(orient='records')

class IngredientsInput(BaseModel):
    ingredients: list

# Load dataset
dataset_path = "cuisines.csv"  # Update with actual path
df = load_dataset(dataset_path)

@app.post("/recommend")
def get_recommendations(input_data: IngredientsInput):
    recommendations = recommend_recipes(df, input_data.ingredients)
    return {"recommended_recipes": recommendations}
