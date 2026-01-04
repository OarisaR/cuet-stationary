import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { WishlistItem, Product } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get wishlist
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const wishlistCollection = db.collection<WishlistItem>('wishlist');

    const items = await wishlistCollection
      .find({ studentId: new ObjectId(user.userId) })
      .sort({ addedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const wishlistCollection = db.collection<WishlistItem>('wishlist');
    const productsCollection = db.collection<Product>('products');

    // Check if already in wishlist
    const existing = await wishlistCollection.findOne({
      studentId: new ObjectId(user.userId),
      productId: new ObjectId(productId),
    });

    if (existing) {
      return NextResponse.json({ success: true, itemId: existing._id!.toString() });
    }

    // Get product details
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Add to wishlist
    const wishlistItem: WishlistItem = {
      studentId: new ObjectId(user.userId),
      productId: new ObjectId(productId),
      productName: product.name,
      productPrice: product.price,
      productEmoji: product.emoji,
      vendorId: product.vendorId,
      addedAt: new Date(),
    };

    const result = await wishlistCollection.insertOne(wishlistItem);
    return NextResponse.json({ success: true, itemId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}
