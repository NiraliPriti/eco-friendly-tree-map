# 🌲 Eco-Friendly Tree Map & Afforestation Planner

An intelligent geospatial web platform that monitors live regional air pollution metrics, evaluates urban tree canopy deficit, and automatically computes targeted afforestation recommendations.

---

## 🌟 Key Features

* **Live Atmospheric Telemetry:** Queries real-time Air Quality Index (AQI 1-5), PM2.5, PM10, NO₂, SO₂, O₃, CO, and relative humidity via OpenWeatherMap API.
* **Afforestation Recommendations:** Dynamic calculation of required tree planting counts and climate/AQI-tolerant species (e.g. Neem, Banyan, Peepal, Bamboo, Ashoka).
* **Dual Backend Support:** Fully integrated with both an **Express (Node.js)** backend and a **FastAPI (Python)** backend, with an interactive runtime switcher in the frontend.
* **Interactive Map & Fallback Canvas:** Supports Mapbox GL dark satellite layers with graceful fallback to a radar geo-satellite canvas when no token is present.
* **CSV Report Generation:** Download comprehensive ecological and afforestation reports with a single click.

---

## 📁 Repository Structure

```
├── app/                  # Next.js 16 (React 19) App Router frontend
│   ├── page.tsx          # Interactive Dashboard, Map & Afforestation Planner
│   ├── layout.tsx        # Root layout with Geist typography
│   └── globals.css       # Tailwind CSS v4 styling
├── backend/              # Express.js (Node.js) REST API
│   ├── server.js         # Express server on port 5000
│   ├── controllers/      # Pollution & afforestation controller
│   ├── routes/           # /api/pollution routes
│   └── .env              # Environment config (OPENWEATHER_API_KEY)
├── fastapi_backend/      # FastAPI (Python) REST API
│   ├── main.py           # High-performance ASGI server on port 8000
│   └── .env              # Environment config (OPENWEATHER_API_KEY)
├── public/               # Static assets & satellite imagery
├── DEMO.md               # Quick-start demonstration and reviewer guide
└── package.json          # Root scripts & dependencies
```

---

## ⚙️ Quick Start

See [DEMO.md](file:///c:/Users/neha1/Nirali-Project/eco-friendly-tree-map/eco-friendly-tree-map/DEMO.md) for full setup instructions, external API token details, and commands.

```bash
# 1. Start Frontend
npm run dev

# 2. Start Express Backend
npm run server:express

# 3. Start FastAPI Backend
npm run server:fastapi
```
