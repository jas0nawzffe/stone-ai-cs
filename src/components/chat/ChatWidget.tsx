'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { cn } from '@/lib/utils/cn';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3',
            'bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700',
            'transition-all duration-300 animate-bounce-slow'
          )}
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">在线客服</span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <div className="font-semibold text-sm">云浮石材AI客服</div>
              <div className="text-xs text-blue-100 mt-0.5">在线 · 秒回</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat content */}
          <ChatWindow />
        </div>
      )}
    </>
  );
}
