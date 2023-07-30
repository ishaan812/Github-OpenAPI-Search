export async function checkClusterHealth(esClient: any): Promise<string> {
  try {
    const response = await esClient.cat.health();
    console.info('Cluster health:', response);
    return response;
  } catch (error) {
    console.error('Error checking cluster health:', error);
    return '';
  }
}

export async function BulkStoreToDB(
  validFiles: any,
  esClient: any,
): Promise<void> {
  try {
    if (validFiles.length == 0) {
      return;
    }
    const response = await esClient.bulk({ body: validFiles });
    return response;
  } catch (error) {
    console.error('Error bulk indexing:', error);
  }
}
