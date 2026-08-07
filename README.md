

# ECO-friendly Tree Map 🌿🗺️

An interactive, data-driven geospatial full-stack application designed to connect real-time climate metrics with targeted urban afforestation planning. Users can analyze localized air pollution, calculate tree canopy deficits, and virtually plant optimized native tree species on an interactive satellite canvas.

---

## 🚀 Project Vision & Core Strategy
Rapid urbanization has triggered severe air quality degradation and critical tree canopy depletion in urban centers. **ECO-friendly Tree Map** acts as a spatial simulation tool to bridge the gap between abstract climate statistics and targeted environmental action. 

The platform captures precise geographic coordinates via a satellite UI, queries global environmental nodes for live particulate data ($PM_{2.5}$, $PM_{10}$, $O_3$, $NO_2$), runs a specialized canopy deficit formula, and provides users with localized botanical recommendation layouts alongside downloadable analytical reports.

---

## 🛠️ Planned Architecture & Tech Stack

### Frontend (User Interface)
* **Framework:** Next.js (React.js)
* **Styling & Components:** Tailwind CSS & Shadcn/ui
* **Geospatial Mapping:** Mapbox GL JS (`react-map-gl`)
* **Data Visualization:** Recharts (for live atmospheric pollution indexing)

### Backend & Database (Planned Node/Python Expansion)
* **API Runtime:** Node.js (Express) or Python (FastAPI)
* **Database Engine:** PostgreSQL with **PostGIS** Geospatial Extension
* **Deployment Vectors:** Vercel (Frontend) & Supabase / Render (Backend Data)

---

## 🌟 Key Application Features

1. **Interactive Geospatial Canvas:** High-resolution satellite map tracking mouse events and capturing real-time Indian coordinate structures.
2. **Atmospheric Payload Engine:** On-click backend triggers fetching live Air Quality Index (AQI), micro-pollutants, and relative humidity.
3. **Canopy Deficit Algorithm:** Formula-driven system calculating exactly how many trees an area needs versus what it contains to balance the carbon footprint.
4. **Bio-Diverse Recommendation Checklist:** Context-aware suggestions recommending native plant species (e.g., Neem, Bamboo, broad-leafed Banana plants) optimized for local air filtration.
5. **Virtual Simulation Mode:** Drop customizable tree asset markers onto the map to simulate pollution reduction.
6. **Data Document Export:** Convert coordinate summaries, botanical inventories, and pollution metrics into structured CSV spreadsheets or PDF audits.

---

## 📂 UI Development Roadmap

- [ ] Initialize Next.js project container with Tailwind CSS
- [ ] Implement layout framework (Sidebar Dashboard + Main Map Canvas)
- [ ] Integrate Mapbox GL JS engine and render baseline satellite layers
- [ ] Build interactive pointer capture to display dynamic Latitude / Longitude cards
- [ ] Create mock dashboard panels for Pollution metrics and Tree Recommendations
- [ ] Add interactive marker pinning system for Virtual Tree drops
- [ ] Connect production code to live API routes (Backend Integration Phase)

---

## 🛠️ Local Installation & Setup

1. **Clone the project container:**
   ```bash
   git clone https://github.com
   cd eco-friendly-tree-map
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Establish Environment Configurations (`.env.local`):**
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_api_token_here
   ```

4. **Launch the local development node:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) inside your browser to view the application canvas.
