import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { verifyOTP, sendOTP } from '@/services/mockAPI';

export default function OTPVerification() {
  const navigate = useNavigate();
  const { currentVehicle, setCurrentVehicle, addVehicle, maskPhoneNumber } = useApp();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!currentVehicle?.phoneNumber) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentVehicle, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(
        currentVehicle!.phoneNumber!,
        otp,
        currentVehicle!.otp!
      );

      if (result.success) {
        // Add vehicle to community database
        addVehicle({
          registrationNumber: currentVehicle!.registrationNumber!,
          ownerName: currentVehicle!.ownerName || 'Anonymous',
          phoneNumber: currentVehicle!.phoneNumber!,
        });

        toast.success('Vehicle registered successfully!');
        setCurrentVehicle(null);
        navigate('/');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResending(true);
    try {
      const result = await sendOTP(currentVehicle!.phoneNumber!);
      
      if (result.success) {
        setCurrentVehicle({
          ...currentVehicle,
          otp: result.otp,
        });
        setCountdown(30);
        toast.success('OTP resent successfully!');
      } else {
        toast.error('Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (!currentVehicle) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/register')}
              className="flex items-center space-x-2 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Verify Phone Number</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
              <p className="text-gray-600">
                We've sent a 4-digit code to<br />
                <strong>{maskPhoneNumber(currentVehicle.phoneNumber!)}</strong>
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={4}
                  disabled={loading}
                  autoComplete="one-time-code"
                />
              </div>

              {/* Mock OTP Display - Remove in production */}
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Development Mode:</strong> Use OTP: <span className="font-mono">{currentVehicle.otp}</span>
                </p>
              </div>

              <Button 
                onClick={handleVerify}
                className="w-full" 
                disabled={loading || otp.length !== 4}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Register'
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || resending}
                  className="text-sm"
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend OTP in ${countdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>
                  Vehicle: <strong>{currentVehicle.registrationNumber}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}