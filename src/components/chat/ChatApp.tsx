import React, { useState, useEffect } from 'react';
import { UserList } from './UserList';
import { ChatWindow } from './ChatWindow';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';
import { ChatUser } from '../../types/chat';
import { LogOut, MessageCircle, Menu, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

export const ChatApp: React.FC = () => {
  const { user, token, logout } = useAuth();
  const {
    isConnected,
    messages,
    typingUsers,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping
  } = useSocket();

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (chatUser: ChatUser) => {
    setSelectedUser(chatUser);
    joinConversation(chatUser.id);
    setSidebarOpen(false);
  };

  const handleSendMessage = (content: string) => {
    if (selectedUser) {
      sendMessage(selectedUser.id, content);
    }
  };

  const handleTypingStart = () => {
    if (selectedUser) {
      startTyping(selectedUser.id);
    }
  };

  const handleTypingStop = () => {
    if (selectedUser) {
      stopTyping(selectedUser.id);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setSidebarOpen(true);
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static fixed inset-y-0 left-0 z-50
        w-80 bg-white border-r shadow-lg transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat</h1>
                <p className="text-sm text-gray-500">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h2>
          <UserList
            users={users}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            loading={loading}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>
        </div>

        {/* Chat Window */}
        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          onBack={handleBack}
          typingUsers={typingUsers}
          isConnected={isConnected}
        />
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};