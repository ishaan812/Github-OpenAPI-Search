import { octokit } from '../app.js';
// import { CodeSearchResponse } from "./searchstructs.js";
import crypto from "crypto";
import OASNormalize from 'oas-normalize';
import { BulkStoreToDB } from '../DB/dbutils.js';




export function generateUUID() : string {
  // Generate a random buffer of 16 bytes
  const buffer = crypto.randomBytes(16);

  // Set the version (4) and variant (2) bits
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  buffer[8] = (buffer[8] & 0x3f) | 0x80;

  // Convert the buffer to a string representation of the UUID
  const uuid = buffer.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  uuid.shift();
  return uuid.join('-');
}

export async function getFileContents(
  repoowner: string,
  reponame: string,
  filepath: string,
): Promise<string> {
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}',
    {
      owner: repoowner,
      repo: reponame,
      path: filepath,
    },
  );
  return response.data['content'];
}

export async function queryBuilder(prompt: string, repo: string, organisation: string, username: string): Promise<string> {
  if(prompt == undefined){
    prompt = "" 
  }
  let query = prompt + ' AND "openapi: 3"';
    // query+= prompt + ' AND "swagger: \\"2"'
  if (repo != undefined) {
    query += '+repo:' + repo;
  } else if (organisation != undefined) {
    query += '+org:' + organisation;
  } else if (username != undefined) {
    query += '+user:' + username;
  } else {
    return query;
  }
  return query;
}

export async function ValidateandStoreFiles(files: any[], esClient: any): Promise<any> {
  if(files.length == 0){
    return;
  }
  console.log("Validating and storing files")
  let validFiles = [];
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
        if(validFiles.length >= 50){
          console.log("Storing some of the valid files")
          BulkStoreToDB(validFiles as any[],esClient as any);
          validFiles = []
        }
      })
      .catch((error) => {
        console.log('File ' + file.name + ' is not valid');
      });
   }
  BulkStoreToDB(validFiles as any[],esClient as any);
  return validFiles;
}
