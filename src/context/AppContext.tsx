import React, { createContext, useContext, useState, useEffect } from 'react';

interface Vehicle {
  id: string;
  registrationNumber: string;
  ownerName: string;
  phoneNumber: string;
  registeredAt: string;
  isVerified: boolean;
  otp?: string;
}

interface AppContextType {
  vehicles: Vehicle[];
  selectedVehicles: Vehicle[];
  dailyLookups: number;
  maxDailyLookups: number;
  currentVehicle: Partial<Vehicle> | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'registeredAt' | 'isVerified'>) => void;
  searchVehicle: (registrationNumber: string) => Vehicle | null;
  incrementLookups: () => boolean;
  setCurrentVehicle: (vehicle: Partial<Vehicle> | null) => void;
  addToSelection: (vehicle: Vehicle) => void;
  removeFromSelection: (vehicleId: string) => void;
  clearSelection: () => void;
  maskPhoneNumber: (phone: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [dailyLookups, setDailyLookups] = useState(0);
  const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle> | null>(null);
  const maxDailyLookups = 10;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedVehicles = localStorage.getItem('freeway_vehicles');
    const savedLookups = localStorage.getItem('freeway_daily_lookups');
    const lookupDate = localStorage.getItem('freeway_lookup_date');
    
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    }
    
    // Reset daily lookups if it's a new day
    const today = new Date().toDateString();
    if (lookupDate !== today) {
      setDailyLookups(0);
      localStorage.setItem('freeway_lookup_date', today);
      localStorage.setItem('freeway_daily_lookups', '0');
    } else if (savedLookups) {
      setDailyLookups(parseInt(savedLookups));
    }
  }, []);

  // Save vehicles to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('freeway_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'registeredAt' | 'isVerified'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
      isVerified: true,
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const searchVehicle = (registrationNumber: string): Vehicle | null => {
    return vehicles.find(v => 
      v.registrationNumber.toLowerCase().replace(/\s/g, '') === 
      registrationNumber.toLowerCase().replace(/\s/g, '')
    ) || null;
  };

  const incrementLookups = (): boolean => {
    if (dailyLookups >= maxDailyLookups) {
      return false;
    }
    const newCount = dailyLookups + 1;
    setDailyLookups(newCount);
    localStorage.setItem('freeway_daily_lookups', newCount.toString());
    return true;
  };

  const addToSelection = (vehicle: Vehicle) => {
    setSelectedVehicles(prev => 
      prev.find(v => v.id === vehicle.id) ? prev : [...prev, vehicle]
    );
  };

  const removeFromSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };

  const clearSelection = () => {
    setSelectedVehicles([]);
  };

  const maskPhoneNumber = (phone: string): string => {
    if (phone.length < 6) return phone;
    return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
  };

  const value: AppContextType = {
    vehicles,
    selectedVehicles,
    dailyLookups,
    maxDailyLookups,
    currentVehicle,
    addVehicle,
    searchVehicle,
    incrementLookups,
    setCurrentVehicle,
    addToSelection,
    removeFromSelection,
    clearSelection,
    maskPhoneNumber,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};