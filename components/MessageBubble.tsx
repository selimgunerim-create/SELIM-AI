import React from 'react';
import { Message, Sender } from '../types';
import { User, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
          isUser 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gradient-to-br from-orange-400 to-pink-500 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base whitespace-pre-wrap leading-relaxed ${
              isUser
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white/80 backdrop-blur-sm border border-white/50 text-gray-800 rounded-tl-none'
            } ${message.isError ? 'bg-red-100 border-red-200 text-red-600' : ''}`}
          >
            {message.text}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 px-1 font-medium opacity-70">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};