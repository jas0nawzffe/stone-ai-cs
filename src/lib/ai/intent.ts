import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from './chat';
import type { RAGResult, RAGSource, Product } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
function getDB() {
  if (!_supabase) _supabase = createAdminClient();
  return _supabase;
}

export async function retrieveContext(query: string): Promise<RAGResult> {
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

function mapSource(row: Record<string, unknown>): RAGSource {
  return {
    id: row.id as string,
    title: (row.title || row.question) as string,
    similarity: row.similarity as number,
    snippet: ((row.content || row.answer) as string)?.slice(0, 300) || '',
  };
}

export async function searchProducts(query: string): Promise<Product[]> {
  const embedding = await generateEmbedding(query);
  const db = getDB();

  const { data } = await db.rpc('match_products', {
    query_embedding: embedding,
    match_threshold: 0.6,
    match_count: 5,
  });

  return (data || []) as Product[];
}

export async function searchFAQs(query: string): Promise<{ question: string; answer: string }[]> {
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
}
