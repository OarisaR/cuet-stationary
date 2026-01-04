import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { User } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const userData = await usersCollection.findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { password: 0 } }
    );

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData._id!.toString(),
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
