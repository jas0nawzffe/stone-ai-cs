import type OpenAI from 'openai';
import type { Product } from '@/lib/types';
import { NextRequest } from 'next/server';
import { getOrCreateConversation, saveMessage, getMessages } from '@/lib/db/conversations';
import { retrieveContext, searchProducts } from '@/lib/ai/intent';
import { classifyIntent } from '@/lib/ai/prompt';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { streamChat } from '@/lib/ai/rag';
import { createAILog } from '@/lib/db/ai-logs';
import { getModel } from '@/lib/ai/embed';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const model = getModel();

  try {
    const body = await req.json();
    const { message, conversation_id, customer_name } = body;

    if (!message?.trim()) {
      return Response.json({ error: '消息不能为空' }, { status: 400 });
    }

    // 1. Get or create conversation
    const conv = await getOrCreateConversation(conversation_id, customer_name);

    // 2. Save user message
    await saveMessage(conv.id, 'user', message);

    // 3. Fetch conversation history
    const history = await getMessages(conv.id, 20);
    type OAI = OpenAI.Chat.Completions.ChatCompletionMessageParam;
    const historyMessages: OAI[] = history
      .filter((m) => m.role !== 'agent')
      .map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

    // 4. RAG retrieval + intent classification (in parallel, each fails safely)
    const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
      p.catch((e) => { console.warn('RAG sub-task failed:', e.message); return fallback; });
    const [ragResult, intent, products] = await Promise.all([
      safe(retrieveContext(message), { knowledge: [], faqs: [], scripts: [] }),
      safe(classifyIntent(message), 'general_chat'),
      safe(searchProducts(message), [] as Product[]),
    ]);

    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(ragResult, products, historyMessages);

    // 6. Stream AI response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages: OAI[] = [
            { role: 'system', content: systemPrompt },
            ...historyMessages,
          ];

          for await (const chunk of streamChat(messages)) {
            fullResponse += chunk;
            const data = JSON.stringify({ type: 'text', content: chunk, conversation_id: conv.id });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send products if relevant
          if (products.length > 0 && (intent === 'product_inquiry' || intent === 'price_inquiry')) {
            const productData = JSON.stringify({
              type: 'products',
              products: products.slice(0, 5),
              conversation_id: conv.id,
            });
            controller.enqueue(encoder.encode(`data: ${productData}\n\n`));
          }

          // Check if should trigger lead form
          const leadKeywords = ['报价', '多少钱', '价格', '样品', '合作', '采购', '批发', '定制', '联系', '电话'];
          const shouldLead = leadKeywords.some((kw) => message.includes(kw)) || intent === 'leave_contact';
          if (shouldLead) {
            const leadData = JSON.stringify({ type: 'lead_form', conversation_id: conv.id });
            controller.enqueue(encoder.encode(`data: ${leadData}\n\n`));
          }

          // Send done and close stream BEFORE DB writes to avoid Vercel 10s timeout
          const done = JSON.stringify({ type: 'done', conversation_id: conv.id });
          controller.enqueue(encoder.encode(`data: ${done}\n\n`));
          controller.close();

          // DB operations are best-effort after stream closure
          try {
            const savedMsg = await saveMessage(conv.id, 'assistant', fullResponse, products.slice(0, 5).map((p) => p.id));
            await createAILog({
              conversation_id: conv.id,
              message_id: savedMsg.id,
              model,
              prompt_tokens: 0,
              completion_tokens: 0,
              latency_ms: Date.now() - startTime,
              intent,
              knowledge_sources: ragResult.knowledge,
              faq_sources: ragResult.faqs,
              product_recommended: products.slice(0, 5).map((p) => p.id),
            });
          } catch (dbErr) {
            console.warn('Post-stream DB save failed:', (dbErr as Error).message);
          }
        } catch (e) {
          const err = JSON.stringify({ type: 'error', content: 'AI服务暂时不可用，请稍后重试' });
          controller.enqueue(encoder.encode(`data: ${err}\n\n`));
          controller.close();
          console.error('Chat stream error:', e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e) {
    console.error('Chat API error:', e);
    return Response.json({ error: '服务器错误' }, { status: 500 });
  }
}
