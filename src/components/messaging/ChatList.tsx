import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useMessaging } from '@/context/MessagingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Pin, 
  Archive, 
  VolumeX, 
  MessageSquare,
  Phone,
  Settings
} from 'lucide-react';

export const ChatList: React.FC = () => {
  const { 
    chats, 
    users, 
    currentUser, 
    activeChat, 
    setActiveChat, 
    searchChats,
    isDarkMode,
    toggleDarkMode
  } = useMessaging();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredChats = searchChats(searchQuery).filter(chat => 
    showArchived ? chat.isArchived : !chat.isArchived
  );

  const sortedChats = filteredChats.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getOtherUser = (chat: any) => {
    return users.find(u => 
      chat.participants.includes(u.id) && u.id !== currentUser?.id
    );
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-r`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Messages
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter Tabs */}
        <div className="flex mt-3 space-x-2">
          <Button
            variant={!showArchived ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowArchived(false)}
          >
            All
          </Button>
          <Button
            variant={showArchived ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowArchived(true)}
          >
            <Archive className="h-3 w-3 mr-1" />
            Archived
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {sortedChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            if (!otherUser) return null;

            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ backgroundColor: isDarkMode ? '#374151' : '#f9fafb' }}
                className={`p-4 cursor-pointer border-b transition-colors ${
                  isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'
                } ${
                  activeChat?.id === chat.id 
                    ? isDarkMode ? 'bg-gray-800' : 'bg-blue-50' 
                    : ''
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                      <AvatarFallback>
                        {otherUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {otherUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold truncate ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {otherUser.name}
                        </h3>
                        {chat.isPinned && (
                          <Pin className="h-3 w-3 text-blue-500" />
                        )}
                        {chat.isMuted && (
                          <VolumeX className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {chat.lastMessage && (
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {chat.lastMessage && (
                      <div className="flex items-center mt-1">
                        <p className={`text-sm truncate ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {chat.lastMessage.senderId === currentUser?.id && '✓ '}
                          {chat.lastMessage.type === 'text' 
                            ? chat.lastMessage.content 
                            : `📎 ${chat.lastMessage.type}`
                          }
                        </p>
                      </div>
                    )}
                    
                    {/* Online Status */}
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {otherUser.isOnline 
                        ? 'Online' 
                        : `Last seen ${formatDistanceToNow(otherUser.lastSeen, { addSuffix: true })}`
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedChats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MessageSquare className={`h-12 w-12 mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-lg font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};