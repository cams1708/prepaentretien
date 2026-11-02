import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { env } from "@/lib/env";

// Server-side only Anthropic client. Never import this from a Client
// Component or expose ANTHROPIC_API_KEY to the browser.
let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

// Pinned model for every server-side AI feature (interview prep reply +
// end-of-session summary) — change here to upgrade everywhere.
export const CLAUDE_MODEL = "claude-sonnet-5";
