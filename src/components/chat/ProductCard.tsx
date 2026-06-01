import type { Product } from '@/lib/types';
import { Package } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow max-w-[280px]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
          <Package size={18} className="text-amber-600" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{product.category}</div>
          {product.price_range && (
            <div className="text-sm font-semibold text-blue-600 mt-1">{product.price_range}/㎡</div>
          )}
          {product.description && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
