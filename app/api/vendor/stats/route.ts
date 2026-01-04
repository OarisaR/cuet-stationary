import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Product, Order } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get vendor statistics/dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const productsCollection = db.collection<Product>('products');
    const ordersCollection = db.collection<Order>('orders');

    // Get all products
    const products = await productsCollection
      .find({ vendorId: new ObjectId(user.userId) })
      .toArray();

    // Get all orders
    const orders = await ordersCollection
      .find({ vendorId: new ObjectId(user.userId) })
      .toArray();

    // Calculate stats
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const lowStockItems = products.filter(product => product.stock <= 10).length;

    const stats = {
      vendorId: user.userId,
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length,
      lowStockItems,
      lastUpdated: new Date(),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
