import { queryBuilder, ValidateandStoreFiles} from './searchutils.js';
import { octokit } from '../app.js';


let processCount = 1;
let finishedCount = 1;

export async function activeSearch(
  prompt: string,
  repo: string,
  organisation: string,
  username: string,
  rootquery: string,
  esClient: any,
): Promise<any> {
  const query = await queryBuilder(prompt, repo, organisation, username, rootquery);
  let files = [];
  let validFiles = [];
  console.log("Query: "+query)
  await octokit.paginate(octokit.rest.search.code, {
    q: query,
    per_page: 100
  },
  (response : any) => {
    files = files.concat(response.data)
    if(files.length >= 200){
      processCount++;
      console.log("ValidateandStoreFiles Process Number "+processCount+" Started")
      ValidateandStoreFiles(files, esClient).then((validatedFiles) => {
        validFiles = validFiles.concat(validatedFiles);
        finishedCount++;
        console.log("ValidateandStoreFiles Process Number "+finishedCount+" Started")
      });
      files = []
    }
  }
  );
  //this ending before the above one
  processCount++;
  console.log("ValidateandStoreFiles Process Number "+processCount+" Started")
  ValidateandStoreFiles(files, esClient).then((validatedFiles) => {
    validFiles = validFiles.concat(validatedFiles);
    console.log("ValidateandStoreFiles Process Number "+finishedCount+" Started")
    finishedCount++;
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




