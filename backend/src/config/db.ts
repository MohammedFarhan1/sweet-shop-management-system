import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 
      'mongodb+srv://sweetshop_admin:admin123@sweet-shop-cluster.thrjcvk.mongodb.net/sweetshop?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};