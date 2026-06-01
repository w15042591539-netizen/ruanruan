import { useState, useRef, useEffect, useCallback } from "react";
import Live2DCanvas from "../live2d/Live2DCanvas";

interface Message {
  role: "user" | "assistant";
  content: string;
}

let ws: WebSocket | null = null;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connect();
    return () => {
      ws?.close();
    };
  }, []);

  const connect = () => {
    ws = new WebSocket("ws://localhost:8000/ws/chat");
    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000);
    };
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat_chunk") {
        setWaiting(false);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, content: last.content + data.content }];
          }
          return [...prev, { role: "assistant", content: data.content }];
        });
      } else if (data.type === "chat_complete") {
        setWaiting(false);
      }
    };
  };

  const send = useCallback(() => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    ws.send(JSON.stringify({ type: "chat", session_id: "1", content: input }));
    setInput("");
    setWaiting(true);
  }, [input]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, waiting]);

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Live2D 背景层 */}
      <Live2DCanvas
        modelPath="/models/hiyori_free_zh/runtime/hiyori_free_t08.model3.json"
        className="absolute inset-0"
      />

      {/* 顶部状态栏 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-6 py-3 pointer-events-none">
        <span className="font-medium text-lg text-gray-800 bg-white/70 backdrop-blur-sm rounded-full px-4 py-1 shadow-sm">软软</span>
        <span className={`ml-2 w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
      </div>

      {/* 聊天悬浮层 - 下三分之一 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col pointer-events-none" style={{ height: "35%" }}>
        {/* 消息列表 */}
        <main ref={listRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-none">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} pointer-events-auto`}>
              <div className="flex items-start gap-2 max-w-md">
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm">
                    🤖
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-500/90 text-white rounded-br-md"
                      : "bg-white/75 backdrop-blur-sm text-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-sm">
                    U
                  </div>
                )}
              </div>
            </div>
          ))}
          {waiting && (
            <div className="flex justify-start pointer-events-auto">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-xs shrink-0 shadow-sm">🤖</div>
                <div className="px-4 py-2 rounded-2xl rounded-bl-md bg-white/75 backdrop-blur-sm shadow-sm">
                  <span className="inline-flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 输入区 */}
        <footer className="shrink-0 px-4 pb-4 pointer-events-auto">
          <div className="flex gap-2 items-end max-w-2xl mx-auto">
            <input
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/75 backdrop-blur-sm border border-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm disabled:opacity-50 shadow-sm text-gray-800 placeholder:text-gray-400"
              placeholder={connected ? "输入消息..." : "连接中..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={!connected}
            />
            <button
              onClick={send}
              disabled={!connected}
              className="px-5 py-2.5 rounded-xl bg-blue-500/90 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors backdrop-blur-sm shadow-sm"
            >
              发送
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
