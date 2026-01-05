import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { CartItem } from '@/lib/models';
import { ObjectId } from 'mongodb';

// PATCH - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
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
        _id: new ObjectId(id),
        student_id: new ObjectId(user.userId),
      });
    } else {
      // Update quantity
      await cartCollection.updateOne(
        { _id: new ObjectId(id), student_id: new ObjectId(user.userId) },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    console.log('DELETE cart item:', {
      itemId: id,
      userId: user.userId
    });

    const db = await getDatabase();
    const cartCollection = db.collection<CartItem>('cart');

    const result = await cartCollection.deleteOne({
      _id: new ObjectId(id),
      student_id: new ObjectId(user.userId),
    });

    console.log('Delete result:', {
      deletedCount: result.deletedCount,
      acknowledged: result.acknowledged
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
