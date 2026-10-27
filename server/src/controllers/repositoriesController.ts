import { Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/GitHubService.js';
import { validateRepo } from '../utils/validate.js';

export class RepositoriesController {
  public static async getDocs(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = validateRepo(`${req.params.owner}/${req.params.repo}`);
      if (!parsed) return res.status(400).json({ error: 'Bad Request', message: 'A valid owner and repository name are required.', statusCode: 400 });
      res.json(await GitHubService.fetchRepositoryDocs(parsed.owner, parsed.repo));
    } catch (err) { next(err); }
  }
}
