"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const api_1 = require("@atproto/api");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function postGitHubUpdates() {
    try {
        const agent = new api_1.BskyAgent({ service: "https://bsky.social" });
        await agent.login({
            identifier: process.env.BSKY_HANDLE,
            password: process.env.BSKY_PASSWORD,
        });
        console.log("Successfully logged into Bluesky.");
        const repo = "zed-industries/zed";
        let headers = {};
        if (process.env.GITHUB_TOKEN) {
            headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` };
        }
        const issuesUrl = `https://api.github.com/repos/${repo}/issues?state=open`;
        const { data: issues } = await axios_1.default.get(issuesUrl, { headers });
        console.log(`Fetched ${issues.length} open issues/PRs from ${repo}.`);
        for (const issue of issues) {
            const type = issue.pull_request ? "Pull Request" : "Issue";
            const title = issue.title;
            const url = issue.html_url.replace(/^https?:\/\//, "");
            const message = `New ${type}: ${title} (${url.split("/").pop()})\n${url}\n`;
            try {
                await agent.post({
                    text: message,
                    createdAt: new Date().toISOString(),
                });
                console.log(`Posted on Bluesky: ${message}`);
            }
            catch (postError) {
                console.error("Error posting on Bluesky:", postError);
            }
        }
    }
    catch (error) {
        console.error("An error occurred in postGitHubUpdates:", error);
    }
}
postGitHubUpdates();
