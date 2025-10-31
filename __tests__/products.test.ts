/**
 * Products Test Suite
 * Tests for vendor product management
 */

import request from 'supertest';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Products Tests', () => {
  
  describe('Products API Integration (Real API)', () => {
    let vendorToken: string;
    let createdProductId: string;

    beforeAll(async () => {
      // Vendor login with actual credentials
      const vendorEmail = 'admin@cuet.ac.bd';
      const vendorPassword = 'admin123';
      
      const loginRes = await request(baseUrl)
        .post('/api/auth/login')
        .send({ email: vendorEmail, password: vendorPassword });
      
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.token).toBeTruthy();
      vendorToken = loginRes.body.token;
    }, 20000);

    test('should add a new product via API', async () => {
      const newProduct = {
        name: 'Test Notebook API',
        price: 50,
        stock: 100,
        emoji: '📓',
        category: 'Stationery',
        description: 'Test product for API testing',
        brand: 'Test Brand'
      };

      const addProductRes = await request(baseUrl)
        .post('/api/vendor/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(newProduct);

      expect([200, 201]).toContain(addProductRes.statusCode);
      expect(addProductRes.body.success).toBe(true);
      
      // Store the product ID for later tests
      createdProductId = addProductRes.body.productId || addProductRes.body.product?._id || addProductRes.body.data?._id;
      expect(createdProductId).toBeTruthy();
    }, 15000);

    test('should retrieve all products via API', async () => {
      const productsRes = await request(baseUrl)
        .get('/api/vendor/products')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(productsRes.statusCode).toBe(200);
      expect(productsRes.body.success).toBe(true);
      
      const products = productsRes.body.products || productsRes.body.data || [];
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    }, 15000);

    test('should update product stock via API', async () => {
      // First, get the product to know its current stock
      const getProductRes = await request(baseUrl)
        .get('/api/vendor/products')
        .set('Authorization', `Bearer ${vendorToken}`);

      const products = getProductRes.body.products || getProductRes.body.data || [];
      const product = products.find((p: any) => p._id === createdProductId);
      
      expect(product).toBeTruthy();
      const originalStock = product.stock_quantity;
      const newStock = originalStock + 50;

      // Update - send stock_quantity directly (not 'stock')
      const updateData = {
        product_name: product.product_name,
        price: product.price,
        stock_quantity: newStock,
        emoji: product.emoji,
        category: product.category,
        description: product.description,
        brand: product.brand
      };

      const updateRes = await request(baseUrl)
        .patch(`/api/vendor/products/${createdProductId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(updateData);

      expect([200, 201]).toContain(updateRes.statusCode);
      expect(updateRes.body.success).toBe(true);

      // Verify the stock was updated
      const verifyRes = await request(baseUrl)
        .get('/api/vendor/products')
        .set('Authorization', `Bearer ${vendorToken}`);

      const updatedProducts = verifyRes.body.products || verifyRes.body.data || [];
      const updatedProduct = updatedProducts.find((p: any) => p._id === createdProductId);
      
      expect(updatedProduct).toBeTruthy();
      expect(updatedProduct.stock_quantity).toBe(newStock);
    }, 15000);

    test('should detect low stock products via API', async () => {
      const productsRes = await request(baseUrl)
        .get('/api/vendor/products?lowStock=10')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(productsRes.statusCode).toBe(200);
      const products = productsRes.body.products || productsRes.body.data || [];
      
      // All returned products should have stock <= 10
      if (products.length > 0) {
        products.forEach((p: any) => {
          expect(p.stock_quantity).toBeLessThanOrEqual(10);
        });
      }
      
      console.log(`Found ${products.length} low stock products`);
      expect(Array.isArray(products)).toBe(true);
    }, 15000);

    test('should not allow negative price via API', async () => {
      const productWithNegativePrice = {
        name: 'Product With Negative Price',
        price: -50,
        stock: 100,
        emoji: '❌',
        category: 'Test',
        description: 'Should be rejected'
      };

      const addProductRes = await request(baseUrl)
        .post('/api/vendor/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(productWithNegativePrice);

      // Should return 400 Bad Request
      expect(addProductRes.statusCode).toBe(400);
      expect(addProductRes.body.success).toBe(false);
      expect(addProductRes.body.message).toContain('negative');
    }, 15000);

    test('should not allow negative stock via API', async () => {
      const productWithNegativeStock = {
        name: 'Product With Negative Stock',
        price: 50,
        stock: -10,
        emoji: '❌',
        category: 'Test',
        description: 'Should be rejected'
      };

      const addProductRes = await request(baseUrl)
        .post('/api/vendor/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(productWithNegativeStock);

      // Should return 400 Bad Request
      expect(addProductRes.statusCode).toBe(400);
      expect(addProductRes.body.success).toBe(false);
      expect(addProductRes.body.message).toContain('negative');
    }, 15000);
  });
});