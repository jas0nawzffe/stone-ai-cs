// ============================================
// Database row types
// ============================================

export type ProfileRole = 'admin' | 'agent' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: ProfileRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CustomerSource = 'web' | 'wechat' | 'phone' | 'other';

export interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  wechat_id: string | null;
  source: CustomerSource;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ConversationStatus = 'active' | 'pending_agent' | 'agent_taken' | 'closed';

export interface Conversation {
  id: string;
  customer_id: string | null;
  status: ConversationStatus;
  assigned_to: string | null;
  title: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'agent';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  product_ids: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price_range: string | null;
  unit: string | null;
  image_urls: string[];
  specs: Record<string, unknown>;
  stock_status: string;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  embedding: number[] | null;
  category: string | null;
  source: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  embedding: number[] | null;
  category: string | null;
  priority: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SalesScript {
  id: string;
  title: string;
  scenario: string | null;
  content: string;
  embedding: number[] | null;
  category: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type InquiryType = 'quote' | 'sample' | 'visit' | 'cooperation' | 'general';
export type InquiryStatus = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost';

export interface Inquiry {
  id: string;
  customer_id: string | null;
  conversation_id: string | null;
  type: InquiryType;
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  requirement: string | null;
  product_interests: string[];
  status: InquiryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AILog {
  id: string;
  conversation_id: string | null;
  message_id: string | null;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  intent: string | null;
  knowledge_sources: RAGSource[];
  faq_sources: RAGSource[];
  product_recommended: string[];
  created_at: string;
}

export interface RAGSource {
  id: string;
  title: string;
  similarity: number;
  snippet: string;
}

// ============================================
// API request/response types
// ============================================

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface ChatStreamChunk {
  type: 'text' | 'products' | 'faq' | 'lead_form' | 'done' | 'error';
  content?: string;
  products?: Product[];
  conversation_id?: string;
  message_id?: string;
}

export interface InquirySubmit {
  conversation_id?: string;
  type: InquiryType;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  requirement: string;
  product_interests?: string[];
}

export interface DashboardStats {
  total_conversations: number;
  active_today: number;
  total_inquiries: number;
  new_inquiries: number;
  avg_response_time_ms: number;
  ai_resolution_rate: number;
  daily_stats: { date: string; conversations: number; inquiries: number }[];
}

// ============================================
// AI types
// ============================================

export type Intent = 'product_inquiry' | 'price_inquiry' | 'faq' | 'leave_contact' | 'general_chat';

export interface RAGResult {
  knowledge: RAGSource[];
  faqs: RAGSource[];
  scripts: RAGSource[];
}

export interface AIContext {
  ragResult: RAGResult;
  relevantProducts: Product[];
  conversationHistory: { role: MessageRole; content: string }[];
}
