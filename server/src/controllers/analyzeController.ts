import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/AIService.js';
import { AnalyzeRequest, ChatRequest } from '../models/ai.js';
import { GitHubService } from '../services/GitHubService.js';
import { validateRepo } from '../utils/validate.js';
import { ModelProvider } from '../services/ModelProvider.js';

export class AnalyzeController {
  public static async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { owner, repo, issueNumber, userSkills, language } = req.body;

      if (!owner || !repo || !issueNumber) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Fields owner, repo, and issueNumber are required for analysis.',
          statusCode: 400,
        });
      }

      const repository = validateRepo(`${owner}/${repo}`);
      const number = Number(issueNumber);
      if (!repository || !Number.isSafeInteger(number) || number <= 0) {
        return res.status(400).json({ error: 'Bad Request', message: 'A valid repository and issue number are required.', statusCode: 400 });
      }

      ModelProvider.assertConfigured();

      const issue = await GitHubService.fetchIssue(repository.owner, repository.repo, number);
      const request: AnalyzeRequest = {
        owner: repository.owner,
        repo: repository.repo,
        issueNumber: number,
        issueTitle: issue.title,
        issueBody: issue.body || '',
        labels: issue.labels.map((label) => label.name),
        userSkills: Array.isArray(userSkills) ? userSkills.filter((skill): skill is string => typeof skill === 'string').slice(0, 30) : [],
        language: language === 'hinglish' ? 'hinglish' : 'english',
      };

      const result = await AIService.analyze(request);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, issueContext, history } = req.body as ChatRequest;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'The message field is required.',
          statusCode: 400,
        });
      }

      const reply = await AIService.answerQuestion(message, issueContext, history);
      res.json({ reply });
    } catch (err) {
      next(err);
    }
  }
}
