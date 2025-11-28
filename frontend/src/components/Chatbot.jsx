import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Sparkles, User, Bot } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateResponse = async (userMessage) => {
        setIsLoading(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are the Intelligent Support Assistant for the Smart Ticketing Automation Platform.
                            Your goal is to help users navigate and use the platform.
                            
                            Platform Features:
                            1. User Dashboard:
                               - 'New Ticket' Tab: Users can submit support requests with Subject, Description, and Urgency (Low, Medium, High, Critical).
                               - 'History' Tab: Users can view their past tickets, filter them by Year/Month and Urgency.
                               - Actions: Users can 'Edit' tickets, 'Withdraw' open tickets, and 'Delete' tickets.
                            2. Admin Dashboard:
                               - Admins can view all tickets, see a 'Priority Queue' for critical issues, and update ticket statuses (Open -> Pending -> Resolved).
                            3. Authentication:
                               - Users and Admins log in via the same page but select their role.
                               - New users can Sign Up with Name, Email, and Password.

                            User Query: "${userMessage}"
                            
                            Provide a helpful response based on the platform features above. If the user asks how to do something, give step-by-step instructions based on the UI described. Keep responses concise and friendly.`
                        }]
                    }]
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const botResponse = data.candidates[0].content.parts[0].text;

            setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I'm having trouble connecting to the server right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');

        await generateResponse(userMessage);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Support Assistant</h3>
                                <p className="text-xs text-indigo-100 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 border border-indigo-200">
                                        <Bot className="w-5 h-5 text-indigo-600" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center ml-2 flex-shrink-0">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 border border-indigo-200">
                                    <Bot className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-2">
                            Powered by Gemini AI • Responses may vary
                        </p>
                    </form>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isOpen
                    ? 'bg-slate-700 text-white rotate-90'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/50'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default Chatbot;
