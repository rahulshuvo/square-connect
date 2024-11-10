/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import socket from '@/socket'

export default function ChessGameChat({ room }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const chatRef = useRef(null)

  useEffect(() => {
    const chatContainer = chatRef.current
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      socket.emit('message', {
        text: inputMessage,
        room,
      })
      setMessages([...messages, { text: inputMessage, sender: 'You' }])
      setInputMessage('')
    }
  }

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages([...messages, { text: data.text, sender: 'Opponent' }])
    })
  }, [messages])

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Chat</h2>
        <ScrollArea
          className="h-[300px] w-full rounded-md border p-4"
          ref={chatRef}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${
                message.sender === 'You' ? 'text-right' : 'text-left'
              }`}
            >
              <span className="font-semibold">{message.sender}: </span>
              {message.text}
            </div>
          ))}
        </ScrollArea>
        <div className="flex mt-4">
          <Input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow"
          />
          <Button onClick={sendMessage} className="ml-2">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
