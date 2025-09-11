import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ArrowLeft, Users, Send, Loader2, Bell, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { sendPushNotification, sendSMS, makeCall } from '@/services/mockAPI';

export default function BulkNotify() {
  const navigate = useNavigate();
  const { selectedVehicles, removeFromSelection, clearSelection, maskPhoneNumber } = useApp();
  
  const [notificationMethod, setNotificationMethod] = useState<'push' | 'sms' | 'call'>('push');
  const [customMessage, setCustomMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const predefinedMessages = {
    push: [
      'Your vehicle is blocking the way. Please move it.',
      'Reminder: Your vehicle needs to be moved.',
      'Community notification: Please check your vehicle.',
    ],
    sms: [
      'Hello! Your vehicle is causing inconvenience. Please move it when possible. Thank you!',
      'Friendly reminder from your community: Please check on your parked vehicle.',
      'Hi! Could you please move your vehicle? It\'s needed for community access.',
    ],
    call: [] // Calls don't need predefined messages
  };

  const handleSendBulkNotification = async () => {
    if (selectedVehicles.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    if (notificationMethod !== 'call' && !customMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmAndSend = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    const message = customMessage || predefinedMessages[notificationMethod][0];
    let successful = 0;
    let failed = 0;

    for (const vehicle of selectedVehicles) {
      try {
        switch (notificationMethod) {
          case 'push':
            await sendPushNotification(vehicle.phoneNumber, message);
            break;
          case 'sms':
            await sendSMS(vehicle.phoneNumber, message);
            break;
          case 'call':
            await makeCall(vehicle.phoneNumber);
            break;
        }
        successful++;
      } catch (error) {
        failed++;
      }
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
    
    if (successful > 0) {
      toast.success(
        `Successfully sent ${successful} notification${successful !== 1 ? 's' : ''}`
      );
      clearSelection();
      navigate('/lookup');
    }
    
    if (failed > 0) {
      toast.error(`${failed} notification${failed !== 1 ? 's' : ''} failed to send`);
    }
  };

  if (selectedVehicles.length === 0) {
    navigate('/results');
    return null;
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'push': return <Bell className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/results')}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Results</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">Bulk Notification</h1>
              </div>
            </div>
            
            <Badge variant="secondary">
              {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Selected Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-mono font-semibold">{vehicle.registrationNumber}</p>
                        <p className="text-sm text-gray-600">{vehicle.ownerName}</p>
                        <p className="text-sm text-gray-500">{maskPhoneNumber(vehicle.phoneNumber)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromSelection(vehicle.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Method */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Notification Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'push', label: 'Push Notification', icon: Bell, desc: 'Instant in-app notification' },
                  { id: 'sms', label: 'SMS Message', icon: MessageSquare, desc: 'Text message to phone' },
                  { id: 'call', label: 'Phone Call', icon: Phone, desc: 'Direct call to owner' }
                ].map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-colors ${
                      notificationMethod === method.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setNotificationMethod(method.id as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Checkbox 
                          checked={notificationMethod === method.id}
                          className="mr-2"
                        />
                        <method.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold">{method.label}</h4>
                      <p className="text-sm text-gray-600">{method.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Composition */}
          {notificationMethod !== 'call' && (
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {predefinedMessages[notificationMethod].length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Quick Messages:</h4>
                    <div className="space-y-2">
                      {predefinedMessages[notificationMethod].map((message, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomMessage(message)}
                          className="block w-full text-left h-auto p-3 whitespace-normal"
                        >
                          {message}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Custom Message:</h4>
                  <Textarea
                    placeholder="Type your custom message here..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    maxLength={300}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {customMessage.length}/300 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Send Button */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Ready to Send?</h3>
                <p className="text-gray-600">
                  This will send {notificationMethod === 'push' ? 'push notifications' : 
                    notificationMethod === 'sms' ? 'SMS messages' : 'phone calls'} to {selectedVehicles.length} vehicle owner{selectedVehicles.length !== 1 ? 's' : ''}.
                </p>
                <Button 
                  onClick={handleSendBulkNotification}
                  size="lg"
                  disabled={loading || (notificationMethod !== 'call' && !customMessage.trim())}
                  className="px-8"
                >
                  {getMethodIcon(notificationMethod)}
                  <span className="ml-2">Send to {selectedVehicles.length} Owner{selectedVehicles.length !== 1 ? 's' : ''}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Notification</DialogTitle>
            <DialogDescription>
              You're about to send {notificationMethod === 'push' ? 'push notifications' : 
                notificationMethod === 'sms' ? 'SMS messages' : 'make phone calls'} to {selectedVehicles.length} vehicle owner{selectedVehicles.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recipients:</h4>
              <div className="space-y-1">
                {selectedVehicles.map((vehicle) => (
                  <p key={vehicle.id} className="text-sm text-gray-600">
                    {vehicle.registrationNumber} - {vehicle.ownerName}
                  </p>
                ))}
              </div>
            </div>
            
            {notificationMethod !== 'call' && customMessage && (
              <div>
                <h4 className="font-medium mb-2">Message:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {customMessage}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAndSend} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirm & Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}