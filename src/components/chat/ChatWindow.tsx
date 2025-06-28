import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Message, ChatUser } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, User } from 'lucide-react';

interface ChatWindowProps {
  selectedUser: ChatUser | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onBack: () => void;
  typingUsers: Set<string>;
  isConnected: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedUser,
  messages,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onBack,
  typingUsers,
  isConnected
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Start a conversation
          </h3>
          <p className="text-gray-500">
            Select a user from the sidebar to begin chatting
          </p>
        </div>
      </div>
    );
  }

  const isTyping = selectedUser && typingUsers.has(selectedUser.id);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Say hello to {selectedUser.name}
              </h3>
              <p className="text-gray-500">
                This is the beginning of your conversation
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
              />
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={!isConnected}
      />
    </div>
  );
};