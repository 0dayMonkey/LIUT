import { Client } from "@notionhq/client";

if (!process.env.NOTION_API_KEY) {
  throw new Error("Missing NOTION_API_KEY environment variable");
}

export const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});
