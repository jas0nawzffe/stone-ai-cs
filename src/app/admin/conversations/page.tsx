'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { formatDateTime } from '@/lib/utils/format';

interface ConvRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  customers?: { name: string };
}

const statusLabels: Record<string, string> = {
  active: '进行中',
  pending_agent: '待接手',
  agent_taken: '人工服务中',
  closed: '已结束',
};

export default function ConversationsPage() {
  const router = useRouter();
  const [data, setData] = useState<ConvRow[]>([]);

  useEffect(() => {
    setData([
      { id: '1', title: '李先生的咨询', status: 'active', created_at: new Date().toISOString(), customers: { name: '李先生' } },
      { id: '2', title: '张女士的产品咨询', status: 'pending_agent', created_at: new Date().toISOString(), customers: { name: '张女士' } },
    ]);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">客户对话</h2>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <DataTable
          columns={[
            { key: 'title', header: '对话标题' },
            {
              key: 'customers',
              header: '客户',
              render: (row: ConvRow) => <span>{row.customers?.name || '访客'}</span>,
            },
            {
              key: 'status',
              header: '状态',
              render: (row: ConvRow) => (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  row.status === 'active' ? 'bg-green-100 text-green-700' :
                  row.status === 'pending_agent' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {statusLabels[row.status] || row.status}
                </span>
              ),
            },
            {
              key: 'created_at',
              header: '时间',
              render: (row: ConvRow) => <span className="text-gray-500 text-xs">{formatDateTime(row.created_at)}</span>,
            },
          ]}
          data={data}
          keyField="id"
          onRowClick={(row) => router.push(`/admin/conversations/${row.id}`)}
        />
      </div>
    </div>
  );
}
