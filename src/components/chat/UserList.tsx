import React from 'react';
import { ChatUser } from '../../types/chat';
import { User, Circle } from 'lucide-react';

interface UserListProps {
  users: ChatUser[];
  selectedUser: ChatUser | null;
  onUserSelect: (user: ChatUser) => void;
  loading: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUser,
  onUserSelect,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No users available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onUserSelect(user)}
          className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
            selectedUser?.id === user.id
              ? 'bg-blue-100 border-l-4 border-blue-600'
              : 'hover:bg-gray-50 border-l-4 border-transparent'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {user.isOnline && (
                <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 fill-current" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {user.email}
              </p>
              {user.lastMessage && (
                <p className="text-xs text-gray-400 truncate mt-1">
                  {user.lastMessage}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};