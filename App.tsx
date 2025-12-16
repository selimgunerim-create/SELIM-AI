import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender } from './types';
import { sendMessageToGemini, resetChatSession } from './services/geminiService';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { Calculator } from './components/Calculator';
import { MiniGame } from './components/MiniGame';
import { Sparkles, Trash2, Calculator as CalcIcon, Gamepad2, AlertCircle, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  // API Key var mı kontrolü (Frontend tarafında process.env genelde build time'da gömülür)
  const isDemoMode = !process.env.API_KEY;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: isDemoMode 
        ? 'Selam! Ben Selim AI. 😎\nŞu an **Ücretsiz Demo Modu**ndayım. Matematik sorularını çözebilirim ve seninle sohbet edebilirim. API anahtarı olmadığı için internete bağlanamıyorum ama yerel zekamla buradayım! 💪'
        : 'Merhaba dostum! Ben Selim AI. 😎\nMatematik sorularını çözebilir, yazdığın cümleleri düzeltebilir ve aklına gelen her konuda sohbet edebilirim. Ayrıca yeni mini oyunumuzu denedin mi? 🚀',
      sender: Sender.Bot,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.User,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(text);

      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: Sender.Bot,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Bağlantıda bir sorun oldu dostum. 😔",
        sender: Sender.Bot,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    resetChatSession();
    setMessages([
      {
        id: Date.now().toString(),
        text: 'Sohbet temizlendi. Tertemiz bir sayfa! 🚀',
        sender: Sender.Bot,
        timestamp: new Date(),
      },
    ]);
    setShowClearConfirm(false);
  };

  const cancelClearChat = () => {
    setShowClearConfirm(false);
  };

  return (
    <div className="w-full h-full md:h-[90vh] bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
      
      {/* Top Browser Bar Decoration */}
      <div className="bg-white/40 border-b border-white/20 h-8 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
        </div>
        <div className="flex-1 text-center">
            <span className="bg-white/50 px-3 py-0.5 rounded-md text-xs text-gray-600 font-medium">selim-ai.com</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/60 backdrop-blur-md border-b border-white/20 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transform hover:rotate-6 transition-transform ${isDemoMode ? 'bg-gray-700' : 'bg-gradient-to-tr from-orange-400 to-pink-600'}`}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-xl leading-tight tracking-tight flex items-center gap-2">
                SELİM AI
                {isDemoMode && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-full uppercase tracking-wider font-bold border border-gray-300">
                        Demo Modu
                    </span>
                )}
            </h1>
            <p className="text-xs text-gray-500 font-semibold tracking-wide">AI COMPANION</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className={`p-2.5 rounded-xl transition-all ${showCalculator ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-md'}`}
                title="Hesap Makinesi"
            >
                <CalcIcon size={20} />
            </button>
            <button 
                onClick={handleClearClick}
                className="p-2.5 bg-white/50 text-gray-500 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                title="Sohbeti Temizle"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </header>

      {/* Overlays */}
      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}
      
      {showMiniGame && (
        <MiniGame onClose={() => setShowMiniGame(false)} />
      )}

      {/* Custom Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 border border-white/50">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sohbeti Temizle?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Tüm konuşma geçmişin silinecek dostum. Buna emin misin? 🤔
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={cancelClearChat} 
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition active:scale-95"
              >
                Hayır
              </button>
              <button 
                onClick={confirmClearChat} 
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition active:scale-95"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full mb-6">
                <div className="bg-white/80 border border-white/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Mini Game FAB */}
      <div className="absolute bottom-5 left-4 md:left-6 z-30">
        <button 
          onClick={() => setShowMiniGame(true)}
          className="group flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-sm text-white pl-1.5 pr-3 py-1.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/10"
        >
          <div className="w-7 h-7 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Gamepad2 size={14} className="text-white" />
          </div>
          <div className="flex flex-col items-start">
             <span className="text-[9px] font-bold text-gray-400 leading-none mb-0.5">MİNİ</span>
             <span className="text-[11px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">OYUN</span>
          </div>
        </button>
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;