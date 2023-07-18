
# GitHub OpenAPI Search

The goal of this project is to provide a robust yet easy way to search Github for Swagger and OpenAPI definitions. Understanding that there is a lot of noise available, that we only care about OpenAPIs that validate, and that the Github API has rate limits that require you to automate the crawling over time. Providing a robust open-source solution that will crawl public Github repositories for machine-readable API definitions.
The project will consist of developing an open-source API that allows you to pass in search parameters and then utilize the GitHub API to perform the search, helping simplify the search interface, make rate limits visible as part of the response, and handle conducting a search in an asynchronous way, allowing the user to make a call to initiate, but then separate calls to receive results over time as results come in, helping show outcomes over time.

## Tech Stack

- Node JS/Express JS
- Typescript
- Octokit.JS
- Jest

## Dev Runbook
Dependancies: NodeJS, npm, GithubAPIKey 

 1. Pull the repository to your local setup
 2. Run `npm i`
 3. Make a `.env` file in the directory and add the variables: 
	 **PORT**= **(port number you want to host the api)**
	 **GITHUB_API_KEY**= **(Github API key)**
4.  Run `npm run build:watch` on one terminal.
5.  On another terminal, run `npm run start` to start the server on the port specified on. 
6.  Now the nodejs server should be running! To test it just go to `localhost:{{PORT}}` and the text `TypeScript With Express` should be returned.

## Setting up ElasticSearch Runbook (Dev/Local)
-**docker pull docker.elastic.co/elasticsearch/elasticsearch:8.8.2** 
-**docker network create elastic**
-**docker run \ 
    -p 9200:9200 \
    -p 9300:9300 \
    -e "discovery.type=single-node" \
    -e "xpack.security.enabled=false" \
    docker.elastic.co/elasticsearch/elasticsearch:8.8.2**

## API Endpoints
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/19841716-f1801bb7-b189-429b-a875-91b115d349a2?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D19841716-f1801bb7-b189-429b-a875-91b115d349a2%26entityType%3Dcollection%26workspaceId%3D5ebe19fb-61d4-47a7-9cae-de3834853f6b)
 - **/search?prompt={{prompt}}** : The active search endpoint. Add the search prompt in the prompt variable in query params.
 - **/passive?q={}** : The passive search endpoint. Add the search prompt in the query param (q) to query the database.

🚧Under Construction
