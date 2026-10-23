import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

# Load environment variables (e.g. OPENWEATHER_API_KEY)
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="ECO-friendly Tree Map Backend",
    description="High-performance backend for parsing geospatial atmospheric data.",
    version="1.0.0"
)

# Setup CORS to allow requests from the local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Pydantic Schemas for Response Validation
# ---------------------------------------------------------

class TreeSpecies(BaseModel):
    """Schema representing a single tree species."""
    name: str
    co2: Optional[str] = None
    co2_absorption: Optional[str] = None
    humidity: Optional[str] = None
    ideal_humidity: Optional[str] = None
    tolerance: Optional[str] = None
    max_aqi_tolerance: int

class PollutionResponse(BaseModel):
    """Explicit response model for the /api/pollution endpoint."""
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    aqi: int = Field(..., description="Air Quality Index (1 = Good, 5 = Very Poor)")
    aqi_label: Optional[str] = None
    pm2_5: float = Field(..., description="PM2.5 concentration in μg/m3")
    pm10: float = Field(..., description="PM10 concentration in μg/m3")
    no2: Optional[float] = 0.0
    so2: Optional[float] = 0.0
    o3: Optional[float] = 0.0
    co: Optional[float] = 0.0
    humidity: Optional[int] = 60
    canopyDeficitPercentage: Optional[float] = 0.0
    recommended_tree_count: int = Field(..., description="Suggested number of trees to plant to offset pollution")
    recommended_species: List[TreeSpecies] = Field(..., description="List of tree species suitable for the current AQI")
    timestamp: Optional[int] = None
    source: Optional[str] = "OpenWeatherMap API"

# ---------------------------------------------------------
# In-Memory Database
# ---------------------------------------------------------

LOCAL_TREES_DB = [
    {
        "name": "Neem",
        "co2": "22kg/yr",
        "co2_absorption": "22kg/yr",
        "humidity": "Moderate",
        "ideal_humidity": "Moderate",
        "tolerance": "Very High",
        "max_aqi_tolerance": 5
    },
    {
        "name": "Banyan",
        "co2": "25kg/yr",
        "co2_absorption": "25kg/yr",
        "humidity": "Moderate",
        "ideal_humidity": "Moderate",
        "tolerance": "Very High",
        "max_aqi_tolerance": 5
    },
    {
        "name": "Peepal",
        "co2": "28kg/yr",
        "co2_absorption": "28kg/yr",
        "humidity": "Low",
        "ideal_humidity": "Low",
        "tolerance": "High",
        "max_aqi_tolerance": 4
    },
    {
        "name": "Bamboo",
        "co2": "400kg/yr",
        "co2_absorption": "400kg/yr",
        "humidity": "High",
        "ideal_humidity": "High",
        "tolerance": "High",
        "max_aqi_tolerance": 4
    },
    {
        "name": "Ashoka",
        "co2": "18kg/yr",
        "co2_absorption": "18kg/yr",
        "humidity": "Moderate",
        "ideal_humidity": "Moderate",
        "tolerance": "Fair",
        "max_aqi_tolerance": 3
    },
    {
        "name": "Banana Plant",
        "co2": "15kg/yr",
        "co2_absorption": "15kg/yr",
        "humidity": "High",
        "ideal_humidity": "High",
        "tolerance": "Fair",
        "max_aqi_tolerance": 2
    }
]

AQI_LABELS = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor"
}

def calculate_canopy_deficit(aqi: int) -> float:
    clamped = max(1, min(5, aqi))
    deficit = 10.0 + (clamped - 1) * 17.5
    return round(deficit, 2)

# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "Eco-Friendly Tree Map - FastAPI Backend",
        "endpoints": {
            "health": "/api/health",
            "pollution": "/api/pollution?lat={lat}&lng={lng}",
            "docs": "/docs"
        }
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "FastAPI (Python) Backend",
        "port": 8000
    }

@app.get("/api/pollution", response_model=PollutionResponse)
async def get_pollution_data(
    lat: float = Query(..., description="Latitude of the location"),
    lng: float = Query(..., description="Longitude of the location")
):
    """
    Asynchronously fetches air pollution and weather data from OpenWeatherMap API,
    transforms the raw metrics, and generates a tailored afforestation plan.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Server Configuration Error: Missing API Key")

    openweather_pollution_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lng}&appid={api_key}"
    openweather_weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={api_key}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            pollution_resp = await client.get(openweather_pollution_url)
            pollution_resp.raise_for_status()
        except httpx.HTTPStatusError:
            raise HTTPException(status_code=502, detail="Failed to fetch data from the upstream weather service.")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Weather service is currently unreachable.")

        # Try fetching weather data for real humidity and location name
        weather_data = {}
        try:
            weather_resp = await client.get(openweather_weather_url)
            if weather_resp.status_code == 200:
                weather_data = weather_resp.json()
        except Exception:
            pass

    data = pollution_resp.json()
    if not data.get("list"):
        raise HTTPException(status_code=404, detail="No pollution data found for the given coordinates.")

    raw_metrics = data["list"][0]
    
    # Extract air pollution components
    aqi = raw_metrics.get("main", {}).get("aqi", 1)
    components = raw_metrics.get("components", {})
    pm2_5 = round(components.get("pm2_5", 0.0), 1)
    pm10 = round(components.get("pm10", 0.0), 1)
    no2 = round(components.get("no2", 0.0), 1)
    so2 = round(components.get("so2", 0.0), 1)
    o3 = round(components.get("o3", 0.0), 1)
    co = round(components.get("co", 0.0), 1)

    # Weather details
    humidity = weather_data.get("main", {}).get("humidity", 60)
    city_name = weather_data.get("name")
    country = weather_data.get("sys", {}).get("country")
    if city_name:
        location_name = f"{city_name}, {country}" if country else city_name
    else:
        location_name = f"{lat:.4f}° N, {lng:.4f}° E"

    # Afforestation and canopy metrics
    recommended_tree_count = 10 + ((aqi - 1) * 15)
    canopy_deficit = calculate_canopy_deficit(aqi)

    recommended_species = [
        TreeSpecies(**tree) 
        for tree in LOCAL_TREES_DB 
        if tree["max_aqi_tolerance"] >= aqi
    ]
    if not recommended_species:
        recommended_species = [TreeSpecies(**tree) for tree in LOCAL_TREES_DB[:2]]

    return PollutionResponse(
        latitude=lat,
        longitude=lng,
        location_name=location_name,
        aqi=aqi,
        aqi_label=AQI_LABELS.get(aqi, "Moderate"),
        pm2_5=pm2_5,
        pm10=pm10,
        no2=no2,
        so2=so2,
        o3=o3,
        co=co,
        humidity=humidity,
        canopyDeficitPercentage=canopy_deficit,
        recommended_tree_count=recommended_tree_count,
        recommended_species=recommended_species,
        timestamp=raw_metrics.get("dt"),
        source="OpenWeatherMap API"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
