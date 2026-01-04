import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Product, InventoryAdjustment } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const productsCollection = db.collection<Product>('products');

    const product = await productsCollection.findOne({
      _id: new ObjectId(params.id),
      vendorId: new ObjectId(user.userId),
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
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const allowedFields = ['name', 'price', 'stock', 'category', 'emoji', 'description'];
    
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
    const productsCollection = db.collection<Product>('products');

    // Get current product for inventory tracking
    const currentProduct = await productsCollection.findOne({
      _id: new ObjectId(params.id),
      vendorId: new ObjectId(user.userId),
    });

    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // If stock is being updated, log inventory adjustment
    if (filteredUpdates.stock !== undefined && filteredUpdates.stock !== currentProduct.stock) {
      const adjustmentCollection = db.collection<InventoryAdjustment>('inventoryAdjustments');
      const adjustment: InventoryAdjustment = {
        productId: new ObjectId(params.id),
        productName: currentProduct.name,
        vendorId: new ObjectId(user.userId),
        previousStock: currentProduct.stock,
        adjustment: filteredUpdates.stock - currentProduct.stock,
        newStock: filteredUpdates.stock,
        reason: 'Manual adjustment',
        createdAt: new Date(),
      };
      await adjustmentCollection.insertOne(adjustment);
    }

    await productsCollection.updateOne(
      { _id: new ObjectId(params.id), vendorId: new ObjectId(user.userId) },
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
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const productsCollection = db.collection<Product>('products');

    await productsCollection.deleteOne({
      _id: new ObjectId(params.id),
      vendorId: new ObjectId(user.userId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
