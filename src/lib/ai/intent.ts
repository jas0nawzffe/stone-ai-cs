import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from './chat';
import type { RAGResult, RAGSource, Product } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
function getDB() {
  if (!_supabase) _supabase = createAdminClient();
  return _supabase;
}

/** Extract keywords from Chinese text for fallback search */
function extractKeywords(text: string): string[] {
  return text
    .replace(/[，。！？、；：""''（）\s]/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 2)
    .slice(0, 5);
}

export async function retrieveContext(query: string): Promise<RAGResult> {
  try {
    return await vectorRetrieveContext(query);
  } catch (e) {
    console.warn('Vector search failed, using text fallback:', (e as Error).message);
    return await textFallbackRetrieve(query);
  }
}

async function vectorRetrieveContext(query: string): Promise<RAGResult> {
  const embedding = await generateEmbedding(query);
  const db = getDB();

  const [knowledgeRes, faqRes, scriptRes] = await Promise.all([
    db.rpc('match_knowledge', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 3,
    }),
    db.rpc('match_faqs', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 3,
    }),
    db.rpc('match_sales_scripts', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 2,
    }),
  ]);

  return {
    knowledge: (knowledgeRes.data || []).map(mapSource),
    faqs: (faqRes.data || []).map(mapSource),
    scripts: (scriptRes.data || []).map(mapSource),
  };
}

async function textFallbackRetrieve(query: string): Promise<RAGResult> {
  const db = getDB();
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return { knowledge: [], faqs: [], scripts: [] };

  const ilike = keywords.map((k) => `%${k}%`);

  // Build OR filters for ILIKE matching
  const buildOr = (fields: string[]) =>
    fields.map((f) => ilike.map((pat) => `${f}.ilike.${pat}`).join(',')).join(',');

  const [kRes, fRes, sRes] = await Promise.all([
    db.from('knowledge_docs').select('id, title, content, category').eq('status', 'active').or(buildOr(['title', 'content'])).limit(3),
    db.from('faqs').select('id, question, answer, category').eq('status', 'active').or(buildOr(['question', 'answer'])).limit(3),
    db.from('sales_scripts').select('id, title, content, scenario').eq('status', 'active').or(buildOr(['title', 'content'])).limit(2),
  ]);

  return {
    knowledge: ((kRes.data || []) as Record<string, unknown>[]).map((r) => mapSource({ ...r, similarity: 0.3 })),
    faqs: ((fRes.data || []) as Record<string, unknown>[]).map((r) => mapSource({ ...r, similarity: 0.3, title: r.question })),
    scripts: ((sRes.data || []) as Record<string, unknown>[]).map((r) => mapSource({ ...r, similarity: 0.3 })),
  };
}

function mapSource(row: Record<string, unknown>): RAGSource {
  return {
    id: row.id as string,
    title: (row.title || row.question) as string,
    similarity: row.similarity as number,
    snippet: ((row.content || row.answer) as string)?.slice(0, 300) || '',
  };
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const embedding = await generateEmbedding(query);
    const db = getDB();
    const { data } = await db.rpc('match_products', {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 5,
    });
    return (data || []) as Product[];
  } catch (e) {
    console.warn('Product vector search failed, using text fallback:', (e as Error).message);
    const db = getDB();
    const keywords = extractKeywords(query);
    if (keywords.length === 0) return [];
    const ilike = keywords.map((k) => `%${k}%`);
    const orFilter = ['name', 'description', 'category']
      .map((f) => ilike.map((pat) => `${f}.ilike.${pat}`).join(','))
      .join(',');
    const { data } = await db.from('products').select('*').eq('status', 'active').or(orFilter).limit(5);
    return (data || []) as Product[];
  }
}

export async function searchFAQs(query: string): Promise<{ question: string; answer: string }[]> {
  try {
    const embedding = await generateEmbedding(query);
    const db = getDB();
    const { data } = await db.rpc('match_faqs', {
      query_embedding: embedding,
      match_threshold: 0.8,
      match_count: 3,
    });
    return (data || []).map((r: Record<string, unknown>) => ({
      question: r.question as string,
      answer: r.answer as string,
    }));
  } catch (e) {
    console.warn('FAQ vector search failed, using text fallback:', (e as Error).message);
    const db = getDB();
    const keywords = extractKeywords(query);
    if (keywords.length === 0) return [];
    const ilike = keywords.map((k) => `%${k}%`);
    const orFilter = ['question', 'answer']
      .map((f) => ilike.map((pat) => `${f}.ilike.${pat}`).join(','))
      .join(',');
    const { data } = await db.from('faqs').select('question, answer').eq('status', 'active').or(orFilter).limit(3);
    return (data || []) as { question: string; answer: string }[];
  }
}
