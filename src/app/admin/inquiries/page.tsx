'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';

const statusLabels: Record<string, string> = {
  new: '新询盘',
  contacted: '已联系',
  qualified: '已确认',
  negotiating: '洽谈中',
  won: '已成交',
  lost: '已流失',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  negotiating: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
};

export default function InquiriesPage() {
  const [inquiries] = useState([
    { id: '1', name: '李先生', phone: '138****8888', type: 'quote', requirement: '客厅背景墙大理石', status: 'new', created_at: new Date().toISOString() },
    { id: '2', name: '张女士', phone: '139****9999', type: 'sample', requirement: '需要莎安娜米黄样品', status: 'contacted', created_at: new Date().toISOString() },
    { id: '3', name: '王总', phone: '137****7777', type: 'cooperation', requirement: '工程采购5000平', status: 'negotiating', created_at: new Date().toISOString() },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">询盘管理</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">客户</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">需求</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">时间</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{inq.name}</div>
                  <div className="text-xs text-gray-500">{inq.phone}</div>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {inq.type === 'quote' ? '报价' : inq.type === 'sample' ? '样品' : inq.type === 'cooperation' ? '合作' : '其他'}
                </td>
                <td className="py-3 px-4 text-gray-700 max-w-[200px] truncate">{inq.requirement}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inq.status]}`}>
                    {statusLabels[inq.status]}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDateTime(inq.created_at)}</td>
                <td className="py-3 px-4 text-right">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
