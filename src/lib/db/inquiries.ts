import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Inquiry, InquirySubmit } from '@/lib/types';

let _supabase: SupabaseClient | null = null;
function getDB() {
  if (!_supabase) _supabase = createAdminClient();
  return _supabase;
}

export async function submitInquiry(data: InquirySubmit): Promise<Inquiry> {
  const db = getDB();
  const { data: inquiry } = await db
    .from('inquiries')
    .insert({
      conversation_id: data.conversation_id || null,
      type: data.type,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      company: data.company || null,
      requirement: data.requirement,
      product_interests: data.product_interests || [],
      status: 'new',
    })
    .select('*')
    .single();

  return inquiry as Inquiry;
}

export async function getInquiries(page = 1, pageSize = 20, status?: string) {
  const db = getDB();
  const from = (page - 1) * pageSize;
  let query = db
    .from('inquiries')
    .select('*, customers(name, phone)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (status) query = query.eq('status', status);

  const { data, count } = await query;
  return { data: (data || []) as Inquiry[], total: count || 0 };
}

export async function updateInquiry(id: string, updates: Partial<Inquiry>): Promise<void> {
  const db = getDB();
  await db.from('inquiries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}
