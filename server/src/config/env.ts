import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root or server directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  githubToken: process.env.GITHUB_TOKEN || '',
  aiProvider: process.env.AI_PROVIDER || (process.env.KAGGLE_KERNEL_URL ? 'kaggle' : 'huggingface'),
  kaggleKernelUrl: process.env.KAGGLE_KERNEL_URL || '',
  aiApiKey: process.env.AI_API_KEY || process.env.HF_TOKEN || '',
  aiBaseUrl: process.env.AI_BASE_URL || (process.env.KAGGLE_KERNEL_URL || 'https://router.huggingface.co/v1'),
  aiModel: process.env.AI_MODEL || process.env.MODEL_ID || 'gemma-3-4b-it',
  nodeEnv: process.env.NODE_ENV || 'development',
};
