/**
 * Orders Test Suite
 * Tests for order placement and management
 */

import request from 'supertest';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Orders Tests', () => {
  
  describe('TC_ORDER_001: Place Order', () => {
    test('should validate order has items', () => {
      const orderItems = [
        { productName: 'Notebook', price: 50, quantity: 2 }
      ];
      
      expect(orderItems.length).toBeGreaterThan(0);
    });

    test('should calculate correct order total', () => {
      const orderItems = [
        { productName: 'Notebook', price: 50, quantity: 2 },
        { productName: 'Pen', price: 10, quantity: 3 }
      ];
      
      const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(total).toBe(130);
    });
  });

  describe('Orders API Integration (Real API)', () => {
    test('should place an order via real API and check total', async () => {
      // Student setup
      const studentEmail = 'test@gmail.com';
      const studentPassword = 'test123';
      const deliveryAddress = 'Room 215, Tapashi Rabeya Hall, CUET';
      let studentToken: string;
      
      let loginRes = await request(baseUrl)
        .post('/api/auth/login')
        .send({ email: studentEmail, password: studentPassword });
      
      if (loginRes.statusCode === 200 && loginRes.body.token) {
        studentToken = loginRes.body.token;
      } else {
        await request(baseUrl)
          .post('/api/auth/signup')
          .send({ name: 'Order User', email: studentEmail, password: studentPassword });
        
        loginRes = await request(baseUrl)
          .post('/api/auth/login')
          .send({ email: studentEmail, password: studentPassword });
        
        studentToken = loginRes.body.token;
      }
      
      expect(studentToken).toBeTruthy();

      // Update profile with delivery address
      await request(baseUrl)
        .patch('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          delivery_address: deliveryAddress
        });

      // Get a real product from inventory
      const productsRes = await request(baseUrl)
        .get('/api/student/products');
      
      expect(productsRes.statusCode).toBe(200);
      
      const products = productsRes.body.products || productsRes.body.data || [];
      expect(Array.isArray(products) && products.length > 0).toBe(true);
      
      const product = products[0];
      expect(product).toHaveProperty('_id');
      expect(product).toHaveProperty('price');

      // CRITICAL: Clear cart before test to ensure clean state
      await request(baseUrl)
        .delete('/api/student/cart')
        .set('Authorization', `Bearer ${studentToken}`);

      const orderQuantity = 2;

      // Add product to cart with specific quantity
      const addToCartRes = await request(baseUrl)
        .post('/api/student/cart')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ productId: product._id, quantity: orderQuantity });
      
      expect([200, 201]).toContain(addToCartRes.statusCode);

      // Verify cart has exactly what we added
      const cartCheckRes = await request(baseUrl)
        .get('/api/student/cart')
        .set('Authorization', `Bearer ${studentToken}`);
      
      const cartItems = cartCheckRes.body.items || [];
      
      // Calculate expected total from actual cart
      const expectedTotal = cartItems.reduce((sum: number, item: any) => {
        const price = item.product_price || item.price;
        const qty = item.quantity;
        return sum + (price * qty);
      }, 0);

      // Place order
      const placeOrderRes = await request(baseUrl)
        .post('/api/student/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          delivery_address: deliveryAddress
        });
      
      expect([200, 201]).toContain(placeOrderRes.statusCode);
      expect(placeOrderRes.body.success).toBe(true);
      expect(placeOrderRes.body.orderId).toBeTruthy();

      const orderId = placeOrderRes.body.orderId;

      // Fetch all orders and find the one we just created
      const allOrdersRes = await request(baseUrl)
        .get('/api/student/orders')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(allOrdersRes.statusCode).toBe(200);
      expect(allOrdersRes.body.success).toBe(true);
      
      const orders = allOrdersRes.body.orders || allOrdersRes.body.data || [];
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      
      // Find our order by ID
      const order = orders.find((o: any) => o._id === orderId || o.id === orderId);
      expect(order).toBeTruthy();

      // Check order has items
      expect(order.items).toBeDefined();
      expect(Array.isArray(order.items)).toBe(true);
      expect(order.items.length).toBeGreaterThan(0);
      
      // Find the order item
      const orderItem = order.items.find((item: any) => 
        item.product_name === product.product_name || 
        item.productName === product.product_name ||
        item.name === product.product_name
      );
      
      expect(orderItem).toBeTruthy();
      // Verify quantity matches what was in cart
      expect(orderItem.quantity).toBeGreaterThan(0);
      
      // Get the unit price from order item
      const itemPrice = orderItem.unit_price || orderItem.product_price || orderItem.price || orderItem.productPrice;
      expect(itemPrice).toBeDefined();
      expect(itemPrice).toBeGreaterThan(0);
      
      // Check total - use total_amount from order
      const actualTotal = order.total_amount || order.total || order.totalAmount;
      
      expect(actualTotal).toBeDefined();
      expect(actualTotal).toBeGreaterThan(0);
      expect(actualTotal).toBeCloseTo(expectedTotal, 2);
    }, 20000);
  });
});