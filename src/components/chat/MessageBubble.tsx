import React from 'react';
import { Message } from '../../types/chat';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <CheckCheck className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
};