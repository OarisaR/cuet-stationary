import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { WishlistItem } from '@/lib/models';
import { ObjectId } from 'mongodb';

// DELETE - Remove from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const wishlistCollection = db.collection<WishlistItem>('wishlist');

    await wishlistCollection.deleteOne({
      _id: new ObjectId(id),
      studentId: new ObjectId(user.userId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
