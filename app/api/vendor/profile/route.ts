import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { User } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get vendor profile
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const profile = await usersCollection.findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { password: 0 } }
    );

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update vendor profile
export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const allowedFields = ['displayName', 'phoneNum', 'address', 'licenseNum'];
    
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
    const usersCollection = db.collection<User>('users');

    await usersCollection.updateOne(
      { _id: new ObjectId(user.userId) },
      { $set: { ...filteredUpdates, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
