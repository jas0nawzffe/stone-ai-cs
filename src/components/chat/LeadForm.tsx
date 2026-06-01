'use client';

import { useState } from 'react';
import { Phone, User, Building2, FileText, Send, Check } from 'lucide-react';

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', company: '', requirement: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || loading) return;

    setLoading(true);
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'general' }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 ml-10 max-w-[280px]">
        <div className="flex items-center gap-2 text-green-700">
          <Check size={18} />
          <span className="text-sm font-medium">提交成功！</span>
        </div>
        <p className="text-xs text-green-600 mt-1">我们的销售顾问会尽快联系您~</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 ml-10 max-w-[300px]">
      <div className="text-sm font-medium text-blue-800 mb-3">快速留资 · 获取专属报价</div>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <User size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="您的姓名 *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 text-sm outline-none bg-transparent"
            required
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <Phone size={14} className="text-gray-400 shrink-0" />
          <input
            type="tel"
            placeholder="手机号码 *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="flex-1 text-sm outline-none bg-transparent"
            required
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <Building2 size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="公司名称（选填）"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <div className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <FileText size={14} className="text-gray-400 shrink-0 mt-1.5" />
          <textarea
            placeholder="需求简述（选填）"
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            className="flex-1 text-sm outline-none bg-transparent resize-none h-14"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={!form.name || !form.phone || loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>提交中...</>
          ) : (
            <>
              <Send size={14} />
              提交留资
            </>
          )}
        </button>
      </form>
    </div>
  );
}
