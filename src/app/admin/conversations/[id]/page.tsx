'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';

export default function ConversationDetailPage({ params }: { params: { id: string } }) {
  const [agentMessage, setAgentMessage] = useState('');

  const messages = [
    { id: '1', role: 'user', content: '你们有什么大理石推荐吗？我想做客厅背景墙。', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', role: 'assistant', content: '您好！针对客厅背景墙，我推荐以下几款大理石：\n\n1. 莎安娜米黄 - 温润如玉的底色，适合暖色调装修风格\n2. 爵士白 - 经典白色基底配灰色纹理，大气优雅\n3. 金碧辉煌 - 金黄色调，特别适合轻奢风格\n\n请问您更偏好哪种色调呢？', created_at: new Date(Date.now() - 3500000).toISOString() },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">对话详情</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          人工接管
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Messages */}
        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'assistant'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-xs mt-1 opacity-60">{formatDateTime(msg.created_at)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent reply */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-400 mb-2">人工回复（将发送给客户）</div>
          <div className="flex gap-2">
            <textarea
              value={agentMessage}
              onChange={(e) => setAgentMessage(e.target.value)}
              placeholder="输入回复内容..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none h-20"
            />
            <button
              disabled={!agentMessage.trim()}
              className="self-end p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
