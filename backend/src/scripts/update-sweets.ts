import mongoose from 'mongoose';
import { Sweet } from '../modules/sweets/sweet.model';
import { connectDB } from '../config/db';

async function updateExistingSweets() {
  try {
    await connectDB();
    
    // Update all sweets that don't have quantityType field
    const result = await Sweet.updateMany(
      { quantityType: { $exists: false } },
      { $set: { quantityType: 'nos' } }
    );
    
    console.log(`Updated ${result.modifiedCount} sweets with default quantityType 'nos'`);
    
    // Show all sweets with their quantityType
    const allSweets = await Sweet.find({});
    console.log('\nAll sweets in database:');
    allSweets.forEach(sweet => {
      console.log(`- ${sweet.name}: ${sweet.quantity} ${sweet.quantityType}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating sweets:', error);
    process.exit(1);
  }
}

updateExistingSweets();