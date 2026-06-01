import type OpenAI from 'openai';
import { getOpenAI, getModel } from './embed';

function getClient() {
  return getOpenAI();
}

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export { type ChatMessage };

export async function* streamChat(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string> {
  const stream = await getClient().chat.completions.create({
    model: getModel(),
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2000,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

export async function chatOnce(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: getModel(),
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2000,
  });

  return response.choices[0]?.message?.content || '';
}
