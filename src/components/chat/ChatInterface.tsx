import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Bot, User, Loader2, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export function ChatInterface({ className }: ChatInterfaceProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 Hello! I'm EpiBot, your AI assistant for disease surveillance in Kenya. I can help you with:\n\n• 📊 Outbreak risk predictions\n• 🔍 Social media early warning signals\n• 📈 Disease trend analysis\n\nWhat would you like to know?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCounty, setSelectedCounty] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
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
                    history: messages.slice(-5).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
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
        } catch (error) {
            // Fallback mock response
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

    // Quick action buttons
    const QuickActions = () => (
        <div className="flex flex-wrap gap-2 mb-3">
            {['Nairobi malaria risk', 'Kisumu cholera trends', 'National alerts'].map((action) => (
                <Badge
                    key={action}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => {
                        setInput(action);
                    }}
                >
                    {action}
                </Badge>
            ))}
        </div>
    );

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className={cn(
                    'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50',
                    'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
                    className
                )}
            >
                <MessageSquare className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card
            className={cn(
                'fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50',
                'flex flex-col animate-in slide-in-from-bottom-5 duration-300',
                className
            )}
        >
            {/* Header */}
            <CardHeader className="pb-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6" />
                        <div>
                            <CardTitle className="text-lg">EpiBot</CardTitle>
                            <p className="text-xs opacity-80">AI Disease Surveillance Assistant</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="text-primary-foreground hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'mb-4 flex',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={cn(
                                    'max-w-[85%] rounded-lg p-3',
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    {message.role === 'assistant' && (
                                        <Bot className="h-5 w-5 mt-0.5 shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        {message.sources && message.sources.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {message.sources.map((source, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {source}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {message.role === 'user' && (
                                        <User className="h-5 w-5 mt-0.5 shrink-0" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Analyzing...</span>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t">
                <QuickActions />
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about disease risks..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                    <Button variant="outline" size="icon" title="Voice input (coming soon)">
                        <Mic className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// Helper functions
function extractCounty(text: string): string | undefined {
    const counties = [
        'nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'kiambu',
        'machakos', 'nyeri', 'meru', 'kakamega', 'kisii', 'garissa'
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
        return `📊 **Malaria Risk Assessment for Nairobi**

🟡 **Current Risk: MEDIUM**

**Key Indicators:**
- Outbreak probability: 42%
- Recent rainfall: 85mm (elevated)
- Previous week cases: 67

**Social Media Signals:**
- 234 health mentions in 24h
- Keywords trending: "fever", "clinic"

**Recommended Actions:**
1. 🦟 Enhance mosquito control
2. 📊 Increase surveillance
3. 💊 Check antimalarial stocks`;
    }

    if (lower.includes('cholera')) {
        return `⚠️ **Cholera Risk Update**

Water quality concerns detected in social signals.

**Actions Recommended:**
1. 💧 Deploy water testing
2. 📢 Issue boil-water advisory
3. 🏥 Prepare ORS stockpiles`;
    }

    return `I understand you're asking about: "${query}"

I can help with:
• 📊 Disease risk predictions
• 🔍 Social media early warnings  
• 📈 Trend analysis

Try: "What's the malaria risk in Kisumu?"`;
}

export default ChatInterface;
