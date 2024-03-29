import { openAPIValidateandStoreFiles } from './openAPISearchUtils.js';
import { octokit, esClient } from '../app.js';

let processCount = 0;
let finishedCount = 0;

export async function activeSearch(
  query: string,
  type: string,
): Promise<any> {
  console.log(type)
  console.info('Query: ' + query);
  let files = [];
  let validFiles = [];
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
        switch (type) {
          case 'openapi':
            openAPIValidateandStoreFiles(files).then((validatedFiles) => {
              validFiles = validFiles.concat(validatedFiles);
              finishedCount++;
              console.info(
                'ValidateandStoreFiles Process Number ' +
                  finishedCount +
                  ' Finished',
              );
            });
            break;
        }
        files = [];
      }
    },
  );
  //this ending before the above one
  processCount++;
  console.info(
    'ValidateandStoreFiles Process Number ' + processCount + ' Started',
  );
  switch (type) {
    case 'openapi':
      openAPIValidateandStoreFiles(files).then((validatedFiles) => {
        validFiles = validFiles.concat(validatedFiles);
        console.info(
          'ValidateandStoreFiles Process Number ' + finishedCount + ' Finished',
        );
        finishedCount++;
      });
  }
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


export async function passiveSearch(query: string): Promise<any> {
  try {
    if (esClient === undefined) {
      throw new Error('Invalid Elasticsearch client');
    }
    const result = await esClient.search({
      index: 'openapi',
      filterPath : ['hits.hits._source'],
      body: {
        query: {
          simple_query_string: {
            query: query,
            fields: ['data^1', 'title^10','repository^10', 'owner^10', 'description^5'],
            default_operator: 'and',
          },
        },
      },
    });
    if (result.hits.hits) {
      if (result.hits.hits.length === 0) {
        console.error('No results found in the database');
      }
      return result.hits.hits.map((hit: any) => hit._source);
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
