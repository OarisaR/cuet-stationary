import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Inventory } from '@/lib/models';
import { ObjectId } from 'mongodb';

// POST - Adjust product stock
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, adjustment } = await request.json();

    if (!productId || adjustment === undefined || adjustment === null) {
      return NextResponse.json(
        { success: false, message: 'Product ID and adjustment are required' },
        { status: 400 }
      );
    }

    const adjustmentNumber = Number(adjustment);
    if (isNaN(adjustmentNumber)) {
      return NextResponse.json(
        { success: false, message: 'Adjustment must be a number' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const inventoryCollection = db.collection<Inventory>('inventory');

    // Get current product
    const product = await inventoryCollection.findOne({
      _id: new ObjectId(productId),
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate new stock (ensure it doesn't go below 0)
    const previousStock = product.stock_quantity || 0;
    const newStock = Math.max(0, previousStock + adjustmentNumber);

    // Update the product stock
    await inventoryCollection.updateOne(
      { _id: new ObjectId(productId) },
      { 
        $set: { 
          stock_quantity: newStock,
          updatedAt: new Date() 
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Stock updated successfully',
      previousStock,
      newStock,
      adjustment: adjustmentNumber 
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
