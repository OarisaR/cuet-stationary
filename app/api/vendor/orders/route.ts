import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Order, Inventory, OrderItem, Feedback, Payment } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get all orders (vendor/admin sees all orders)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = await getDatabase();
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection<OrderItem>('order_items');
    const feedbackCollection = db.collection<Feedback>('feedbacks');
    const paymentsCollection = db.collection<Payment>('payments');
    const inventoryCollection = db.collection<Inventory>('inventory');

    let query: any = {};
    if (status) {
      query.order_status = status;
    }

    const orders = await ordersCollection
      .find(query)
      .sort({ ordered_at: -1 })
      .toArray();

    // Add items, feedback and payment information
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get order items
        const items = await orderItemsCollection
          .find({ order_id: order._id })
          .toArray();

        // Enrich items with product emoji from inventory
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const product = await inventoryCollection.findOne({
              _id: item.inventory_id
            });
            return {
              ...item,
              product_emoji: product?.emoji || '📦'
            };
          })
        );

        // Get payment information
        const payment = await paymentsCollection.findOne({
          order_id: order._id
        });

        if (order.order_status === 'delivered') {
          // Get feedback for all products in this order
          const feedbacks = await feedbackCollection
            .find({
              order_id: order._id
            })
            .toArray();

          // Create a map of inventoryId -> feedback
          const feedbackMap = new Map(
            feedbacks.map(f => [f.inventory_id.toString(), f])
          );

          // Add feedback to enriched items
          const itemsWithFeedback = enrichedItems.map(item => ({
            ...item,
            feedback: feedbackMap.get(item.inventory_id.toString()) || null
          }));

          return {
            ...order,
            items: itemsWithFeedback,
            payment: payment || null
          };
        }
        return {
          ...order,
          items: enrichedItems,
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
