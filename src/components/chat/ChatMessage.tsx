import type { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { Bot, User } from 'lucide-react';

export function ChatMessage({ msg }: { msg: ChatMessageType }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-blue-100' : 'bg-blue-600'
        }`}
      >
        {isUser ? (
          <User size={14} className="text-blue-600" />
        ) : (
          <Bot size={14} className="text-white" />
        )}
      </div>

      {/* Content */}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
        }`}
      >
        {msg.content ? (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}
      </div>
    </div>
  );
}
