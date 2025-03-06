from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import pandas as pd
from model import FoodRecommender

app = FastAPI(title="Indian Food Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IngredientsRequest(BaseModel):
    ingredients: List[str]

model_path = "food_recommender_model.pkl"
data_path = "indian_food_dataset.csv"
recommender = FoodRecommender()

@app.on_event("startup")
async def startup_event():
    """Initialize the model when the application starts"""
    global recommender
    if os.path.exists(model_path):
        recommender.load_model(model_path)
    else:
        if not os.path.exists(data_path):
            raise HTTPException(status_code=500, detail="Dataset file not found")
        recommender.load_data(data_path)
        recommender.create_ingredient_matrix()
        recommender.save_model(model_path)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Indian Food Recommendation API"}

@app.get("/ingredients")
def get_all_ingredients():
    """Get all available ingredients from the dataset"""
    try:
        ingredients = recommender.get_ingredient_names().tolist()
        return {"ingredients": ingredients}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving ingredients: {str(e)}")

@app.post("/recommend")
def get_recommendations(request: IngredientsRequest):
    """Get top 5 food recommendations based on available ingredients"""
    try:
        if not request.ingredients:
            raise HTTPException(status_code=400, detail="No ingredients provided")
        
        recommendations = recommender.recommend_dishes(request.ingredients, top_n=5)
        
        # Format the response
        response = []
        for rec in recommendations:
            response.append({
                "name": rec["name"],
                "similarity_score": float(rec["similarity_score"]),
                "ingredients": rec["ingredients"],
                "matching_ingredients": rec["matching_ingredients"],
                "total_ingredients": rec["total_ingredients"],
                "missing_ingredients": rec["missing_ingredients"]
            })
        
        return {"recommendations": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)