// Mock VAHAN API for vehicle validation
export const validateVehicle = async (registrationNumber: string): Promise<{
  isValid: boolean;
  vehicleInfo?: {
    registrationNumber: string;
    vehicleType: string;
    model: string;
    year: string;
  };
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock validation logic - consider it valid if it follows basic pattern
  const isValidFormat = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$/i.test(
    registrationNumber.replace(/\s/g, '')
  );
  
  if (!isValidFormat) {
    return { isValid: false };
  }

  return {
    isValid: true,
    vehicleInfo: {
      registrationNumber: registrationNumber.toUpperCase(),
      vehicleType: 'Car',
      model: 'Honda City',
      year: '2020',
    },
  };
};

// Mock OTP service
export const sendOTP = async (_phoneNumber: string): Promise<{ success: boolean; otp?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock OTP - in real app, this would be sent via SMS
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(`Mock OTP for ${_phoneNumber}: ${otp}`);
  
  return { success: true, otp };
};

export const verifyOTP = async (_phoneNumber: string, otp: string, correctOTP: string): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return { success: otp === correctOTP };
};

// Mock OCR service for number plate scanning
export const scanNumberPlate = async (_imageFile: File): Promise<{
  success: boolean;
  registrationNumber?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock OCR result
  const mockNumbers = ['KA01AB1234', 'MH02CD5678', 'TN03EF9012', 'DL04GH3456'];
  const randomNumber = mockNumbers[Math.floor(Math.random() * mockNumbers.length)];
  
  return {
    success: true,
    registrationNumber: randomNumber,
  };
};

// Mock notification services
export const sendPushNotification = async (phoneNumber: string, message: string): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Push notification to ${phoneNumber}: ${message}`);
  return { success: true };
};

export const sendSMS = async (phoneNumber: string, message: string): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log(`SMS to ${phoneNumber}: ${message}`);
  return { success: true };
};

export const makeCall = async (phoneNumber: string): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Initiating call to ${phoneNumber}`);
  return { success: true };
};