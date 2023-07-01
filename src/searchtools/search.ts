import { getFileContents, handleCodeSearch } from './searchutils.js';
import OASNormalize from 'oas-normalize';

export async function activeSearch(
  prompt: string,
  repo: string,
  organisation: string,
  username: string,
): Promise<any> {
  //3 types of searches:
  // If repository is specified, then search through that repository: /search/code with repo name
  // If organisation is specified then search through that organisation: /search/code with org name
  // If user is specified then search through that user: /search/code with user name
  // If none is specified then return error
  const validFiles = [];
  const files = await handleCodeSearch(prompt, repo, organisation, username, 1);
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
        validFiles.push(definition);
        console.log(validFiles);
      })
      .catch((error) => {
        // Error will be an array of validation errors.
        console.log('File ' + file.name + ' is not valid');
      });
  }

  return validFiles;
}
