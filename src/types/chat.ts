export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  sender_name?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
}