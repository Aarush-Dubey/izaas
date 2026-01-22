import React from 'react';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message }) => {
    const isBot = message.sender === 'bot';

    return (
        <div className={`flex gap-4 ${isBot ? '' : 'flex-row-reverse'} mb-6 group`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBot ? 'bg-primary/20 text-primary' : 'bg-special/20 text-special'
                }`}>
                {isBot ? <Bot size={20} /> : <User size={20} />}
            </div>

            <div className={`flex flex-col max-w-[80%] ${isBot ? 'items-start' : 'items-end'}`}>
                <div className={`px-5 py-3 rounded-2xl ${isBot
                        ? 'bg-white/10 text-gray-100 rounded-tl-none'
                        : 'bg-primary/20 text-white rounded-tr-none'
                    }`}>
                    <p className="leading-relaxed">{message.text}</p>
                </div>

                {/* Render Widget if exists */}
                {message.widget}

                <span className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
