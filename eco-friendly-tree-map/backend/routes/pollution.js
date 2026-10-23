import express from 'express';
import { getPollutionData } from '../controllers/pollutionController.js';

const router = express.Router();

router.get('/', getPollutionData);

export default router;
