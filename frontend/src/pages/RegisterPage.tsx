import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-96 p-8 rounded-2xl bg-gray-800 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">注册 软软</h1>
        <input
          className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-pink-500"
          placeholder="用户名"
        />
        <input
          className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-pink-500"
          placeholder="邮箱"
        />
        <input
          type="password"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-pink-500"
          placeholder="密码"
        />
        <button className="w-full py-2 mb-4 rounded-lg bg-pink-500 hover:bg-pink-600 font-medium">
          注 册
        </button>
        <p className="text-center text-sm text-gray-400">
          已有账号？
          <Link to="/login" className="text-pink-400 ml-1 hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
