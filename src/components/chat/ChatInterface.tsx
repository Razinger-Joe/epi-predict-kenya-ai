import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, User, Loader2, X, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: string[];
    suggestedActions?: string[];
}

interface ChatInterfaceProps {
    className?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const quickActions = [
    'Active Outbreaks',
    'Nairobi Risk',
    'Weekly Forecast',
    'Alert Me',
];

export function ChatInterface({ className }: ChatInterfaceProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                "👋 Hello! I'm EpiPredict AI, your disease intelligence assistant for Kenya.\n\n• 📊 Outbreak risk predictions\n• 🔍 Social media early warning signals\n• 📈 Disease trend analysis\n\nWhat would you like to know?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCounty, setSelectedCounty] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/v1/chat/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    county: selectedCounty || extractCounty(input),
                    disease: extractDisease(input),
                    history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
                }),
            });
            if (response.ok) {
                const data = await response.json();
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date(),
                    sources: data.sources,
                    suggestedActions: data.suggested_actions,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch {
            const mockResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: getMockResponse(input),
                timestamp: new Date(),
                sources: ['Mock Data (Ollama unavailable)'],
            };
            setMessages((prev) => [...prev, mockResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    /* ---------- CLOSED STATE — Floating Trigger ---------- */
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    'fixed bottom-6 right-6 w-16 h-16 rounded-full z-50 flex items-center justify-center',
                    'bg-gradient-to-br from-epi-amber to-epi-orange text-[#050A14]',
                    'shadow-[0_8px_30px_rgba(245,158,11,0.4)]',
                    'hover:shadow-[0_8px_40px_rgba(245,158,11,0.6)] hover:scale-105',
                    'transition-all duration-300 animate-glow-pulse',
                    className
                )}
                aria-label="Open AI Chat"
            >
                <Brain className="w-7 h-7" />
            </button>
        );
    }

    /* ---------- OPEN STATE — Chat Window ---------- */
    return (
        <div
            className={cn(
                'fixed bottom-6 right-6 w-[420px] h-[600px] z-50 flex flex-col',
                'epi-glass-modal rounded-2xl overflow-hidden',
                'animate-chat-entry',
                className
            )}
        >
            {/* ---- Header ---- */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-epi-amber/20 bg-gradient-to-r from-epi-amber/10 to-transparent">
                {/* AI Avatar */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-epi-amber to-epi-orange flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#050A14]" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-epi-green border-2 border-[#050A14] animate-status-pulse" />
                </div>
                <div className="flex-1">
                    <h4 className="font-syne text-sm font-bold text-foreground">EpiPredict AI</h4>
                    <p className="text-[10px] text-muted-foreground">Disease Intelligence Assistant</p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
                    aria-label="Close chat"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            {/* ---- Messages ---- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((message, i) => (
                    <div
                        key={message.id}
                        className={cn(
                            'flex animate-cascade-in opacity-0',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        <div
                            className={cn(
                                'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                                message.role === 'user'
                                    ? 'bg-gradient-to-br from-epi-amber to-epi-orange text-[#050A14] rounded-br-sm font-medium'
                                    : 'epi-glass-card border-l-2 border-l-epi-amber/40 rounded-bl-sm'
                            )}
                        >
                            <div className="flex items-start gap-2">
                                {message.role === 'assistant' && (
                                    <Bot className="w-4 h-4 mt-0.5 shrink-0 text-epi-amber" />
                                )}
                                <div className="flex-1">
                                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                    {message.sources && message.sources.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {message.sources.map((source, j) => (
                                                <span
                                                    key={j}
                                                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-[rgba(245,158,11,0.15)] text-muted-foreground"
                                                >
                                                    {source}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <User className="w-4 h-4 mt-0.5 shrink-0 text-[#050A14]/70" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="epi-glass-card rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 border-l-2 border-l-epi-amber/40">
                            <Bot className="w-4 h-4 text-epi-amber" />
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-epi-amber"
                                        style={{ animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ---- Quick Actions ---- */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                {quickActions.map((action) => (
                    <button
                        key={action}
                        onClick={() => setInput(action)}
                        className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full epi-glass-card text-muted-foreground hover:text-epi-amber hover:border-epi-amber/30 transition-all shrink-0"
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* ---- Input Area ---- */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-[rgba(245,158,11,0.12)]">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about disease trends in Kenya..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 text-sm bg-white/[0.04] border border-[rgba(245,158,11,0.12)] rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-epi-amber/40 focus:ring-1 focus:ring-epi-amber/20 transition-all disabled:opacity-50"
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-epi-amber to-epi-orange text-[#050A14] flex items-center justify-center hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-40 disabled:hover:shadow-none active:scale-95"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
                <button
                    className="w-10 h-10 rounded-xl border border-[rgba(245,158,11,0.12)] text-muted-foreground hover:text-epi-amber hover:border-epi-amber/30 flex items-center justify-center transition-all"
                    title="Voice input (coming soon)"
                >
                    <Mic className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// Helper functions
function extractCounty(text: string): string | undefined {
    const counties = [
        'nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'kiambu',
        'machakos', 'nyeri', 'meru', 'kakamega', 'kisii', 'garissa',
    ];
    const lower = text.toLowerCase();
    return counties.find((c) => lower.includes(c));
}

function extractDisease(text: string): string | undefined {
    const diseases = ['malaria', 'cholera', 'typhoid', 'dengue', 'tuberculosis', 'covid'];
    const lower = text.toLowerCase();
    return diseases.find((d) => lower.includes(d));
}

function getMockResponse(query: string): string {
    const lower = query.toLowerCase();
    if (lower.includes('malaria') && lower.includes('nairobi')) {
        return `📊 **Malaria Risk Assessment for Nairobi**\n\n🟡 **Current Risk: MEDIUM**\n\n**Key Indicators:**\n- Outbreak probability: 42%\n- Recent rainfall: 85mm (elevated)\n- Previous week cases: 67\n\n**Social Media Signals:**\n- 234 health mentions in 24h\n- Keywords trending: "fever", "clinic"\n\n**Recommended Actions:**\n1. 🦟 Enhance mosquito control\n2. 📊 Increase surveillance\n3. 💊 Check antimalarial stocks`;
    }
    if (lower.includes('cholera')) {
        return `⚠️ **Cholera Risk Update**\n\nWater quality concerns detected in social signals.\n\n**Actions Recommended:**\n1. 💧 Deploy water testing\n2. 📢 Issue boil-water advisory\n3. 🏥 Prepare ORS stockpiles`;
    }
    return `I understand you're asking about: "${query}"\n\nI can help with:\n• 📊 Disease risk predictions\n• 🔍 Social media early warnings\n• 📈 Trend analysis\n\nTry: "What's the malaria risk in Kisumu?"`;
}

export default ChatInterface;
