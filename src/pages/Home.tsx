import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Search, Users, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { vehicles, dailyLookups, maxDailyLookups } = useApp();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">FreeWay</h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="outline" 
                onClick={() => navigate('/stats')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Community Stats</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-8"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Connect with Your
              <span className="text-blue-600 block">Community</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find and connect with vehicle owners in your community. 
              Block unwanted parking, send notifications, and build better neighborhoods.
            </p>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="space-y-4"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Register Vehicle</h3>
                  <p className="text-gray-600">
                    Add your vehicle to the community database and help others reach you when needed.
                  </p>
                  <Button className="w-full">Get Started</Button>
                </motion.div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/lookup')}
                  className="space-y-4"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                    <Search className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Lookup Vehicle</h3>
                  <p className="text-gray-600">
                    Find vehicle owners in your community and send them notifications or messages.
                  </p>
                  <Button variant="outline" className="w-full">
                    Search Now
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Preview */}
          <motion.div variants={itemVariants}>
            <Card className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{vehicles.length}</div>
                    <div className="text-sm text-gray-600">Registered Vehicles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {maxDailyLookups - dailyLookups}
                    </div>
                    <div className="text-sm text-gray-600">Lookups Remaining</div>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-indigo-600 mx-auto" />
                    <div className="text-sm text-gray-600 mt-1">Privacy First</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="mt-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">Why Choose FreeWay?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Privacy Protected",
                  description: "Phone numbers are masked and secure communication channels are provided."
                },
                {
                  icon: Users,
                  title: "Community Driven",
                  description: "Built by the community, for the community. Help your neighbors and get help when needed."
                },
                {
                  icon: Search,
                  title: "Smart Lookup",
                  description: "OCR scanning, manual entry, and bulk operations make finding vehicles easy."
                }
              ].map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">
            <strong>Prototype</strong> — Replace mock services with real APIs for production.
          </p>
        </div>
      </footer>
    </div>
  );
}