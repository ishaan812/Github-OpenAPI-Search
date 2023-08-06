import OASNormalize from "oas-normalize"
import { octokit, esClient } from "../app.js"
import { DeleteDocumentWithId, CreateDocument } from "../DB/dbutils.js"

async function * scrollSearch (params)  {
  let response = await esClient.search(params)
  while (true) {
    const sourceHits = response.hits.hits
    if (sourceHits.length === 0) {
      break
    }
    for (const hit of sourceHits) {
      yield hit
    }
    if (!response._scroll_id) {
      break
    }
    response = await esClient.scroll({
      scroll_id: response._scroll_id,
      scroll: params.scroll
    })
  }
}

async function UpdateDocument(document: any): Promise<void> {
  if(document._source.isDeleted === true){
    return
  }
  const requestConfig = {
    owner: document._source.owner,
    repo: document._source.repository,
    path: document._source.filepath,
  };
  requestConfig['headers'] = {
    'If-None-Match': document._source.ETAG,
  };
  const request = {
    method: 'GET',
    url: "/repos/"+requestConfig.owner+"/"+requestConfig.repo+"/contents/"+requestConfig.path,
    headers: {
      'If-None-Match': document._source.ETAG,
    }
  };
  await octokit.request(request).then(async(response) => {
      console.info("File "+document._id+" to be updated")
      // make isDeleted true for current Document and update
      DeleteDocumentWithId(document._id)
      // create new Document with new content
      const content = Buffer.from(
        response['data']['content'],
        'base64',
      ).toString();
      const oas = new OASNormalize.default(content);
      oas
      .validate()
      .then(async(definition) => {
        console.info('Updated file is valid');
        console.info(definition?.info?.title);
        const newData = {
          URL: response['url'].split('api.github.com/repos/')[1],
          ETAG: response['headers']['etag'],
          title: definition?.info?.title,
          description: definition?.info?.description,
          version: definition?.info?.version,
          servers: JSON.stringify(definition?.servers),
          paths: JSON.stringify(definition?.paths),
          filepath: document._source.filepath,
          repository: document._source.repository,
          owner: document._source.owner,
          data: content,
          LastModified: response['headers']['last-modified'],
          LastUpdated: new Date().toISOString(),
          isDeleted: false,
        }
        await CreateDocument(response['data']['sha'], newData)
        console.info('Updated File '+response['data']['sha']+' Added To Database');
      })
      .catch(() => {
        console.info('Updated File is not valid');
      });
    }).catch((error) => {
    if(error.status == 304){
      console.info("File "+document._id+" has not changed")
      return
    } else if (error.status == 404){
      console.info("File "+document._id+" does not exist anymore and has been deleted")
      DeleteDocumentWithId(document._id)
    } else {
      console.error(error)
    }
  });
}

export async function UpdateAllDocuments(
  index: string,
): Promise<string> {
  // Perform the initial search request to initiate the scroll
  const params = {
    index: index,
    scroll: '30s',
    size: 1,
    _source: ['owner', 'repository', 'filepath', 'ETAG', 'isDeleted'],
    body:{
      query: {
        match_all: {}
      }
    }
  }
  for await (const hit of scrollSearch(params)) {
    await UpdateDocument(hit);
  }
  return new Promise((resolve) => {
    resolve('Database Updated');
  });
}

