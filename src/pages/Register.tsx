import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Car, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { validateVehicle, sendOTP } from '@/services/mockAPI';

export default function Register() {
  const navigate = useNavigate();
  const { setCurrentVehicle } = useApp();
  const [formData, setFormData] = useState({
    registrationNumber: '',
    ownerName: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber || !formData.phoneNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Validate vehicle
      toast.info('Validating vehicle number...');
      const validation = await validateVehicle(formData.registrationNumber);
      
      if (!validation.isValid) {
        toast.error('Invalid vehicle number. Please check and try again.');
        setLoading(false);
        return;
      }

      // Step 2: Send OTP
      toast.info('Sending OTP...');
      const otpResult = await sendOTP(formData.phoneNumber);
      
      if (!otpResult.success) {
        toast.error('Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }

      // Store current vehicle data and OTP for verification
      setCurrentVehicle({
        ...formData,
        registrationNumber: formData.registrationNumber.toUpperCase(),
        otp: otpResult.otp, // In real app, this would be stored securely
      });

      toast.success('OTP sent successfully!');
      navigate('/verify-otp');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Register Vehicle</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join Our Community</CardTitle>
              <p className="text-gray-600">
                Register your vehicle to help neighbors connect with you when needed.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">
                    Vehicle Registration Number *
                  </Label>
                  <Input
                    id="registrationNumber"
                    placeholder="e.g., KA01AB1234"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      registrationNumber: e.target.value.toUpperCase()
                    }))}
                    className="text-center text-lg font-mono tracking-wider"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    We'll verify this with the vehicle registry
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name (Optional)</Label>
                  <Input
                    id="ownerName"
                    placeholder="Your full name"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ownerName: e.target.value
                    }))}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      phoneNumber: e.target.value.replace(/\D/g, '')
                    }))}
                    maxLength={10}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    We'll send an OTP to verify your number
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Privacy Notice</h4>
                  <p className="text-sm text-blue-700">
                    Your phone number will be masked in the community directory. 
                    Other users can contact you through secure notifications without seeing your full number.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Continue to Verification'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}