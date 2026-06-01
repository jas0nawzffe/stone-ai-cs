import { NextRequest } from 'next/server';
import { submitInquiry } from '@/lib/db/inquiries';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, phone, email, company, requirement, product_interests, conversation_id } = body;

    if (!name || !phone || !requirement) {
      return Response.json({ error: '请填写姓名、电话和需求' }, { status: 400 });
    }

    const inquiry = await submitInquiry({
      conversation_id,
      type: type || 'general',
      name,
      phone,
      email,
      company,
      requirement,
      product_interests,
    });

    return Response.json({ success: true, inquiry });
  } catch (e) {
    console.error('Inquiry error:', e);
    return Response.json({ error: '提交失败' }, { status: 500 });
  }
}
