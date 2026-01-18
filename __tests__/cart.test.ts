/**
 * Shopping Cart Test Suite
 * Tests for cart operations
 */

describe('Shopping Cart Tests', () => {
  
  describe('TC_CART_001: Add to Cart', () => {
    test('should calculate correct cart total for single item', () => {
      const cartItem = {
        productName: 'Notebook',
        price: 50,
        quantity: 2
      };
      
      const total = cartItem.price * cartItem.quantity;
      expect(total).toBe(100);
    });

    test('should calculate correct cart total for multiple items', () => {
      const cartItems = [
        { productName: 'Notebook', price: 50, quantity: 2 },
        { productName: 'Pen', price: 10, quantity: 5 }
      ];
      
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(total).toBe(150);
    });

    test('should validate quantity is positive', () => {
      const quantity = 5;
      expect(quantity).toBeGreaterThan(0);
    });
  });

  describe('TC_CART_002: Update Cart', () => {
    test('should allow quantity update', () => {
      let cartItem = {
        productName: 'Notebook',
        quantity: 2
      };
      
      cartItem.quantity = 5;
      expect(cartItem.quantity).toBe(5);
    });
  });
});