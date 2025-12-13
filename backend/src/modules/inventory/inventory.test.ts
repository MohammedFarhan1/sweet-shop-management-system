import request from 'supertest';
import { app } from '../../app';
import { User } from '../auth/user.model';

describe('Inventory API', () => {
  let userToken: string;
  let adminToken: string;
  let sweetId: string;

  beforeEach(async () => {
    // Create a regular user and get token
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123'
      });

    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });

    userToken = userLoginResponse.body.token;

    // Create an admin user and get token
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123'
      });

    // Set admin role
    await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      { role: 'ADMIN' }
    );

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    adminToken = adminLoginResponse.body.token;

    // Create a test sweet
    const sweetResponse = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Sweet',
        category: 'Test',
        price: 10.99,
        quantity: 5
      });

    sweetId = sweetResponse.body.sweet.id;
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase sweet successfully as user', async () => {
      const purchaseData = {
        quantity: 2
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Purchase successful');
      expect(response.body).toHaveProperty('sweet');
      expect(response.body.sweet.quantity).toBe(3); // 5 - 2 = 3
    });

    it('should purchase sweet successfully as admin', async () => {
      const purchaseData = {
        quantity: 1
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(purchaseData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Purchase successful');
      expect(response.body.sweet.quantity).toBe(4); // 5 - 1 = 4
    });

    it('should fail to purchase without authentication', async () => {
      const purchaseData = {
        quantity: 2
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send(purchaseData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided');
    });

    it('should fail to purchase more than available quantity', async () => {
      const purchaseData = {
        quantity: 10 // More than available (5)
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Insufficient quantity available');
    });

    it('should fail to purchase with invalid quantity', async () => {
      const purchaseData = {
        quantity: 0
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Quantity must be greater than 0');
    });

    it('should fail to purchase when quantity is 0', async () => {
      // First, purchase all available quantity
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      // Try to purchase when quantity is 0
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Sweet is out of stock');
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    it('should restock sweet successfully as admin', async () => {
      const restockData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Restock successful');
      expect(response.body).toHaveProperty('sweet');
      expect(response.body.sweet.quantity).toBe(15); // 5 + 10 = 15
    });

    it('should fail to restock as regular user', async () => {
      const restockData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(restockData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied. Admin role required');
    });

    it('should fail to restock without authentication', async () => {
      const restockData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .send(restockData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided');
    });

    it('should fail to restock with invalid quantity', async () => {
      const restockData = {
        quantity: -5
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Quantity must be greater than 0');
    });

    it('should fail to restock non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const restockData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restockData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Sweet not found');
    });
  });
});