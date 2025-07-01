"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('技术/开发');
  const [usageFrequency, setUsageFrequency] = useState('每天');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入您的昵称');
      return;
    }

    const userInfo = {
      name: name.trim(),
      profile: {
        occupation,
        usageFrequency,
      },
      startTime: new Date().toISOString(),
    };

    localStorage.setItem('fineval_user_info', JSON.stringify(userInfo));
    router.push('/evaluate');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                欢迎来到智能投资助手<span className="text-blue-600">(RIA)</span>匿名评测平台
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                携手探索智能投资助手的边界，您的洞察至关重要
            </p>
        </header>

        <main className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Column: Project Info */}
          <div className="md:col-span-1 prose prose-lg max-w-none text-gray-700">
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="!mt-0">关于我们与项目</h2>
                <p>您好！我们是来自清华大学五道口金融学院财富管理研究中心的研究人员。</p>
                <p>我们发起了这个项目，旨在建立一个以“人”为核心的评测基准，并创建一个高质量、开放的评测数据集，促进AI社区的透明与发展。</p>
              </div>
              
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="!mt-0">数据隐私与安全</h2>
                <p>我们郑重承诺保护您的隐私。所有模型均匿名处理，个人信息仅用于统计分析，绝不用于商业目的或分享。所有研究结果将以聚合、匿名的形式发布。</p>
              </div>

              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="!mt-0">联系我们</h2>
                <p>有任何意见或者建议都可以邮件告知我们：</p>
                <p className="font-semibold text-blue-600 break-all">wuhh.2018@tsinghua.org.cn</p>
              </div>
          </div>

          {/* Right Column: Mission and Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-700">
                  <h2>您的任务：成为RIA评测官</h2>
                  <p>接下来，您将化身为一位专业的“RIA评测官”。您的任务很简单：</p>
                  <ul>
                      <li><strong>比较回答</strong>：我们会向您展示 60个相同的问题，以及 10个匿名RIA对这些问题的回答。</li>
                      <li><strong>打分评价</strong>：为每个回答打出 1-5星 的分数。</li>
                      <li><strong>勾选标签</strong>：勾选每个回答的优缺点。</li>
                  </ul>
                  <p>整个评测过程预计需要 <strong>30 - 45分钟</strong>。感谢您投入宝贵的时间参与这个有意义的项目！</p>
                  
                  <h3 className="text-center mt-10">准备好了吗？</h3>
                  <p className="text-center">请您填写以下基本信息，它将帮助我们更好地理解评测结果。</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">您的昵称：</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                      placeholder="请输入您的昵称"
                    />
                  </div>
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-semibold text-gray-800 mb-1">您的职业领域：</label>
                    <select
                      id="occupation"
                      name="occupation"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    >
                      <option>技术/开发</option>
                      <option>产品/设计</option>
                      <option>市场/运营</option>
                      <option>学生</option>
                      <option>教育/研究</option>
                      <option>内容创作</option>
                      <option>其他</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="usage" className="block text-sm font-semibold text-gray-800 mb-1">您使用大模型的频率：</label>
                    <select
                      id="usage"
                      name="usage"
                      value={usageFrequency}
                      onChange={(e) => setUsageFrequency(e.target.value)}
                      className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    >
                      <option>每天</option>
                      <option>每周数次</option>
                      <option>偶尔使用</option>
                      <option>几乎不用</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <button
                    type="submit"
                    className="w-full md:w-1/2 lg:w-auto inline-block py-4 px-12 border border-transparent text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    开始评测
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
