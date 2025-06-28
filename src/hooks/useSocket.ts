import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types/chat';

const SERVER_URL = 'http://localhost:3001';

export const useSocket = () => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (token && user) {
      // Initialize socket connection
      socketRef.current = io(SERVER_URL, {
        auth: {
          token
        }
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('previous_messages', (previousMessages: Message[]) => {
        setMessages(previousMessages);
      });

      socket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('user_typing', ({ userId }: { userId: string }) => {
        setTypingUsers(prev => new Set([...prev, userId]));
      });

      socket.on('user_stopped_typing', ({ userId }: { userId: string }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, user]);

  const joinConversation = (otherUserId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { otherUserId });
      setMessages([]); // Clear previous messages
    }
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (socketRef.current && content.trim()) {
      socketRef.current.emit('send_message', {
        receiverId,
        content: content.trim()
      });
    }
  };

  const startTyping = (receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('typing_start', { receiverId });
    }
  };

  const stopTyping = (receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('typing_stop', { receiverId });
    }
  };

  return {
    isConnected,
    messages,
    typingUsers,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping
  };
};