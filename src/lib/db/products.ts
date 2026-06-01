import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '@/lib/types';

let _supabase: SupabaseClient | null = null;
function getDB() {
  if (!_supabase) _supabase = createAdminClient();
  return _supabase;
}

export async function getProducts(page = 1, pageSize = 20, category?: string) {
  const db = getDB();
  const from = (page - 1) * pageSize;
  let query = db
    .from('products')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .range(from, from + pageSize - 1);

  if (category) query = query.eq('category', category);

  const { data, count } = await query;
  return { data: (data || []) as Product[], total: count || 0 };
}

export async function getAllProducts() {
  const db = getDB();
  const { data } = await db
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  return (data || []) as Product[];
}

export async function getProduct(id: string) {
  const db = getDB();
  const { data } = await db.from('products').select('*').eq('id', id).single();
  return data as Product;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const db = getDB();
  const { data } = await db.from('products').insert(product).select('*').single();
  return data as Product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  const db = getDB();
  await db.from('products').update({ ...product, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getDB();
  await db.from('products').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', id);
}
