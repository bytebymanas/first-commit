import { Router } from 'express';
import { AnalyzeController } from '../controllers/analyzeController.js';

export const analyzeRouter = Router();

analyzeRouter.post('/', AnalyzeController.analyze);
analyzeRouter.post('/chat', AnalyzeController.chat);
