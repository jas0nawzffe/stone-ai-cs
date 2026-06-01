import { NextRequest } from 'next/server';
import { getMessages } from '@/lib/db/conversations';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversation_id');

  if (!conversationId) {
    return Response.json({ error: '缺少 conversation_id' }, { status: 400 });
  }

  try {
    const messages = await getMessages(conversationId);
    return Response.json({ messages });
  } catch (e) {
    console.error('History error:', e);
    return Response.json({ error: '获取消息失败' }, { status: 500 });
  }
}
