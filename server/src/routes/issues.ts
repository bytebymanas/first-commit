import { Router } from 'express';
import { IssuesController } from '../controllers/issuesController.js';

export const issuesRouter = Router();

issuesRouter.get('/', IssuesController.getIssues);
issuesRouter.get('/:owner/:repo/:issueNumber', IssuesController.getIssueDetail);
