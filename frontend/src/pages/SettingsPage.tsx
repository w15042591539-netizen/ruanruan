export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">设置</h1>
      <div className="max-w-md space-y-4">
        <div className="p-4 rounded-xl bg-gray-800">
          <h2 className="font-medium mb-2">角色定制</h2>
          <select className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600">
            <option>温柔女友</option>
            <option>傲娇女友</option>
            <option>活泼女友</option>
          </select>
        </div>
        <div className="p-4 rounded-xl bg-gray-800">
          <h2 className="font-medium mb-2">外观</h2>
          <button className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            切换暗色模式
          </button>
        </div>
      </div>
    </div>
  );
}
