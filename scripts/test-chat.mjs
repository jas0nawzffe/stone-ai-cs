// Quick end-to-end test of chat streaming
import 'dotenv/config';
import { createReadStream } from 'fs';
import { join } from 'path';

// Manually set env vars from .env.local
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://aynwgsdsaezbaojzlmhp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bndnc2RzYWV6YmFvanpsbWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTE4NTksImV4cCI6MjA5NTg4Nzg1OX0.oSgD28sWszVwWH5gAUfBAOQZoQrcA9RYgxF0hZof4Hk';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bndnc2RzYWV6YmFvanpsbWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMxMTg1OSwiZXhwIjoyMDk1ODg3ODU5fQ.uETlDfg61i95CGlZhCBhAqzTmMbdFWZV-x-v5EX2j4U';
process.env.AI_API_KEY = 'sk-89a1f9fb94164f13a7fd9a0679dc8bbc';
process.env.AI_BASE_URL = 'https://api.deepseek.com/v1';
process.env.AI_MODEL = 'deepseek-v4-flash';
process.env.AI_EMBEDDING_MODEL = 'text-embedding-3-small';

async function test() {
  // Test 1: Direct DeepSeek API call
  console.log('=== Test 1: Direct DeepSeek API (streaming) ===');
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'user', content: 'Hello, say hi' }],
      max_tokens: 200,
      stream: true,
    }),
  });

  let full = '';
  for await (const chunk of res.body) {
    const text = new TextDecoder().decode(chunk);
    const lines = text.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta;
        const content = delta?.content || delta?.reasoning_content || '';
        if (content) {
          full += content;
        }
      } catch {}
    }
  }
  console.log('Response:', full || '(empty)');
  console.log('Tokens received:', full.length);

  // Test 2: Chat API with system prompt
  console.log('\n=== Test 2: With system prompt (non-streaming) ===');
  const res2 = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        { role: 'system', content: '你是中文客服助手，用中文简短回复。' },
        { role: 'user', content: '你好，有什么大理石推荐？' }
      ],
      max_tokens: 500,
      stream: false,
    }),
  });
  const j = await res2.json();
  console.log('Content:', j.choices?.[0]?.message?.content || '(empty)');
  console.log('Finish reason:', j.choices?.[0]?.finish_reason);
  console.log('Tokens used:', j.usage);
}

test().catch(e => console.error('Test error:', e.message));
