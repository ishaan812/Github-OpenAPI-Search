import { octokit } from '../app.js';
import { UpdateAllDocuments } from './updateutils.js';

export async function UpdateOpenAPIFiles(esClient: any, octokit: any): Promise<string> {
  //Go through all rows in the database
  await UpdateAllDocuments('openapi', esClient, octokit);
  return 'Updated OpenAPI Files';
}
