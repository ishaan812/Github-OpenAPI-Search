import { queryBuilder, ValidateandStoreFiles} from './searchutils.js';
import { octokit } from '../app.js';


let processCount = 1;
let finishedCount = 1;

export async function activeSearch(
  prompt: string,
  repo: string,
  organisation: string,
  username: string,
  esClient: any,
): Promise<any> {
  const query = await queryBuilder(prompt, repo, organisation, username);
  let files = [];
  let validFiles = [];
  await octokit.paginate(octokit.rest.search.code, {
    q: query,
    per_page: 100
  },
  (response : any) => {
    files = files.concat(response.data)
    if(files.length >= 500){
      console.log("Validating and storing files since rate limit reached")
      processCount++;
      ValidateandStoreFiles(files, esClient).then((validatedFiles) => {
        validFiles = validFiles.concat(validatedFiles);
        finishedCount++;
      });
      files = []
    }
  }
  );
  //this ending before the above one
  ValidateandStoreFiles(files, esClient).then((validatedFiles) => {
    validFiles = validFiles.concat(validatedFiles);
  });
  while(processCount > finishedCount){
    await new Promise(r => setTimeout(r, 3000));
    console.log("Total Processes: "+processCount+"\nFinished Processes: "+finishedCount)
    console.log("Waiting for all files to be processed")
  }
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




