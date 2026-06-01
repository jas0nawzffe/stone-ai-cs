import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Conversation, Message } from '@/lib/types';

let _supabase: SupabaseClient | null = null;
function getDB() {
  if (!_supabase) _supabase = createAdminClient();
  return _supabase;
}

export async function getOrCreateConversation(
  conversationId: string | undefined,
  customerName?: string
): Promise<Conversation> {
  const db = getDB();

  if (conversationId) {
    const { data } = await db
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (data) return data as Conversation;
  }

  const { data: customer } = await db
    .from('customers')
    .insert({ name: customerName || '网站访客', source: 'web' })
    .select('id')
    .single();

  const { data: conversation } = await db
    .from('conversations')
    .insert({
      customer_id: customer?.id || null,
      status: 'active',
      title: customerName ? `${customerName}的咨询` : '新对话',
    })
    .select('*')
    .single();

  return conversation as Conversation;
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  productIds: string[] = [],
  metadata: Record<string, unknown> = {}
): Promise<Message> {
  const db = getDB();
  const { data } = await db
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      product_ids: productIds,
      metadata,
    })
    .select('*')
    .single();

  return data as Message;
}

export async function getMessages(conversationId: string, limit = 50): Promise<Message[]> {
  const db = getDB();
  const { data } = await db
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  return (data || []) as Message[];
}

export async function getConversations(page = 1, pageSize = 20) {
  const db = getDB();
  const from = (page - 1) * pageSize;
  const { data, count } = await db
    .from('conversations')
    .select('*, customers(name)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, from + pageSize - 1);

  return { data: (data || []) as Conversation[], total: count || 0 };
}

export async function getConversation(id: string) {
  const db = getDB();
  const { data } = await db
    .from('conversations')
    .select('*, customers(*)')
    .eq('id', id)
    .single();

  return data;
}

export async function updateConversationStatus(
  id: string,
  status: string,
  assignedTo?: string
) {
  const db = getDB();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (assignedTo) update.assigned_to = assignedTo;

  await db.from('conversations').update(update).eq('id', id);
}
