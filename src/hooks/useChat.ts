'use client';

import { useState, useCallback, useRef } from 'react';
import type { Product, ChatStreamChunk } from '@/lib/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  showLeadForm?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, customerName?: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversation_id: conversationId,
            customer_name: customerName,
          }),
        });

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data: ChatStreamChunk = JSON.parse(line.slice(6));
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== assistantMsg.id) return m;
                  const updates: Partial<ChatMessage> = {};
                  if (data.type === 'text' && data.content) {
                    updates.content = m.content + data.content;
                  }
                  if (data.type === 'products' && data.products) {
                    updates.products = data.products;
                  }
                  if (data.type === 'lead_form') {
                    updates.showLeadForm = true;
                  }
                  return { ...m, ...updates };
                })
              );
              if (data.type === 'done' && data.conversation_id) {
                setConversationId(data.conversation_id);
              }
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }
      } catch (e) {
        console.error('Chat error:', e);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: '抱歉，服务暂时不可用，请稍后重试。' }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
  }, []);

  return { messages, isLoading, sendMessage, resetChat };
}
