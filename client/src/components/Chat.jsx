/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import socket from '@/socket';
import './Chat.scss';

export default function ChessGameChat({ room }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    const chatContainer = chatRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      socket.emit('message', {
        text: inputMessage,
        room,
      });
      setMessages([...messages, { text: inputMessage, sender: 'You' }]);
      setInputMessage('');
    }
  };

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prevMessages) => [...prevMessages, { text: data.text, sender: 'Opponent' }]);
    };

    socket.on('message', handleMessage);

    return () => socket.off('message', handleMessage);
  }, []);

  return (
    <Card className="chat-card">
      <CardContent className="chat-content">
        <h2 className="chat-title">Chat</h2>
        <ScrollArea className="chat-scroll" ref={chatRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.sender === 'You' ? 'chat-message-right' : 'chat-message-left'
              }`}
            >
              <span className="chat-sender">{message.sender}: </span>
              {message.text}
            </div>
          ))}
        </ScrollArea>
        <div className="chat-input-container">
          <Input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="chat-input"
          />
          <Button onClick={sendMessage} className="chat-send-button">
            <Send className="chat-send-icon" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
