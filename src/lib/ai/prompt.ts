import type { Intent } from '@/lib/types';
import { chatOnce } from './rag';

export async function classifyIntent(message: string): Promise<Intent> {
  const prompt = `你是一个意图分类器。分析用户消息，归类为以下之一：

- product_inquiry: 询问石材产品种类、规格、特性
- price_inquiry: 询问价格、报价、费用
- faq: 常见问题（配送、安装、售后、保养等）
- leave_contact: 表示想要留联系方式、咨询、合作
- general_chat: 闲聊、打招呼、感谢等

只回复类别名称，不要解释。

用户消息: ${message}

意图:`;

  const result = await chatOnce(
    [{ role: 'system', content: prompt }],
    { temperature: 0, maxTokens: 50 }
  );

  const cleaned = result.trim().toLowerCase();
  const validIntents: Intent[] = ['product_inquiry', 'price_inquiry', 'faq', 'leave_contact', 'general_chat'];
  return validIntents.includes(cleaned as Intent) ? (cleaned as Intent) : 'general_chat';
}
