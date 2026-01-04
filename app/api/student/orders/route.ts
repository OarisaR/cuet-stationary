import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Order, OrderItem, CartItem, Product } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get student orders
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const ordersCollection = db.collection<Order>('orders');

    const orders = await ordersCollection
      .find({ customerId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create order from cart
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { shippingAddress, notes } = await request.json();

    const db = await getDatabase();
    const cartCollection = db.collection<CartItem>('cart');
    const ordersCollection = db.collection<Order>('orders');
    const usersCollection = db.collection('users');

    // Get cart items
    const cartItems = await cartCollection
      .find({ studentId: new ObjectId(user.userId) })
      .toArray();

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Get user details
    const userData = await usersCollection.findOne({ _id: new ObjectId(user.userId) });

    // Group items by vendor
    const itemsByVendor = cartItems.reduce((acc, item) => {
      const vendorId = item.vendorId.toString();
      if (!acc[vendorId]) {
        acc[vendorId] = [];
      }
      acc[vendorId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    const orderIds: string[] = [];

    // Create one order per vendor
    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productEmoji: item.productEmoji,
        quantity: item.quantity,
        price: item.productPrice,
        subtotal: item.productPrice * item.quantity,
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      const order: Order = {
        vendorId: new ObjectId(vendorId),
        customerId: new ObjectId(user.userId),
        customerName: userData?.displayName || user.email,
        customerEmail: user.email,
        items: orderItems,
        totalAmount,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(shippingAddress && { shippingAddress }),
        ...(notes && { notes }),
      };

      const result = await ordersCollection.insertOne(order);
      orderIds.push(result.insertedId.toString());
    }

    // Clear cart
    await cartCollection.deleteMany({ studentId: new ObjectId(user.userId) });

    return NextResponse.json({ success: true, orderIds }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
