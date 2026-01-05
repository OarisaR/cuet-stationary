import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/jwt';
import type { Student, Admin, AuthResponse } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Try to find user in students or admins collection
    let user: (Student | Admin) & { _id: any } | null = null;
    let foundUserType: 'student' | 'admin' | null = null;

    // If userType is specified, search only that collection
    if (userType === 'admin') {
      const adminsCollection = db.collection<Admin>('admins');
      user = await adminsCollection.findOne({ email: email.toLowerCase() });
      foundUserType = user ? 'admin' : null;
    } else if (userType === 'student') {
      const studentsCollection = db.collection<Student>('students');
      user = await studentsCollection.findOne({ email: email.toLowerCase() });
      foundUserType = user ? 'student' : null;
    } else {
      // Search both collections
      const studentsCollection = db.collection<Student>('students');
      const adminsCollection = db.collection<Admin>('admins');
      
      user = await studentsCollection.findOne({ email: email.toLowerCase() });
      if (user) {
        foundUserType = 'student';
      } else {
        user = await adminsCollection.findOne({ email: email.toLowerCase() });
        foundUserType = user ? 'admin' : null;
      }
    }

    if (!user || !foundUserType) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      userType: foundUserType,
    });

    const response: AuthResponse = {
      success: true,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: foundUserType === 'admin' ? (user as Admin).username : (user as Student).name,
        userType: foundUserType,
      },
      token,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to login' },
      { status: 500 }
    );
  }
}
