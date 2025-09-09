import React, { useState, useRef, useEffect } from 'react';
import { Message, Grievance } from '../types';
import { processUserMessage } from '../services/geminiService';
import { SendIcon, UserIcon, BotIcon, MicrophoneIcon } from './Icons';
import { INITIAL_BOT_MESSAGE } from '../constants';

// For browser compatibility with SpeechRecognition API
// Fix: Add type definitions for the Web Speech API to resolve 'Cannot find name SpeechRecognition' error.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
  
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface ChatbotProps {
    addGrievance: (grievance: Omit<Grievance, 'id' | 'status' | 'submittedAt'>) => string;
    getGrievanceStatus: (id: string) => string;
}

const Chatbot: React.FC<ChatbotProps> = ({ addGrievance, getGrievanceStatus }) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Optimized for Indian English

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const geminiResult = await processUserMessage(input, messages);
        
        let botText = geminiResult.response;

        if (geminiResult.intent === 'GRIEVANCE_FILING' && geminiResult.grievance) {
            const newTicketId = addGrievance(geminiResult.grievance);
            botText = geminiResult.response.replace('{{TICKET_ID}}', newTicketId);
        } else if (geminiResult.intent === 'STATUS_CHECK' && geminiResult.ticketId) {
            botText = getGrievanceStatus(geminiResult.ticketId);
        }

        const botMessage: Message = { id: Date.now() + 1, text: botText, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = { id: Date.now() + 1, text: "I'm sorry, I encountered an error. Please try again.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleListen = () => {
    if (isLoading || isListening || !recognitionRef.current) return;
    
    setInput(''); 
    recognitionRef.current.start();
    setIsListening(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-3xl mx-auto flex flex-col" style={{height: '70vh'}}>
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-700">Grievance Assistant</h2>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-blue-50/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && <BotIcon className="h-8 w-8 text-brand-blue-500" />}
            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-brand-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.sender === 'user' && <UserIcon className="h-8 w-8 text-gray-500" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <BotIcon className="h-8 w-8 text-brand-blue-500" />
            <div className="max-w-md p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-brand-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-brand-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-brand-blue-400 rounded-full animate-bounce"></span>
                </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Describe your issue or ask for status..."}
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue-500 transition"
            disabled={isLoading}
          />
          {recognitionRef.current && (
            <button
              onClick={handleListen}
              disabled={isLoading || isListening}
              className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
              aria-label={isListening ? "Listening..." : "Use microphone to speak"}
              title={isListening ? "Listening..." : "Use microphone to speak"}
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="p-3 bg-brand-blue-600 text-white rounded-full hover:bg-brand-blue-700 disabled:bg-brand-blue-300 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500"
            aria-label="Send message"
          >
            <SendIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;