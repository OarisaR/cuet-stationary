import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Order, OrderItem, CartItem, Inventory, Feedback, Payment, Student } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get student orders with feedback information
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection<OrderItem>('order_items');
    const feedbackCollection = db.collection<Feedback>('feedbacks');
    const paymentsCollection = db.collection<Payment>('payments');
    const inventoryCollection = db.collection<Inventory>('inventory');

    const orders = await ordersCollection
      .find({ student_id: new ObjectId(user.userId) })
      .sort({ ordered_at: -1 })
      .toArray();

    // For each order, get items, feedback, and payment information
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

        // Get feedback for all products in this order
        const feedbacks = await feedbackCollection
          .find({
            order_id: order._id,
            student_id: new ObjectId(user.userId)
          })
          .toArray();

        // Get payment information
        const payment = await paymentsCollection.findOne({
          order_id: order._id
        });

        // Create a map of inventoryId -> feedback
        const feedbackMap = new Map(
          feedbacks.map(f => [f.inventory_id.toString(), f])
        );

        // Add feedback status to enriched items
        const itemsWithFeedback = enrichedItems.map(item => ({
          ...item,
          feedback: feedbackMap.get(item.inventory_id.toString()) || null,
          feedbackGiven: feedbackMap.has(item.inventory_id.toString())
        }));

        return {
          ...order,
          items: itemsWithFeedback,
          payment: payment || null
        };
      })
    );

    return NextResponse.json({ success: true, orders: ordersWithDetails });
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
    if (!user || user.userType !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { deliveryAddress, notes, paymentMethod, transactionId } = await request.json();

    const db = await getDatabase();
    const cartCollection = db.collection<CartItem>('cart');
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection<OrderItem>('order_items');
    const paymentsCollection = db.collection<Payment>('payments');
    const studentsCollection = db.collection<Student>('students');
    const inventoryCollection = db.collection<Inventory>('inventory');

    // Get cart items
    const cartItems = await cartCollection
      .find({ student_id: new ObjectId(user.userId) })
      .toArray();

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Get student details
    const studentData = await studentsCollection.findOne({ _id: new ObjectId(user.userId) });

    if (!studentData) {
      return NextResponse.json(
        { success: false, message: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Use provided delivery address or fallback to student's saved address
    const finalDeliveryAddress = deliveryAddress || studentData.delivery_address;

    if (!finalDeliveryAddress) {
      return NextResponse.json(
        { success: false, message: 'Delivery address is required. Please update your profile.' },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + ((item.product_price || 0) * item.quantity), 0);

    // Create single order
    const order: Order = {
      student_id: new ObjectId(user.userId),
      customer_name: studentData.name || user.email,
      customer_email: user.email,
      total_amount: totalAmount,
      order_status: 'pending',
      delivery_address: finalDeliveryAddress,
      ordered_at: new Date(),
      updatedAt: new Date(),
      ...(notes && { notes }),
    };

    const orderResult = await ordersCollection.insertOne(order);
    const orderId = orderResult.insertedId;

    // Create order items
    const orderItems: OrderItem[] = cartItems
      .filter(item => item.inventory_id && item.product_name && item.product_price !== undefined)
      .map((item) => ({
        order_id: orderId,
        inventory_id: item.inventory_id!,
        product_name: item.product_name!,
        quantity: item.quantity,
        unit_price: item.product_price!,
      }));

    if (orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid cart items' },
        { status: 400 }
      );
    }

    await orderItemsCollection.insertMany(orderItems);

    // Update inventory stock
    for (const item of cartItems) {
      await inventoryCollection.updateOne(
        { _id: item.inventory_id },
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    // Create payment record
    const payment: Payment = {
      student_id: new ObjectId(user.userId),
      order_id: orderId,
      payment_method: paymentMethod || 'cash',
      payment_status: 'pending',
      amount: totalAmount,
      ...(transactionId && { transactionId }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await paymentsCollection.insertOne(payment);

    // Clear cart
    await cartCollection.deleteMany({ student_id: new ObjectId(user.userId) });

    return NextResponse.json({ success: true, orderId: orderId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
