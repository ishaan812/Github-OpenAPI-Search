import { octokit } from "../app.js";
// import { CodeSearchResponse } from "./searchstructs.js";

export async function getFileContents(repoowner: string, reponame: string, filepath: string) : Promise<string> {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: repoowner,
      repo: reponame,
      path: filepath,
    });
    return response.data['content'];
}

export async function handleCodeSearch(repo: string, organisation: string, username: string, page: number) : Promise<any>{
    //Why does /(openai|swagger)/ not work :/
    //Even Parenthesis doesn't work
    let query = ""
    if (repo != undefined) {
        query += " repo:" + repo;
    } else if (organisation != undefined) {
        query += " org:" + organisation;
    } else if (username != undefined) {
        query += " user:" + username;
    } else{
        return "Error: No search parameters specified";
    }
    query+= " language:json OR language:yaml" 
    
    console.log("Query: "+query)
    //api call handling
    const results = await octokit.rest.search.code({
        q: query,
        per_page: 100,
        page: page,
    })
    return results.data.items;
}

