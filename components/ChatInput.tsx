import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, SpellCheck, Check } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

// Yaygın Türkçe yazım hataları sözlüğü
const TURKISH_TYPOS: Record<string, string> = {
  "herkez": "herkes",
  "yanlız": "yalnız",
  "yalnış": "yanlış",
  "eşöför": "şoför",
  "şöför": "şoför",
  "şarz": "şarj",
  "orjinal": "orijinal",
  "kiprik": "kirpik",
  "tabiki": "tabii ki",
  "deynek": "değnek",
  "gurup": "grup",
  "kılavuz": "kılavuz", // Doğrusu bu ama insanlar klavuz yazar
  "klavuz": "kılavuz",
  "kontür": "kontör",
  "mahsül": "mahsul",
  "müsayit": "müsait",
  "pardesü": "pardösü",
  "sahnalye": "sandalye",
  "sarmısak": "sarımsak",
  "birşey": "bir şey",
  "hiçbir": "hiçbir", // Bitişik yazılır
  "hicbir": "hiçbir",
  "herşey": "her şey",
  "eglence": "eğlence",
  "hoscakal": "hoşça kal",
  "tesekkur": "teşekkür",
  "değil": "değil",
  "deil": "değil",
  "yapcam": "yapacağım",
  "gelcem": "geleceğim",
  "gidiyom": "gidiyorum",
  "bide": "bir de"
};

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [typoMatch, setTypoMatch] = useState<{ wrong: string; correct: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Yazım hatası kontrolü
  useEffect(() => {
    const words = input.toLowerCase().split(/[\s.,!?]+/);
    const foundTypo = words.find(word => TURKISH_TYPOS[word]);

    if (foundTypo) {
      setTypoMatch({ wrong: foundTypo, correct: TURKISH_TYPOS[foundTypo] });
    } else {
      setTypoMatch(null);
    }

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleFixTypo = () => {
    if (typoMatch) {
      // Kelimeyi büyük/küçük harf duyarlılığını koruyarak değiştir (Basit regex replace)
      const regex = new RegExp(`\\b${typoMatch.wrong}\\b`, 'gi');
      const fixedInput = input.replace(regex, typoMatch.correct);
      setInput(fixedInput);
      setTypoMatch(null);
      
      // Textarea odağını koru
      textareaRef.current?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      setTypoMatch(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Arka plan render'ı için metni parçalara ayır
  const renderBackdropText = () => {
    if (!input) return null;
    
    // Basit bir yöntem: Kelimeleri boşlukla ayırıp, hatalı olanları span içine al
    // Not: Bu basit yöntem satır sonlarını tam simüle edemeyebilir, ama görsel efekt için yeterlidir.
    // Daha hassas eşleşme için Textarea ile aynı font/padding/width değerlerine sahip olması şart.
    
    // Regex ile kelimeleri ve ayırıcıları koruyarak bölüyoruz
    const parts = input.split(/(\s+|[.,!?]+)/g);
    
    return parts.map((part, i) => {
        const lower = part.toLowerCase();
        if (TURKISH_TYPOS[lower]) {
            return (
                <span key={i} className="border-b-2 border-red-500 border-dashed decoration-wavy decoration-red-500 pb-[1px] opacity-100">
                    {part}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="w-full bg-white/50 backdrop-blur-md border-t border-white/20 p-4 pb-6 md:pb-6 rounded-b-3xl relative">
      
      {/* Typo Suggestion Popup (Hover Effect Alternative) */}
      {typoMatch && input.trim() !== '' && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 md:left-8 md:transform-none bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 z-50 border border-white/10">
            <div className="flex items-center gap-1.5 text-red-300">
                <SpellCheck size={16} />
                <span className="line-through opacity-70 text-sm">{typoMatch.wrong}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <button 
                onClick={handleFixTypo}
                className="flex items-center gap-1.5 text-green-400 font-bold hover:text-green-300 transition-colors text-sm"
            >
                <span>{typoMatch.correct}</span>
                <div className="bg-green-500/20 p-1 rounded-md">
                   <Check size={12} />
                </div>
            </button>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
        </div>
      )}

      <div className="max-w-3xl mx-auto relative group">
        
        {/* Container for alignment */}
        <div className="relative bg-white rounded-3xl p-2 border border-gray-100 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all flex items-end gap-2 overflow-hidden">
            
            {/* 1. Backdrop Layer (For Red Underlines) */}
            {/* pointer-events-none sayesinde tıklamalar textarea'ya geçer */}
            <div 
                className="absolute top-2 left-2 right-14 bottom-2 py-3 px-4 text-transparent whitespace-pre-wrap break-words font-sans pointer-events-none select-none z-0 overflow-hidden"
                style={{
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                }}
                aria-hidden="true"
            >
                {renderBackdropText()}
            </div>

            {/* 2. Textarea Layer (Transparent Text Background, Visible Caret) */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Selim AI'ya sor..."
              spellCheck={false} // Tarayıcının kendi kontrolünü kapatıyoruz
              className="relative z-10 w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-gray-700 placeholder-gray-400 max-h-[120px] scrollbar-hide focus:outline-none"
              style={{ background: 'transparent' }} // Extra safety
              disabled={isLoading}
            />
            
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-full flex-shrink-0 transition-all duration-200 z-20 ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <SendHorizontal size={20} />
            </button>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold opacity-70">
          Powered by SELİM AI
        </p>
      </div>
    </div>
  );
};
