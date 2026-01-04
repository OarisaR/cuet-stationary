import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Order, Product, InventoryAdjustment, OrderItem } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get vendor orders
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = await getDatabase();
    const ordersCollection = db.collection<Order>('orders');

    let query: any = { vendorId: new ObjectId(user.userId) };
    if (status) {
      query.status = status;
    }

    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
