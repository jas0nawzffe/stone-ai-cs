'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const [docs] = useState([
    { id: '1', title: '云浮石材产业介绍', category: '公司介绍', status: 'active', created_at: '2026-05-01' },
    { id: '2', title: '大理石选购指南', category: '产品知识', status: 'active', created_at: '2026-05-02' },
    { id: '3', title: '花岗岩特性与用途', category: '产品知识', status: 'active', created_at: '2026-05-03' },
    { id: '4', title: '石材加工工艺流程', category: '工艺技术', status: 'active', created_at: '2026-05-04' },
    { id: '5', title: '石材安装施工规范', category: '工艺技术', status: 'active', created_at: '2026-05-05' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">知识库管理</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> 添加文档
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
              placeholder="搜索知识库..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">标题</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">更新时间</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{doc.title}</td>
                <td className="py-3 px-4 text-gray-500">{doc.category}</td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">已启用</span>
                </td>
                <td className="py-3 px-4 text-gray-500">{doc.created_at}</td>
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
