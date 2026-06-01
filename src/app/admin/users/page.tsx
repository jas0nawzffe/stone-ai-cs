'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: '管理员',
  agent: '客服',
  viewer: '观察者',
};

export default function UsersPage() {
  const [users] = useState([
    { id: '1', email: 'admin@example.com', full_name: '系统管理员', role: 'admin', created_at: '2026-01-01' },
    { id: '2', email: 'agent@example.com', full_name: '客服小王', role: 'agent', created_at: '2026-01-15' },
    { id: '3', email: 'viewer@example.com', full_name: '李经理', role: 'viewer', created_at: '2026-03-01' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">用户管理</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> 添加用户
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">姓名</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">邮箱</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">角色</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">创建时间</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{u.full_name}</td>
                <td className="py-3 px-4 text-gray-600">{u.email}</td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{u.created_at}</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-sm text-blue-600 hover:underline">编辑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
