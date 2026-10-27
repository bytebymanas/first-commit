import { Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/GitHubService.js';
import { validateRepo } from '../utils/validate.js';

export class IssuesController {
  public static async getIssues(req: Request, res: Response, next: NextFunction) {
    try {
      let owner = req.query.owner as string;
      let repo = req.query.repo as string;
      const label = (req.query.label as string) || undefined;
      const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;

      // Support either ?repo=owner/repo or ?owner=owner&repo=repo
      if (!owner && repo) {
        const parsed = validateRepo(repo);
        if (parsed) {
          owner = parsed.owner;
          repo = parsed.repo;
        }
      }

      if (!owner || !repo) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Both "owner" and "repo" (or "repo=owner/name") query parameters are required.',
          statusCode: 400,
        });
      }

      const parsed = validateRepo(`${owner}/${repo}`);
      if (!parsed) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Invalid repository identifier: "${owner}/${repo}".`,
          statusCode: 400,
        });
      }

      if (!Number.isSafeInteger(page) || page < 1 || page > 10) {
        return res.status(400).json({ error: 'Bad Request', message: 'Page must be a number from 1 to 10.', statusCode: 400 });
      }

      if (query.length > 100) {
        return res.status(400).json({ error: 'Bad Request', message: 'Search terms must be 100 characters or fewer.', statusCode: 400 });
      }

      const result = query
        ? await GitHubService.searchIssues(parsed.owner, parsed.repo, query, label, page)
        : await GitHubService.fetchIssues(parsed.owner, parsed.repo, label, page);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async getIssueDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { owner, repo, issueNumber } = req.params;
      const parsedNum = parseInt(issueNumber, 10);

      if (!owner || !repo || isNaN(parsedNum)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Valid owner, repo, and numeric issueNumber parameters are required.',
          statusCode: 400,
        });
      }

      const issue = await GitHubService.fetchIssue(owner, repo, parsedNum);
      res.json(issue);
    } catch (err) {
      next(err);
    }
  }
}
