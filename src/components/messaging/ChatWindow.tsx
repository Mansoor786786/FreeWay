import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useMessaging } from '@/context/MessagingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile,
  Mic,
  Image as ImageIcon,
  Reply,
  Forward,
  Copy,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ChatWindow: React.FC = () => {
  const { 
    activeChat, 
    messages, 
    users, 
    currentUser, 
    sendMessage, 
    markMessagesAsRead,
    typingIndicators,
    setTyping,
    initiateCall,
    isDarkMode,
    deleteMessage,
    replyToMessage
  } = useMessaging();
  
  const [messageText, setMessageText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUser = activeChat ? users.find(u => 
    activeChat.participants.includes(u.id) && u.id !== currentUser?.id
  ) : null;

  const chatMessages = activeChat ? messages[activeChat.id] || [] : [];
  const isTyping = typingIndicators.some(t => 
    t.chatId === activeChat?.id && t.userId !== currentUser?.id
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (activeChat) {
      markMessagesAsRead(activeChat.id);
    }
  }, [activeChat, markMessagesAsRead]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    if (replyingTo) {
      replyToMessage(replyingTo, messageText);
      setReplyingTo(null);
    } else {
      sendMessage(activeChat.id, messageText);
    }
    
    setMessageText('');
    setTyping(activeChat.id, false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (activeChat) {
      setTyping(activeChat.id, e.target.value.length > 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM dd, yyyy');
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeChat) return;

    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'text';
    
    // In a real app, you'd upload the file and get a URL
    const mockUrl = URL.createObjectURL(file);
    sendMessage(activeChat.id, file.name, fileType, mockUrl);
  };

  if (!activeChat || !otherUser) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`text-6xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            💬
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Select a conversation
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = chatMessages.reduce((groups: any, message) => {
    const date = formatMessageDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback>
                {otherUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {otherUser.name}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {otherUser.isOnline ? 'Online' : `Last seen ${format(otherUser.lastSeen, 'HH:mm')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => initiateCall(otherUser.id, 'voice')}
            className="p-2"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => initiateCall(otherUser.id, 'video')}
            className="p-2"
          >
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Media Gallery</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem>Block User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex justify-center my-4">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {date}
                </span>
              </div>

              {/* Messages for this date */}
              {msgs.map((message: any, index: number) => {
                const isFromCurrentUser = message.senderId === currentUser?.id;
                const showAvatar = !isFromCurrentUser && (
                  index === 0 || 
                  msgs[index - 1]?.senderId !== message.senderId
                );

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                      isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {showAvatar && !isFromCurrentUser && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                          <AvatarFallback className="text-xs">
                            {otherUser.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onLongPress={() => setSelectedMessage(message.id)}
                        className={`relative group px-4 py-2 rounded-2xl ${
                          isFromCurrentUser
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : isDarkMode
                              ? 'bg-gray-700 text-white rounded-bl-md'
                              : 'bg-gray-200 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        {message.replyTo && (
                          <div className={`mb-2 p-2 rounded border-l-2 text-xs ${
                            isFromCurrentUser
                              ? 'border-blue-300 bg-blue-400'
                              : isDarkMode
                                ? 'border-gray-500 bg-gray-600'
                                : 'border-gray-400 bg-gray-100'
                          }`}>
                            Replying to message...
                          </div>
                        )}
                        
                        {message.isForwarded && (
                          <div className="text-xs opacity-75 mb-1">
                            ↪️ Forwarded
                          </div>
                        )}

                        {message.type === 'text' ? (
                          <p className="break-words">{message.content}</p>
                        ) : message.type === 'image' ? (
                          <div>
                            <img 
                              src={message.mediaUrl} 
                              alt="Shared image" 
                              className="rounded-lg max-w-full h-auto mb-1"
                            />
                            {message.content && <p className="text-sm">{message.content}</p>}
                          </div>
                        ) : message.type === 'video' ? (
                          <div>
                            <video 
                              src={message.mediaUrl} 
                              controls 
                              className="rounded-lg max-w-full h-auto mb-1"
                            />
                            {message.content && <p className="text-sm">{message.content}</p>}
                          </div>
                        ) : null}

                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{format(message.timestamp, 'HH:mm')}</span>
                          {isFromCurrentUser && (
                            <span className="ml-2">
                              {getMessageStatusIcon(message.status)}
                            </span>
                          )}
                        </div>

                        {/* Message Actions */}
                        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className={`flex space-x-1 p-1 rounded-lg shadow-lg ${
                            isDarkMode ? 'bg-gray-700' : 'bg-white'
                          }`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                              onClick={() => setReplyingTo(message.id)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                              onClick={() => navigator.clipboard.writeText(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {isFromCurrentUser && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6 w-6 text-red-500"
                                onClick={() => deleteMessage(message.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                <AvatarFallback className="text-xs">{otherUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`px-4 py-2 rounded-2xl rounded-bl-md ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className={`px-4 py-2 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Replying to message
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="p-1"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="p-2"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="p-1">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};