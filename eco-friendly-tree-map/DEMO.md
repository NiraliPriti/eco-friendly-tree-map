# 🌍 Eco-Friendly Tree Map — System Guide & API Integration Manual

Welcome to the **Eco-Friendly Tree Map with SmartCity Simulation**!
This document provides instructions on project architecture, external API tokens, configuration files, and exact terminal commands to run all services.

---

## 🏛️ Project Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │    Next.js 16 Frontend (React 19)     │
                      │         http://localhost:3000         │
                      └───────┬───────────────────────┬───────┘
                              │                       │
           (REST / JSON)      │                       │ (REST / JSON)
       http://localhost:5000  │                       │ http://127.0.0.1:8000
                              ▼                       ▼
               ┌───────────────────────┐   ┌───────────────────────┐
               │ Express (Node.js) API │   │  FastAPI (Python) API │
               │   backend/server.js   │   │ fastapi_backend/main  │
               └──────────┬────────────┘   └──────────┬────────────┘
                          │                           │
                          │   (HTTPS REST Requests)   │
                          └─────────────┬─────────────┘
                                        ▼
                     ┌─────────────────────────────────────┐
                     │         OpenWeatherMap API          │
                     │  - Air Pollution (AQI, PM2.5, PM10) │
                     │  - Current Weather (Humidity, City) │
                     └─────────────────────────────────────┘
```

The frontend includes an **interactive switcher** allowing live queries to either:
1. **Express (Node.js)** backend running on port **5000**
2. **FastAPI (Python)** backend running on port **8000**
3. **Demo Mode** (simulated offline calculation engine if backends are not running)

---

## 🔑 External API Tokens & Configuration

### 1. OpenWeatherMap API (Required by Backends)
* **What it does:** Fetches real-time atmospheric pollution data (AQI 1-5, PM2.5, PM10, NO₂, SO₂, CO, O₃) and meteorological humidity and location name.
* **Token / Key format:** 32-character hexadecimal string (e.g., `your_openweather_api_key_here`).
* **Where to obtain:** Free signup at [OpenWeatherMap API](https://home.openweathermap.org/api_keys).
* **Where to configure:**
  * **Express Backend:** In `backend/.env`:
    ```env
    PORT=5000
    OPENWEATHER_API_KEY=your_openweather_api_key_here
    ```
  * **FastAPI Backend:** In `fastapi_backend/.env`:
    ```env
    PORT=8000
    OPENWEATHER_API_KEY=your_openweather_api_key_here
    ```

---

### 2. Mapbox GL API (Optional for Frontend 3D Satellite Layer)
* **What it does:** Renders high-resolution Mapbox dark vector and satellite raster tiles.
* **Token / Key format:** Starts with `pk.eyJ1I...`
* **Where to obtain:** Free signup at [Mapbox Account Access Tokens](https://account.mapbox.com/access-tokens/).
* **Where to configure:**
  * In root `.env.local`:
    ```env
    NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
    NEXT_PUBLIC_API_URL=http://localhost:5000
    NEXT_PUBLIC_FASTAPI_URL=http://127.0.0.1:8000
    ```
  * *Note:* You can also click the **Sliders icon (⚙️)** in the top right of the sidebar in the browser to paste and apply your Mapbox token live.
  * **Graceful Fallback:** If you do not have a Mapbox token, the application automatically runs on the **Interactive Geo-Satellite Radar Canvas**. You can click anywhere to place pins, select preset cities, and inspect live atmospheric logs without any errors!

---

## 🚀 Commands to Run the Project

You can run the project using **three separate terminal windows** (recommended) or use the npm scripts.

### Terminal 1: Start Next.js Frontend
```powershell
cd c:\Users\neha1\Nirali-Project\eco-friendly-tree-map\eco-friendly-tree-map
npm run dev
```
* **URL:** `http://localhost:3000`

---

### Terminal 2: Start Express (Node.js) Backend
```powershell
cd c:\Users\neha1\Nirali-Project\eco-friendly-tree-map\eco-friendly-tree-map\backend
npm start
```
*(or from root: `npm run server:express`)*
* **URL:** `http://localhost:5000`
* **Health Check:** `http://localhost:5000/api/health`
* **Sample API Query:** `http://localhost:5000/api/pollution?lat=19.0760&lng=72.8777`

---

### Terminal 3: Start FastAPI (Python) Backend
```powershell
cd c:\Users\neha1\Nirali-Project\eco-friendly-tree-map\eco-friendly-tree-map\fastapi_backend
.\venv\Scripts\Activate.ps1
python main.py
```
*(or from root: `npm run server:fastapi`)*
* **URL:** `http://127.0.0.1:8000`
* **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
* **Health Check:** `http://127.0.0.1:8000/api/health`
* **Sample API Query:** `http://127.0.0.1:8000/api/pollution?lat=19.0760&lng=72.8777`

---

## 🧪 Testing Endpoints Directly

You can test either backend directly with `curl` or in your browser:

### Express:
```bash
curl "http://localhost:5000/api/pollution?lat=19.0760&lng=72.8777"
```

### FastAPI:
```bash
curl "http://127.0.0.1:8000/api/pollution?lat=19.0760&lng=72.8777"
```

### Unified JSON Response Format:
Both backends return the identical standardized schema:
```json
{
  "latitude": 19.076,
  "longitude": 72.8777,
  "location_name": "Konkan Division, IN",
  "aqi": 5,
  "aqi_label": "Very Poor",
  "pm2_5": 158.2,
  "pm10": 175.6,
  "no2": 1.2,
  "so2": 10.3,
  "o3": 170.6,
  "co": 533.9,
  "humidity": 51,
  "canopyDeficitPercentage": 80,
  "recommended_tree_count": 70,
  "recommended_species": [
    {
      "name": "Neem",
      "co2": "22kg/yr",
      "humidity": "Moderate",
      "tolerance": "Very High"
    },
    {
      "name": "Banyan",
      "co2": "25kg/yr",
      "humidity": "Moderate",
      "tolerance": "Very High"
    }
  ],
  "timestamp": 1792775941,
  "source": "OpenWeatherMap API"
}
```

---

## 🛠️ Verification & Quality Checks

Run these commands in the root directory to verify code health:
```bash
# Type check TypeScript
npx tsc --noEmit

# Lint check (0 errors, 0 warnings)
npm run lint

# Production build validation
npm run build
```
