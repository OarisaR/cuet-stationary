import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { InventoryAdjustment } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get inventory adjustments history
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    const adjustmentsCollection = db.collection<InventoryAdjustment>('inventoryAdjustments');

    const adjustments = await adjustmentsCollection
      .find({ vendorId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ success: true, adjustments });
  } catch (error) {
    console.error('Get inventory history error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inventory history' },
      { status: 500 }
    );
  }
}
