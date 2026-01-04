import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Order, Product, InventoryAdjustment, OrderItem, Feedback, Payment } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get vendor orders with feedback for delivered orders
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
    const feedbackCollection = db.collection<Feedback>('feedbacks');
    const paymentsCollection = db.collection<Payment>('payments');

    let query: any = { vendorId: new ObjectId(user.userId) };
    if (status) {
      query.status = status;
    }

    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Add feedback and payment information
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get payment information
        const payment = await paymentsCollection.findOne({
          orderId: order._id
        });

        if (order.status === 'delivered') {
          // Get feedback for all products in this order
          const feedbacks = await feedbackCollection
            .find({
              orderId: order._id,
              vendorId: new ObjectId(user.userId)
            })
            .toArray();

          // Create a map of productId -> feedback
          const feedbackMap = new Map(
            feedbacks.map(f => [f.productId.toString(), f])
          );

          // Add feedback to each item
          const itemsWithFeedback = order.items.map(item => ({
            ...item,
            feedback: feedbackMap.get(item.productId.toString()) || null
          }));

          return {
            ...order,
            items: itemsWithFeedback,
            payment: payment || null
          };
        }
        return {
          ...order,
          payment: payment || null
        };
      })
    );

    return NextResponse.json({ success: true, orders: ordersWithDetails });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
