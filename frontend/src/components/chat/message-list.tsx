"use client";

import { Message } from "./message";
import { useEffect, useRef } from "react";

export interface Action {
  type: string;
  data: Record<string, any>;
}

export interface Step {
  id: string;
  title?: string;
  content: string;
  status?: 'running' | 'completed' | 'failed';
  actions?: Action[];
  integration_uuid?: string;
  animationDelay?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  steps?: Step[];
  isLoading?: boolean;
}

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-scroll py-4 space-y-4 scrollbar-hide"
      style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* Internet Explorer 10+ */
      }}
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 