import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, Sparkles, Brain, TrendingUp, Building, RefreshCw, Copy, ThumbsUp, ThumbsDown, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import runeAvatar from "../assets/rune-avatar.jpg";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  typing?: boolean;
  reactions?: {
    helpful?: boolean;
    unhelpful?: boolean;
  };
  suggestedActions?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActive: Date;
}

export default function ChatGPTWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession>({
    id: "default",
    title: "New Chat",
    messages: [
      {
        id: "1",
        content: "Welcome to Commertize! I'm RUNE.CTZ, your real estate investment assistant.\n\nCommertize is transforming commercial real estate by making institutional-grade investments accessible through tokenization. Our platform combines cutting-edge blockchain technology with proven real estate expertise to democratize this powerful asset class.\n\nWhat makes us different:\n• Direct access to premium commercial properties\n• Transparent, secure blockchain-based ownership\n• Lower barriers to entry for quality investments\n• Enhanced liquidity through tokenization\n\nI'm here to help you navigate real estate investment opportunities, understand tokenization, or explore how our platform can work for your goals.\n\nHow can I assist you today?",
        role: "assistant",
        timestamp: new Date(),
        suggestedActions: [
          "I want to invest",
          "I want to raise capital", 
          "Tell me more",
          "How does it work?"
        ]
      },
    ],
    lastActive: new Date()
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Rotating popup messages
  const popupMessages = [
    "I'm RUNE.CTZ 👋 Want today's CRE market highlights?",
    "Ask me about cap rates, tokenization, or new deals.",
    "Curious if you qualify to invest? I can check in seconds.",
    "Need a quick 30-second property breakdown? Just ask."
  ];

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message,
          context: currentSession.messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const assistantMessage: Message = {
        id: Date.now().toString() + "_assistant",
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
        suggestedActions: data.suggestedActions || []
      };
      
      setCurrentSession(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        lastActive: new Date()
      }));
    },
    onError: (error) => {
      setIsTyping(false);
      console.error('Send message error:', error);
      toast({
        title: "Connection Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      console.log('No message to send');
      return;
    }

    console.log('Sending message:', inputMessage);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setCurrentSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      lastActive: new Date()
    }));
    
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleSuggestedAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const handleReaction = (messageId: string, reaction: 'helpful' | 'unhelpful') => {
    setCurrentSession(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, reactions: { ...msg.reactions, [reaction]: !msg.reactions?.[reaction] } }
          : msg
      )
    }));
  };

  const startNewChat = () => {
    setCurrentSession({
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          id: "1",
          content: "Welcome back! I'm ready to help you explore Commertize's real estate investment opportunities and guide you through our tokenization platform.\n\nPowered by Commertize Intelligence – RUNE.CTZ.",
          role: "assistant",
          timestamp: new Date(),
          suggestedActions: [
            "Investor Onboarding",
            "Join Waitlist", 
            "Submit Property",
            "Run conservative scenario"
          ]
        },
      ],
      lastActive: new Date()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Smart scroll behavior: scroll to beginning of new RUNE.CTZ messages, or bottom for user messages
  useEffect(() => {
    if (currentSession.messages.length > 1) {
      const lastMessage = currentSession.messages[currentSession.messages.length - 1];
      
      setTimeout(() => {
        if (lastMessage.role === "assistant") {
          // For RUNE.CTZ messages, scroll to the beginning of the new message
          const lastMessageElement = document.querySelector(`[data-message-id="${lastMessage.id}"]`);
          if (lastMessageElement) {
            lastMessageElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else {
          // For user messages, scroll to bottom as usual
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
          }
        }
      }, 100); // Small delay to ensure DOM is updated
    }
  }, [currentSession.messages]);

  // Scroll to top when chat opens to show beginning of welcome message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 300);
    }
  }, [isOpen, isMinimized]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  // Popup message rotation effect - only when chat is closed
  useEffect(() => {
    if (isOpen) return; // Don't show popup when chat is open

    const showMessage = () => {
      setShowPopupMessage(true);
      
      // Hide after 5 seconds
      setTimeout(() => {
        setShowPopupMessage(false);
      }, 5000);
      
      // Rotate to next message
      setCurrentMessageIndex(prev => (prev + 1) % popupMessages.length);
    };

    // Show first message immediately, then every 7 seconds
    const timer = setInterval(showMessage, 7000);
    showMessage(); // Initial show

    return () => clearInterval(timer);
  }, [isOpen, popupMessages.length]);

  return (
    <>
      {/* Enhanced Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-4 right-4 sm:right-6 z-[60]"
          >
            <div className={`w-80 sm:w-96 max-w-[calc(100vw-2rem)] shadow-sm bg-white rounded-2xl ${isMinimized ? 'h-16' : 'h-[650px] max-h-[calc(100vh-6rem)]'} transition-all duration-300 overflow-hidden relative`}
                 style={{ 
                   border: '6px solid #d4a017',
                   boxShadow: '0 0 8px rgba(212, 160, 23, 0.4)',
                   background: 'linear-gradient(135deg, rgba(212, 160, 23, 0.08) 0%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 1) 85%, rgba(212, 160, 23, 0.08) 100%)'
                 }}>
              {/* Moving pulse around RUNE.CTZ popup border */}
              <div className="moving-pulse absolute w-3 h-3 bg-[#d4a017] rounded-full z-50 pointer-events-none" 
                   style={{ 
                     filter: 'drop-shadow(0 0 2px #d4a017)', 
                     boxShadow: '0 0 2px #d4a017'
                   }} />
              {/* Header with RUNE.CTZ Profile Picture */}
              <div className="flex flex-row items-center justify-between p-3 bg-gradient-to-r from-white to-gray-100 text-[#be8d00] rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -2, 0], scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="w-12 h-12 rounded-full relative">
                      <img 
                        src={runeAvatar} 
                        alt="RUNE.CTZ" 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load, using fallback');
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full bg-[#be8d00]/20 rounded-full flex items-center justify-center backdrop-blur-sm hidden">
                        <Brain className="w-4 h-4 text-[#be8d00]" />
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-sm"
                    />
                  </motion.div>
                  <div>
                    <span className="font-sans font-light text-base text-black">RUNE.CTZ</span>
                    <div className="text-xs font-sans font-light text-black">AI Real Estate Assistant</div>
                  </div>
                </div>
                
                {/* Only Close Button at Top */}
                <div 
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer h-8 w-8 bg-[#be8d00] text-white hover:bg-[#a67c00] rounded-lg flex items-center justify-center shadow-sm"
                >
                  <X className="h-4 w-4" />
                </div>
              </div>
              
              {!isMinimized && (
                <div className="flex flex-col" style={{ height: 'calc(100% - 70px)' }}>
                  {/* Messages Container */}
                  <div className="p-4 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-lg overflow-y-auto messages-container gold-scrollbar" style={{ height: '380px' }}>
                    <div className="space-y-4">
                      {currentSession.messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          data-message-id={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}>
                            <div
                              className={`rounded-2xl p-4 text-sm leading-relaxed relative ${
                                message.role === "user"
                                  ? "bg-gradient-to-br from-[#be8d00] to-[#d4a017] text-white ml-4 sm:ml-8 shadow-sm border-2 border-[#be8d00]"
                                  : "bg-white border-2 border-[#be8d00] shadow-sm mr-4 sm:mr-8 text-black"
                              }`}
                            >

                              <div className={`whitespace-pre-wrap font-sans ${
                                message.role === "user" ? "font-light text-white" : "font-light text-black"
                              }`}>{message.content}</div>
                              
                              {/* Message timestamp */}
                              <div className={`text-xs mt-3 font-sans font-light ${
                                message.role === "user" ? "text-white/80" : "text-black/80"
                              }`}>
                                {message.role === "assistant" ? "RUNE.CTZ • " : ""}
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>

                            {/* Assistant message actions */}
                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2 mt-2 px-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyMessage(message.content)}
                                  className="h-6 text-xs text-gray-500 hover:text-gray-700"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReaction(message.id, 'helpful')}
                                  className={`h-6 text-xs ${
                                    message.reactions?.helpful ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReaction(message.id, 'unhelpful')}
                                  className={`h-6 text-xs ${
                                    message.reactions?.unhelpful ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                  }`}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}

                            {/* Suggested actions */}
                            {message.role === "assistant" && message.suggestedActions && message.suggestedActions.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.suggestedActions.map((action, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-yellow-50 border-yellow-300 text-yellow-700 font-logo text-xs"
                                    onClick={() => handleSuggestedAction(action)}
                                  >
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Typing indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-4 mr-8 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                              <span className="text-xs text-gray-500 ml-2 font-sans font-light">RUNE.CTZ is thinking...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  
                  {/* Input Controls Section */}
                  <div className="border-t border-[#be8d00]/30 bg-white flex-shrink-0 p-3 mt-2">
                    <div className="flex gap-2 items-start">
                      {/* Text Input */}
                      <div className="flex-1">
                        <textarea
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Curious about tokenization? Start typing…"
                          disabled={sendMessageMutation.isPending}
                          rows={2}
                          className="w-full min-h-[48px] max-h-[120px] border-2 border-[#d4a017] focus:border-[#be8d00] focus:ring-1 focus:ring-[#be8d00]/20 bg-white text-sm sm:text-base font-logo font-light rounded-lg px-3 py-2 transition-all duration-200 text-black placeholder:text-black placeholder:font-logo placeholder:font-light shadow-sm resize-none"
                        />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* Send Button */}
                        <div
                          onClick={() => {
                            console.log('Send button clicked, input:', inputMessage);
                            if (inputMessage.trim() && !sendMessageMutation.isPending) {
                              handleSendMessage();
                            }
                          }}
                          className="cursor-pointer bg-[#be8d00] hover:bg-[#a67c00] text-white px-2 py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all duration-200 hover:scale-105 font-sans font-light min-w-[45px]"
                        >
                          {sendMessageMutation.isPending ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </motion.div>
                              <span className="text-sm">Send</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span className="text-sm">Send</span>
                            </>
                          )}
                        </div>
                        
                        {/* Refresh Chat Button */}
                        <div 
                          onClick={startNewChat}
                          className="cursor-pointer bg-[#be8d00] hover:bg-[#a67c00] text-white px-2 py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all duration-200 hover:scale-105 font-sans font-light min-w-[45px]"
                          title="New Chat"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="text-sm">New</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Powered By Footer Section - Separate */}
                  <div className="bg-gradient-to-r from-white to-gray-100 border-t border-[#be8d00]/20 p-3 flex-shrink-0 rounded-b-2xl">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-[#be8d00] rounded-full animate-pulse shadow-sm"></div>
                      <span className="font-sans font-bold text-[#be8d00]">Powered by Commertize Intelligence™</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Toggle Button - Matches opened chatbox avatar exactly */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:right-6 z-[60] transition-all duration-300 flex items-center justify-center group hover:scale-110 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -2, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Exact match to opened chatbox avatar styling */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#d4a017] via-[#be8d00] to-[#d4a017] p-1 border-2 border-[#d4a017] shadow-sm relative">
              <div className="w-full h-full rounded-full bg-white p-0.5 relative">
                <img 
                  src={runeAvatar} 
                  alt="RUNE.CTZ" 
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    console.log('Image failed to load, using fallback');
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-full h-full bg-[#be8d00]/20 rounded-full flex items-center justify-center backdrop-blur-sm hidden">
                  <Brain className="w-4 h-4 text-[#be8d00]" />
                </div>
              </div>
              {/* Enhanced gold ring effect - reduced glow */}
              <div className="absolute inset-0 rounded-full border-2 border-[#d4a017] shadow-sm ring-1 ring-[#be8d00] ring-opacity-50"></div>
            </div>
            
            {/* Status indicator */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-sm"
            />
          </motion.div>
          
          {/* Rotating popup messages */}
          <AnimatePresence>
            {showPopupMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute -top-16 -left-40 bg-white border-2 border-[#be8d00] text-black text-sm px-3 py-2 rounded-lg shadow-sm pointer-events-none max-w-[240px] z-[70] font-sans font-light leading-relaxed"
                style={{ lineHeight: 1.3 }}
              >
                {popupMessages[currentMessageIndex]}
                <div className="absolute top-full right-6">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#be8d00]"></div>
                  <div className="absolute -top-[4px] left-[1px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-white"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </>
  );
}