'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Package,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  FileText,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const menuItems = [
  { href: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/conversations', label: '客户对话', icon: MessageSquare },
  { href: '/admin/inquiries', label: '询盘管理', icon: ClipboardList },
  { href: '/admin/knowledge', label: '知识库', icon: BookOpen },
  { href: '/admin/faqs', label: 'FAQ管理', icon: HelpCircle },
  { href: '/admin/products', label: '产品管理', icon: Package },
  { href: '/admin/ai-logs', label: 'AI日志', icon: FileText },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/settings', label: '系统设置', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <h1 className="text-white font-bold text-lg">石材AI客服</h1>
        <p className="text-gray-500 text-xs mt-0.5">管理后台</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <form action="/auth/signout" method="post">
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors">
            <LogOut size={16} />
            退出登录
          </button>
        </form>
      </div>
    </aside>
  );
}
