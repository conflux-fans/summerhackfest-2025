import React, { useState, useRef, useEffect } from 'react';
import AIService from '../services/aiService';

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant for the Treasury DAO. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await AIService.chatWithAI(inputMessage, {
        currentPage: 'Treasury DAO',
        features: ['Investment Analysis', 'Proposal Scoring', 'Market Insights']
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000); // Simulate typing delay
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How do I create a proposal?",
    "What is the voting process?",
    "How do I join a club?",
    "What are the risks?",
    "How does AI analysis work?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="card shadow">
      <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
        <h6 className="m-0 font-weight-bold text-primary">
          <i className="fas fa-robot mr-2"></i>
          AI Chat Assistant
        </h6>
        <span className="badge badge-success">Online</span>
      </div>
      <div className="card-body p-0">
        {/* Chat Messages */}
        <div 
          className="chat-messages p-3" 
          style={{ 
            height: '400px', 
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`message-bubble p-3 rounded ${
                  message.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white border'
                }`}
                style={{ maxWidth: '80%' }}
              >
                <div className="d-flex align-items-start">
                  {message.sender === 'ai' && (
                    <i className="fas fa-robot text-primary mr-2 mt-1"></i>
                  )}
                  <div>
                    <div className="message-text">{message.text}</div>
                    <small className={`text-muted ${message.sender === 'user' ? 'text-white-50' : ''}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-3 d-flex justify-content-start">
              <div className="message-bubble p-3 rounded bg-white border">
                <div className="d-flex align-items-center">
                  <i className="fas fa-robot text-primary mr-2"></i>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="p-3 border-top">
          <small className="text-muted mb-2 d-block">Quick questions:</small>
          <div className="d-flex flex-wrap gap-1">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="btn btn-outline-primary btn-sm mr-1 mb-1"
                onClick={() => handleQuickQuestion(question)}
                style={{ fontSize: '0.75rem' }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 border-top">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Ask me anything about the Treasury DAO..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                type="button"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .message-bubble {
          word-wrap: break-word;
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #007bff;
          border-radius: 50%;
          display: inline-block;
          margin-right: 4px;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .chat-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default AIChatAssistant;
