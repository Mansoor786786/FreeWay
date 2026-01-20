import React, { useState } from 'react';
import { MessagingProvider } from '@/context/MessagingContext';
import { ChatList } from '@/components/messaging/ChatList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { CallHistory } from '@/components/messaging/CallHistory';
import { CallInterface } from '@/components/messaging/CallInterface';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MessagingApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <MessagingProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to FreeWay</span>
              </Button>
              
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Communication Hub
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-gray-200 dark:border-gray-700">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-2">
                <TabsTrigger value="messages" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </TabsTrigger>
                <TabsTrigger value="calls" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Calls</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="messages" className="flex-1 m-0">
                <ChatList />
              </TabsContent>
              
              <TabsContent value="calls" className="flex-1 m-0">
                <CallHistory />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex-1">
            <ChatWindow />
          </div>
        </div>

        {/* Call Interface Overlay */}
        <CallInterface />
      </div>
    </MessagingProvider>
  );
}