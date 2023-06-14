import express from "express";
import { Octokit} from "octokit";
import { activeSearch } from "./searchtools/search.js";
// import { router as userRoutes } from "./routes/user.routes.js";

const app = express();
const octokit = new Octokit({
  userAgent: "github-openapi-search/v1.2.3",
  auth: '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',
});

// Should not even be an API endpoint for passive search
// Should just fetch repositories and go through them (with ETAG to make sure no repeats)
// Check for openapi.json in the contents of the repository
// If it exists, then store in database with important content
app.use("/search", (_req , _res) => {
  const Repository = _req.query.repo as string
  const Organisation = _req.query.org as string
  const User = _req.query.user as string

  activeSearch("", Repository as string, Organisation as string, User as string);
  _res.send("Search");
})

app.get('/', (_req, _res) => {
  _res.send("TypeScript With Express");
});

export default app;
export { octokit };