import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.AI_API_KEY;
    const baseURL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    if (!apiKey) {
      throw new Error('Missing AI_API_KEY environment variable');
    }
    openaiInstance = new OpenAI({ apiKey, baseURL });
  }
  return openaiInstance;
}

export function getModel(): string {
  return process.env.AI_MODEL || 'gpt-4o-mini';
}

export function getEmbeddingModel(): string {
  return process.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small';
}
