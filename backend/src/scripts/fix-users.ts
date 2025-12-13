import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../modules/auth/user.model';
import { connectDB } from '../config/db';

async function fixUsers() {
  try {
    await connectDB();
    
    // Delete existing users
    await User.deleteMany({});
    console.log('Deleted existing users');
    
    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'ADMIN'
    });
    await adminUser.save();
    console.log('Created admin user: admin@example.com / admin123');
    
    // Create regular user
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const regularUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: hashedUserPassword,
      role: 'USER'
    });
    await regularUser.save();
    console.log('Created regular user: user@example.com / user123');
    
    // Verify users
    const users = await User.find({});
    console.log('\nAll users in database:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.name} (${user.role})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixUsers();