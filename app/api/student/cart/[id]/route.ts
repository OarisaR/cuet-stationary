import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { CartItem } from '@/lib/models';
import { ObjectId } from 'mongodb';

// PATCH - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quantity } = await request.json();

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid quantity' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const cartCollection = db.collection<CartItem>('cart');

    if (quantity === 0) {
      // Remove item
      await cartCollection.deleteOne({
        _id: new ObjectId(params.id),
        studentId: new ObjectId(user.userId),
      });
    } else {
      // Update quantity
      await cartCollection.updateOne(
        { _id: new ObjectId(params.id), studentId: new ObjectId(user.userId) },
        { $set: { quantity } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await cartCollection.deleteOne({
      _id: new ObjectId(params.id),
      studentId: new ObjectId(user.userId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
