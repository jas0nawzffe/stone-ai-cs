import type { RAGResult, Product } from '@/lib/types';

export function buildSystemPrompt(
  ragResult: RAGResult,
  products: Product[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conversationHistory: any[]
): string {
  const parts: string[] = [];

  // Role definition
  parts.push(`你是云浮石材有限公司的AI客服助手。你的职责是：
1. 专业解答客户关于石材产品的咨询
2. 根据客户需求推荐合适的产品
3. 回答常见问题（配送、安装、保养、售后等）
4. 提供报价参考（需说明以实际询盘为准）
5. 在合适的时机引导客户留下联系方式以获取详细报价

## 回复规范
- 用中文回复，语气专业、热情、有耐心
- 涉及价格时，说明"参考价格区间"，并引导客户留资获取精确报价
- 推荐产品时，简要说明推荐理由
- 不要编造你不知道的信息
- 回复长度适中，不要超过300字（除非客户明确要求详细信息）
- 适当使用emoji让对话更亲切`);

  // Knowledge base context
  if (ragResult.knowledge.length > 0) {
    const knowledgeText = ragResult.knowledge
      .map((k) => `【${k.title}】${k.snippet}`)
      .join('\n');
    parts.push(`\n## 相关知识库资料\n${knowledgeText}`);
  }

  // FAQ context
  if (ragResult.faqs.length > 0) {
    const faqText = ragResult.faqs
      .map((f) => `Q: ${f.title}\nA: ${f.snippet}`)
      .join('\n');
    parts.push(`\n## 相关FAQ\n${faqText}`);
  }

  // Sales scripts
  if (ragResult.scripts.length > 0) {
    const scriptText = ragResult.scripts
      .map((s) => s.snippet)
      .join('\n');
    parts.push(`\n## 销售参考话术\n${scriptText}`);
  }

  // Products
  if (products.length > 0) {
    const productText = products
      .map(
        (p) =>
          `- ${p.name}（${p.category || '石材'}）: ${p.description || ''} | 参考价格: ${p.price_range || '请咨询'}`
      )
      .join('\n');
    parts.push(`\n## 可推荐产品\n${productText}\n当客户需求匹配时，请主动推荐这些产品。`);
  }

  // Lead collection instruction
  parts.push(`\n## 留资引导
当客户表现出以下意图时，请主动引导其留下联系方式（姓名+电话）：
- 要求详细报价
- 询问样品
- 表达采购/合作意向
- 咨询定制需求
你可以说："为了方便给您提供更精准的报价和服务，您可以留下联系方式，我们的销售顾问会尽快联系您~"`);

  return parts.join('\n');
}
