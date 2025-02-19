const axios = require("axios");
const { AtpAgent } = require("@atproto/api");

const BLUESKY_USER = process.env.BSKY_USER;
const BLUESKY_PASS = process.env.BSKY_PASS;

const GITHUB_REPO = "zed-industries/zed";
const GITHUB_API_BASE = "https://api.github.com";

async function fetchGitHubEvents() {
  const since = new Date(Date.now() - 10 * 60000).toISOString();
  const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/issues?since=${since}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub events:", error);
    return [];
  }
}

async function postToBluesky(agent, event) {
  const eventType = event.pull_request ? "Pull Request" : "Issue";
  const message = `New ${eventType}: "${event.title}"\n${event.html_url}`;
  try {
    await agent.createPost({ text: message });
    console.log("Posted to Bluesky:", message);
  } catch (error) {
    console.error("Error posting to Bluesky:", error);
  }
}

async function runBot() {
  const agent = new AtpAgent();
  try {
    await agent.login({ identifier: BLUESKY_USER, password: BLUESKY_PASS });
    console.log("Logged into Bluesky");
  } catch (error) {
    console.error("Bluesky login failed:", error);
    return;
  }

  const events = await fetchGitHubEvents();
  if (!events.length) {
    console.log("No new events found.");
    return;
  }

  for (const event of events) {
    await postToBluesky(agent, event);
  }
}

runBot();
