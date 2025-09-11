import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, MessageSquare, Bell, Users, Car } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { sendPushNotification, sendSMS, makeCall } from '@/services/mockAPI';

interface Vehicle {
  id: string;
  registrationNumber: string;
  ownerName: string;
  phoneNumber: string;
  registeredAt: string;
  isVerified: boolean;
}

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedVehicles, addToSelection, removeFromSelection, clearSelection, maskPhoneNumber } = useApp();
  
  const { vehicles = [], searchTerm = '', scanned = false } = location.state || {};
  
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

  const handleAction = async (action: string, vehicle: Vehicle) => {
    const actionKey = `${action}-${vehicle.id}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));

    try {
      switch (action) {
        case 'push':
          await sendPushNotification(vehicle.phoneNumber, 'You have a new notification from the community');
          toast.success(`Push notification sent to ${vehicle.ownerName}`);
          break;
        case 'sms':
          await sendSMS(vehicle.phoneNumber, 'Hello from FreeWay community! Someone is trying to reach you regarding your vehicle.');
          toast.success(`SMS sent to ${vehicle.ownerName}`);
          break;
        case 'call':
          await makeCall(vehicle.phoneNumber);
          toast.success(`Initiating call to ${vehicle.ownerName}`);
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action}. Please try again.`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleSelectVehicle = (vehicle: Vehicle, checked: boolean) => {
    if (checked) {
      addToSelection(vehicle);
    } else {
      removeFromSelection(vehicle.id);
    }
  };

  const handleBulkNotify = () => {
    if (selectedVehicles.length === 0) {
      toast.error('Please select at least one vehicle');
      return;
    }
    navigate('/bulk-notify');
  };

  if (vehicles.length === 0) {
    navigate('/lookup');
    return null;
  }

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
                onClick={() => navigate('/lookup')}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Search</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Car className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Search Results</h1>
              </div>
            </div>
            
            {selectedVehicles.length > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {selectedVehicles.length} selected
                </Badge>
                <Button onClick={handleBulkNotify} size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Notify
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </div>
            )}
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
          {/* Search Info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Found {vehicles.length} result{vehicles.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-gray-600">
              {scanned ? 'Scanned' : 'Searched for'}: <strong>{searchTerm}</strong>
            </p>
            {vehicles.length > 1 && (
              <p className="text-sm text-gray-500">
                Select multiple vehicles to send bulk notifications
              </p>
            )}
          </div>

          {/* Results */}
          <div className="grid gap-6">
            {vehicles.map((vehicle: Vehicle, index: number) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {vehicles.length > 1 && (
                          <Checkbox
                            checked={selectedVehicles.some(v => v.id === vehicle.id)}
                            onCheckedChange={(checked) => 
                              handleSelectVehicle(vehicle, checked as boolean)
                            }
                            className="mt-1"
                          />
                        )}
                        <div>
                          <CardTitle className="text-xl font-mono tracking-wide">
                            {vehicle.registrationNumber}
                          </CardTitle>
                          <p className="text-gray-600">{vehicle.ownerName}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          ✓ Verified
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          Registered {new Date(vehicle.registeredAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Contact Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Contact Information</p>
                        <p className="font-mono text-lg">
                          📱 {maskPhoneNumber(vehicle.phoneNumber)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Phone number is protected for privacy
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => handleAction('push', vehicle)}
                          disabled={loadingActions[`push-${vehicle.id}`]}
                          variant="default"
                          size="sm"
                        >
                          {loadingActions[`push-${vehicle.id}`] ? (
                            <>Loading...</>
                          ) : (
                            <>
                              <Bell className="h-4 w-4 mr-2" />
                              Push Notification
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleAction('sms', vehicle)}
                          disabled={loadingActions[`sms-${vehicle.id}`]}
                          variant="outline"
                          size="sm"
                        >
                          {loadingActions[`sms-${vehicle.id}`] ? (
                            <>Loading...</>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleAction('call', vehicle)}
                          disabled={loadingActions[`call-${vehicle.id}`]}
                          variant="outline"
                          size="sm"
                        >
                          {loadingActions[`call-${vehicle.id}`] ? (
                            <>Loading...</>
                          ) : (
                            <>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Owner
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Privacy Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">🔒 Privacy Protected</h4>
              <p className="text-sm text-blue-700">
                All communications are handled securely without exposing personal contact details. 
                The owner will receive your message without seeing your information unless they choose to respond.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}