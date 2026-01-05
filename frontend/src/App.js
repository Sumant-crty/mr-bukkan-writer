import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BookOpen, User, Copy, Download, FileText, BookMarked } from 'lucide-react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm Mr Bukkan, your personal Article & Story Writer. ✍️\n\nI can help you create:\n📰 Articles - Professional content on any topic\n📖 Stories - Creative narratives and fiction\n\nJust tell me what you'd like me to write about!", 
      sender: 'bot',
      type: 'welcome',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [input, setInput] = useState('');
  const [contentType, setContentType] = useState('article');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Content copied to clipboard!');
  };

  const downloadAsText = (text, filename) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateContent = async (topic, type) => {
    try {
      const response = await fetch(`${API_URL}/api/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, type }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return data.content;
      } else {
        return `Error: ${data.error}\n${data.details || ''}`;
      }
    } catch (error) {
      console.error("Error generating content:", error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  };

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = {
        id: messages.length + 1,
        text: input,
        sender: 'user',
        type: contentType,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, userMessage]);
      const topic = input;
      const type = contentType;
      setInput('');
      setIsLoading(true);
      
      const content = await generateContent(topic, type);
      
      const botMessage = {
        id: messages.length + 2,
        text: content,
        sender: 'bot',
        type: type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-icon">
            <BookOpen className="icon-book" />
          </div>
          <div>
            <h1 className="header-title">'Mr Bukkan' - Your Article & Story Writer</h1>
            <p className="header-subtitle">
              {isLoading ? 'Writing your content...' : 'Professional content creation at your service'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
          >
            <div className={`avatar ${message.sender === 'bot' ? 'avatar-bot' : 'avatar-user'}`}>
              {message.sender === 'bot' ? (
                <BookOpen className="avatar-icon" />
              ) : (
                <User className="avatar-icon" />
              )}
            </div>
            <div className="message-content-wrapper">
              <div className={`message-bubble ${message.sender === 'bot' ? 'bubble-bot' : 'bubble-user'}`}>
                {message.type && message.type !== 'welcome' && message.sender === 'user' && (
                  <div className="content-type-badge">
                    {message.type === 'article' ? (
                      <FileText className="badge-icon" />
                    ) : (
                      <BookMarked className="badge-icon" />
                    )}
                    <span className="badge-text">
                      {message.type === 'article' ? 'Article Request' : 'Story Request'}
                    </span>
                  </div>
                )}
                <p className="message-text">{message.text}</p>
                {message.sender === 'bot' && message.type && message.type !== 'welcome' && (
                  <div className="action-buttons">
                    <button onClick={() => copyToClipboard(message.text)} className="action-btn copy-btn">
                      <Copy className="btn-icon" />
                      <span>Copy</span>
                    </button>
                    <button onClick={() => downloadAsText(message.text, `mr-bukkan-${message.type}-${message.id}.txt`)} className="action-btn download-btn">
                      <Download className="btn-icon" />
                      <span>Download</span>
                    </button>
                    <div className="flex-spacer"></div>
                    <span className="word-count">
                      {message.text.split(' ').length} words
                    </span>
                  </div>
                )}
              </div>
              <p className="message-time">{message.time}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message message-bot">
            <div className="avatar avatar-bot">
              <BookOpen className="avatar-icon" />
            </div>
            <div className="message-content-wrapper">
              <div className="message-bubble bubble-bot">
                <div className="loading-indicator">
                  <Loader2 className="loading-spinner" />
                  <span className="loading-text">
                    {contentType === 'article' ? 'Crafting your article...' : 'Writing your story...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="content-type-selector">
          <button
            onClick={() => setContentType('article')}
            className={`type-btn ${contentType === 'article' ? 'type-btn-active-article' : 'type-btn-inactive'}`}
          >
            <FileText className="type-icon" />
            <span>Article</span>
          </button>
          <button
            onClick={() => setContentType('story')}
            className={`type-btn ${contentType === 'story' ? 'type-btn-active-story' : 'type-btn-inactive'}`}
          >
            <BookMarked className="type-icon" />
            <span>Story</span>
          </button>
        </div>

        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={contentType === 'article' ? 'Enter article topic (e.g., "Benefits of AI in Healthcare")' : 'Enter story topic (e.g., "A journey through time")'}
            disabled={isLoading}
            className="input-field"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            {isLoading ? (
              <Loader2 className="button-icon spinner" />
            ) : (
              <Send className="button-icon" />
            )}
          </button>
        </div>
        
        <div className="footer">
          <span className="footer-text">©2026 Mr Bukkan</span>
          <span className="footer-separator">•</span>
          <span className="footer-text">📧 bukkan1309@gmail.com</span>
          <span className="footer-separator">•</span>
          <div className="content-counter">
            <span className="counter-label">✍️ Content created:</span>
            <div className="counter-badge">
              <span className="counter-count">{messages.filter(m => m.sender === 'user').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
