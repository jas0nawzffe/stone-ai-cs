'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

interface DashboardData {
  total_conversations: number;
  active_today: number;
  total_inquiries: number;
  new_inquiries: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    total_conversations: 0,
    active_today: 0,
    total_inquiries: 0,
    new_inquiries: 0,
  });

  useEffect(() => {
    // In production: fetch from API
    setData({
      total_conversations: 1286,
      active_today: 47,
      total_inquiries: 356,
      new_inquiries: 12,
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">数据概览</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="总对话数" value={data.total_conversations.toLocaleString()} icon={MessageSquare} />
        <StatsCard title="今日活跃" value={data.active_today} change="较昨日 +8%" icon={TrendingUp} trend="up" />
        <StatsCard title="总询盘数" value={data.total_inquiries.toLocaleString()} icon={ClipboardList} />
        <StatsCard title="新询盘" value={data.new_inquiries} change="待处理" icon={Users} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">近期对话趋势</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            图表区域（接入 Recharts 后显示）
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">询盘转化统计</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            图表区域（接入 Recharts 后显示）
          </div>
        </div>
      </div>
    </div>
  );
}
