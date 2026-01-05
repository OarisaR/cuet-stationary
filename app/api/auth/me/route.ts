import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Student, Admin } from '@/lib/models';
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

    // Query the appropriate collection based on userType
    let userData: (Student | Admin) & { _id: ObjectId } | null = null;
    
    if (user.userType === 'student') {
      const studentsCollection = db.collection<Student>('students');
      userData = await studentsCollection.findOne(
        { _id: new ObjectId(user.userId) },
        { projection: { password: 0 } }
      );
    } else if (user.userType === 'admin') {
      const adminsCollection = db.collection<Admin>('admins');
      userData = await adminsCollection.findOne(
        { _id: new ObjectId(user.userId) },
        { projection: { password: 0 } }
      );
    }

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
        name: user.userType === 'admin' ? (userData as Admin).username : (userData as Student).name,
        userType: user.userType,
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
