'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products] = useState([
    { id: '1', name: '莎安娜米黄大理石', category: '大理石', price_range: '380-580元', status: 'active' },
    { id: '2', name: '黑白根大理石', category: '大理石', price_range: '180-280元', status: 'active' },
    { id: '3', name: '皇室啡花岗岩', category: '花岗岩', price_range: '150-250元', status: 'active' },
    { id: '4', name: '蓝钻石英石', category: '人造石', price_range: '280-420元', status: 'active' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">产品管理</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> 添加产品
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索产品..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">产品名称</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">参考价格</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                <td className="py-3 px-4 text-gray-500">{p.category}</td>
                <td className="py-3 px-4 text-blue-600 font-medium">{p.price_range}/㎡</td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">在售</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600"><Edit size={15} /></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
