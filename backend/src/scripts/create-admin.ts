import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../modules/auth/user.model';
import { connectDB } from '../config/db';

async function createAdminUser() {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    // Also create a regular user for testing
    const existingUser = await User.findOne({ email: 'user@example.com' });
    if (!existingUser) {
      const userPassword = await bcrypt.hash('user123', 10);
      const regularUser = new User({
        name: 'Regular User',
        email: 'user@example.com',
        password: userPassword,
        role: 'USER'
      });
      await regularUser.save();
      console.log('Regular user created successfully');
      console.log('Email: user@example.com');
      console.log('Password: user123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();