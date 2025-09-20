# Chefy

**Chefy** is an Indian food recommendation system that suggests recipes based on user input. It combines **cosine similarity** for typed food items and **YOLO-based image detection** to identify food items from images.

## Features

- **Text-Based Recommendations:** Users can type a food item, and Chefy recommends similar Indian dishes using cosine similarity.  
- **Image-Based Detection:** Upload a food image, and the YOLO model detects and identifies the dish.  
- **Recipe Suggestions:** Get detailed recipes for identified or typed food items.  
- **Indian Cuisine Focus:** Specializes in popular Indian dishes and regional specialties.  
- **Interactive & Fast:** Quick recommendations with minimal latency.

## Installation

### Prerequisites

- Python 3.9+  
- pip or conda  
- Required Python packages: `numpy`, `pandas`, `scikit-learn`, `opencv-python`, `torch`, `yolov5`  

### Steps

1. Clone the repository:  
```bash
git clone https://github.com/yourusername/Chefy.git
cd Chefy
