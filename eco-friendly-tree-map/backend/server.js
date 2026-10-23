import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pollutionRoutes from './routes/pollution.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// System Configuration
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Express (Node.js) Backend',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/pollution', pollutionRoutes);

// Root route for friendly browser navigation
app.get('/', (req, res) => {
  res.json({
    message: 'Eco-Friendly Tree Map - Express Backend',
    endpoints: {
      health: '/api/health',
      pollution: '/api/pollution?lat={lat}&lng={lng}'
    }
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error(err.stack || err.message);
  // Ensure no raw API secret tokens are exposed to the client response
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Express Backend running on http://localhost:${PORT}`);
});
