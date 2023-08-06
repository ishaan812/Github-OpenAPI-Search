import { UpdateAllDocuments } from './updateutils.js';

export async function UpdateOpenAPIFiles(): Promise<string> {
  //Go through all rows in the database
  await UpdateAllDocuments('openapi');
  return 'Updated OpenAPI Files';
}
