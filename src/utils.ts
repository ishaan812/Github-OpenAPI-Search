import axios from 'axios';

export const makePostmanCollection = async (collectionData: any) => {
    try{
    const response = await axios.post('https://api.getpostman.com/collections', collectionData, {
      headers: {
        'X-Api-Key': process.env.POSTMAN_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    if(response.status === 200) {
        console.log('Collection created successfully.');
        // console.log(response.data)
    } else {
        console.error(`Error creating collection. Status code: ${response.status}, Response: ${response.data}`);
    }
    } catch (error) {
        console.error(`Error creating collection. Error: ${error}`);
    }
}