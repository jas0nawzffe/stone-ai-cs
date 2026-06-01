import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/ai/chat';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { KnowledgeDoc, FAQ, SalesScript } from '@/lib/types';

let _supabase: SupabaseClient | null = null;
function getDB() {
  if (!_supabase) _supabase = createAdminClient();
  return _supabase;
}

// ========== Knowledge Docs ==========

export async function getKnowledgeDocs(page = 1, pageSize = 20) {
  const db = getDB();
  const from = (page - 1) * pageSize;
  const { data, count } = await db
    .from('knowledge_docs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  return { data: (data || []) as KnowledgeDoc[], total: count || 0 };
}

export async function createKnowledgeDoc(doc: { title: string; content: string; category?: string; source?: string }): Promise<KnowledgeDoc> {
  const db = getDB();
  const embedding = await generateEmbedding(`${doc.title}\n${doc.content}`);

  const { data } = await db
    .from('knowledge_docs')
    .insert({ ...doc, embedding })
    .select('*')
    .single();

  return data as KnowledgeDoc;
}

export async function updateKnowledgeDoc(id: string, doc: Partial<KnowledgeDoc>): Promise<void> {
  const db = getDB();
  const update: Record<string, unknown> = { ...doc, updated_at: new Date().toISOString() };

  if (doc.title || doc.content) {
    const current = await db.from('knowledge_docs').select('title,content').eq('id', id).single();
    const title = doc.title || (current.data?.title as string);
    const content = doc.content || (current.data?.content as string);
    update.embedding = await generateEmbedding(`${title}\n${content}`);
  }

  await db.from('knowledge_docs').update(update).eq('id', id);
}

export async function deleteKnowledgeDoc(id: string): Promise<void> {
  const db = getDB();
  await db.from('knowledge_docs').delete().eq('id', id);
}

// ========== FAQs ==========

export async function getFAQs(page = 1, pageSize = 20) {
  const db = getDB();
  const from = (page - 1) * pageSize;
  const { data, count } = await db
    .from('faqs')
    .select('*', { count: 'exact' })
    .order('priority', { ascending: false })
    .range(from, from + pageSize - 1);

  return { data: (data || []) as FAQ[], total: count || 0 };
}

export async function createFAQ(faq: { question: string; answer: string; category?: string; priority?: number }): Promise<FAQ> {
  const db = getDB();
  const embedding = await generateEmbedding(`${faq.question}\n${faq.answer}`);

  const { data } = await db
    .from('faqs')
    .insert({ ...faq, embedding })
    .select('*')
    .single();

  return data as FAQ;
}

export async function updateFAQ(id: string, faq: Partial<FAQ>): Promise<void> {
  const db = getDB();
  const update: Record<string, unknown> = { ...faq, updated_at: new Date().toISOString() };

  if (faq.question || faq.answer) {
    const current = await db.from('faqs').select('question,answer').eq('id', id).single();
    const question = faq.question || (current.data?.question as string);
    const answer = faq.answer || (current.data?.answer as string);
    update.embedding = await generateEmbedding(`${question}\n${answer}`);
  }

  await db.from('faqs').update(update).eq('id', id);
}

export async function deleteFAQ(id: string): Promise<void> {
  const db = getDB();
  await db.from('faqs').delete().eq('id', id);
}

// ========== Sales Scripts ==========

export async function getSalesScripts(page = 1, pageSize = 20) {
  const db = getDB();
  const from = (page - 1) * pageSize;
  const { data, count } = await db
    .from('sales_scripts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  return { data: (data || []) as SalesScript[], total: count || 0 };
}

export async function createSalesScript(script: { title: string; scenario?: string; content: string; category?: string }): Promise<SalesScript> {
  const db = getDB();
  const embedding = await generateEmbedding(`${script.title}\n${script.content}`);

  const { data } = await db
    .from('sales_scripts')
    .insert({ ...script, embedding })
    .select('*')
    .single();

  return data as SalesScript;
}

export async function updateSalesScript(id: string, script: Partial<SalesScript>): Promise<void> {
  const db = getDB();
  const update: Record<string, unknown> = { ...script, updated_at: new Date().toISOString() };

  if (script.title || script.content) {
    const current = await db.from('sales_scripts').select('title,content').eq('id', id).single();
    const title = script.title || (current.data?.title as string);
    const content = script.content || (current.data?.content as string);
    update.embedding = await generateEmbedding(`${title}\n${content}`);
  }

  await db.from('sales_scripts').update(update).eq('id', id);
}

export async function deleteSalesScript(id: string): Promise<void> {
  const db = getDB();
  await db.from('sales_scripts').delete().eq('id', id);
}
