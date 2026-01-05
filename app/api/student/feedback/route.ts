import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Feedback, Order, OrderItem } from '@/lib/models';
import { ObjectId } from 'mongodb';

// POST - Submit feedback for a product in a delivered order
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, productId, rating, comment } = await request.json();

    // Validate required fields
    if (!orderId || !productId || !rating) {
      return NextResponse.json(
        { success: false, message: 'Order ID, Product ID, and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { success: false, message: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection<OrderItem>('order_items');
    const feedbackCollection = db.collection<Feedback>('feedbacks');

    // Verify order exists, belongs to student, and is delivered
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      student_id: new ObjectId(user.userId)
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.order_status !== 'delivered') {
      return NextResponse.json(
        { success: false, message: 'Feedback can only be given for delivered orders' },
        { status: 400 }
      );
    }

    // Verify product is in the order (check order_items collection)
    const productInOrder = await orderItemsCollection.findOne({
      order_id: new ObjectId(orderId),
      inventory_id: new ObjectId(productId)
    });

    if (!productInOrder) {
      return NextResponse.json(
        { success: false, message: 'Product not found in this order' },
        { status: 404 }
      );
    }

    // Check if feedback already exists for this product in this order
    const existingFeedback = await feedbackCollection.findOne({
      order_id: new ObjectId(orderId),
      inventory_id: new ObjectId(productId),
      student_id: new ObjectId(user.userId)
    });

    if (existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback already submitted for this product' },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback: Feedback = {
      student_id: new ObjectId(user.userId),
      order_id: new ObjectId(orderId),
      inventory_id: new ObjectId(productId),
      rating,
      comment: comment?.trim() || undefined,
      createdAt: new Date()
    };

    const result = await feedbackCollection.insertOne(feedback);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: result.insertedId
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
