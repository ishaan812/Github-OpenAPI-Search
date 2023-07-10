export async function checkClusterHealth(esClient: any) : Promise<string>  {
    try {
      const response = await esClient.cat.health();
      console.log('Cluster health:', response);
      return response;
    } catch (error) {
      console.error('Error checking cluster health:', error);
      return "";
    }
  }

async function * generator (validFiles: any) {
  for (const file of validFiles) {
    yield file
  }
}

export async function BulkStoreToDB(validFiles: any,esClient: any) : Promise<void>{
    try {
        const response = await esClient.bulk({ body: validFiles});
        console.log('Bulk response:', response);
      } catch (error) {
        console.error('Error bulk indexing:', error);
      }
}