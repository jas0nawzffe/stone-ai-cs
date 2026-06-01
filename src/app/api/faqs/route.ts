import { getFAQs } from '@/lib/db/knowledge';

export async function GET() {
  try {
    const { data } = await getFAQs(1, 100);
    return Response.json({ faqs: data });
  } catch (e) {
    console.error('FAQs error:', e);
    return Response.json({ error: '获取FAQ失败' }, { status: 500 });
  }
}
