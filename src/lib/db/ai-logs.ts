import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AILog, RAGSource } from '@/lib/types';

let _supabase: SupabaseClient | null = null;
function getDB() {
  if (!_supabase) _supabase = createAdminClient();
  return _supabase;
}

export async function createAILog(log: {
  conversation_id?: string;
  message_id?: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  intent?: string;
  knowledge_sources?: RAGSource[];
  faq_sources?: RAGSource[];
  product_recommended?: string[];
}): Promise<AILog> {
  const db = getDB();
  const { data } = await db
    .from('ai_logs')
    .insert(log)
    .select('*')
    .single();

  return data as AILog;
}

export async function getAILogs(page = 1, pageSize = 20) {
  const db = getDB();
  const from = (page - 1) * pageSize;
  const { data, count } = await db
    .from('ai_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  return { data: (data || []) as AILog[], total: count || 0 };
}
