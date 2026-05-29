import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, input]);
    setInput("");
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-800 flex flex-col p-4 border-r border-gray-700">
        <h2 className="text-lg font-bold mb-4">软软</h2>
        <button className="w-full py-2 mb-4 rounded-lg bg-pink-500 hover:bg-pink-600 text-sm font-medium">
          新建对话
        </button>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <div className="py-2 px-3 rounded-lg bg-gray-700 text-sm cursor-pointer">默认对话</div>
        </nav>
      </aside>

      {/* 聊天区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部 */}
        <header className="h-14 flex items-center px-6 border-b border-gray-700">
          <span className="font-medium">小软</span>
          <span className="ml-2 text-xs text-pink-400">❤ 80</span>
        </header>

        {/* 消息列表 */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 mt-20">
              和你的 AI 女友开始聊天吧 💕
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="flex justify-end">
              <div className="max-w-xs px-4 py-2 rounded-2xl bg-pink-500">
                {msg}
              </div>
            </div>
          ))}
        </main>

        {/* 输入区 */}
        <footer className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 focus:outline-none focus:border-pink-500"
              placeholder="说点什么..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              className="px-6 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 font-medium"
            >
              发送
            </button>
          </div>
        </footer>
      </div>

      {/* Live2D 占位区 */}
      <aside className="w-80 bg-gray-950 flex items-center justify-center border-l border-gray-700">
        <p className="text-gray-600 text-sm">Live2D 模型区域</p>
      </aside>
    </div>
  );
}
