import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useMessaging } from '@/context/MessagingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneCall, 
  PhoneMissed, 
  PhoneIncoming, 
  PhoneOutgoing,
  Search,
  MessageSquare,
  Video,
  Clock
} from 'lucide-react';

export const CallHistory: React.FC = () => {
  const { calls, users, currentUser, initiateCall, isDarkMode } = useMessaging();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalls = calls.filter(call => {
    const otherUserId = call.callerId === currentUser?.id ? call.receiverId : call.callerId;
    const otherUser = users.find(u => u.id === otherUserId);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatCallDuration = (seconds: number) => {
    if (seconds === 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getCallIcon = (call: any) => {
    const isIncoming = call.receiverId === currentUser?.id;
    
    if (call.status === 'missed') {
      return <PhoneMissed className="h-4 w-4 text-red-500" />;
    } else if (isIncoming) {
      return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    } else {
      return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCallStatusText = (call: any) => {
    const isIncoming = call.receiverId === currentUser?.id;
    
    switch (call.status) {
      case 'missed':
        return 'Missed call';
      case 'answered':
        return isIncoming ? 'Incoming call' : 'Outgoing call';
      case 'ended':
        return isIncoming ? 'Incoming call' : 'Outgoing call';
      default:
        return call.status;
    }
  };

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  // Group calls by date
  const groupedCalls = filteredCalls.reduce((groups: any, call) => {
    const date = formatCallTime(call.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(call);
    return groups;
  }, {});

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Call History
        </h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search call history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {Object.entries(groupedCalls).map(([date, callsForDate]: [string, any]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className={`px-4 py-2 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'
              }`}>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {date}
                </span>
              </div>

              {/* Calls for this date */}
              {callsForDate.map((call: any) => {
                const otherUserId = call.callerId === currentUser?.id ? call.receiverId : call.callerId;
                const otherUser = users.find(u => u.id === otherUserId);
                
                if (!otherUser) return null;

                return (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 border-b transition-colors hover:bg-opacity-50 ${
                      isDarkMode 
                        ? 'border-gray-700 hover:bg-gray-800' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                          <AvatarFallback>
                            {otherUser.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        {/* Call Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {otherUser.name}
                            </h3>
                            {call.type === 'video' && (
                              <Video className="h-3 w-3 text-blue-500" />
                            )}
                            {call.status === 'missed' && (
                              <Badge variant="destructive" className="text-xs">
                                Missed
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            {getCallIcon(call)}
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {getCallStatusText(call)}
                            </span>
                            {call.duration > 0 && (
                              <>
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  •
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {formatCallDuration(call.duration)}
                                  </span>
                                </div>
                              </>
                            )}
                            {call.quality && (
                              <div className={`text-xs ${getQualityColor(call.quality)}`}>
                                📶 {call.quality}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {format(call.timestamp, 'HH:mm')}
                        </span>
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
                          className="p-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {filteredCalls.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Phone className={`h-12 w-12 mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-lg font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {searchQuery ? 'No calls found' : 'No call history'}
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchQuery ? 'Try a different search term' : 'Your call history will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};