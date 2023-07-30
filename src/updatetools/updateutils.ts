export async function getAllDocuments(
  index: string,
  esClient: any,
): Promise<any[]> {
  try {
    const response = await esClient.search({
      index,
      size: 100, // Adjust the size as needed to accommodate all documents in the index
      body: {
        query: {
          match_all: {}, // Retrieve all documents without filtering
        },
      },
    });
    console.info(`Total ${response.hits.total.value} documents`);
    let allDocuments = [];
    if (response) {
      allDocuments = response.hits.hits.map((hit: any) => hit._source);
    }
    return allDocuments;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    throw error;
  }
}

export async function UpdateDocuments(rows: any, esClient: any): Promise<void> {
    return;
}
