import { octokit } from '../app.js';
// import { CodeSearchResponse } from "./searchstructs.js";
import crypto from "crypto";

export function generateUUID() {
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

export async function handleCodeSearch(
  prompt: string,
  repo: string,
  organisation: string,
  username: string,
  page: number,
): Promise<any> {
  //Why does /(openai|swagger)/ not work :/
  //Even Parenthesis doesn't work
  let query = prompt + ' AND "openapi: 3"';
    // query+= prompt + ' AND "swagger: \\"2"'
  if (repo != undefined) {
    query += '+repo:' + repo;
  } else if (organisation != undefined) {
    query += '+org:' + organisation;
  } else if (username != undefined) {
    query += '+user:' + username;
  }
  console.log('Query: ' + query);
  //api call handling
  const results = await octokit.paginate(octokit.rest.search.code, {
    q: query,
    per_page: 100,
  });
  console.log(results.length)
  return results;
}
