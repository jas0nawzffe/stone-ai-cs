'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [faqs] = useState([
    { id: '1', question: '你们有哪些石材品种？', category: '产品咨询', priority: 10 },
    { id: '2', question: '大理石和人造石有什么区别？', category: '产品咨询', priority: 9 },
    { id: '3', question: '石材怎么计算价格？', category: '价格相关', priority: 8 },
    { id: '4', question: '你们可以寄样品吗？', category: '服务相关', priority: 7 },
    { id: '5', question: '石材怎么安装？', category: '安装售后', priority: 6 },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">FAQ 管理</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> 添加FAQ
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
              placeholder="搜索FAQ..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase w-[40%]">问题</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">优先级</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{faq.question}</td>
                <td className="py-3 px-4 text-gray-500">{faq.category}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{faq.priority}</span>
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
