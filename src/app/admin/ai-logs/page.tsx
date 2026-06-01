'use client';

import { useState } from 'react';
import { formatDateTime, formatDuration } from '@/lib/utils/format';

export default function AILogsPage() {
  const [logs] = useState([
    { id: '1', model: 'gpt-4o-mini', intent: 'product_inquiry', prompt_tokens: 450, completion_tokens: 180, latency_ms: 1200, created_at: new Date().toISOString() },
    { id: '2', model: 'gpt-4o-mini', intent: 'price_inquiry', prompt_tokens: 380, completion_tokens: 150, latency_ms: 980, created_at: new Date(Date.now() - 300000).toISOString() },
    { id: '3', model: 'gpt-4o-mini', intent: 'faq', prompt_tokens: 520, completion_tokens: 200, latency_ms: 1500, created_at: new Date(Date.now() - 600000).toISOString() },
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">AI 回答日志</h2>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">模型</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">意图</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Prompt Tokens</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Completion</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">延迟</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">时间</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{log.model}</td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{log.intent}</span>
                </td>
                <td className="py-3 px-4 text-right text-gray-600">{log.prompt_tokens.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-gray-600">{log.completion_tokens.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-gray-600">{formatDuration(log.latency_ms)}</td>
                <td className="py-3 px-4 text-right text-gray-500 text-xs">{formatDateTime(log.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
