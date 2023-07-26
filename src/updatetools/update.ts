import { getAllDocuments, UpdateDocuments } from './updateutils.js';

export async function UpdateOpenAPIFiles(esClient: any): Promise<any[]> {
  //Go through all rows in the database
  const rows = await getAllDocuments('openapi', esClient);
  //For each row, check for the file in the repository and update the database using the "If-None-Match" header
  UpdateDocuments(rows, esClient);
  return rows;
}
