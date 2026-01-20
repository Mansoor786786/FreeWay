import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Message, Chat, Call, CallState, TypingIndicator } from '@/types/messaging';
import { v4 as uuidv4 } from 'uuid';

interface MessagingContextType {
  // Users
  currentUser: User | null;
  users: User[];
  contacts: User[];
  
  // Chats
  chats: Chat[];
  activeChat: Chat | null;
  messages: { [chatId: string]: Message[] };
  typingIndicators: TypingIndicator[];
  
  // Calls
  calls: Call[];
  callState: CallState;
  
  // Theme
  isDarkMode: boolean;
  
  // Actions
  setCurrentUser: (user: User) => void;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type'], mediaUrl?: string) => void;
  markMessagesAsRead: (chatId: string) => void;
  deleteMessage: (messageId: string) => void;
  forwardMessage: (messageId: string, chatIds: string[]) => void;
  replyToMessage: (messageId: string, content: string) => void;
  
  // Typing
  setTyping: (chatId: string, isTyping: boolean) => void;
  
  // Calls
  initiateCall: (receiverId: string, type: 'voice' | 'video') => void;
  answerCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  
  // Chat management
  pinChat: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  muteChat: (chatId: string) => void;
  blockUser: (userId: string) => void;
  
  // Theme
  toggleDarkMode: () => void;
  
  // Search
  searchChats: (query: string) => Chat[];
  searchMessages: (query: string) => Message[];
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within MessagingProvider');
  }
  return context;
};

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isIncoming: false,
    isMuted: false,
    isSpeakerOn: false,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        phone: '+1234567890',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150',
        isOnline: true,
        lastSeen: new Date(),
        status: 'Available'
      },
      {
        id: '2',
        name: 'Jane Smith',
        phone: '+1234567891',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=150',
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        status: 'Busy'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        phone: '+1234567892',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150',
        isOnline: true,
        lastSeen: new Date(),
        status: 'At work'
      }
    ];

    const currentUserData: User = {
      id: 'current',
      name: 'You',
      phone: '+1234567899',
      avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=150',
      isOnline: true,
      lastSeen: new Date(),
      status: 'Available'
    };

    setUsers(mockUsers);
    setContacts(mockUsers);
    setCurrentUser(currentUserData);

    // Create mock chats
    const mockChats: Chat[] = mockUsers.map(user => ({
      id: uuidv4(),
      participants: [currentUserData.id, user.id],
      unreadCount: Math.floor(Math.random() * 5),
      isPinned: Math.random() > 0.7,
      isArchived: false,
      isMuted: false,
      isBlocked: false,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random within last week
      updatedAt: new Date(Date.now() - Math.random() * 3600000), // Random within last hour
    }));

    setChats(mockChats);

    // Create mock messages
    const mockMessages: { [chatId: string]: Message[] } = {};
    mockChats.forEach(chat => {
      const messageCount = Math.floor(Math.random() * 20) + 5;
      const chatMessages: Message[] = [];
      
      for (let i = 0; i < messageCount; i++) {
        const isFromCurrentUser = Math.random() > 0.5;
        const senderId = isFromCurrentUser ? currentUserData.id : chat.participants.find(p => p !== currentUserData.id)!;
        const receiverId = isFromCurrentUser ? chat.participants.find(p => p !== currentUserData.id)! : currentUserData.id;
        
        chatMessages.push({
          id: uuidv4(),
          chatId: chat.id,
          senderId,
          receiverId,
          content: generateMockMessage(),
          type: 'text',
          timestamp: new Date(Date.now() - (messageCount - i) * 300000), // 5 minutes apart
          status: isFromCurrentUser ? 'read' : 'delivered',
        });
      }
      
      mockMessages[chat.id] = chatMessages;
      
      // Set last message for chat
      if (chatMessages.length > 0) {
        chat.lastMessage = chatMessages[chatMessages.length - 1];
      }
    });

    setMessages(mockMessages);

    // Mock calls
    const mockCalls: Call[] = [
      {
        id: uuidv4(),
        callerId: currentUserData.id,
        receiverId: mockUsers[0].id,
        type: 'voice',
        status: 'answered',
        duration: 180,
        timestamp: new Date(Date.now() - 3600000),
        quality: 'excellent'
      },
      {
        id: uuidv4(),
        callerId: mockUsers[1].id,
        receiverId: currentUserData.id,
        type: 'voice',
        status: 'missed',
        duration: 0,
        timestamp: new Date(Date.now() - 7200000),
      }
    ];

    setCalls(mockCalls);
  }, []);

  const generateMockMessage = (): string => {
    const messages = [
      "Hey there! How are you doing?",
      "Just finished work, heading home now",
      "Did you see the game last night?",
      "Let's catch up soon!",
      "Thanks for your help earlier",
      "Have a great day!",
      "See you tomorrow",
      "That sounds like a great plan",
      "I'll call you later",
      "Perfect timing!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const sendMessage = useCallback((chatId: string, content: string, type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const receiverId = chat.participants.find(p => p !== currentUser.id)!;
    
    const newMessage: Message = {
      id: uuidv4(),
      chatId,
      senderId: currentUser.id,
      receiverId,
      content,
      type,
      timestamp: new Date(),
      status: 'sending',
      mediaUrl,
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      }));
    }, 500);

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      }));
    }, 1000);

    // Update chat's last message and timestamp
    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? { ...c, lastMessage: newMessage, updatedAt: new Date() }
        : c
    ));
  }, [currentUser, chats]);

  const markMessagesAsRead = useCallback((chatId: string) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(msg => 
        msg.receiverId === currentUser?.id ? { ...msg, status: 'read' } : msg
      ) || []
    }));

    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));
  }, [currentUser]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => {
      const newMessages = { ...prev };
      Object.keys(newMessages).forEach(chatId => {
        newMessages[chatId] = newMessages[chatId].filter(msg => msg.id !== messageId);
      });
      return newMessages;
    });
  }, []);

  const forwardMessage = useCallback((messageId: string, chatIds: string[]) => {
    const message = Object.values(messages).flat().find(m => m.id === messageId);
    if (!message || !currentUser) return;

    chatIds.forEach(chatId => {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      const receiverId = chat.participants.find(p => p !== currentUser.id)!;
      
      const forwardedMessage: Message = {
        ...message,
        id: uuidv4(),
        chatId,
        senderId: currentUser.id,
        receiverId,
        timestamp: new Date(),
        status: 'sending',
        isForwarded: true,
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), forwardedMessage]
      }));
    });
  }, [messages, chats, currentUser]);

  const replyToMessage = useCallback((messageId: string, content: string) => {
    const message = Object.values(messages).flat().find(m => m.id === messageId);
    if (!message || !currentUser) return;

    const receiverId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
    
    const replyMessage: Message = {
      id: uuidv4(),
      chatId: message.chatId,
      senderId: currentUser.id,
      receiverId,
      content,
      type: 'text',
      timestamp: new Date(),
      status: 'sending',
      replyTo: messageId,
    };

    setMessages(prev => ({
      ...prev,
      [message.chatId]: [...(prev[message.chatId] || []), replyMessage]
    }));
  }, [messages, currentUser]);

  const setTyping = useCallback((chatId: string, isTyping: boolean) => {
    if (!currentUser) return;

    setTypingIndicators(prev => {
      const filtered = prev.filter(t => !(t.chatId === chatId && t.userId === currentUser.id));
      
      if (isTyping) {
        return [...filtered, {
          chatId,
          userId: currentUser.id,
          isTyping: true,
          timestamp: new Date()
        }];
      }
      
      return filtered;
    });

    // Auto-clear typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingIndicators(prev => 
          prev.filter(t => !(t.chatId === chatId && t.userId === currentUser.id))
        );
      }, 3000);
    }
  }, [currentUser]);

  const initiateCall = useCallback((receiverId: string, type: 'voice' | 'video') => {
    if (!currentUser) return;

    const newCall: Call = {
      id: uuidv4(),
      callerId: currentUser.id,
      receiverId,
      type,
      status: 'outgoing',
      duration: 0,
      timestamp: new Date(),
    };

    setCalls(prev => [newCall, ...prev]);
    setCallState({
      isActive: true,
      isIncoming: false,
      currentCall: newCall,
      isMuted: false,
      isSpeakerOn: false,
      startTime: new Date(),
    });
  }, [currentUser]);

  const answerCall = useCallback(() => {
    if (!callState.currentCall) return;

    setCallState(prev => ({
      ...prev,
      isIncoming: false,
      startTime: new Date(),
    }));

    setCalls(prev => prev.map(call => 
      call.id === callState.currentCall?.id 
        ? { ...call, status: 'answered' }
        : call
    ));
  }, [callState.currentCall]);

  const endCall = useCallback(() => {
    if (!callState.currentCall || !callState.startTime) return;

    const duration = Math.floor((Date.now() - callState.startTime.getTime()) / 1000);

    setCalls(prev => prev.map(call => 
      call.id === callState.currentCall?.id 
        ? { ...call, status: 'ended', duration }
        : call
    ));

    setCallState({
      isActive: false,
      isIncoming: false,
      isMuted: false,
      isSpeakerOn: false,
    });
  }, [callState.currentCall, callState.startTime]);

  const toggleMute = useCallback(() => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const toggleSpeaker = useCallback(() => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  }, []);

  const pinChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  }, []);

  const archiveChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
    ));
  }, []);

  const muteChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
    ));
  }, []);

  const blockUser = useCallback((userId: string) => {
    setChats(prev => prev.map(chat => 
      chat.participants.includes(userId) ? { ...chat, isBlocked: !chat.isBlocked } : chat
    ));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const searchChats = useCallback((query: string): Chat[] => {
    if (!query.trim()) return chats;
    
    return chats.filter(chat => {
      const otherUser = users.find(u => 
        chat.participants.includes(u.id) && u.id !== currentUser?.id
      );
      return otherUser?.name.toLowerCase().includes(query.toLowerCase()) ||
             chat.lastMessage?.content.toLowerCase().includes(query.toLowerCase());
    });
  }, [chats, users, currentUser]);

  const searchMessages = useCallback((query: string): Message[] => {
    if (!query.trim()) return [];
    
    return Object.values(messages).flat().filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
  }, [messages]);

  const value: MessagingContextType = {
    currentUser,
    users,
    contacts,
    chats,
    activeChat,
    messages,
    typingIndicators,
    calls,
    callState,
    isDarkMode,
    setCurrentUser,
    setActiveChat,
    sendMessage,
    markMessagesAsRead,
    deleteMessage,
    forwardMessage,
    replyToMessage,
    setTyping,
    initiateCall,
    answerCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    pinChat,
    archiveChat,
    muteChat,
    blockUser,
    toggleDarkMode,
    searchChats,
    searchMessages,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};