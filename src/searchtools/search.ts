import { handleCodeSearch, validateFiles} from './searchutils.js';
import { BulkStoreToDB } from '../DB/dbutils.js';

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
  const files = await handleCodeSearch(prompt, repo, organisation, username, 1);
  const validFiles= await validateFiles(files);
  BulkStoreToDB(validFiles as any[],esClient as any);
  return validFiles;
}

export async function passiveSearch(
  query: string,
  esClient: any,
): Promise<any> {
  try {
    if (esClient === undefined) {
      throw new Error('Invalid Elasticsearch client');
    }
    const result = await esClient.search({
      index: 'openapi',
      body: {
        query: {
          simple_query_string: {
            query: query,
            fields: ["servers^2","paths^1.5","data^1"],
            default_operator: "and"
          }
        }
      }
    });

    if (result.hits.hits) {
      if (result.hits.hits.length === 0) {
        console.log('No results found in the database');
        // activeSearch(query, "", "", "", esClient);
      }
      return result.hits.hits;
    }
  } catch (error) {
    if (error.message.includes('No Living connections')) {
      console.log('Elasticsearch connection error:', error);
      return error
    } else {
      console.log('Error occurred during passive search:', error);
      return error; 
    }
  }

  return 'Database not found';
}




