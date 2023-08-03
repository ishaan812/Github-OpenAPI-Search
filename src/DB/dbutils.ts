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

export async function DeleteDocumentWithId(Id : string, esClient: any): Promise<void> {
  try {
    const index = 'openapi';
    const updatedDocument = {
      isDeleted: false,
    };
    await esClient.update({
      index,
      id: Id,
      body: {
        doc: updatedDocument,
      },
    });
    console.log(`Document with ID ${Id} soft deleted.`);
  } catch (error) {
    console.error('Error updating the document:', error);
  }
}

export async function CreateDocument(Id:string, document: any, esClient: any): Promise<void> {
  try {
    const index = 'openapi';
    await esClient.index({
      index,
      id: Id,
      body: {
        doc: document,
      },
    });
    console.log(`New Document Added with ID ${Id}`);
  } catch (error) {
    console.error('Error updating the document:', error);
  }
}

export async function GetDocumentWithId(Id:string, esClient: any): Promise<any> {
  try {
    const index = 'openapi';
    const document = await esClient.get({
      index,
      id: Id,
    });
    return document;
  } catch (error) {
    console.error('Error updating the document:', error);
  }
}

