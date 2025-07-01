"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [profile, setProfile] = useState({
    occupation: '',
    frequency: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setName(value);
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStart = () => {
    if (!name.trim()) {
      setError('请输入您的姓名或昵称。');
      return;
    }
    setError('');

    // 将用户信息和开始时间存入localStorage
    const userInfo = {
      name,
      profile,
      startTime: new Date().toISOString(),
    };
    localStorage.setItem('fineval_user_info', JSON.stringify(userInfo));

    // 跳转到测评主页
    router.push('/evaluate');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">大语言模型测评</h1>
          <p className="mt-2 text-gray-600">感谢您参与本次评测。您将对一系列问题下不同模型的回答进行匿名评价。您的数据将为我们研究大语言模型提供宝贵的帮助。</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名/昵称 (必填)</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            />
          </div>

          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">您的职业领域是？</label>
            <select
              name="occupation"
              id="occupation"
              value={profile.occupation}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            >
              <option value="">请选择...</option>
              <option value="tech">技术/研发</option>
              <option value="education">教育/研究</option>
              <option value="media">媒体/内容创作</option>
              <option value="business">商业/金融</option>
              <option value="other">其他</option>
            </select>
          </div>

           <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">您使用大模型的频率？</label>
            <select
              name="frequency"
              id="frequency"
              value={profile.frequency}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            >
              <option value="">请选择...</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="rarely">很少</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          onClick={handleStart}
          className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          开始测评
        </button>
      </div>
    </main>
  );
}
