import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Search, Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { scanNumberPlate } from '@/services/mockAPI';

export default function Lookup() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { searchVehicle, incrementLookups, dailyLookups, maxDailyLookups } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a vehicle number');
      return;
    }

    if (!incrementLookups()) {
      toast.error('Daily lookup limit reached. Try again tomorrow.');
      return;
    }

    setLoading(true);

    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const vehicle = searchVehicle(searchQuery);
      
      if (vehicle) {
        navigate('/results', { state: { vehicles: [vehicle], searchTerm: searchQuery } });
      } else {
        toast.error('Vehicle not found in community database');
      }
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!incrementLookups()) {
      toast.error('Daily lookup limit reached. Try again tomorrow.');
      return;
    }

    setScanning(true);

    try {
      const result = await scanNumberPlate(file);
      
      if (result.success && result.registrationNumber) {
        setSearchQuery(result.registrationNumber);
        toast.success(`Scanned: ${result.registrationNumber}`);
        
        // Auto-search after scanning
        const vehicle = searchVehicle(result.registrationNumber);
        if (vehicle) {
          navigate('/results', { 
            state: { 
              vehicles: [vehicle], 
              searchTerm: result.registrationNumber,
              scanned: true 
            } 
          });
        } else {
          toast.error('Scanned vehicle not found in community database');
        }
      } else {
        toast.error('Could not scan number plate. Please try manual entry.');
      }
    } catch (error) {
      toast.error('Scanning failed. Please try again.');
    } finally {
      setScanning(false);
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
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Search className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Lookup Vehicle</h1>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {maxDailyLookups - dailyLookups} lookups remaining today
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
          className="space-y-8"
        >
          {/* Manual Search */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Manual Search</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Vehicle Registration Number</Label>
                <Input
                  id="search"
                  placeholder="e.g., KA01AB1234"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  disabled={loading || scanning}
                />
              </div>

              <Button 
                onClick={handleSearch}
                className="w-full" 
                disabled={loading || scanning || dailyLookups >= maxDailyLookups}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Community Database
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="flex items-center space-x-4">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-500">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* OCR Scan */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Scan Number Plate</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  {scanning ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                
                <div>
                  <p className="text-gray-600 mb-4">
                    Upload a photo of the vehicle's number plate for automatic recognition
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={scanning || dailyLookups >= maxDailyLookups}
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={scanning || dailyLookups >= maxDailyLookups}
                    size="lg"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Ensure the number plate is clearly visible and well-lit for best results.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limit Warning */}
          {dailyLookups >= maxDailyLookups && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <p className="text-orange-800 text-center">
                  <strong>Daily limit reached.</strong> You've used all {maxDailyLookups} lookups for today.
                  <br />Come back tomorrow for more searches.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}