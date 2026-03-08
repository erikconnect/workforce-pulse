import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workforce-pulse';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};
