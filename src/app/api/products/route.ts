import { getAllProducts } from '@/lib/db/products';

export async function GET() {
  try {
    const products = await getAllProducts();
    return Response.json({ products });
  } catch (e) {
    console.error('Products error:', e);
    return Response.json({ error: '获取产品失败' }, { status: 500 });
  }
}
