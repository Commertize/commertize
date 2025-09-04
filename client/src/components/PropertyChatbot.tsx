import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Building2, TrendingUp, Calculator, BarChart3, Zap, RefreshCw, Copy, ThumbsUp, ThumbsDown, Brain, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
// CommertizerX avatar as data URL
const commertizerXAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

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

interface PropertyChatbotProps {
  properties?: any[];
  selectedProperty?: any;
}

export default function PropertyChatbot({ properties, selectedProperty }: PropertyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm CommertizerX, your specialized property investment analysis assistant.\n\nI focus exclusively on helping you navigate commercial real estate investment opportunities through our tokenized marketplace. I can help you:\n\n• Analyze investment opportunities & due diligence\n• Compare property returns, risks & performance metrics\n• Explain tokenization benefits & fractional ownership\n• Calculate potential ROI, IRR, NPV & cash flows\n• Provide market insights & location analysis\n• Portfolio optimization & diversification strategies\n\nWhat property investment question can I help you with?",
      role: "assistant",
      timestamp: new Date(),
      suggestedActions: [
        "Compare all properties",
        "Calculate investment returns",
        "Explain tokenization benefits",
        "Analyze property risks"
      ]
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  // Smart scroll behavior: scroll to beginning of new CommertizerX messages, or bottom for user messages
  useEffect(() => {
    if (messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      
      setTimeout(() => {
        if (lastMessage.role === "assistant") {
          // For CommertizerX messages, scroll to the beginning of the new message
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
  }, [messages]);

  // Scroll to top when chat opens to show beginning of welcome message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        const messagesContainer = document.querySelector('.property-messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Try to fetch marketplace properties, but continue even if it fails
      let allMarketplaceProperties = [];
      try {
        const propertiesResponse = await fetch('/api/marketplace-properties', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          if (propertiesData.success && propertiesData.properties) {
            allMarketplaceProperties = propertiesData.properties;
            console.log(`CommertizerX loaded ${allMarketplaceProperties.length} properties for analysis`);
          }
        } else {
          console.log('Properties API returned error:', propertiesResponse.status);
        }
      } catch (error) {
        console.log('Could not fetch marketplace properties, continuing without them:', error);
        // Chat will work without marketplace data
      }

      // Include property context if available
      const context = selectedProperty ? 
        `Currently viewing: ${selectedProperty.name}. User can ask about comparisons with other properties.` : 
        `Marketplace with ${allMarketplaceProperties.length} properties available`;

      // Comprehensive property data for dynamic analysis
      const propertyData = {
        // Current property being viewed (if any)
        currentProperty: selectedProperty ? {
          ...selectedProperty,
          // Financial metrics for calculations
          propertyValue: selectedProperty.propertyValue || selectedProperty.value,
          netOperatingIncome: selectedProperty.netOperatingIncome || selectedProperty.noi,
          capRate: selectedProperty.capRate,
          rentalYield: selectedProperty.rentalYield,
          occupancyRate: selectedProperty.occupancyRate,
          squareFeet: selectedProperty.squareFeet,
          pricePerSquareFoot: selectedProperty.pricePerSquareFoot,
          // Investment metrics
          tokenPrice: selectedProperty.tokenPrice,
          totalTokens: selectedProperty.totalTokens,
          minimumInvestment: selectedProperty.minimumInvestment,
          targetEquity: selectedProperty.targetEquity,
          // Location and market data
          location: selectedProperty.location,
          city: selectedProperty.city,
          state: selectedProperty.state,
          propertyType: selectedProperty.propertyType,
          propertyClass: selectedProperty.propertyClass,
          // Additional analytics
          marketGrowthRate: selectedProperty.marketGrowthRate,
          appreciationRate: selectedProperty.appreciationRate,
          dqiScore: selectedProperty.dqiScore
        } : null,
        // Simplified marketplace properties to prevent timeouts
        allMarketplaceProperties: allMarketplaceProperties.slice(0, 10).map(p => ({
          id: p.id,
          name: p.name,
          propertyValue: p.propertyValue || p.value || 0,
          netOperatingIncome: p.netOperatingIncome || p.noi || 0,
          capRate: p.capRate || 0,
          targetIRR: p.targetIRR || 0,
          targetCashYield: p.targetCashYield || 0,
          propertyType: p.propertyType,
          location: p.location
        })),
        marketplaceSummary: {
          totalProperties: allMarketplaceProperties.length,
          averagePropertyValue: allMarketplaceProperties.length > 0 ? 
            allMarketplaceProperties.reduce((sum, p) => sum + (p.propertyValue || p.value || 0), 0) / allMarketplaceProperties.length : 0,
          propertyTypes: [...new Set(allMarketplaceProperties.map(p => p.propertyType).filter(Boolean))]
        }
      };

      const response = await fetch("/api/property-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message, 
          context,
          propertyData 
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
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      setIsTyping(false);
      console.error('Send message error:', error);
      
      // Provide comprehensive fallback response with investment insights
      const fallbackResponse = `Property Investment Analysis:

Key Investment Metrics:
• Risk-Adjusted Returns: Commercial real estate historically provides 8-12% annual returns with inflation hedge benefits
• Portfolio Diversification: Real estate correlation with stocks is typically 0.2-0.4, offering excellent diversification
• Tokenization Advantages: Fractional ownership reduces barriers, enables $5K minimum vs. traditional $500K+ requirements

Market Position Analysis:
• Liquidity Enhancement: Blockchain tokenization provides secondary market trading vs. traditional 5-10 year hold periods
• Transparency Benefits: Smart contracts ensure automated distributions and real-time performance tracking
• Professional Management: Institutional-grade property management with technology-driven efficiency

Investment Considerations:
• Income Stability: Commercial leases provide predictable cash flows with built-in rent escalations
• Tax Efficiency: Real estate offers depreciation benefits and potential 1031 exchange advantages
• Inflation Protection: Property values and rents typically increase with inflation, preserving purchasing power

This tokenized approach democratizes access to institutional-quality commercial real estate previously reserved for large investors.`;

      const fallbackMessage: Message = {
        id: Date.now().toString() + "_fallback",
        content: fallbackResponse,
        role: "assistant",
        timestamp: new Date(),
        suggestedActions: [
          "View property details",
          "Calculate investment returns", 
          "Explore tokenization benefits"
        ]
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
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

    setMessages(prev => [...prev, userMessage]);
    
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
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: { ...msg.reactions, [reaction]: !msg.reactions?.[reaction] } }
        : msg
    ));
  };

  const startNewChat = () => {
    setMessages([
      {
        id: "1",
        content: "Welcome back! I'm ready to help you analyze property investment opportunities and guide you through our tokenized marketplace.\n\nPowered by Commertize Intelligence – CommertizerX.",
        role: "assistant",
        timestamp: new Date(),
        suggestedActions: [
          "Compare all properties",
          "Calculate investment returns", 
          "Analyze property risks",
          "Explain tokenization benefits"
        ]
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="commertizer-x-toggle-gold fixed bottom-6 right-6 z-[70] w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center group hover:scale-110 cursor-pointer bg-gradient-to-r from-[#be8d00] to-[#d4a017] p-1"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1.0 }}
        style={{ marginBottom: '20px' }}
      >
        <img 
          src="/assets/commertizer-x-avatar.png?v=1756762864425" 
          alt="CommertizerX" 
          className="w-full h-full rounded-full object-cover object-top group-hover:scale-110 transition-transform duration-200"
          style={{ objectPosition: 'center 8%', transform: 'scale(1.4)' }}
          onError={(e) => {
            console.log('CommertizerX button image failed to load, using fallback');
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <Building2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200 hidden" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-[70] property-chatbot"
    >
      <div className={`commertizer-x-gold-border w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl ${isMinimized ? 'h-16' : 'h-[650px] max-h-[calc(100vh-6rem)]'} transition-all duration-300 overflow-hidden relative`}>
        {/* Moving pulse around CommertizerX popup border */}
        <div className="moving-pulse absolute w-3 h-3 bg-[#d4a017] rounded-full z-50 pointer-events-none" 
             style={{ 
               filter: 'drop-shadow(0 0 2px #d4a017)', 
               boxShadow: '0 0 10px #d4a017, 0 0 20px #d4a017'
             }} />
        {/* Header with CommertizerX Profile Picture */}
        <div className="flex flex-row items-center justify-between p-3 bg-gradient-to-r from-white to-gray-100 text-[#be8d00] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, -2, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-full relative">
                <img 
                  src="/assets/commertizer-x-avatar.png?v=1756762864425" 
                  alt="CommertizerX" 
                  className="w-full h-full rounded-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                  onError={(e) => {
                    console.log('CommertizerX image failed to load, using fallback');
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-full h-full bg-[#be8d00]/20 rounded-full flex items-center justify-center backdrop-blur-sm hidden">
                  <Building2 className="w-4 h-4 text-[#be8d00]" />
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-sm"
              />
            </motion.div>
            <div>
              <span className="font-sans font-light text-base text-black">CommertizerX</span>
              <div className="text-xs font-sans font-light text-black">AI Property Investment Assistant</div>
            </div>
          </div>
          
          {/* Only Close Button at Top */}
          <div 
            onClick={() => setIsOpen(false)}
            className="cursor-pointer h-8 w-8 bg-[#be8d00] text-white hover:bg-[#a67c00] rounded-lg flex items-center justify-center shadow-md"
          >
            <X className="h-4 w-4" />
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col" style={{ height: 'calc(100% - 70px)' }}>
            {/* Messages Container */}
            <div className="p-4 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-lg overflow-y-auto property-messages-container gold-scrollbar" style={{ height: '380px' }}>
              <div className="space-y-4">
                {messages.map((message, index) => (
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
                          {message.role === "assistant" ? "CommertizerX • " : ""}
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
                        <span className="text-xs text-gray-500 ml-2 font-sans font-light">CommertizerX is thinking...</span>
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
                    placeholder="Ask about this property's yield, valuation, or tokenization…"
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
  );
}