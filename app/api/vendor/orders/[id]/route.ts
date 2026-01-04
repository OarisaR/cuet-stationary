import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Order, Product, InventoryAdjustment, Payment } from '@/lib/models';
import { ObjectId } from 'mongodb';

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
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
    const paymentsCollection = db.collection<Payment>('payments');
    const productsCollection = db.collection<Product>('products');
    const adjustmentsCollection = db.collection<InventoryAdjustment>('inventoryAdjustments');

    // Get current order
    const order = await ordersCollection.findOne({
      _id: new ObjectId(id),
      vendorId: new ObjectId(user.userId),
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // If changing from pending to processing, deduct stock
    if (status === 'processing' && order.status === 'pending') {
      for (const item of order.items) {
        const product = await productsCollection.findOne({ _id: item.productId });
        
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          
          // Update product stock
          await productsCollection.updateOne(
            { _id: item.productId },
            {
              $set: { stock: newStock, updatedAt: new Date() },
            }
          );

          // Log inventory adjustment
          const adjustment: InventoryAdjustment = {
            productId: item.productId,
            productName: item.productName,
            vendorId: new ObjectId(user.userId),
            previousStock: product.stock,
            adjustment: -item.quantity,
            newStock,
            reason: `Order #${id.substring(0, 8)} accepted`,
            createdAt: new Date(),
          };
          await adjustmentsCollection.insertOne(adjustment);
        }
      }
    }

    // Update order status
    await ordersCollection.updateOne(
      { _id: new ObjectId(id), vendorId: new ObjectId(user.userId) },
      { $set: { status, updatedAt: new Date() } }
    );

    // If order is delivered, update payment status to completed
    if (status === 'delivered') {
      await paymentsCollection.updateOne(
        { orderId: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: 'completed', 
            paymentDate: new Date(),
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
