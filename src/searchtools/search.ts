import { getFileContents, handleCodeSearch, generateUUID } from './searchutils.js';
import { BulkStoreToDB } from '../DB/dbutils.js';
import OASNormalize from 'oas-normalize';

export async function activeSearch(
  prompt: string,
  repo: string,
  organisation: string,
  username: string,
  esClient: any,
): Promise<any> {
  //3 types of searches:
  // If repository is specified, then search through that repository: /search/code with repo name
  // If organisation is specified then search through that organisation: /search/code with org name
  // If user is specified then search through that user: /search/code with user name
  // If none is specified then return error
  const validFiles = [];
  const files = await handleCodeSearch(prompt, repo, organisation, username, 1);
  for (const file of files) {
    const base64content = await getFileContents(
      file.repository.owner.login,
      file.repository.name,
      file.path,
    );
    const content = Buffer.from(base64content, 'base64').toString();
    const oas = new OASNormalize.default(content);
    oas
      .validate()
      .then((definition) => {
        console.log('File ' + file.name + ' is valid');
        console.log(definition?.info?.title)
        validFiles.push({index: { _index: 'openapi', _id: generateUUID()}});
        validFiles.push({title: definition?.info?.title, description: definition?.info?.description, version: definition?.info?.version, servers: JSON.stringify(definition?.servers), paths: JSON.stringify(definition?.paths) , path: file.path, repository: file?.repository?.name, owner: file?.repository?.owner?.login, data: content});
      })
      .catch((error) => {
        // Error will be an array of validation errors.
        console.log('File ' + file.name + ' is not valid');
      });
    }
  BulkStoreToDB(validFiles as any[],esClient as any);
  return validFiles;
}

export async function passiveSearch(
  query: string,
  esClient: any,
): Promise<any> {
  const result = await esClient.search({
    index: 'openapi',
    body: {
      query: {
        match: {data: query}
      }
    }
  });
  if(result.hits.hits.length === 0) {
    console.log("No results found in database");
    // activeSearch(query, "", "", "", esClient);
  } 
  return result;
}