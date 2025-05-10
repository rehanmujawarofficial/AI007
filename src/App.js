import React, { useState, useEffect } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#121212' : '#ffffff';
  }, [darkMode]);

  const handleMessageSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsThinking(true);

    // Add placeholder with 'typing' class
    setMessages(prev => [
      ...prev,
      { text: 'Thinking...', sender: 'bot', isPlaceholder: true, className: 'typing' }
    ]);

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ];

    const generationConfig = {
      stopSequences: ["red"],
      maxOutputTokens: 200,
      temperature: 0.9,
      topP: 0.1,
      topK: 16,
    };

    try {
      const ai = new GoogleGenAI({ apiKey: "AIzaSyDJqEloVuHtoQtom7reentd4m3NkVrPO0k" }); // Replace with your actual API key

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: input,
        safetySettings,
        generationConfig,
      });

      const botMessage = { text: response.text, sender: 'bot' };
      setMessages(prev => {
        const updated = [...prev];
        const index = updated.findIndex(msg => msg.isPlaceholder);
        if (index !== -1) updated[index] = botMessage;
        return updated;
      });

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className={`chat-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="theme-toggle">
        <button
          className={`theme-switch ${darkMode ? 'dark' : 'light'}`}
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Theme"
        >
          <span className="icon">{darkMode ? '🌙' : '☀️'}</span>
        </button>
      </div>

      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender} ${message.className || ''}`}>
            {message.sender === 'bot' ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isThinking) {
              handleMessageSend();
            }
          }}
          disabled={isThinking}
        />
        <button onClick={handleMessageSend} disabled={isThinking}>
          {isThinking ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
