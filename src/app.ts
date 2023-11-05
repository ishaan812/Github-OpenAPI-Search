import express from 'express';
import { Octokit } from 'octokit';
import { activeSearch, passiveSearch } from './searchtools/search.js';
import dotenv from 'dotenv';
import es from 'elasticsearch';
import { checkClusterHealth, GetDocumentWithId } from './DB/dbutils.js';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';
import { UpdateOpenAPIFiles } from './updatetools/update.js';
import { fileURLToPath } from 'url';
import path from 'path';
import Converter from 'openapi-to-postmanv2';
import { makePostmanCollection } from './utils.js';


const CustomOctokit = Octokit.plugin(throttling as any, retry as any);
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname);

const octokit = new CustomOctokit({
  userAgent: 'github-openapi-search/v0.0.1',
  auth: process.env.GITHUB_API_KEY,
  throttle: {
    onRateLimit: (retryAfter, options): boolean => {

      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`,
      );
      console.info(`Retrying after ${retryAfter} seconds!`);
      return true;
    },
    onSecondaryRateLimit: (retryAfter, options, octokit): void => {
      octokit.log.warn(
        `Secondary quota detected for request ${options.method} ${options.url}`,
      );
    },
  },
});


const esHost = process.env.ES_HOST || 'localhost';
const esClient = new es.Client({
  host: 'http://' + esHost + ':9200',
  // log: 'trace',
});

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(rootDir, 'templates'));
app.get('/search', async (_req, _res) => {
  const query = _req.query.q as string;
  const results = await passiveSearch(query);
  _res.send(results);
});

app.post('/openapi', async (_req, _res) => {
  const Repository = _req.query.repo as string;
  const Organisation = _req.query.org as string;
  const User = _req.query.user as string;
  const Prompt = _req.query.prompt as string;
  const RootQuery = _req.query.rootquery as string;
  const results = await activeSearch(
    Prompt as string,
    Repository as string,
    Organisation as string,
    User as string,
    RootQuery as string,
  );
  _res.send(results);
});

app.put('/openapi', async (_req, _res) => {
  const results = await UpdateOpenAPIFiles();
  _res.send(results);
});

app.use('/ping', async (_req, _res) => {
  const response = await checkClusterHealth();
  _res.send(response);
});


app.get('/openapi/:id', async (_req, _res) => {
  const id = _req.params.id;
  GetDocumentWithId(id).then((response) => {
    _res.send(response);
  });
})

app.get('/', (_req, _res) => {
  const filePath = path.join(rootDir, 'templates', 'index.html');
  _res.sendFile(filePath);
});

app.get('/file/:id', (_req, _res) => {
  const id = _req.params.id;
  GetDocumentWithId(id).then((response) => {
    console.log(response._source.data)
    Converter.convert({ type: 'string', data: response._source.data }, {}, (err, conversionResult) => {
      console.log('Conversion result:', conversionResult);
      if (!conversionResult.result) {
        console.log('Could not convert', conversionResult);
        _res.render('openapifile', {response: response, collection: "Could not convert to Collection"})
      }
      else {
        // console.log('The collection object is: ', conversionResult.output[0].data);
        makePostmanCollection(conversionResult.output[0].data).then((collection) => {
          console.log(collection);
          _res.render('openapifile', {response: response, collection: conversionResult?.output[0].data})
        });
      }
    }
    );
  });
})

export { octokit, esClient, app };

