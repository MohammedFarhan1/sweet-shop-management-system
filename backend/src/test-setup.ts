import mongoose from 'mongoose';

beforeAll(async () => {
  // Use test database
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/sweetshop_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  // Clean up test data after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});