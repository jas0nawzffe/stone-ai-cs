-- ============================================
-- 云浮石材AI客服系统 - 初始化数据库
-- ============================================

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. profiles (关联 Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 新用户自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'agent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. customers
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  email TEXT,
  wechat_id TEXT,
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'wechat', 'phone', 'other')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. conversations
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_agent', 'agent_taken', 'closed')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. messages
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'agent')),
  content TEXT NOT NULL,
  product_ids UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. products
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  price_range TEXT,
  unit TEXT DEFAULT '平方米',
  image_urls TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '{}',
  stock_status TEXT DEFAULT 'in_stock',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. knowledge_docs (RAG知识库)
-- ============================================
CREATE TABLE knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  category TEXT,
  source TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. faqs
-- ============================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  embedding vector(1536),
  category TEXT,
  priority INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 8. sales_scripts
-- ============================================
CREATE TABLE sales_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scenario TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 9. inquiries (询盘/留资)
-- ============================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('quote', 'sample', 'visit', 'cooperation', 'general')),
  name TEXT,
  phone TEXT,
  email TEXT,
  company TEXT,
  requirement TEXT,
  product_interests UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'won', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 10. ai_logs
-- ============================================
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  intent TEXT,
  knowledge_sources JSONB DEFAULT '[]',
  faq_sources JSONB DEFAULT '[]',
  product_recommended UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 11. system_config
-- ============================================
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- pgvector 向量索引 (IVFFlat)
-- ============================================
CREATE INDEX ON knowledge_docs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON faqs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON sales_scripts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- ============================================
-- 业务索引
-- ============================================
CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_status ON conversations(status, updated_at);
CREATE INDEX idx_inquiries_status ON inquiries(status, created_at);
CREATE INDEX idx_ai_logs_conv ON ai_logs(conversation_id, created_at);
CREATE INDEX idx_knowledge_category ON knowledge_docs(category, status);
CREATE INDEX idx_faqs_category ON faqs(category, status);
CREATE INDEX idx_products_category ON products(category, status);

-- ============================================
-- RLS 策略
-- ============================================

-- profiles: 用户只能读写自己的
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- customers: 公开可创建，staff可查看
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create customer" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view customers" ON customers FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- conversations: staff管理
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view conversations" ON conversations FOR SELECT USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "Staff can insert conversations" ON conversations FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' OR true
);
CREATE POLICY "Staff can update conversations" ON conversations FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- messages: 公开可插入，staff可查看
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view messages" ON messages FOR SELECT USING (
  auth.role() = 'authenticated' OR true
);

-- products: 公开可读，staff可管理
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Staff can manage products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');

-- knowledge_docs: staff管理
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view knowledge" ON knowledge_docs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can manage knowledge" ON knowledge_docs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update knowledge" ON knowledge_docs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can delete knowledge" ON knowledge_docs FOR DELETE USING (auth.role() = 'authenticated');

-- faqs: 公开可读，staff可管理
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Staff can manage faqs" ON faqs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- inquiries: staff管理
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert inquiry" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view inquiries" ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update inquiries" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');

-- ai_logs: staff查看
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view ai_logs" ON ai_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System can insert ai_logs" ON ai_logs FOR INSERT WITH CHECK (true);

-- system_config: staff管理
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view config" ON system_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can manage config" ON system_config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update config" ON system_config FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- RPC 函数 (向量相似度搜索)
-- ============================================

-- 知识库匹配
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.title,
    kd.content,
    kd.category,
    1 - (kd.embedding <=> query_embedding) AS similarity
  FROM knowledge_docs kd
  WHERE kd.status = 'active' AND kd.embedding IS NOT NULL
    AND 1 - (kd.embedding <=> query_embedding) > match_threshold
  ORDER BY kd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- FAQ匹配
CREATE OR REPLACE FUNCTION match_faqs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  question text,
  answer text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.question,
    f.answer,
    f.category,
    1 - (f.embedding <=> query_embedding) AS similarity
  FROM faqs f
  WHERE f.status = 'active' AND f.embedding IS NOT NULL
    AND 1 - (f.embedding <=> query_embedding) > match_threshold
  ORDER BY f.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 销售话术匹配
CREATE OR REPLACE FUNCTION match_sales_scripts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  scenario text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id,
    ss.title,
    ss.content,
    ss.scenario,
    1 - (ss.embedding <=> query_embedding) AS similarity
  FROM sales_scripts ss
  WHERE ss.status = 'active' AND ss.embedding IS NOT NULL
    AND 1 - (ss.embedding <=> query_embedding) > match_threshold
  ORDER BY ss.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 产品语义搜索
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  name text,
  category text,
  description text,
  price_range text,
  specs jsonb,
  image_urls text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.category,
    p.description,
    p.price_range,
    p.specs,
    p.image_urls,
    1 - ((SELECT embedding FROM products_embeddings pe WHERE pe.product_id = p.id) <=> query_embedding) AS similarity
  FROM products p
  WHERE p.status = 'active'
    AND EXISTS (
      SELECT 1 FROM products_embeddings pe
      WHERE pe.product_id = p.id
        AND 1 - (pe.embedding <=> query_embedding) > match_threshold
    )
  ORDER BY (SELECT embedding FROM products_embeddings pe WHERE pe.product_id = p.id) <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 产品向量表（产品语义搜索需要单独的embedding表）
CREATE TABLE products_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX ON products_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- ============================================
-- 默认系统配置
-- ============================================
INSERT INTO system_config (key, value, description) VALUES
  ('welcome_message', '{"text": "您好！我是云浮石材AI客服助手，请问有什么可以帮您的？您可以咨询产品信息、价格、配送安装等问题~"}', '欢迎语'),
  ('lead_trigger_keywords', '["报价", "多少钱", "价格", "样品", "合作", "采购", "批发", "定制", "联系", "电话"]', '留资触发关键词'),
  ('ai_model', '{"model": "gpt-4o-mini", "temperature": 0.7, "max_tokens": 2000}', 'AI模型配置'),
  ('company_info', '{"name": "云浮石材有限公司", "address": "广东省云浮市云城区石材工业园", "phone": "400-xxx-xxxx", "website": "www.example.com"}', '公司信息')
ON CONFLICT (key) DO NOTHING;
