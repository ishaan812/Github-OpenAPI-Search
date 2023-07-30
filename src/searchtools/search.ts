import { queryBuilder, ValidateandStoreFiles } from './searchutils.js';
import { octokit } from '../app.js';

let processCount = 0;
let finishedCount = 0;


export async function activeSearch(
  prompt: string,
  repo: string,
  organisation: string,
  username: string,
  rootquery: string,
  esClient: any,
): Promise<any> {
  const query = await queryBuilder(
    prompt,
    repo,
    organisation,
    username,
    rootquery,
  );
  let files = [];
  let validFiles = [];
  console.info('Query: ' + query);
  await octokit.paginate(
    octokit.rest.search.code,
    {
      q: query,
      per_page: 100,
    },
    (response: any) => {
      files = files.concat(response.data);
      if (files.length >= 200) {
        processCount++;
        console.info(
          'ValidateandStoreFiles Process Number ' + processCount + ' Started',
        );
        ValidateandStoreFiles(files, esClient).then((validatedFiles) => {
          validFiles = validFiles.concat(validatedFiles);
          finishedCount++;
          console.info(
            'ValidateandStoreFiles Process Number ' +
              finishedCount +
              ' Finished',
          );
        });
        files = [];
      }
    },
  );
  //this ending before the above one
  processCount++;
  console.info(
    'ValidateandStoreFiles Process Number ' + processCount + ' Started',
  );
  ValidateandStoreFiles(files, esClient).then((validatedFiles) => {
    validFiles = validFiles.concat(validatedFiles);
    console.info(
      'ValidateandStoreFiles Process Number ' + finishedCount + ' Finished',
    );
    finishedCount++;
  });
  while (processCount > finishedCount) {
    await new Promise((r) => setTimeout(r, 5000));
    console.info(
      'Total Processes: ' +
        processCount +
        '\nFinished Processes: ' +
        finishedCount,
    );
    console.info('Waiting for all files to be processed');
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
            fields: ['title^3','servers^2', 'paths^1.5', 'data^1'],
            default_operator: 'and',
          },
        },
      },
    });

    if (result.hits.hits) {
      if (result.hits.hits.length === 0) {
        console.error('No results found in the database');
        // activeSearch(query, "", "", "", esClient);
      }
      return result.hits.hits;
    }
  } catch (error) {
    if (error.message.includes('No Living connections')) {
      console.error('Elasticsearch connection error:', error);
      return error;
    } else {
      console.error('Error occurred during passive search:', error);
      return error;
    }
  }

  return 'Database not found';
}
