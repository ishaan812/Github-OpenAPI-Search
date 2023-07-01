# GitHub OpenAPI Search

The goal of this project is to provide a robust yet easy way to search Github for Swagger and OpenAPI definitions. Understanding that there is a lot of noise available, that we only care about OpenAPIs that validate, and that the Github API has rate limits that require you to automate the crawling over time. Providing a robust open-source solution that will crawl public Github repositories for machine-readable API definitions.
The project will consist of developing an open-source API that allows you to pass in search parameters and then utilize the GitHub API to perform the search, helping simplify the search interface, make rate limits visible as part of the response, and handle conducting a search in an asynchronous way, allowing the user to make a call to initiate, but then separate calls to receive results over time as results come in, helping show outcomes over time.

## Tech Stack

- Node JS/Express JS
- Typescript
- Octokit.JS
- Jest

🚧Under Construction
