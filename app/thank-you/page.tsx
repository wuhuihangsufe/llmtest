import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 text-center">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-green-600">提交成功！</h1>
        <p className="text-gray-700">
          非常感谢您的参与！您的宝贵意见已经成功提交，这对我们的研究至关重要。
        </p>
        <Link 
            href="/"
            className="inline-block px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
} 