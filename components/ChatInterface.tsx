import React, { useState, useRef, useEffect } from 'react';
import { Sender, ChatMessage, ProcessingStatus, Territory } from '../types';
import { sendMessageToAgent, initializeGemini } from '../services/geminiService';
import { QuoteCard } from './QuoteCard';
import { marked } from 'marked';

// Add type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatInterfaceProps {
    territory?: Territory;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ territory }) => {
  // Initialize with a welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: Sender.BOT,
      text: "Welcome to the APRA AMCOS Production Music Assistant.\n\nI can assist you in estimating licensing costs using the 2025 Rate Cards for Australia and New Zealand.\n\nTo ensure I reference the correct rate card, please select the territory in which your production is being created and provide a brief description of your project (e.g., “I need a quote for 2 x 30s TVCs for Free-to-Air and Pay TV, National broadcast”).",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize API key from env
    if (process.env.API_KEY) {
        initializeGemini(process.env.API_KEY);
    } else {
        console.error("API Key missing");
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || status === ProcessingStatus.THINKING) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setStatus(ProcessingStatus.THINKING);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.sender === Sender.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Call Agent with territory context
      const response = await sendMessageToAgent(history, userText, territory);

      // Add Bot Message
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.BOT,
        text: response.text,
        quote: response.quote,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setStatus(ProcessingStatus.IDLE);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.BOT,
        text: "I'm having trouble connecting to the rate database. Please check your internet connection or try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    // Optimize for local accent
    recognition.lang = territory === 'New Zealand' ? 'en-NZ' : 'en-AU';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Capture current input to append to it
    const currentInput = inputValue;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      // Smart spacing: add space if input wasn't empty and didn't end in space
      const prefix = currentInput && !currentInput.endsWith(' ') ? `${currentInput} ` : currentInput;
      setInputValue(prefix + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Helper to render markdown safely
  const renderMarkdown = (text: string) => {
    return { __html: marked(text) };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-white sm:rounded-xl sm:shadow-lg sm:my-6 overflow-hidden border border-gray-200">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 relative">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] sm:max-w-[80%] ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs shadow-sm
                ${msg.sender === Sender.USER 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-yellow-400 text-gray-900'}`}>
                {msg.sender === Sender.USER ? <i className="fa-solid fa-user"></i> : <i className="fa-solid fa-robot"></i>}
              </div>

              {/* Bubble Content */}
              <div className="flex flex-col gap-2 w-full">
                <div 
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.sender === Sender.USER 
                        ? 'bg-gray-900 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}
                >
                    <div 
                        className={`markdown prose prose-sm max-w-none ${msg.sender === Sender.USER ? 'prose-invert' : ''}`}
                        dangerouslySetInnerHTML={renderMarkdown(msg.text)} 
                    />
                </div>
                
                {/* Render Quote Card if available */}
                {msg.quote && (
                    <QuoteCard quote={msg.quote} />
                )}
                
                <span className={`text-[10px] text-gray-400 ${msg.sender === Sender.USER ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {status === ProcessingStatus.THINKING && (
           <div className="flex w-full justify-start">
             <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center text-xs shadow-sm">
                 <i className="fa-solid fa-robot"></i>
               </div>
               <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form 
            onSubmit={handleSendMessage}
            className="relative"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={territory ? `Ask about ${territory} rates (e.g. "30s TV ad")` : "Describe your project (e.g. '30s TV ad in Melbourne')..."}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-4 pr-28 shadow-sm transition-all outline-none"
            disabled={status === ProcessingStatus.THINKING}
          />
          
          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
             {/* Mic Button */}
             <button
                type="button"
                onClick={handleVoiceInput}
                className={`w-10 h-10 rounded-md transition-all flex items-center justify-center ${
                    isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-md' 
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Voice Input"
             >
                <i className={`fa-solid ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
             </button>

             {/* Send Button */}
             <button 
                type="submit"
                disabled={!inputValue.trim() || status === ProcessingStatus.THINKING}
                className="w-10 h-10 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
             >
                {status === ProcessingStatus.THINKING ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                    <i className="fa-solid fa-paper-plane"></i>
                )}
             </button>
          </div>
        </form>
        <div className="text-center mt-2 flex justify-center items-center gap-2">
             <p className="text-[10px] text-gray-400">
                AI Agent (2025 Rates). {territory ? `Using ${territory} rates.` : 'Auto-detecting territory.'}
            </p>
        </div>
      </div>
    </div>
  );
};