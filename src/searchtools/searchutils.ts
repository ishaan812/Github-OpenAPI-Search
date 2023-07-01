import { octokit } from '../app.js';
// import { CodeSearchResponse } from "./searchstructs.js";

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
  //   query+= prompt + ' AND "swagger: \\"2"'
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
