import { Router } from 'express';
import { RepositoriesController } from '../controllers/repositoriesController.js';

export const repositoriesRouter = Router();
repositoriesRouter.get('/:owner/:repo/docs', RepositoriesController.getDocs);
