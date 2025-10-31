import request from 'supertest';

const baseUrl = 'http://localhost:3000'; // Change if your server runs elsewhere

describe('Authentication API Tests', () => {
  describe('TC_AUTH_001: Student Signup', () => {
    test('should allow signup with valid data', async () => {

  try {
    const res = await request(baseUrl)
      .post('/api/auth/signup')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: 'Test123456'
      });
    console.log('Signup response:', res.statusCode, res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('john@gmail.com');
  } catch (err) {
    console.error('Signup test error:', err);
    throw err;
  }
});
  });

  describe('TC_AUTH_002: Student Login', () => {
    test('should login with valid credentials', async () => {
      const res = await request(baseUrl)
        .post('/api/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'test123'
        });
      expect(res.statusCode).toBe(200); 
    });
  });
});