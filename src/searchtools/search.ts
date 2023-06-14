import { handleCodeSearch } from "./searchutils.js";

export async function activeSearch(prompt:string, repo: string, organisation: string, username: string) : Promise<string> {
    //3 types of searches:
    // If repository is specified, then search through that repository: /search/code with repo name
    // If organisation is specified then search through that organisation: /search/code with org name
    // If user is specified then search through that user: /search/code with user name
    // If none is specified then return error
    const response = await handleCodeSearch(repo, organisation, username, 1);
  
    // const fileContents = await getFileContents(repoowner, reponame, filepath);
    // console.log(Buffer.from(fileContents, 'base64').toString());
    return response;
}





