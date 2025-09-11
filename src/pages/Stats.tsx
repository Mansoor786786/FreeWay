import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Users, Car, Search, Shield, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Stats() {
  const navigate = useNavigate();
  const { vehicles, dailyLookups, maxDailyLookups } = useApp();

  const stats = [
    {
      title: 'Registered Vehicles',
      value: vehicles.length,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Active community members'
    },
    {
      title: 'Daily Lookups Used',
      value: `${dailyLookups}/${maxDailyLookups}`,
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Searches performed today'
    },
    {
      title: 'Privacy Protected',
      value: '100%',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'All contacts are masked'
    },
    {
      title: 'Community Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'New registrations this week'
    }
  ];

  const recentActivity = [
    { action: 'Vehicle registered', vehicle: 'KA01AB1234', time: '2 hours ago' },
    { action: 'Lookup performed', vehicle: 'MH02CD5678', time: '4 hours ago' },
    { action: 'Notification sent', vehicle: 'TN03EF9012', time: '6 hours ago' },
    { action: 'Bulk notification', vehicle: '3 vehicles', time: '1 day ago' },
  ];

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
              <span>Back to Home</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Community Stats</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Community Dashboard
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track the growth and activity of our FreeWay community. 
              See how we're building better neighborhoods together.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Usage Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Daily Lookup Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Used: {dailyLookups} searches</span>
                    <span>Remaining: {maxDailyLookups - dailyLookups} searches</span>
                  </div>
                  <Progress value={(dailyLookups / maxDailyLookups) * 100} className="w-full" />
                  <p className="text-sm text-gray-500">
                    Rate limiting helps prevent spam and ensures fair usage for all community members.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity & Community Info */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.vehicle}</p>
                        </div>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900">
                    <Users className="h-5 w-5" />
                    <span>Community Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {vehicles.length * 3}
                      </div>
                      <p className="text-blue-800">Estimated connections made</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">98%</div>
                        <p className="text-sm text-green-700">Success rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">24/7</div>
                        <p className="text-sm text-purple-700">Available</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg mt-4">
                      <p className="text-sm text-gray-700">
                        <strong>Privacy First:</strong> Every interaction is secure and phone numbers remain protected.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Join Our Growing Community</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Help us build a more connected neighborhood. Register your vehicle and 
                  be part of the solution for better community communication.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    variant="secondary"
                    onClick={() => navigate('/register')}
                    size="lg"
                  >
                    <Car className="h-4 w-4 mr-2" />
                    Register Vehicle
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/lookup')}
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Lookup Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}