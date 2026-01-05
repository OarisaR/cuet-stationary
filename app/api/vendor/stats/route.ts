import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Inventory, Order } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get vendor statistics/dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const inventoryCollection = db.collection<Inventory>('inventory');
    const ordersCollection = db.collection<Order>('orders');

    // Get all inventory items (admins manage all inventory)
    const products = await inventoryCollection.find({}).toArray();

    // Get all orders (admins see all orders)
    const orders = await ordersCollection.find({}).toArray();

    // Calculate total sales from delivered orders only
    const deliveredOrders = orders.filter(order => 
      order.order_status === 'delivered'
    );
    const totalSales = deliveredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    // Count pending orders
    const pendingOrders = orders.filter(order => order.order_status === 'pending').length;
    
    // Count low stock items (stock_quantity <= 10)
    const lowStockItems = products.filter(product => product.stock_quantity <= 10).length;

    const stats = {
      totalRevenue: totalSales,
      totalSales: totalSales, // Alias
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length,
      lowStockProducts: lowStockItems,
      lowStockItems: lowStockItems, // Alias
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
