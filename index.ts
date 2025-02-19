import axios from "axios";
import { BskyAgent } from "@atproto/api";
import * as dotenv from "dotenv";

dotenv.config();

async function postGitHubUpdates() {
  try {
    const agent = new BskyAgent({ service: "https://bsky.social" });
    await agent.login({
      identifier: process.env.BSKY_HANDLE!,
      password: process.env.BSKY_PASSWORD!,
    });
    console.log("Successfully logged into Bluesky.");

    const repo = "zed-industries/zed";

    let headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` };
    }

    const issuesUrl = `https://api.github.com/repos/${repo}/issues?state=open`;
    const { data: issues } = await axios.get(issuesUrl, { headers });
    console.log(`Fetched ${issues.length} open issues/PRs from ${repo}.`);

    for (const issue of issues) {
      const type = issue.pull_request ? "Pull Request" : "Issue";
      const title = issue.title;
      const url = issue.html_url;
      const message = `New ${type}: ${title}\n${url}\n`;

      try {
        await agent.post({
          text: message,
          createdAt: new Date().toISOString(),
        });
        console.log(`Posted on Bluesky: ${message}`);
      } catch (postError) {
        console.error("Error posting on Bluesky:", postError);
      }
    }
  } catch (error) {
    console.error("An error occurred in postGitHubUpdates:", error);
  }
}

postGitHubUpdates();
