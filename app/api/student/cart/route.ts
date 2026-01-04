import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { CartItem, Product } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get cart items
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
    const cartCollection = db.collection<CartItem>('cart');

    const items = await cartCollection
      .find({ studentId: new ObjectId(user.userId) })
      .sort({ addedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Add to cart
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const cartCollection = db.collection<CartItem>('cart');
    const productsCollection = db.collection<Product>('products');

    // Get product details
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already in cart
    const existingItem = await cartCollection.findOne({
      studentId: new ObjectId(user.userId),
      productId: new ObjectId(productId),
    });

    if (existingItem) {
      // Update quantity
      await cartCollection.updateOne(
        { _id: existingItem._id },
        { $inc: { quantity } }
      );
      return NextResponse.json({ success: true, itemId: existingItem._id!.toString() });
    } else {
      // Add new item
      const cartItem: CartItem = {
        studentId: new ObjectId(user.userId),
        productId: new ObjectId(productId),
        productName: product.name,
        productPrice: product.price,
        productEmoji: product.emoji,
        quantity,
        vendorId: product.vendorId,
        addedAt: new Date(),
      };

      const result = await cartCollection.insertOne(cartItem);
      return NextResponse.json({ success: true, itemId: result.insertedId.toString() }, { status: 201 });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// DELETE - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const cartCollection = db.collection<CartItem>('cart');

    await cartCollection.deleteMany({ studentId: new ObjectId(user.userId) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
