import request from 'supertest';
import { app } from '../../app';
import { User } from '../auth/user.model';

describe('Sweets API', () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Create a regular user and get token
    const userResponse = await request(app)
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

    // Manually set admin role (in real app, this would be done differently)
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
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet as admin', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 25.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Sweet created successfully');
      expect(response.body).toHaveProperty('sweet');
      expect(response.body.sweet).toHaveProperty('id');
      expect(response.body.sweet).toHaveProperty('name', sweetData.name);
      expect(response.body.sweet).toHaveProperty('category', sweetData.category);
      expect(response.body.sweet).toHaveProperty('price', sweetData.price);
      expect(response.body.sweet).toHaveProperty('quantity', sweetData.quantity);
    });

    it('should fail to create sweet without authentication', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 25.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided');
    });

    it('should fail to create sweet as regular user', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 25.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied. Admin role required');
    });

    it('should fail to create sweet with invalid data', async () => {
      const invalidData = {
        name: '',
        category: '',
        price: -5,
        quantity: -1
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create some test sweets
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: 25.99,
          quantity: 10
        });

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Vanilla Cupcake',
          category: 'Cupcakes',
          price: 5.99,
          quantity: 20
        });
    });

    it('should get all sweets as authenticated user', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sweets');
      expect(Array.isArray(response.body.sweets)).toBe(true);
      expect(response.body.sweets.length).toBeGreaterThan(0);
    });

    it('should fail to get sweets without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided');
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      // Create test sweets for search
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: 25.99,
          quantity: 10
        });

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Strawberry Cake',
          category: 'Cakes',
          price: 30.99,
          quantity: 5
        });
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sweets');
      expect(response.body.sweets.length).toBe(1);
      expect(response.body.sweets[0].name).toContain('Chocolate');
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Cakes')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sweets');
      expect(response.body.sweets.length).toBe(2);
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=20&maxPrice=30')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sweets');
      expect(response.body.sweets.length).toBe(1);
      expect(response.body.sweets[0].price).toBeGreaterThanOrEqual(20);
      expect(response.body.sweets[0].price).toBeLessThanOrEqual(30);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 10.99,
          quantity: 5
        });

      sweetId = response.body.sweet.id;
    });

    it('should update sweet as admin', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 15.99
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Sweet updated successfully');
      expect(response.body.sweet.name).toBe(updateData.name);
      expect(response.body.sweet.price).toBe(updateData.price);
    });

    it('should fail to update sweet as regular user', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 15.99
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied. Admin role required');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 10.99,
          quantity: 5
        });

      sweetId = response.body.sweet.id;
    });

    it('should delete sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Sweet deleted successfully');
    });

    it('should fail to delete sweet as regular user', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied. Admin role required');
    });
  });
});