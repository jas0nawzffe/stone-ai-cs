import { ChatWidget } from '@/components/chat/ChatWidget';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero section */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          云浮石材 AI 智能客服
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          专业的石材行业智能客服系统，支持产品推荐、报价咨询、FAQ自动回答、
          RAG知识库检索，为您的业务提供7x24小时智能服务
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {[
            { value: '100+', label: '石材品种', color: 'text-blue-600' },
            { value: '7x24', label: '智能在线', color: 'text-green-600' },
            { value: '秒级', label: '响应速度', color: 'text-orange-600' },
            { value: 'RAG', label: '知识库检索', color: 'text-purple-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-200 w-48"
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">&#x1f4e6;</div>
            <h3 className="font-semibold text-gray-900 mb-2">产品智能推荐</h3>
            <p className="text-sm text-gray-600">
              AI根据客户需求，从大理石、花岗岩、人造石中精准推荐最合适的产品
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">&#x1f4b0;</div>
            <h3 className="font-semibold text-gray-900 mb-2">实时报价咨询</h3>
            <p className="text-sm text-gray-600">
              自动提供参考价格区间，引导客户留资获取精确报价
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">&#x1f4cb;</div>
            <h3 className="font-semibold text-gray-900 mb-2">自动留资收集</h3>
            <p className="text-sm text-gray-600">
              智能识别高意向客户，自动引导填写联系方式，提升转化率
            </p>
          </div>
        </div>
      </div>

      <ChatWidget />
    </main>
  );
}
