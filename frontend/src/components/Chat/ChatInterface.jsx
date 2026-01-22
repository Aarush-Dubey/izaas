import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import MessageBubble from './MessageBubble';

// Dynamic Widget Imports
import BarChart from '../Widgets/BarChart';
import TransactionTable from '../Widgets/TransactionTable';

const WIDGET_REGISTRY = {
    BarChart,
    TransactionTable
};

const ChatInterface = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hello! I am your finance co-pilot. Ask me about your spending or transactions.' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('chat/', { message: userMsg.text });
            const { response: botText, ui_action } = response.data;

            let widgetComponent = null;
            if (ui_action && ui_action.type === 'render' && WIDGET_REGISTRY[ui_action.component]) {
                const Widget = WIDGET_REGISTRY[ui_action.component];
                widgetComponent = <Widget data={ui_action.data} props={ui_action.props} />;
            }

            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: botText,
                    widget: widgetComponent
                }
            ]);

        } catch (error) {
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, sender: 'bot', text: 'Sorry, I encountered an error connecting to the brain.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full bg-primary-dark/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-3">
                <Sparkles className="text-special" size={20} />
                <h2 className="font-semibold text-white">Co-Pilot Link</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {loading && (
                    <div className="flex gap-2 items-center text-gray-400 text-sm ml-14 animate-pulse">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-black/20 border-t border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your finances..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 p-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-black transition-colors disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
