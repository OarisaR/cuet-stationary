import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Order, Inventory, InventoryAdjustment, Payment } from '@/lib/models';
import { ObjectId } from 'mongodb';

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection('order_items');
    const paymentsCollection = db.collection<Payment>('payments');
    const inventoryCollection = db.collection<Inventory>('inventory');
    const adjustmentsCollection = db.collection<InventoryAdjustment>('inventoryAdjustments');

    // Get current order (no vendorId filter - admins see all orders)
    const order = await ordersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Get order items
    const orderItems = await orderItemsCollection
      .find({ order_id: new ObjectId(id) })
      .toArray();

    // If changing from pending to processing, deduct stock
    if (status === 'processing' && order.order_status === 'pending') {
      for (const item of orderItems) {
        const product = await inventoryCollection.findOne({ _id: item.inventory_id });
        
        if (product) {
          const newStock = Math.max(0, product.stock_quantity - item.quantity);
          
          // Update product stock
          await inventoryCollection.updateOne(
            { _id: item.inventory_id },
            {
              $set: { stock_quantity: newStock, updatedAt: new Date() },
            }
          );

          // Log inventory adjustment
          const adjustment: InventoryAdjustment = {
            inventory_id: item.inventory_id,
            product_name: item.product_name,
            admin_id: new ObjectId(user.userId),
            previousStock: product.stock_quantity,
            adjustment: -item.quantity,
            newStock,
            reason: `Order #${id.substring(0, 8)} accepted`,
            createdAt: new Date(),
          };
          await adjustmentsCollection.insertOne(adjustment);
        }
      }
    }

    // Prepare update object
    const orderUpdate: any = {
      order_status: status,
      updatedAt: new Date()
    };

    // If order is being marked as delivered, set delivered_at timestamp
    if (status === 'delivered') {
      orderUpdate.delivered_at = new Date();
    }

    // Update order status (and delivered_at if applicable)
    await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: orderUpdate }
    );

    // If order is delivered, update payment status to completed
    if (status === 'delivered') {
      await paymentsCollection.updateOne(
        { order_id: new ObjectId(id) },
        { 
          $set: { 
            payment_status: 'completed', 
            payment_date: new Date(),
            updatedAt: new Date() 
          } 
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
