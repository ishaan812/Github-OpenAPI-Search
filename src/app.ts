import express from 'express';
import { Octokit } from 'octokit';
import { activeSearch, passiveSearch } from './searchtools/search.js';
import dotenv from 'dotenv';
import es from 'elasticsearch';
import { checkClusterHealth } from './DB/dbutils.js';
// import { router as userRoutes } from "./routes/user.routes.js";

dotenv.config();

const app = express();
const octokit = new Octokit({
  userAgent: 'github-openapi-search/v0.0.1',
  auth: process.env.GITHUB_API_KEY,
});

const esClient = new es.Client({
  host: 'http://localhost:9200',
  log: 'trace',
});

// Should not even be an API endpoint for passive search
// Should just fetch repositories and go through them (with ETAG to make sure no repeats)
// Check for openapi.json in the contents of the repository
// If it exists, then store in database with important content

app.use('/passive', async (_req, _res) => {
  const query = _req.query.q as string;
  const results = await passiveSearch(query, esClient);
  _res.send(results);
})

app.use('/search', async (_req, _res) => {
  const Repository = _req.query.repo as string;
  const Organisation = _req.query.org as string;
  const User = _req.query.user as string;
  const Prompt = _req.query.prompt as string;
  const results = await activeSearch(
    Prompt as string,
    Repository as string,
    Organisation as string,
    User as string,
    esClient as any,
  );
  _res.send(results);
});

app.use('/ping', async (_req, _res) => {
  const response = await checkClusterHealth(esClient);
  _res.send(response);
})

app.get('/', (_req, _res) => {
  _res.send('TypeScript With Express');
});

export default app;
export { octokit };
