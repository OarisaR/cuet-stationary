import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Inventory, InventoryAdjustment } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get single product
export async function GET(
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

    const db = await getDatabase();
    const inventoryCollection = db.collection<Inventory>('inventory');

    const product = await inventoryCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH - Update product
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

    const updates = await request.json();
    const allowedFields = ['product_name', 'price', 'stock_quantity', 'category', 'emoji', 'description', 'brand'];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const inventoryCollection = db.collection<Inventory>('inventory');

    // Get current product for inventory tracking
    const currentProduct = await inventoryCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // If stock is being updated, log inventory adjustment
    if (filteredUpdates.stock_quantity !== undefined && filteredUpdates.stock_quantity !== currentProduct.stock_quantity) {
      const adjustmentCollection = db.collection<InventoryAdjustment>('inventoryAdjustments');
      const adjustment: InventoryAdjustment = {
        inventory_id: new ObjectId(id),
        product_name: currentProduct.product_name,
        admin_id: new ObjectId(user.userId),
        previousStock: currentProduct.stock_quantity,
        adjustment: filteredUpdates.stock_quantity - currentProduct.stock_quantity,
        newStock: filteredUpdates.stock_quantity,
        reason: 'Manual adjustment',
        createdAt: new Date(),
      };
      await adjustmentCollection.insertOne(adjustment);
    }

    await inventoryCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...filteredUpdates, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
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

    const db = await getDatabase();
    const inventoryCollection = db.collection<Inventory>('inventory');

    const result = await inventoryCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found or already deleted' },
        { status: 404 }
      );
    }

    console.log(`Product ${id} deleted successfully by user ${user.userId}`);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}