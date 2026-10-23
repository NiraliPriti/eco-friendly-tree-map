import axios from 'axios';

// Indian and tropical trees database with ecological metrics
const LOCAL_TREES_DB = [
  {
    name: "Neem",
    co2: "22kg/yr",
    co2_absorption: "22kg/yr",
    humidity: "Moderate",
    ideal_humidity: "Moderate",
    tolerance: "Very High",
    max_aqi_tolerance: 5
  },
  {
    name: "Banyan",
    co2: "25kg/yr",
    co2_absorption: "25kg/yr",
    humidity: "Moderate",
    ideal_humidity: "Moderate",
    tolerance: "Very High",
    max_aqi_tolerance: 5
  },
  {
    name: "Peepal",
    co2: "28kg/yr",
    co2_absorption: "28kg/yr",
    humidity: "Low",
    ideal_humidity: "Low",
    tolerance: "High",
    max_aqi_tolerance: 4
  },
  {
    name: "Bamboo",
    co2: "400kg/yr",
    co2_absorption: "400kg/yr",
    humidity: "High",
    ideal_humidity: "High",
    tolerance: "High",
    max_aqi_tolerance: 4
  },
  {
    name: "Ashoka",
    co2: "18kg/yr",
    co2_absorption: "18kg/yr",
    humidity: "Moderate",
    ideal_humidity: "Moderate",
    tolerance: "Fair",
    max_aqi_tolerance: 3
  },
  {
    name: "Banana Plant",
    co2: "15kg/yr",
    co2_absorption: "15kg/yr",
    humidity: "High",
    ideal_humidity: "High",
    tolerance: "Fair",
    max_aqi_tolerance: 2
  }
];

const AQI_LABELS = {
  1: "Good",
  2: "Fair",
  3: "Moderate",
  4: "Poor",
  5: "Very Poor"
};

// Calculates canopyDeficitPercentage based on AQI (10% for AQI=1, 80% for AQI=5)
const calculateCanopyDeficit = (aqi) => {
  const clampedAqi = Math.max(1, Math.min(5, aqi || 1));
  const deficit = 10 + (clampedAqi - 1) * 17.5;
  return Math.round(deficit * 100) / 100;
};

export const getPollutionData = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing required query parameters: lat and lng' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude format' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY is not configured in environment variables.');
      return res.status(500).json({ error: 'Internal Server Configuration Error: Missing API Key' });
    }

    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    // Concurrently fetch air pollution and weather metrics
    const [pollutionResult, weatherResult] = await Promise.allSettled([
      axios.get(airPollutionUrl),
      axios.get(weatherUrl)
    ]);

    if (pollutionResult.status === 'rejected') {
      console.error('Error fetching from OpenWeather Air Pollution API:', pollutionResult.reason?.message || 'Unknown error');
      return res.status(502).json({ error: 'Failed to fetch data from external weather service' });
    }

    const pollutionData = pollutionResult.value.data;
    if (!pollutionData || !pollutionData.list || pollutionData.list.length === 0) {
      return res.status(404).json({ error: 'No pollution data found for this location' });
    }

    const rawPollution = pollutionData.list[0];
    const aqi = rawPollution.main?.aqi || 1;
    const components = rawPollution.components || {};
    const pm2_5 = components.pm2_5 || 0;
    const pm10 = components.pm10 || 0;
    const no2 = components.no2 || 0;
    const so2 = components.so2 || 0;
    const o3 = components.o3 || 0;
    const co = components.co || 0;

    // Extract weather details (humidity, location name)
    let humidity = 60;
    let locationName = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;

    if (weatherResult.status === 'fulfilled' && weatherResult.value.data) {
      const weatherData = weatherResult.value.data;
      if (weatherData.main && typeof weatherData.main.humidity === 'number') {
        humidity = weatherData.main.humidity;
      }
      if (weatherData.name) {
        const country = weatherData.sys?.country ? `, ${weatherData.sys.country}` : '';
        locationName = `${weatherData.name}${country}`;
      }
    }

    const canopyDeficitPercentage = calculateCanopyDeficit(aqi);
    const recommended_tree_count = 10 + (aqi - 1) * 15;

    // Filter suitable tree species based on AQI tolerance
    let recommended_species = LOCAL_TREES_DB.filter(tree => tree.max_aqi_tolerance >= aqi);
    if (recommended_species.length === 0) {
      recommended_species = LOCAL_TREES_DB.slice(0, 2);
    }

    const payload = {
      latitude,
      longitude,
      location_name: locationName,
      aqi,
      aqi_label: AQI_LABELS[aqi] || "Moderate",
      pm2_5: Math.round(pm2_5 * 10) / 10,
      pm10: Math.round(pm10 * 10) / 10,
      no2: Math.round(no2 * 10) / 10,
      so2: Math.round(so2 * 10) / 10,
      o3: Math.round(o3 * 10) / 10,
      co: Math.round(co * 10) / 10,
      humidity,
      canopyDeficitPercentage,
      recommended_tree_count,
      recommended_species,
      timestamp: rawPollution.dt || Math.floor(Date.now() / 1000),
      source: "OpenWeatherMap API"
    };

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};
